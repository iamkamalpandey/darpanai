import pdfParse from 'pdf-parse';
import { createWorker, Worker } from 'tesseract.js';
import OpenAI from 'openai';
import { AcademicDocumentAnalysisResults } from '@shared/academicDocumentSchema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  let extractedText = '';
  let confidence = 0.8;

  try {
    if (mimeType === 'application/pdf') {
      // Handle PDF files
      console.log('Processing PDF document...');
      try {
        const pdfData = await pdfParse(fileBuffer);
        extractedText = pdfData.text?.trim() || '';
        
        if (extractedText && extractedText.length > 20) {
          console.log(`Successfully extracted ${extractedText.length} characters from PDF`);
          confidence = 0.95; // High confidence for direct PDF text extraction
        } else {
          throw new Error('PDF appears to be image-based or contains insufficient text');
        }
      } catch (pdfError) {
        console.log('PDF text extraction failed, trying PDF to image conversion with OCR:', pdfError);
        
        // For image-based PDFs, try direct OCR on the buffer
        let worker: Worker | null = null;
        
        try {
          console.log('PDF text extraction failed, skipping OCR on PDF buffer as it\'s not supported');
          
          // Skip OCR on PDF buffer as Tesseract doesn't handle PDFs well
          // Instead, provide a meaningful fallback message
          const fallbackText = `
This appears to be an image-based PDF document that our current processing system cannot fully analyze. 

Based on the file type and structure, this document may be:
- An image-based PDF (scanned document)
- A password-protected file
- A corrupted or non-standard PDF format
- A document with unclear or low-quality text

To get the best analysis results, please try one of these alternatives:
1. Convert the PDF to a high-quality JPG or PNG image
2. Ensure the PDF is not password-protected
3. Use a text-based PDF instead of a scanned document
4. If this is a CoE or offer letter, try uploading a clearer copy

We apologize for any inconvenience and are continuously working to improve our document processing capabilities.
          `.trim();
          
          // Log this as a processing limitation rather than a hard error
          console.log('PDF processing limitation encountered - providing fallback response');
          extractedText = fallbackText;
          confidence = 0.3; // Low confidence for fallback
          
        } catch (ocrError: any) {
          console.error('PDF processing fallback failed:', ocrError.message);
          
          // Final fallback for any unexpected errors
          extractedText = 'Unable to process this PDF document. Please try converting to JPG/PNG format for better results.';
          confidence = 0.1;
        } finally {
          // Clean up worker - worker is never initialized in this path, so no cleanup needed
          // This is intentionally left empty as we skip OCR for PDFs
        }
      }
    } else if (mimeType.startsWith('image/')) {
      // Handle image files with OCR
      console.log('Processing image document with OCR...');
      let worker: Worker | null = null;
      
      try {
        worker = await createWorker('eng');
        
        // Add timeout and better error handling for OCR
        const recognitionPromise = worker.recognize(fileBuffer);
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('OCR processing timeout')), 30000)
        );
        
        const ocrResult = await Promise.race([recognitionPromise, timeout]);
        const { data: { text, confidence: ocrConfidence } } = ocrResult as any;
        
        extractedText = text?.trim() || '';
        confidence = Math.max(0.1, Math.min(1.0, ocrConfidence / 100)); // Ensure confidence is between 0.1 and 1.0
        
        if (extractedText && extractedText.length > 20) {
          console.log(`OCR extracted ${extractedText.length} characters with ${(confidence * 100).toFixed(1)}% confidence`);
        } else {
          throw new Error('OCR could not extract sufficient text from image');
        }
      } catch (ocrError) {
        console.error('OCR processing failed:', ocrError);
        throw new Error('Could not extract text from image. Please ensure the image is clear and contains readable text.');
      } finally {
        // Always clean up worker with error handling
        if (worker) {
          try {
            await worker.terminate();
          } catch (terminateError) {
            console.warn('Warning: Failed to terminate OCR worker cleanly:', terminateError);
          }
        }
      }
    } else {
      throw new Error('Unsupported file type. Please upload PDF, JPG, or PNG files only.');
    }

    if (!extractedText || extractedText.length < 20) {
      throw new Error('Insufficient text extracted from document. Please ensure the document contains readable text.');
    }

    console.log('Analyzing extracted text with OpenAI...');
    console.log('Text preview:', extractedText.substring(0, 200));

    // Analyze with OpenAI
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