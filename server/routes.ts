import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { extractTextFromDocument } from "./fileProcessing";
import { analyzeRejectionLetter } from "./openai";
import { analysisResponseSchema } from "@shared/schema";

// Extended Request type to include file upload
interface FileRequest extends Request {
  file?: Express.Multer.File;
}

// Set up multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png'
    ];
    
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    
    if (allowedTypes.includes(file.mimetype) && validExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  
  // Analyze rejection letter
  app.post('/api/analyze', upload.single('file'), async (req: FileRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      console.log(`Processing file: ${req.file.originalname}, size: ${req.file.size} bytes, mimetype: ${req.file.mimetype}`);
      
      // Extract text from the document
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      console.log(`File extension detected: ${fileExtension}`);
      
      try {
        // Extract text from the document with enhanced error handling
        const extractedText = await extractTextFromDocument(
          req.file.buffer, 
          fileExtension
        );
        
        if (!extractedText || extractedText.trim().length < 10) {
          console.error('Text extraction returned insufficient content');
          return res.status(400).json({ 
            error: 'Failed to extract meaningful text from the document. Please ensure your document contains readable text.'
          });
        }
        
        console.log(`Successfully extracted ${extractedText.length} characters of text`);
        console.log('Extracted text sample:', extractedText.substring(0, 100) + '...');
        
        // Analyze the extracted text using OpenAI
        console.log('Sending text to OpenAI for analysis...');
        const analysisResult = await analyzeRejectionLetter(extractedText);
        
        // Validate response schema
        const validationResult = analysisResponseSchema.safeParse(analysisResult);
        
        if (!validationResult.success) {
          console.error('Invalid analysis result:', validationResult.error);
          return res.status(500).json({ error: 'Failed to analyze the document' });
        }
        
        // Save analysis to database
        try {
          const timestamp = new Date().toISOString();
          await storage.saveAnalysis({
            filename: req.file.originalname,
            originalText: extractedText,
            summary: analysisResult.summary,
            createdAt: timestamp,
            rejectionReasons: analysisResult.rejectionReasons,
            recommendations: analysisResult.recommendations,
            nextSteps: analysisResult.nextSteps
          });
          console.log('Analysis saved to database successfully');
        } catch (dbError) {
          console.error('Error saving analysis to database:', dbError);
          // Continue even if saving to DB fails
        }
        
        // Return the analysis results
        return res.status(200).json(analysisResult);
        
      } catch (extractionError) {
        console.error('Text extraction error:', extractionError);
        return res.status(400).json({ 
          error: `Text extraction failed: ${(extractionError as Error).message}. Please ensure your document is not corrupted and contains readable text.`
        });
      }
      
    } catch (error) {
      console.error('Error in /api/analyze:', error);
      return res.status(500).json({ error: (error as Error).message || 'An error occurred during analysis' });
    }
  });

  // Get all past analyses
  app.get('/api/analyses', async (_req: Request, res: Response) => {
    try {
      const analyses = await storage.getAllAnalyses();
      return res.status(200).json(analyses);
    } catch (error) {
      console.error('Error in /api/analyses:', error);
      return res.status(500).json({ error: (error as Error).message || 'An error occurred while retrieving analyses' });
    }
  });

  // Get a single analysis by ID
  app.get('/api/analyses/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }
      
      const analysis = await storage.getAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }
      
      return res.status(200).json(analysis);
    } catch (error) {
      console.error(`Error in /api/analyses/${req.params.id}:`, error);
      return res.status(500).json({ error: (error as Error).message || 'An error occurred while retrieving the analysis' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
