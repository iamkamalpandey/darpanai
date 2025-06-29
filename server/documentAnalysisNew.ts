import pdfParse from 'pdf-parse';
import { createWorker, Worker } from 'tesseract.js';
import OpenAI from 'openai';
import { AcademicDocumentAnalysisResults } from '@shared/academicDocumentSchema';
import { processDocumentWithMultiAI, performAdvancedOCR, classifyDocument, extractInformation, categorizeAndStructure } from './aiServices';

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
        
        // If direct text extraction yields insufficient text, try alternative approaches
        if (extractedText.length < 30) {
          console.log('PDF has insufficient text, checking if this is an image-based PDF...');
          
          // For now, we'll provide guidance to convert to image format
          // This avoids the pdf2pic dependency issues while maintaining functionality
          console.log('Recommending image conversion for better OCR processing');
        }
      } catch (error) {
        console.error('PDF processing failed:', error);
        return {
          isValid: false,
          documentType: 'unknown',
          confidence: 0,
          reason: 'PDF processing failed - document may be corrupted or password-protected'
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

    // Step 2: Check if sufficient text was extracted (reduced threshold for academic documents)
    if (!extractedText || extractedText.length < 30) {
      console.log(`Text extraction result: "${extractedText}" (${extractedText?.length || 0} characters)`);
      
      // Provide more specific guidance based on the processing attempt
      let reason = 'Insufficient text extracted from document. ';
      if (mimeType === 'application/pdf') {
        reason += 'This PDF appears to be image-based or has very little readable text. For best results, please:\n';
        reason += '1. Convert the PDF to a JPG or PNG image (screenshot or export)\n';
        reason += '2. Ensure the image is high-resolution and clear\n';
        reason += '3. Upload the image file instead of the PDF';
      } else {
        reason += 'Please ensure the image is clear, high-resolution, and contains readable text. For scanned documents, try uploading a higher quality version.';
      }
      
      return {
        isValid: false,
        documentType: 'unknown',
        confidence: confidence,
        reason: reason
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
    // Use Multi-AI Processing Pipeline for enterprise-grade accuracy
    console.log('🚀 Starting Multi-AI Document Processing Pipeline...');
    
    const multiAIResult = await processDocumentWithMultiAI(fileBuffer, mimeType);
    
    if (!multiAIResult.success) {
      throw new Error(`Multi-AI processing failed: ${multiAIResult.error}`);
    }
    
    console.log(`✅ Multi-AI processing completed successfully in ${multiAIResult.processingTime}ms`);
    console.log(`📊 OCR Confidence: ${multiAIResult.ocrResult.confidence.toFixed(1)}%`);
    console.log(`🎯 Classification: ${multiAIResult.classification.documentType} (${multiAIResult.classification.confidence}% confidence)`);
    
    const extractedText = multiAIResult.ocrResult.text;
    const confidence = multiAIResult.classification.confidence;

    // Convert multi-AI structured data to required format
    console.log('📊 Converting structured data to analysis results...');
    
    const analysisResults: AcademicDocumentAnalysisResults = {
      // Document Classification
      documentType: multiAIResult.classification.documentType || 'Unknown',
      
      // Institution Information
      institutionName: multiAIResult.structuredData.institutionName || 
                      multiAIResult.extractedInfo.institutionInfo?.name || 'Not specified',
      institutionCountry: multiAIResult.structuredData.institutionCountry || 'Nepal',
      institutionCity: multiAIResult.structuredData.institutionCity || 'Kathmandu',
      institutionType: multiAIResult.structuredData.institutionType || 'University',
      
      // Qualification Details
      qualificationLevel: multiAIResult.structuredData.qualificationLevel || 
                         multiAIResult.extractedInfo.programInfo?.degree || 'Not specified',
      qualificationTitle: multiAIResult.structuredData.qualificationTitle ||
                         multiAIResult.extractedInfo.programInfo?.programName || 'Not specified',
      fieldOfStudy: multiAIResult.structuredData.fieldOfStudy ||
                   multiAIResult.extractedInfo.programInfo?.major || 'Not specified',
      major: multiAIResult.structuredData.major || multiAIResult.extractedInfo.programInfo?.major || 'Not specified',
      minor: multiAIResult.structuredData.minor || 'Not specified',
      specialization: multiAIResult.structuredData.specialization || 'Not specified',
      
      // Student Information
      studentName: multiAIResult.structuredData.studentName || multiAIResult.extractedInfo.studentInfo?.name || 'Not specified',
      studentId: multiAIResult.structuredData.studentId || multiAIResult.extractedInfo.studentInfo?.studentId || 'Not specified',
      registrationNumber: multiAIResult.structuredData.registrationNumber || 'Not specified',
      symbolNumber: multiAIResult.structuredData.symbolNumber || 'Not specified',
      dateOfBirth: multiAIResult.structuredData.dateOfBirth || 'Not specified',
      campus: multiAIResult.structuredData.campus || 'Not specified',
      school: multiAIResult.structuredData.school || 'Not specified',
      
      // Nepalese Academic System Specific
      hsebRegistrationNo: multiAIResult.structuredData.hsebRegistrationNo || 'Not specified',
      issueNumber: multiAIResult.structuredData.issueNumber || 'Not specified',
      academicYear: multiAIResult.structuredData.academicYear || 'Not specified',
      passedYear: multiAIResult.structuredData.passedYear || 'Not specified',
      passedDivision: multiAIResult.structuredData.passedDivision || 'Not specified',
      totalMarks: multiAIResult.structuredData.totalMarks || 'Not specified',
      marksObtained: multiAIResult.structuredData.marksObtained || 'Not specified',
      percentage: multiAIResult.structuredData.percentage || 'Not specified',
      
      // Grade/Year Information
      gradeLevel: multiAIResult.structuredData.gradeLevel || 'Not specified',
      faculty: multiAIResult.structuredData.faculty || 'Not specified',
      
      // Academic Performance
      gpa: multiAIResult.structuredData.gpa ||
           multiAIResult.extractedInfo.academicRecords?.gpa || 'Not specified',
      gradeScale: multiAIResult.structuredData.gradeScale || 'Percentage',
      overallGrade: multiAIResult.structuredData.overallGrade || 'Not specified',
      honors: multiAIResult.structuredData.honors || 'Not specified',
      
      // Subject-wise Performance
      subjectMarks: multiAIResult.structuredData.subjectMarks || [],
      
      // Timeline
      startDate: multiAIResult.structuredData.startDate || multiAIResult.extractedInfo.programInfo?.startDate || 'Not specified',
      endDate: multiAIResult.structuredData.endDate || multiAIResult.extractedInfo.programInfo?.completionDate || 'Not specified',
      graduationDate: multiAIResult.structuredData.graduationDate || 'Not specified',
      duration: multiAIResult.structuredData.duration || 'Not specified',
      
      // Program Details
      programType: multiAIResult.structuredData.programType || 'Full-time',
      credits: multiAIResult.extractedInfo.academicRecords?.credits || 'Not specified',
      thesis: multiAIResult.structuredData.thesis || 'Not specified',
      
      // Additional Information
      accreditation: multiAIResult.structuredData.accreditation || 'Not specified',
      languageOfInstruction: multiAIResult.structuredData.languageOfInstruction || 'English/Nepali',
      
      courses: multiAIResult.extractedInfo.academicRecords?.subjects || [],
      skills: multiAIResult.structuredData.ADDITIONAL_INFO?.skills || [],
      recommendations: multiAIResult.structuredData.ADDITIONAL_INFO?.recommendations || [],
      additionalNotes: multiAIResult.structuredData.ADDITIONAL_INFO?.notes || 'No additional information'
    };

    const processingTime = Date.now() - startTime;
    const tokensUsed = 0; // Multi-AI token usage tracked separately

    console.log(`✅ Enhanced multi-AI analysis completed in ${processingTime}ms`);
    console.log(`📈 Processing pipeline: Google Vision OCR → Anthropic Classification → OpenAI Information Extraction → Data Structuring`);

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