import pdfParse from 'pdf-parse';
import OpenAI from 'openai';
import { AcademicDocumentAnalysisResults } from '@shared/academicDocumentSchema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzePdfWithFallback(buffer: Buffer): Promise<{
  results: AcademicDocumentAnalysisResults;
  extractedText: string;
  tokensUsed: number;
  processingTime: number;
  confidence: number;
}> {
  const startTime = Date.now();
  
  try {
    // Extract text from PDF
    const pdfData = await pdfParse(buffer);
    const extractedText = pdfData.text?.trim() || '';
    
    if (!extractedText || extractedText.length < 50) {
      throw new Error('Could not extract sufficient text from PDF. The document may be an image-based PDF or have poor text quality.');
    }

    console.log(`Extracted ${extractedText.length} characters from PDF`);
    console.log('Text preview:', extractedText.substring(0, 200));

    // Analyze with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert academic document analyzer. Analyze the provided academic document text and extract comprehensive information. Return your analysis in JSON format with these exact fields:

{
  "documentType": "string (e.g., 'Diploma', 'Degree Certificate', 'Transcript', 'Academic Record')",
  "institutionName": "string",
  "studentName": "string",
  "programName": "string",
  "degreeLevel": "string (e.g., 'Bachelor', 'Master', 'PhD', 'Certificate', 'Diploma')",
  "fieldOfStudy": "string",
  "graduationDate": "string (YYYY-MM-DD format or 'Not specified')",
  "gpa": "string (GPA value or 'Not specified')",
  "honors": "string (any honors, awards, or distinctions)",
  "accreditation": "string (accreditation details if mentioned)",
  "courses": ["array of course names or subjects"],
  "skills": ["array of skills that can be inferred from the courses/program"],
  "achievements": ["array of notable achievements or recognitions"],
  "summary": "string (comprehensive summary of the academic document)",
  "extractionQuality": "string (High/Medium/Low based on text clarity)",
  "recommendationsForProfile": ["array of suggestions for updating user profile based on this document"]
}`
        },
        {
          role: "user",
          content: `Please analyze this academic document and extract all relevant information:\n\n${extractedText}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.1,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI analysis');
    }

    let analysisResults;
    try {
      // Handle potential markdown code blocks
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysisResults = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI analysis results');
    }

    const processingTime = Date.now() - startTime;
    const tokensUsed = response.usage?.total_tokens || 0;

    // For PDF extraction, confidence is based on text length and quality
    const confidence = Math.min(1.0, Math.max(0.5, extractedText.length / 1000));

    return {
      results: analysisResults,
      extractedText,
      tokensUsed,
      processingTime,
      confidence
    };

  } catch (error: any) {
    console.error('Error in PDF fallback analysis:', error);
    throw new Error(`Failed to analyze PDF document: ${error.message}`);
  }
}