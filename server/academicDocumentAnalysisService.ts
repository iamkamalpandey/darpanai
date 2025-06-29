import OpenAI from 'openai';
import type { AcademicDocumentAnalysisResults } from '@shared/academicDocumentSchema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeAcademicDocumentContent(extractedText: string): Promise<{
  analysisResults: AcademicDocumentAnalysisResults;
  tokensUsed: number;
  processingTime: number;
}> {
  const startTime = Date.now();

  try {
    const prompt = `
You are an expert academic document analyzer specializing in educational certificates, diplomas, transcripts, and degree documents from institutions worldwide.

Analyze the following academic document text and extract comprehensive academic information in JSON format.

Academic Document Text:
"""
${extractedText}
"""

Please extract and structure the following information in JSON format:

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
    });

    const processingTime = Date.now() - startTime;
    const tokensUsed = completion.usage?.total_tokens || 0;

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    let analysisResults: AcademicDocumentAnalysisResults;
    try {
      analysisResults = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse AI analysis results');
    }

    return {
      analysisResults,
      tokensUsed,
      processingTime,
    };

  } catch (error: any) {
    console.error('Error analyzing academic document:', error);
    throw new Error(`Academic document analysis failed: ${error.message}`);
  }
}