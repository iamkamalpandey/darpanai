import { Request, Response, Express } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { analyzeOfferLetter } from './offerLetterAnalysisService';
import { db } from './db';
import { offerLetterAnalyses, users, type OfferLetterAnalysis, type InsertOfferLetterAnalysis } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, and PNG files are allowed'));
    }
  }
});

export function setupOfferLetterRoutes(app: Express, requireAuth: any, requireAdmin: any) {
  
  // Upload and analyze offer letter document
  app.post('/api/offer-letter-analysis', requireAuth, upload.single('document'), async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Check user quota
      if (user.analysisCount >= user.maxAnalyses) {
        return res.status(403).json({ 
          error: 'Analysis quota exceeded',
          remainingAnalyses: 0,
          maxAnalyses: user.maxAnalyses
        });
      }

      // Extract text from PDF
      let documentText = '';
      try {
        if (req.file.mimetype === 'application/pdf') {
          const pdfData = await pdfParse(req.file.buffer);
          documentText = pdfData.text;
        } else {
          // For images, you would use OCR here (Tesseract.js)
          documentText = 'Image OCR not implemented yet';
        }
      } catch (parseError) {
        console.error('Error parsing document:', parseError);
        return res.status(400).json({ error: 'Failed to extract text from document' });
      }

      if (documentText.length < 100) {
        return res.status(400).json({ error: 'Document appears to be empty or corrupted' });
      }

      // Perform comprehensive multi-AI analysis
      const analysisResult = await analyzeOfferLetter(documentText, req.file.originalname);

      // Save analysis to database
      const newAnalysis: InsertOfferLetterAnalysis = {
        userId: user.id,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        documentText: documentText,
        analysisResults: analysisResult.analysis,
        gptAnalysisResults: analysisResult.gptAnalysis,
        claudeAnalysisResults: analysisResult.claudeAnalysis,
        hybridAnalysisResults: analysisResult.hybridAnalysis,
        institutionalData: analysisResult.institutionalData,
        scholarshipData: analysisResult.scholarshipData,
        competitorAnalysis: analysisResult.competitorAnalysis,
        tokensUsed: analysisResult.tokensUsed,
        claudeTokensUsed: analysisResult.claudeTokensUsed,
        totalAiCost: `$${((analysisResult.tokensUsed * 0.00003) + (analysisResult.claudeTokensUsed * 0.000015)).toFixed(4)}`,
        processingTime: analysisResult.processingTime,
        scrapingTime: analysisResult.scrapingTime,
        isPublic: false
      };

      const [savedAnalysis] = await db
        .insert(offerLetterAnalyses)
        .values(newAnalysis)
        .returning();

      // Update user analysis count
      await db
        .update(users)
        .set({ analysisCount: user.analysisCount + 1 })
        .where(eq(users.id, user.id));

      res.status(201).json({
        id: savedAnalysis.id,
        analysis: analysisResult.analysis,
        processingTime: analysisResult.processingTime,
        tokensUsed: analysisResult.tokensUsed + analysisResult.claudeTokensUsed,
        scrapingTime: analysisResult.scrapingTime
      });

    } catch (error) {
      console.error('Error in offer letter analysis:', error);
      res.status(500).json({ 
        error: 'Failed to analyze offer letter',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get all offer letter analyses for current user
  app.get('/api/offer-letter-analyses', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      const analyses = await db
        .select()
        .from(offerLetterAnalyses)
        .where(eq(offerLetterAnalyses.userId, user.id))
        .orderBy(desc(offerLetterAnalyses.createdAt));

      const formattedAnalyses = analyses.map(analysis => ({
        id: analysis.id,
        fileName: analysis.fileName,
        institutionName: getInstitutionName(analysis.analysisResults),
        program: getProgramName(analysis.analysisResults),
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

  // Get specific offer letter analysis by ID
  app.get('/api/offer-letter-analyses/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const analysisId = parseInt(req.params.id);
      const user = req.user as any;

      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }

      // Get analysis with ownership check (unless admin)
      const whereCondition = user.role === 'admin' 
        ? eq(offerLetterAnalyses.id, analysisId)
        : and(eq(offerLetterAnalyses.id, analysisId), eq(offerLetterAnalyses.userId, user.id));

      const [analysis] = await db
        .select()
        .from(offerLetterAnalyses)
        .where(whereCondition);

      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }

      res.json(analysis);
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

      // Check ownership (unless admin)
      const whereCondition = user.role === 'admin' 
        ? eq(offerLetterAnalyses.id, analysisId)
        : and(eq(offerLetterAnalyses.id, analysisId), eq(offerLetterAnalyses.userId, user.id));

      const [analysis] = await db
        .select()
        .from(offerLetterAnalyses)
        .where(whereCondition);

      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }

      await db
        .delete(offerLetterAnalyses)
        .where(eq(offerLetterAnalyses.id, analysisId));

      res.json({ message: 'Analysis deleted successfully' });
    } catch (error) {
      console.error('Error deleting offer letter analysis:', error);
      res.status(500).json({ error: 'Failed to delete analysis' });
    }
  });

  // Admin: Get all offer letter analyses
  app.get('/api/admin/offer-letter-analyses', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const analyses = await db
        .select({
          id: offerLetterAnalyses.id,
          fileName: offerLetterAnalyses.fileName,
          analysisResults: offerLetterAnalyses.analysisResults,
          tokensUsed: offerLetterAnalyses.tokensUsed,
          claudeTokensUsed: offerLetterAnalyses.claudeTokensUsed,
          processingTime: offerLetterAnalyses.processingTime,
          isPublic: offerLetterAnalyses.isPublic,
          createdAt: offerLetterAnalyses.createdAt,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName
        })
        .from(offerLetterAnalyses)
        .leftJoin(users, eq(offerLetterAnalyses.userId, users.id))
        .orderBy(desc(offerLetterAnalyses.createdAt));

      const formattedAnalyses = analyses.map(analysis => ({
        id: analysis.id,
        fileName: analysis.fileName,
        institutionName: getInstitutionName(analysis.analysisResults),
        program: getProgramName(analysis.analysisResults),
        user: {
          username: analysis.username,
          email: analysis.email,
          name: `${analysis.firstName} ${analysis.lastName}`
        },
        tokensUsed: (analysis.tokensUsed || 0) + (analysis.claudeTokensUsed || 0),
        processingTime: analysis.processingTime,
        isPublic: analysis.isPublic,
        createdAt: analysis.createdAt
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

      const [analysis] = await db
        .select()
        .from(offerLetterAnalyses)
        .where(eq(offerLetterAnalyses.id, analysisId));

      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }

      res.json(analysis);
    } catch (error) {
      console.error('Error fetching admin offer letter analysis:', error);
      res.status(500).json({ error: 'Failed to fetch analysis' });
    }
  });

  // Admin: Update analysis visibility
  app.patch('/api/admin/offer-letter-analyses/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const analysisId = parseInt(req.params.id);
      const { isPublic } = req.body;

      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }

      const [updatedAnalysis] = await db
        .update(offerLetterAnalyses)
        .set({ isPublic })
        .where(eq(offerLetterAnalyses.id, analysisId))
        .returning();

      if (!updatedAnalysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }

      res.json(updatedAnalysis);
    } catch (error) {
      console.error('Error updating offer letter analysis:', error);
      res.status(500).json({ error: 'Failed to update analysis' });
    }
  });
}

// Helper functions to extract data from analysis results
function getInstitutionName(analysisResults: any): string {
  try {
    if (typeof analysisResults === 'string') {
      const parsed = JSON.parse(analysisResults);
      return parsed.institutionDetails?.name || 'Institution name not available';
    }
    return analysisResults?.institutionDetails?.name || 'Institution name not available';
  } catch {
    return 'Institution name not available';
  }
}

function getProgramName(analysisResults: any): string {
  try {
    if (typeof analysisResults === 'string') {
      const parsed = JSON.parse(analysisResults);
      return parsed.courseDetails?.program?.name || 'Program name not available';
    }
    return analysisResults?.courseDetails?.program?.name || 'Program name not available';
  } catch {
    return 'Program name not available';
  }
}