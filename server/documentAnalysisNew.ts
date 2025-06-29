import pdfParse from 'pdf-parse';
import { createWorker, Worker } from 'tesseract.js';
import OpenAI from 'openai';
import { AcademicDocumentAnalysisResults } from '@shared/academicDocumentSchema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Document type validation result
interface DocumentValidationResult {
  isValid: boolean;
  documentType: 'academic' | 'experience' | 'financial' | 'other' | 'unknown';
  confidence: number;
  reason: string;
  extractedText?: string;
}

// Pre-processing validation to check if document analysis is possible
async function validateDocumentForAnalysis(
  fileBuffer: Buffer, 
  mimeType: string
): Promise<DocumentValidationResult> {
  let extractedText = '';
  let confidence = 0;

  try {
    // Step 1: Extract text from document
    if (mimeType === 'application/pdf') {
      try {
        const pdfData = await pdfParse(fileBuffer);
        extractedText = pdfData.text?.trim() || '';
        confidence = extractedText.length > 50 ? 0.9 : 0.3;
      } catch (error) {
        return {
          isValid: false,
          documentType: 'unknown',
          confidence: 0,
          reason: 'PDF text extraction failed - document may be image-based or corrupted'
        };
      }
    } else if (mimeType.startsWith('image/')) {
      // Handle image files with OCR
      let worker: Worker | null = null;
      try {
        worker = await createWorker('eng');
        
        const { data: { text, confidence: ocrConfidence } } = await worker.recognize(fileBuffer);
        extractedText = text.trim();
        confidence = (ocrConfidence || 0) / 100;
        
        await worker.terminate();
      } catch (error) {
        if (worker) await worker.terminate();
        return {
          isValid: false,
          documentType: 'unknown',
          confidence: 0,
          reason: 'Image OCR processing failed'
        };
      }
    }

    // Step 2: Check if sufficient text was extracted
    if (!extractedText || extractedText.length < 50) {
      return {
        isValid: false,
        documentType: 'unknown',
        confidence: confidence,
        reason: 'Insufficient text extracted from document. Document may be blank, corrupted, or contain only images.'
      };
    }

    // Step 3: Determine document type using AI classification
    const documentType = await classifyDocumentType(extractedText);
    
    // Step 4: Validate if document is suitable for academic analysis
    if (documentType.documentType !== 'academic') {
      return {
        isValid: false,
        documentType: documentType.documentType,
        confidence: documentType.confidence,
        reason: `Document identified as ${documentType.documentType} document, not an academic document. Academic analysis requires transcripts, degrees, certificates, or enrollment documents.`,
        extractedText
      };
    }

    return {
      isValid: true,
      documentType: 'academic',
      confidence: Math.min(confidence, documentType.confidence),
      reason: 'Document validated successfully for academic analysis',
      extractedText
    };

  } catch (error) {
    return {
      isValid: false,
      documentType: 'unknown',
      confidence: 0,
      reason: `Document validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// AI-powered document type classification
async function classifyDocumentType(extractedText: string): Promise<{
  documentType: 'academic' | 'experience' | 'financial' | 'other';
  confidence: number;
  reasoning: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a document classification expert. Analyze the provided text and classify it into one of these categories:

ACADEMIC: University transcripts, degree certificates, enrollment letters, academic records, grade reports, course completion certificates, educational institution documents
EXPERIENCE: Employment letters, work experience certificates, job letters, salary certificates, employment verification, work history documents  
FINANCIAL: Bank statements, financial aid documents, loan documents, income certificates, tax documents, financial records
OTHER: Any other type of document not fitting the above categories

Respond in JSON format:
{
  "documentType": "academic|experience|financial|other",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of classification decision"
}

Key indicators:
- ACADEMIC: Contains university names, course names, grades, GPA, degree titles, academic years, enrollment status
- EXPERIENCE: Contains employer names, job titles, employment dates, salary information, work responsibilities, company letterheads
- FINANCIAL: Contains bank names, account numbers, transaction details, financial amounts, income statements`
        },
        {
          role: 'user',
          content: `Classify this document text:\n\n${extractedText.substring(0, 2000)}`
        }
      ],
      temperature: 0.1,
      max_tokens: 300
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      documentType: result.documentType || 'other',
      confidence: result.confidence || 0.5,
      reasoning: result.reasoning || 'Classification completed'
    };
  } catch (error) {
    console.error('Document classification error:', error);
    return {
      documentType: 'other',
      confidence: 0.3,
      reasoning: 'Classification failed, defaulting to other'
    };
  }
}

