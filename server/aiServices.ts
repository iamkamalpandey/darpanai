import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

// Initialize AI services
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Google Cloud Vision client will be initialized in each function as needed

interface OCRResult {
  text: string;
  confidence: number;
  blocks?: any[];
}

interface DocumentClassification {
  isAcademic: boolean;
  documentType: string;
  confidence: number;
  reasoning: string;
}

interface InformationExtraction {
  studentInfo: {
    name?: string;
    studentId?: string;
    dateOfBirth?: string;
  };
  institutionInfo: {
    name?: string;
    address?: string;
    accreditation?: string;
  };
  programInfo: {
    programName?: string;
    degree?: string;
    major?: string;
    completionDate?: string;
    startDate?: string;
  };
  academicRecords: {
    grades?: string[];
    gpa?: string;
    credits?: string;
    subjects?: string[];
  };
  certificateInfo: {
    certificateType?: string;
    issueDate?: string;
    validUntil?: string;
  };
}

/**
 * Advanced OCR with Google Cloud Vision API and multiple fallbacks
 */
export async function performAdvancedOCR(fileBuffer: Buffer, mimeType: string = 'application/pdf'): Promise<OCRResult> {
  console.log(`🔍 Starting OCR processing for ${mimeType}...`);

  // For PDFs, try PDF text extraction first (fastest and most accurate for text-based PDFs)
  if (mimeType === 'application/pdf') {
    try {
      const pdfResult = await extractTextFromPDF(fileBuffer);
      if (pdfResult.text.length > 20) {
        console.log(`✅ PDF text extraction successful: ${pdfResult.text.length} characters`);
        return pdfResult;
      }
      console.log('⚠️ PDF has insufficient text, converting to images for OCR...');
      // Convert PDF to images for OCR processing
      return await processPDFWithOCR(fileBuffer);
    } catch (error) {
      console.log('⚠️ PDF text extraction failed, converting to images for OCR...');
      return await processPDFWithOCR(fileBuffer);
    }
  }

  // For image files, process directly with OCR
  return await processImageWithOCR(fileBuffer);
}

/**
 * PDF text extraction using pdf-parse
 */
async function extractTextFromPDF(pdfBuffer: Buffer): Promise<OCRResult> {
  try {
    const pdfParse = await import('pdf-parse');
    const data = await pdfParse.default(pdfBuffer);
    
    return {
      text: data.text || '',
      confidence: 95, // PDF text extraction is highly accurate
      blocks: []
    };
  } catch (error) {
    console.error('❌ PDF text extraction failed:', error);
    throw new Error('PDF text extraction failed');
  }
}

/**
 * Process PDF by converting to images and performing OCR
 */
async function processPDFWithOCR(pdfBuffer: Buffer): Promise<OCRResult> {
  try {
    console.log('🔄 Converting PDF to images for OCR processing...');
    
    // Convert PDF to images using pdf2pic
    const pdf2pic = await import('pdf2pic');
    const convert = pdf2pic.fromBuffer(pdfBuffer, {
      density: 200,           // Higher DPI for better OCR
      saveFilename: "page",
      savePath: "/tmp",
      format: "png",
      width: 1200,
      height: 1600
    });
    
    // Convert first page to image buffer
    const image = await convert(1, { responseType: "buffer" });
    const imageBuffer = image.buffer;
    
    if (!imageBuffer) {
      throw new Error('Failed to convert PDF page to image buffer');
    }
    
    console.log('✅ PDF converted to image, processing with OCR...');
    return await processImageWithOCR(imageBuffer as Buffer);
    
  } catch (error) {
    console.error('❌ PDF to image conversion failed:', error);
    throw new Error('PDF conversion and OCR processing failed');
  }
}

/**
 * Process images with Google Cloud Vision and Tesseract fallback
 */
