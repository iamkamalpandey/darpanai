import OpenAI from 'openai';
import type { AcademicDocumentAnalysisResults } from '@shared/academicDocumentSchema';
import { googleVisionService } from './googleVisionService';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeAcademicDocumentWithVision(imageBuffer: Buffer): Promise<{
  analysisResults: AcademicDocumentAnalysisResults;
  tokensUsed: number;
  processingTime: number;
  confidence: number;
  extractedText: string;
}> {
  const startTime = Date.now();

  try {
    // Check if Google Vision API is available
    if (!googleVisionService.isAvailable()) {
      throw new Error('Google Vision API is not available - service not configured');
    }

    // Step 1: Extract text using Google Vision API
    console.log('Starting Google Vision text extraction...');
    const visionResult = await googleVisionService.analyzeDocument(imageBuffer);
    const extractedText = visionResult.text;
    
    console.log(`Google Vision extracted ${extractedText.length} characters with ${(visionResult.confidence * 100).toFixed(1)}% confidence`);
    console.log(`First 200 chars: ${extractedText.substring(0, 200)}`);
    
    if (!extractedText || extractedText.trim().length < 20) {
      throw new Error('Insufficient text extracted from document. Please ensure the document is clear and contains readable text.');
    }

    // Step 2: Analyze with OpenAI using the extracted text
    const analysisResult = await analyzeAcademicDocumentContent(extractedText);
    
    const totalProcessingTime = Date.now() - startTime;
    
    return {
      analysisResults: analysisResult.analysisResults,
      tokensUsed: analysisResult.tokensUsed,
      processingTime: totalProcessingTime,
      confidence: visionResult.confidence,
      extractedText: extractedText
    };
    
  } catch (error) {
    console.error('Error in analyzeAcademicDocumentWithVision:', error);
    throw error;
  }
}

export async function analyzeAcademicDocumentContent(extractedText: string): Promise<{
  analysisResults: AcademicDocumentAnalysisResults;
  tokensUsed: number;
  processingTime: number;
}> {
  const startTime = Date.now();

  try {
    const prompt = `
You are an expert academic document analyzer specializing in educational certificates, diplomas, transcripts, and degree documents from institutions worldwide.

Analyze the following academic document text and extract comprehensive academic information. Return ONLY a valid JSON object without any markdown formatting or code blocks.

Academic Document Text:
"""
${extractedText}
"""

Return ONLY a JSON object with the following structure (no markdown, no explanations):

{
  "institutionName": "Full name of the educational institution",
  "institutionCountry": "Country where the institution is located",
  "institutionCity": "City where the institution is located",
  "institutionType": "Type (University, College, Institute, School, etc.)",
  "qualificationLevel": "Level of qualification (Bachelor's, Master's, PhD, Diploma, Certificate, etc.)",
  "qualificationTitle": "Full title/name of the degree or qualification",
  "fieldOfStudy": "Field or area of study",
  "major": "Major subject if specified",
  "minor": "Minor subject if specified",
  "specialization": "Any specialization mentioned",
  "gpa": "Grade Point Average or equivalent",
  "gradeScale": "Scale used (4.0, 10.0, Percentage, etc.)",
  "overallGrade": "Overall grade or class achieved",
  "honors": "Any honors received (Cum Laude, First Class, etc.)",
  "startDate": "Program start date",
  "endDate": "Program end date or completion date",
  "graduationDate": "Official graduation date",
  "duration": "Duration of the program",
  "programType": "Type of program (Full-time, Part-time, Distance Learning, etc.)",
  "credits": "Number of credits or credit hours",
  "thesis": "Thesis title or research topic if applicable",
  "accreditation": "Accreditation information",
  "languageOfInstruction": "Language in which the program was conducted",
  "studentId": "Student ID number if visible",
  "confidenceScores": {
    "institutionName": 85,
    "qualificationLevel": 90,
    "fieldOfStudy": 80,
    "gpa": 75,
    "graduationDate": 88
  },
  "summary": "Brief summary of the academic qualification",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

Instructions:
1. Extract all available information accurately
2. Use null for fields where information is not available or unclear
3. Provide confidence scores (0-100) for key fields based on clarity of information
4. Ensure dates are in YYYY-MM-DD format when possible
5. For GPA, include the actual value and scale if identifiable
6. Include any academic achievements, honors, or distinctions
7. Identify the level of education clearly (undergraduate, graduate, postgraduate, etc.)
8. Extract thesis or research project information if mentioned
9. Note any professional accreditations or certifications
10. Provide actionable recommendations for profile completion

Return only valid JSON without any additional text or formatting.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert academic document analyzer. Extract comprehensive academic information from educational documents and return structured JSON data.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const processingTime = Date.now() - startTime;
    const tokensUsed = completion.usage?.total_tokens || 0;

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonContent = content;
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\s*/, '').replace(/\s*```$/, '');
    }

    let analysisResults: AcademicDocumentAnalysisResults;
    try {
      analysisResults = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      console.error('Extracted JSON content:', jsonContent);
      throw new Error('Failed to parse AI analysis results');
    }

    return {
      analysisResults,
      tokensUsed,
      processingTime,
    };

  } catch (error: any) {
    console.error('Error analyzing academic document:', error);
    
    if (error.code === 'insufficient_quota') {
      throw new Error('AI service temporarily unavailable. Please try again in a few moments.');
    } else if (error.code === 'rate_limit_exceeded') {
      throw new Error('Service is currently busy. Please wait a moment and try again.');
    } else if (error.message?.includes('timeout')) {
      throw new Error('Document processing timed out. Please try uploading a smaller or clearer document.');
    } else if (error.message?.includes('parse')) {
      throw new Error('Unable to process document content. Please ensure the document contains clear, readable text.');
    } else {
      throw new Error('Academic document analysis failed. Please ensure your document is clear and contains readable text, then try again.');
    }
  }
}