export async function analyzeDocumentSimplified(
  fileBuffer: Buffer, 
  mimeType: string
): Promise<{
  results: AcademicDocumentAnalysisResults;
  extractedText: string;
  tokensUsed: number;
  processingTime: number;
  confidence: number;
}> {
  const startTime = Date.now();

  try {
    // Step 1: Pre-processing validation
    console.log('Validating document for academic analysis...');
    const validation = await validateDocumentForAnalysis(fileBuffer, mimeType);
    
    if (!validation.isValid) {
      throw new Error(`Document validation failed: ${validation.reason}`);
    }

    console.log(`Document validated successfully as ${validation.documentType} with ${Math.round(validation.confidence * 100)}% confidence`);
    
    const extractedText = validation.extractedText!;
    const confidence = validation.confidence;

    // Step 2: Perform AI analysis on validated academic document
    console.log('Analyzing extracted text with OpenAI...');
    console.log('Text preview:', extractedText.substring(0, 200));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert academic document analyzer specializing in educational certificates, diplomas, transcripts, and degree documents from institutions worldwide.

Analyze the provided document text and extract comprehensive academic information. Return ONLY a valid JSON object without any markdown formatting or code blocks.

Important: The text may contain OCR errors or formatting issues, so be flexible in interpretation but accurate in extraction.`
        },
        {
          role: "user", 
          content: `Analyze this academic document text and return ONLY a JSON object with the following structure:

{
  "documentType": "Type of document (Diploma, Degree Certificate, Transcript, etc.)",
  "institutionName": "Full name of the educational institution",
  "institutionCountry": "Country where the institution is located",
  "institutionCity": "City where the institution is located", 
  "institutionType": "Type (University, College, Institute, School, etc.)",
  "qualificationLevel": "Level (Bachelor's, Master's, PhD, Diploma, Certificate, etc.)",
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
  "programType": "Type (Full-time, Part-time, Distance Learning, etc.)",
  "credits": "Number of credits or credit hours",
  "thesis": "Thesis title or research topic if applicable",
  "accreditation": "Accreditation information",
  "languageOfInstruction": "Language in which program was conducted",
  "studentId": "Student ID number if visible",
  "studentName": "Full name of the student",
  "courses": ["array of course names or subjects mentioned"],
  "skills": ["array of skills that can be inferred from courses/program"],
  "recommendations": ["array of recommendations for career or further study"],
  "additionalNotes": "Any other relevant information found in the document"
}

Document text to analyze:
"""
${extractedText}
"""

Return ONLY the JSON object, no explanations or markdown formatting:`
        }
      ],
      temperature: 0.1,
      max_tokens: 2000
    });

    const responseText = response.choices[0]?.message?.content?.trim();
    if (!responseText) {
      throw new Error('No response from OpenAI analysis');
    }

    // Parse the JSON response
    let analysisResults: AcademicDocumentAnalysisResults;
    try {
      analysisResults = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      throw new Error('Failed to parse analysis results. Please try again.');
    }

    const processingTime = Date.now() - startTime;
    const tokensUsed = response.usage?.total_tokens || 0;

    console.log(`Analysis completed in ${processingTime}ms using ${tokensUsed} tokens`);

    return {
      results: analysisResults,
      extractedText,
      tokensUsed,
      processingTime,
      confidence
    };

  } catch (error) {
    console.error('Error in document analysis:', error);
    throw error;
  }
}