async function processImageWithOCR(imageBuffer: Buffer): Promise<OCRResult> {
  // Try Google Cloud Vision API first with proper error handling
  try {
    console.log('🔍 Attempting Google Cloud Vision OCR...');
    
    if (!process.env.GOOGLE_CLOUD_VISION_API_KEY) {
      console.log('⚠️ Google Cloud Vision API key not found, using Tesseract...');
      return await performTesseractOCR(imageBuffer);
    }

    const visionClient = new ImageAnnotatorClient({
      apiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY,
    });
    
    const [result] = await visionClient.documentTextDetection({
      image: { content: imageBuffer },
    });

    const detections = result.textAnnotations || [];
    if (detections.length === 0) {
      console.log('⚠️ No text detected by Google Vision, using enhanced Tesseract...');
      return await performTesseractOCR(imageBuffer);
    }

    const fullText = detections[0]?.description || '';
    const confidence = 95; // Google Vision typically has high confidence

    console.log(`✅ Google Cloud Vision OCR completed: ${fullText.length} characters with ${confidence}% confidence`);
    console.log('📝 Google Vision extracted text preview (first 500 chars):', fullText.substring(0, 500));

    return {
      text: fullText,
      confidence: confidence,
      blocks: (result.textAnnotations || []) as any[]
    };

  } catch (error) {
    console.log('⚠️ Google Cloud Vision failed:', error instanceof Error ? error.message : 'Unknown error');
    console.log('⚠️ Falling back to enhanced Tesseract OCR...');
    return await performTesseractOCR(imageBuffer);
  }
}

/**
 * Tesseract OCR fallback function - for image buffers only
 */
async function performTesseractOCR(imageBuffer: Buffer): Promise<OCRResult> {
  try {
    console.log('🔍 Starting Enhanced Tesseract OCR processing...');
    
    // Dynamic import for Tesseract.js and Sharp for image preprocessing
    const { default: Tesseract } = await import('tesseract.js');
    
    let processedBuffer = imageBuffer;
    
    // Try to enhance image quality with Sharp if available
    try {
      const sharp = await import('sharp');
      console.log('🔧 Preprocessing image for better OCR accuracy...');
      
      processedBuffer = await sharp.default(imageBuffer)
        .resize(null, 1800, { 
          withoutEnlargement: false,
          kernel: sharp.default.kernel.lanczos3 
        })
        .grayscale()
        .normalize()
        .sharpen()
        .png()
        .toBuffer();
        
      console.log('✅ Image preprocessing completed');
    } catch (sharpError) {
      console.log('⚠️ Sharp preprocessing not available, using original image');
    }
    
    const { data: { text, confidence } } = await Tesseract.recognize(processedBuffer, 'eng', {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          console.log(`📊 Enhanced Tesseract progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    console.log(`✅ Enhanced Tesseract OCR completed: ${text.length} characters extracted with ${confidence.toFixed(1)}% confidence`);
    console.log('📝 Extracted text preview (first 500 chars):', text.substring(0, 500));

    return {
      text: text || '',
      confidence: confidence || 85,
      blocks: []
    };

  } catch (error) {
    console.error('❌ Tesseract OCR failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`OCR processing failed: ${errorMessage}`);
  }
}

/**
 * Document Classification using Anthropic Claude
 */
export async function classifyDocument(text: string): Promise<DocumentClassification> {
  try {
    console.log('🎯 Classifying document with Anthropic Claude...');

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Analyze this document text and determine if it's an academic document. Academic documents include: transcripts, diplomas, certificates, enrollment letters, graduation certificates, mark sheets, academic records.

NON-academic documents include: experience letters, employment certificates, recommendation letters, personal statements, cover letters.

Document text:
${text.substring(0, 2000)}

Respond with JSON:
{
  "isAcademic": boolean,
  "documentType": "transcript|diploma|certificate|enrollment_letter|experience_letter|other",
  "confidence": number (0-100),
  "reasoning": "Brief explanation"
}`
      }]
    });

    const content = response.content[0];
    const result = JSON.parse((content as any).text);
    console.log(`✅ Document classified: ${result.documentType} (${result.confidence}% confidence)`);
    
    return result;

  } catch (error) {
    console.log('⚠️ Claude classification failed, trying OpenAI fallback...');
    return await classifyDocumentWithOpenAI(text);
  }
}

/**
 * Document Classification fallback using OpenAI
 */
