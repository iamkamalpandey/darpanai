import { Request, Response } from 'express';
import { offerLetterStorage } from './offerLetterStorage';
import { analyzeOfferLetterComprehensive } from './offerLetterAnalysis_comprehensive';
import { extractTextFromDocument } from './fileProcessing';
import multer from 'multer';
import { users } from '@shared/schema';
import { db } from './db';
import { eq, desc } from 'drizzle-orm';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export function setupOfferLetterRoutes(app: any) {
  // Upload and analyze offer letter - separated workflow
  app.post('/api/offer-letter-analysis', upload.single('document'), async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!file.originalname.toLowerCase().endsWith('.pdf')) {
        return res.status(400).json({ error: 'Only PDF files are supported' });
      }

      console.log(`Processing offer letter analysis for user ${user.id}: ${file.originalname}`);

      // Step 1: Extract text from document
      const documentText = await extractTextFromPDF(file.buffer);
      
      if (!documentText || documentText.length < 100) {
        return res.status(400).json({ error: 'Could not extract sufficient text from document' });
      }

      // Step 2: Save raw document to database
      const document = await offerLetterStorage.saveDocument({
        userId: user.id,
        fileName: file.originalname,
        fileSize: file.size,
        documentText: documentText,
        // Basic extraction can be enhanced later
        institutionName: extractInstitutionName(documentText),
        studentName: extractStudentName(documentText),
        programName: extractProgramName(documentText),
        tuitionAmount: extractTuitionAmount(documentText),
        startDate: extractStartDate(documentText)
      });

      // Step 3: Perform AI analysis on the document
      const analysisResult = await analyzeOfferLetterWithOpenAI(documentText);

      // Step 4: Save analysis results to separate table
      const analysis = await offerLetterStorage.saveAnalysis({
        documentId: document.id,
        userId: user.id,
        analysisResults: analysisResult.analysis,
        gptAnalysisResults: analysisResult.analysis,
        tokensUsed: analysisResult.tokensUsed,
        processingTime: analysisResult.processingTime,
        scrapingTime: analysisResult.scrapingTime,
        totalAiCost: `$${(analysisResult.tokensUsed * 0.00001).toFixed(4)}`
      });

      console.log(`Analysis completed successfully. Document ID: ${document.id}, Analysis ID: ${analysis.id}`);

      return res.status(201).json({
        message: 'Offer letter analysis completed successfully',
        documentId: document.id,
        analysisId: analysis.id,
        fileName: document.fileName,
        analysisResults: analysisResult.analysis,
        tokensUsed: analysisResult.tokensUsed,
        processingTime: analysisResult.processingTime
      });

    } catch (error) {
      console.error('Error in offer letter analysis:', error);
      return res.status(500).json({ 
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Get all offer letter analyses for current user
  app.get('/api/offer-letter-analyses', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      const analyses = await offerLetterStorage.getUserAnalyses(user.id);

      const formattedAnalyses = analyses.map(analysis => ({
        id: analysis.id,
        documentId: analysis.documentId,
        fileName: analysis.fileName || 'Unknown Document',
        institutionName: analysis.institutionName || extractInstitutionName(JSON.stringify(analysis.analysisResults)),
        program: analysis.programName || extractProgramName(JSON.stringify(analysis.analysisResults)),
        createdAt: analysis.createdAt,
        processingTime: analysis.processingTime,
        tokensUsed: (analysis.tokensUsed || 0) + (analysis.claudeTokensUsed || 0)
      }));

      res.json(formattedAnalyses);
    } catch (error) {
      console.error('Error fetching offer letter analyses:', error);
      res.status(500).json({ error: 'Failed to fetch analyses' });
    }
  });

  // Get specific offer letter analysis by ID with document data
  app.get('/api/offer-letter-analyses/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const analysisId = parseInt(req.params.id);
      const user = req.user as any;

      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }

      // Get analysis
      const analysis = await offerLetterStorage.getAnalysisById(analysisId, user.id);
      
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }

      // Get associated document
      const document = await offerLetterStorage.getDocumentById(analysis.documentId, user.id);
      
      if (!document) {
        return res.status(404).json({ error: 'Associated document not found' });
      }

      // Return combined data
      res.json({
        id: analysis.id,
        documentId: analysis.documentId,
        fileName: document.fileName,
        fileSize: document.fileSize,
        analysisDate: analysis.createdAt,
        analysisResults: analysis.analysisResults,
        institutionName: document.institutionName,
        programName: document.programName,
        studentName: document.studentName,
        tuitionAmount: document.tuitionAmount,
        startDate: document.startDate,
        processingTime: analysis.processingTime,
        tokensUsed: analysis.tokensUsed,
        claudeTokensUsed: analysis.claudeTokensUsed,
        createdAt: analysis.createdAt
      });
    } catch (error) {
      console.error('Error fetching offer letter analysis:', error);
      res.status(500).json({ error: 'Failed to fetch analysis' });
    }
  });

  // Delete offer letter analysis
  app.delete('/api/offer-letter-analyses/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const analysisId = parseInt(req.params.id);
      const user = req.user as any;

      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }

      const success = await offerLetterStorage.deleteAnalysis(analysisId, user.id);
      
      if (success) {
        res.json({ message: 'Analysis deleted successfully' });
      } else {
        res.status(404).json({ error: 'Analysis not found or access denied' });
      }
    } catch (error) {
      console.error('Error deleting offer letter analysis:', error);
      res.status(500).json({ error: 'Failed to delete analysis' });
    }
  });

  // Admin: Get all offer letter analyses with user data
  app.get('/api/admin/offer-letter-analyses', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const analyses = await offerLetterStorage.getAllAnalysesWithUsers();

      const formattedAnalyses = analyses.map(analysis => ({
        id: analysis.id,
        documentId: analysis.documentId,
        fileName: analysis.fileName || 'Unknown Document',
        institutionName: analysis.institutionName || 'Not specified',
        program: analysis.programName || 'Not specified',
        tokensUsed: (analysis.tokensUsed || 0) + (analysis.claudeTokensUsed || 0),
        processingTime: analysis.processingTime,
        isPublic: analysis.isPublic,
        createdAt: analysis.createdAt,
        userId: analysis.userId
      }));

      res.json(formattedAnalyses);
    } catch (error) {
      console.error('Error fetching admin offer letter analyses:', error);
      res.status(500).json({ error: 'Failed to fetch analyses' });
    }
  });

  // Admin: Get specific offer letter analysis
  app.get('/api/admin/offer-letter-analyses/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const analysisId = parseInt(req.params.id);

      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }

      const analysis = await offerLetterStorage.getAnalysisById(analysisId);
      
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }

      const document = await offerLetterStorage.getDocumentById(analysis.documentId);

      res.json({
        ...analysis,
        document: document
      });
    } catch (error) {
      console.error('Error fetching admin offer letter analysis:', error);
      res.status(500).json({ error: 'Failed to fetch analysis' });
    }
  });
}

