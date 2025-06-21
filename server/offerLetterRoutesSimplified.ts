import { Request, Response } from 'express';
import multer from 'multer';
import { offerLetterStorage } from './offerLetterStorage';
import { extractTextFromPdf } from './fileProcessing';
import OpenAI from 'openai';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export function setupOfferLetterRoutesSimplified(app: any) {
  // Simplified upload and analyze offer letter
  app.post('/api/offer-letter-analysis-new', upload.single('document'), async (req: Request, res: Response) => {
    try {
      const user = { id: 4 }; // Default test user
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log(`Processing offer letter for separated architecture test: ${file.originalname}`);

      // Step 1: Extract text from PDF
      const documentText = await extractTextFromPdf(file.buffer);
      console.log(`Extracted ${documentText.length} characters from document`);

      // Step 2: Extract real data from document text
      const extractedData = extractDocumentData(documentText);
      
      // Step 3: Save document to documents table with extracted data
      const document = await offerLetterStorage.saveDocument({
        userId: user.id,
        fileName: file.originalname,
        fileSize: file.size,
        documentText: documentText,
        institutionName: extractedData.institutionName,
        programName: extractedData.programName,
        studentName: extractedData.studentName,
        tuitionAmount: extractedData.tuitionAmount,
        startDate: extractedData.startDate
      });

      // Step 4: Perform AI analysis with OpenAI
      const startTime = Date.now();
      const aiAnalysis = await performOfferLetterAnalysis(documentText, extractedData);
      const processingTime = Date.now() - startTime;

      const analysisResult = {
        analysis: aiAnalysis.analysis,
        tokensUsed: aiAnalysis.tokensUsed,
        processingTime: processingTime
      };

      // Step 4: Save analysis results to separate table
      const analysis = await offerLetterStorage.saveAnalysis({
        documentId: document.id,
        userId: user.id,
        analysisResults: analysisResult.analysis,
        gptAnalysisResults: analysisResult.analysis,
        tokensUsed: analysisResult.tokensUsed,
        processingTime: analysisResult.processingTime,
        totalAiCost: `$${(analysisResult.tokensUsed * 0.00001).toFixed(4)}`
      });

      console.log(`Successfully completed separated architecture test - Analysis ID: ${analysis.id}`);

      res.status(201).json({
        id: analysis.id,
        analysis: analysisResult.analysis,
        documentId: document.id,
        tokensUsed: analysisResult.tokensUsed,
        processingTime: analysisResult.processingTime
      });

    } catch (error) {
      console.error('Error in separated architecture test:', error);
      res.status(500).json({ 
        error: 'Analysis processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get all analyses for simplified testing
  app.get('/api/offer-letter-analyses-new', async (req: Request, res: Response) => {
    try {
      const user = { id: 4 }; // Default test user
      const analyses = await offerLetterStorage.getUserAnalyses(user.id);
      
      console.log(`Retrieved ${analyses.length} analyses for separated architecture test`);
      res.json(analyses);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      res.status(500).json({ error: 'Failed to fetch analyses' });
    }
  });

  // Get specific analysis by ID
  app.get('/api/offer-letter-analyses-new/:id', async (req: Request, res: Response) => {
    try {
      const analysisId = parseInt(req.params.id);
      const user = { id: 4 };

      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }

      const analysis = await offerLetterStorage.getAnalysisById(analysisId, user.id);
      
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }

      res.json(analysis);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      res.status(500).json({ error: 'Failed to fetch analysis' });
    }
  });

  console.log('✓ Separated offer letter architecture routes registered successfully');
}

// Helper function to extract basic information from text
function extractInstitutionName(text: string): string | undefined {
  const patterns = [
    /(?:University|College|Institute|School)\s+of\s+[\w\s]+/i,
    /[\w\s]+\s+(?:University|College|Institute|School)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }
  return undefined;
}

function extractStudentName(text: string): string | undefined {
  const patterns = [
    /Dear\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/,
    /Student\s+Name:\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return undefined;
}

function extractProgramName(text: string): string | undefined {
  const patterns = [
    /Program:\s*(.+?)(?:\n|$)/,
    /Course:\s*(.+?)(?:\n|$)/,
    /Bachelor of\s+[\w\s]+/i,
    /Master of\s+[\w\s]+/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1]?.trim() || match[0].trim();
  }
  return undefined;
}

function extractTuitionAmount(text: string): string | undefined {
  const patterns = [
    /\$[\d,]+\.?\d*\s*(?:per\s+year|annually)/i,
    /Tuition:\s*\$[\d,]+/i,
    /Fee:\s*\$[\d,]+/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }
  return undefined;
}

function extractStartDate(text: string): string | undefined {
  const patterns = [
    /Start\s+Date:\s*(.+?)(?:\n|$)/i,
    /Commencement:\s*(.+?)(?:\n|$)/i,
    /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1]?.trim() || match[0].trim();
  }
  return undefined;
}