async function classifyDocumentWithOpenAI(text: string): Promise<DocumentClassification> {
  try {
    console.log('🎯 Classifying document with OpenAI...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Analyze this document text and determine if it's an academic document. The text may be incomplete due to OCR processing, but look for any academic indicators.

Academic documents include: transcripts, diplomas, certificates, enrollment letters, graduation certificates, mark sheets, academic records, HSEB documents, university transcripts.

Look for keywords like:
- Institution names (University, Board, College, HSEB)
- Academic terms (Grade XI, Grade XII, Bachelor, First Division)
- Subject names with marks/grades
- Student identifiers (Symbol No, Registration No)
- Academic years or semesters
- Percentage, marks, or GPA information

NON-academic documents include: experience letters, employment certificates, recommendation letters.

Document text (may be fragmented):
${text.substring(0, 2000)}

Be generous with classification - even fragmented text with clear academic content should be classified as academic.

Respond with JSON:
{
  "isAcademic": boolean,
  "documentType": "transcript|diploma|certificate|enrollment_letter|experience_letter|other",
  "confidence": number (0-100),
  "reasoning": "Brief explanation of academic indicators found"
}`
      }],
      temperature: 0.1
    });

    let content = response.choices[0].message.content!;
    // Clean up content if it contains markdown code blocks
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    const result = JSON.parse(content);
    console.log(`✅ Document classified with OpenAI: ${result.documentType} (${result.confidence}% confidence)`);
    
    return result;

  } catch (error) {
    console.error('❌ Document classification failed completely:', error);
    // Return a permissive classification to allow processing to continue
    return {
      isAcademic: true, // Allow processing to continue
      documentType: 'other',
      confidence: 50,
      reasoning: 'Classification service unavailable, proceeding with analysis'
    };
  }
}

/**
 * Information Extraction using OpenAI GPT-4
 */
export async function extractInformation(text: string, documentType: string): Promise<InformationExtraction> {
  try {
    console.log('📊 Extracting information with OpenAI GPT-4...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'system',
        content: `You are an expert at extracting structured information from academic transcripts and certificates, especially from Nepal and South Asian institutions (HSEB, Tribhuvan University, etc.). Extract relevant information and return it as JSON.

Document type: ${documentType}

For academic transcripts, focus on extracting:

STUDENT INFORMATION:
- Student's Name
- Registration/Symbol Number
- Date of Birth
- School/Campus name

INSTITUTION DETAILS:
- Institution Name (e.g., "Higher Secondary Education Board Nepal", "Tribhuvan University")
- Office/Controller (e.g., "Office of the Controller of Examinations")
- Location (Kathmandu, Nepal, etc.)
- Issue Number/Registration Number

ACADEMIC PROGRAM:
- Degree/Certificate Type (Bachelor's Degree, HSEB Certificate, etc.)
- Field of Study (Business Studies, Science, Management, etc.)
- Course Duration (3 Academic Years, 2 Years, etc.)
- Program Starting/Ending Year
- Institute/Faculty name

ACADEMIC PERFORMANCE:
- Individual Subject Marks (Full Marks, Pass Marks, Marks Obtained)
- Grade levels (Grade XI, Grade XII, First Year, Second Year, Third Year)
- Total Marks and Percentage
- Division/Grade (First Division, Second Division, Pass, etc.)
- Year of Completion
- Passed Year

GRADING SYSTEM:
- Total possible marks
- Marks obtained
- Percentage achieved
- Division achieved
- Grading scale used

For Nepalese transcripts specifically look for:
- HSEB Registration Numbers
- Symbol Numbers
- Academic Years (2067, 2068 BS or 2010, 2011 AD)
- Nepali date formats
- Subject codes (MGT.311, ENG.201, etc.)
- Faculty names (Management, Science, Humanities)

Return empty strings for missing information. Be precise and accurate with Nepalese academic terminology.`
      }, {
        role: 'user',
        content: `Extract information from this Nepalese academic transcript text. The text is from OCR so may be fragmented, but extract all available information:

OCR Text:
${text}

EXTRACTION INSTRUCTIONS:
1. Look for "Tribhuvan University" or similar institution names
2. Find "Academic Transcript" or similar document types
3. Extract degree information like "Bachelor's Degree in Business Studies"
4. Look for "Percentage:" followed by numbers (like "44.59")
5. Find student names after "Student's Name:" or "Name:"
6. Extract registration/roll numbers or symbol numbers
7. Look for campus names or faculty information
8. Find examination details and course duration
9. Extract any grade divisions or academic performance data
10. Look for subject names and marks in table format

Even with incomplete OCR text, extract every identifiable piece of academic information. Be specific about what you find and where it appears in the text.`
      }],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const extracted = JSON.parse(response.choices[0].message.content!);
    console.log('✅ Information extraction completed');
    
    return extracted;

  } catch (error) {
    console.error('❌ Information extraction failed:', error);
    return {
      studentInfo: {},
      institutionInfo: {},
      programInfo: {},
      academicRecords: {},
      certificateInfo: {}
    };
  }
}

/**
 * Data Categorization and Structuring using OpenAI
 */
export async function categorizeAndStructure(extractedInfo: InformationExtraction, originalText: string): Promise<any> {
  try {
    console.log('🏗️ Categorizing and structuring data with OpenAI...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'system',
        content: `You are an expert at analyzing Nepalese academic transcripts, specifically from Tribhuvan University and HSEB Nepal. 

Based on the OCR text extracted from a Nepalese academic transcript, structure the information into JSON format:

STUDENT INFORMATION:
- studentName: Extract student's full name (look for patterns like "Student's Name:" or "Name:")
- registrationNumber: University registration/roll number
- symbolNumber: Symbol number (common in HSEB documents)
- campus: Campus name where studied

INSTITUTION DETAILS:
- institutionName: "Tribhuvan University" (if mentioned) or other institution name
- institutionType: "University" or "Board" 
- institutionCountry: "Nepal"
- institutionCity: "Kathmandu" (if mentioned) or other city

ACADEMIC PROGRAM:
- qualificationLevel: "Bachelor's" or "Higher Secondary" etc.
- qualificationTitle: Extract degree name (e.g., "Bachelor's Degree in Business Studies")
- fieldOfStudy: Field like "Business Studies", "Science", "Management"
- faculty: Faculty name if mentioned
- duration: Course duration in years

ACADEMIC PERFORMANCE:
- percentage: Look for "Percentage:" followed by number (like "44.59")
- passedDivision: Division achieved (First Division, Second Division, etc.)
- totalMarks: Total possible marks
- marksObtained: Total marks secured
- passedYear: Year of completion
- subjectMarks: Array of subjects with marks if table data is available

EXAMINATION DETAILS:
- examinationType: Type of examination (like "Bachelors Degree", "Grade XI", "Grade XII")
- academicYear: Academic year in BS/AD format if mentioned
- issueDate: Date of transcript issue

Return ONLY valid JSON. If information is not clearly visible in the text, use empty string "". Do not make assumptions.`
      }, {
        role: 'user',
        content: `Organize this extracted information:

${JSON.stringify(extractedInfo, null, 2)}

Original document text (for context):
${originalText.substring(0, 1000)}...`
      }],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const structured = JSON.parse(response.choices[0].message.content!);
    console.log('✅ Data categorization completed');
    
    return structured;

  } catch (error) {
    console.error('❌ Data categorization failed:', error);
    return {};
  }
}

/**
 * Comprehensive Multi-AI Document Processing Pipeline
 */
export async function processDocumentWithMultiAI(fileBuffer: Buffer, mimeType: string): Promise<{
  success: boolean;
  ocrResult: OCRResult;
  classification: DocumentClassification;
  extractedInfo: InformationExtraction;
  structuredData: any;
  processingTime: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting Multi-AI Document Processing Pipeline...');
    
    // Step 1: Advanced OCR with Google Cloud Vision
    const ocrResult = await performAdvancedOCR(fileBuffer, mimeType);
    
    if (ocrResult.text.length < 20) {
      return {
        success: false,
        ocrResult,
        classification: { isAcademic: false, documentType: 'unknown', confidence: 0, reasoning: 'Insufficient text' },
        extractedInfo: { studentInfo: {}, institutionInfo: {}, programInfo: {}, academicRecords: {}, certificateInfo: {} },
        structuredData: {},
        processingTime: Date.now() - startTime,
        error: 'Insufficient text extracted from document'
      };
    }
    
    // Step 2: Document Classification with Anthropic Claude
    const classification = await classifyDocument(ocrResult.text);
    
    if (!classification.isAcademic) {
      return {
        success: false,
        ocrResult,
        classification,
        extractedInfo: { studentInfo: {}, institutionInfo: {}, programInfo: {}, academicRecords: {}, certificateInfo: {} },
        structuredData: {},
        processingTime: Date.now() - startTime,
        error: `Document is not academic: ${classification.reasoning}`
      };
    }
    
    // Step 3: Information Extraction with OpenAI GPT-4
    const extractedInfo = await extractInformation(ocrResult.text, classification.documentType);
    
    // Step 4: Data Categorization and Structuring
    const structuredData = await categorizeAndStructure(extractedInfo, ocrResult.text);
    
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Multi-AI processing completed in ${processingTime}ms`);
    
    return {
      success: true,
      ocrResult,
      classification,
      extractedInfo,
      structuredData,
      processingTime
    };
    
  } catch (error) {
    console.error('❌ Multi-AI processing failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
    return {
      success: false,
      ocrResult: { text: '', confidence: 0 },
      classification: { isAcademic: false, documentType: 'unknown', confidence: 0, reasoning: 'Processing failed' },
      extractedInfo: { studentInfo: {}, institutionInfo: {}, programInfo: {}, academicRecords: {}, certificateInfo: {} },
      structuredData: {},
      processingTime: Date.now() - startTime,
      error: errorMessage
    };
  }
}