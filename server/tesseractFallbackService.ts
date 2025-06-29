import { createWorker } from 'tesseract.js';
import OpenAI from 'openai';
import { AcademicDocumentAnalysisResults } from '@shared/academicDocumentSchema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeDocumentWithTesseract(buffer: Buffer): Promise<{
  results: AcademicDocumentAnalysisResults;
  extractedText: string;
  tokensUsed: number;
  processingTime: number;
  confidence: number;
}> {
  const startTime = Date.now();
  let worker;
  
  try {
    console.log('Initializing Tesseract.js worker...');
    worker = await createWorker('eng');
    
    console.log('Processing document with OCR...');
    const { data: { text, confidence } } = await worker.recognize(buffer);
    
    const extractedText = text?.trim() || '';
    
    if (!extractedText || extractedText.length < 20) {
      throw new Error('Could not extract sufficient text from document using OCR. Please ensure the document has clear, readable text.');
    }

    console.log(`OCR extracted ${extractedText.length} characters with ${confidence}% confidence`);
    console.log('Text preview:', extractedText.substring(0, 200));

    // Analyze with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert academic document analyzer. Analyze the provided OCR-extracted text from an academic document and extract comprehensive information. The text may have OCR errors, so be flexible in interpretation. Return your analysis in JSON format with these exact fields:

{
  "documentType": "string (e.g., 'Diploma', 'Degree Certificate', 'Transcript', 'Academic Record', 'Course Completion Certificate')",
  "institutionName": "string",
  "studentName": "string",
  "programName": "string",
  "degreeLevel": "string (e.g., 'Bachelor', 'Master', 'PhD', 'Certificate', 'Diploma', 'Course')",
  "fieldOfStudy": "string",
  "graduationDate": "string (YYYY-MM-DD format or 'Not specified')",
  "gpa": "string (GPA value or 'Not specified')",
  "honors": "string (any honors, awards, or distinctions)",
  "accreditation": "string (accreditation details if mentioned)",
  "courses": ["array of course names or subjects"],
  "skills": ["array of skills that can be inferred from the courses/program"],
  "achievements": ["array of notable achievements or recognitions"],
  "summary": "string (comprehensive summary of the academic document)",
  "extractionQuality": "string (Medium/Low - OCR extracted)",
  "recommendationsForProfile": ["array of suggestions for updating user profile based on this document"]
}`
        },
        {
          role: "user",
          content: `Please analyze this OCR-extracted academic document text (may contain some OCR errors):\n\n${extractedText}`
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
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysisResults = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI analysis results');
    }

    const processingTime = Date.now() - startTime;
    const tokensUsed = response.usage?.total_tokens || 0;

    // OCR confidence is provided by Tesseract
    const normalizedConfidence = Math.min(1.0, Math.max(0.3, confidence / 100));

    return {
      results: analysisResults,
      extractedText,
      tokensUsed,
      processingTime,
      confidence: normalizedConfidence
    };

  } catch (error: any) {
    console.error('Error in Tesseract analysis:', error);
    throw new Error(`Failed to analyze document with OCR: ${error.message}`);
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}