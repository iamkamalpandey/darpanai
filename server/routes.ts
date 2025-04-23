import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { extractTextFromDocument } from "./fileProcessing";
import { analyzeRejectionLetter } from "./openai";
import { analysisResponseSchema } from "@shared/schema";

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
  app.post('/api/analyze', upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Extract text from the document
      const extractedText = await extractTextFromDocument(
        req.file.buffer, 
        path.extname(req.file.originalname).toLowerCase()
      );
      
      if (!extractedText) {
        return res.status(400).json({ error: 'Failed to extract text from the document' });
      }
      
      // Analyze the extracted text using OpenAI
      const analysisResult = await analyzeRejectionLetter(extractedText);
      
      // Validate response schema
      const validationResult = analysisResponseSchema.safeParse(analysisResult);
      
      if (!validationResult.success) {
        console.error('Invalid analysis result:', validationResult.error);
        return res.status(500).json({ error: 'Failed to analyze the document' });
      }
      
      // Return the analysis results
      return res.status(200).json(analysisResult);
    } catch (error) {
      console.error('Error in /api/analyze:', error);
      return res.status(500).json({ error: error.message || 'An error occurred during analysis' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