// Helper functions for basic text extraction
function extractInstitutionName(text: string): string | undefined {
  const institutionPatterns = [
    /(?:university|college|institute|school)\s+of\s+([^\n]{1,50})/i,
    /([^\n]{1,50})\s+(?:university|college|institute|school)/i,
    /institution[:\s]+([^\n]{1,50})/i
  ];
  
  for (const pattern of institutionPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1]?.trim();
    }
  }
  return undefined;
}

function extractStudentName(text: string): string | undefined {
  const namePatterns = [
    /student[:\s]+([^\n]{1,50})/i,
    /dear\s+([^\n]{1,50})/i,
    /name[:\s]+([^\n]{1,50})/i
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1]?.trim();
    }
  }
  return undefined;
}

function extractProgramName(text: string): string | undefined {
  const programPatterns = [
    /program[:\s]+([^\n]{1,100})/i,
    /course[:\s]+([^\n]{1,100})/i,
    /degree[:\s]+([^\n]{1,100})/i
  ];
  
  for (const pattern of programPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1]?.trim();
    }
  }
  return undefined;
}

function extractTuitionAmount(text: string): string | undefined {
  const tuitionPatterns = [
    /tuition[:\s]+([^\n]{1,50})/i,
    /fees[:\s]+([^\n]{1,50})/i,
    /\$[\d,]+(?:\.\d{2})?/g
  ];
  
  for (const pattern of tuitionPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1]?.trim() || match[0]?.trim();
    }
  }
  return undefined;
}

function extractStartDate(text: string): string | undefined {
  const datePatterns = [
    /start\s+date[:\s]+([^\n]{1,50})/i,
    /commence[:\s]+([^\n]{1,50})/i,
    /begin[:\s]+([^\n]{1,50})/i
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1]?.trim();
    }
  }
  return undefined;
}