import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { extractTextFromDocument } from "./fileProcessing";
import { analyzeRejectionLetter } from "./openai";
import { analyzeEnrollmentDocument } from "./enrollmentAnalysis";
import { analyzeOfferLetterComprehensive } from "./offerLetterAnalysis_comprehensive";
import { setupOfferLetterRoutes } from "./offerLetterRoutes";
import { extractCoreStudentInfo, type CoreStudentInfo } from "./documentParser";
import { analysisResponseSchema, professionalApplicationSchema, insertDocumentTemplateSchema, insertEnrollmentAnalysisSchema, insertDocumentCategorySchema, insertDocumentTypeSchema, insertAnalysisFeedbackSchema } from "@shared/schema";
import { z } from 'zod';
import { setupAuth } from "./auth";
import gamificationRoutes from "./gamificationRoutes";

// Simple in-memory cache for performance optimization
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

function getCachedData(key: string) {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() - item.timestamp > item.ttl) {
    cache.delete(key);
    return null;
  }
  
  return item.data;
}

function setCacheData(key: string, data: any, ttlMinutes = 10) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMinutes * 60 * 1000
  });
}

function invalidateCache(pattern?: string) {
  if (!pattern) {
    cache.clear();
    return;
  }
  
  const keys = Array.from(cache.keys());
  for (const key of keys) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

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
  // Set up authentication
  const requireAuth = setupAuth(app);
  
  // Get current user data - fetch fresh from database with cache prevention
  app.get('/api/user', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      console.log('=== FETCHING FRESH USER DATA ===');
      console.log('User ID:', userId);
      
      // Get fresh user data from database instead of stale session data
      const freshUser = await storage.getUser(userId);
      
      if (!freshUser) {
        console.error('User not found in database:', userId);
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.log('Fresh user data retrieved successfully');
      console.log('Financial data in response:', {
        fundingSource: freshUser.fundingSource,
        estimatedBudget: freshUser.estimatedBudget,
        savingsAmount: freshUser.savingsAmount,
        loanApproval: freshUser.loanApproval,
        sponsorDetails: freshUser.sponsorDetails
      });
      
      // Prevent all caching to ensure fresh data
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': new Date().toUTCString(),
        'ETag': `"fresh-${Date.now()}-${userId}"` // Dynamic ETag to prevent 304
      });
      
      console.log('=== USER DATA RESPONSE SENT ===');
      res.json(freshUser);
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  });

  // Dedicated fresh user data endpoint - bypass all caching
  app.get('/api/user/fresh', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const timestamp = Date.now();
      
      console.log(`=== FRESH DATA REQUEST ${timestamp} ===`);
      console.log('User ID:', userId);
      
      // Direct database query for absolute fresh data
      const freshUser = await storage.getUser(userId);
      
      if (!freshUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.log('Financial data confirmed:', {
        fundingSource: freshUser.fundingSource,
        estimatedBudget: freshUser.estimatedBudget,
        savingsAmount: freshUser.savingsAmount
      });
      
      // No caching headers
      res.set({
        'Cache-Control': 'no-store',
        'X-Fresh-Data': timestamp.toString()
      });
      
      res.json({ ...freshUser, _timestamp: timestamp });
    } catch (error) {
      console.error('Fresh data error:', error);
      res.status(500).json({ error: 'Failed to fetch fresh data' });
    }
  });
  
  // ANALYZE API
  // Analyze rejection letter
  app.post('/api/analyze', upload.single('file'), async (req: FileRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          error: 'File Required', 
          message: 'Please select a document to upload. We accept PDF, JPG, and PNG files up to 10MB.',
          acceptedFormats: ['PDF', 'JPG', 'PNG'],
          maxSize: '10MB'
        });
      }
      
      // Check usage limits FIRST - before any processing
      const userId = req.isAuthenticated() ? req.user!.id : undefined;
      if (userId) {
        const user = await storage.getUser(userId);
        if (user && user.analysisCount >= user.maxAnalyses) {
          return res.status(403).json({ 
            error: 'Analysis limit reached',
            message: `You have reached your analysis limit of ${user.maxAnalyses}. Please contact admin for additional analyses.`,
            analysisCount: user.analysisCount,
            maxAnalyses: user.maxAnalyses
          });
        }
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
            error: 'Document Content Issue',
            message: 'We could not extract readable text from your document. Please ensure your document contains clear, visible text and is not corrupted.',
            suggestions: [
              'Check that your document is not password protected',
              'Ensure the document contains readable text (not just images)',
              'Try uploading a higher quality scan or PDF',
              'Verify the document is not corrupted'
            ]
          });
        }
        
        console.log(`Successfully extracted ${extractedText.length} characters of text`);
        console.log('Extracted text sample:', extractedText.substring(0, 100) + '...');
        
        // Analyze the extracted text using OpenAI
        console.log('Sending text to OpenAI for analysis...');
        const analysisResult = await analyzeRejectionLetter(extractedText);
        console.log('OpenAI analysis result received:', JSON.stringify(analysisResult, null, 2));
        
        // Validate response schema
        const validationResult = analysisResponseSchema.safeParse(analysisResult);
        
        if (!validationResult.success) {
          console.error('Schema validation failed:', validationResult.error);
          console.error('Invalid analysis result structure:', analysisResult);
          return res.status(500).json({ 
            error: 'Analysis Processing Error',
            message: 'Our analysis system completed processing your document but encountered a formatting issue. Our technical team has been notified.',
            supportInfo: 'Please try uploading your document again. If the issue persists, contact our support team with your document details.'
          });
        }
        
        console.log('Schema validation successful, proceeding with database save...');
        
        try {
          const timestamp = new Date().toISOString();
          const savedAnalysis = await storage.saveAnalysis({
            filename: req.file.originalname,
            originalText: extractedText,
            summary: analysisResult.summary,
            createdAt: timestamp,
            rejectionReasons: analysisResult.rejectionReasons,
            recommendations: analysisResult.recommendations,
            nextSteps: analysisResult.nextSteps
          }, userId);
          
          console.log('Analysis saved to database successfully', userId ? 'with user ID' : 'anonymously');
          
          // ONLY increment user's analysis count AFTER successful completion
          if (userId) {
            await storage.incrementUserAnalysisCount(userId);
            console.log('User analysis count incremented after successful analysis');
          }
          
          console.log('Analysis completed successfully, returning results to client');
          // Return the analysis results with the saved ID for reference
          return res.status(200).json({
            ...analysisResult,
            id: savedAnalysis.id,
            isAuthenticated: req.isAuthenticated(),
            success: true
          });
        } catch (dbError) {
          console.error('Error saving analysis to database:', dbError);
          // Continue even if saving to DB fails, but log the issue
          console.log('Returning analysis result despite database error');
          return res.status(200).json({
            ...analysisResult,
            isAuthenticated: req.isAuthenticated(),
            success: true,
            warning: 'Analysis completed but not saved to history due to temporary database issue'
          });
        }
        
      } catch (extractionError) {
        console.error('Text extraction error:', extractionError);
        return res.status(400).json({ 
          error: 'Document Processing Failed',
          message: 'We encountered an issue extracting text from your document. Please ensure your document is clear and readable.',
          technicalNote: 'File may be corrupted, password protected, or contain only images',
          suggestions: [
            'Try uploading a different version of the document',
            'Ensure the document is not password protected',
            'Check that the document contains readable text'
          ]
        });
      }
      
    } catch (error) {
      console.error('Error in /api/analyze:', error);
      return res.status(500).json({ error: (error as Error).message || 'An error occurred during analysis' });
    }
  });

  // ANALYSES APIS
  // Get public analyses or the user's analyses if authenticated
  app.get('/api/analyses', async (req: Request, res: Response) => {
    try {
      let analyses;
      
      if (req.isAuthenticated()) {
        // If authenticated, get user's analyses
        analyses = await storage.getUserAnalyses(req.user!.id);
      } else {
        // If not authenticated, get public analyses only
        analyses = await storage.getPublicAnalyses();
      }
      
      return res.status(200).json(analyses);
    } catch (error) {
      console.error('Error in /api/analyses:', error);
      return res.status(500).json({ 
        error: 'Analysis Retrieval Error', 
        message: 'Unable to load your analysis history. Please refresh the page and try again.',
        supportNote: 'If this continues, contact support for assistance',
        technicalDetails: (error as Error).message
      });
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
      
      // STRICT Privacy: Only allow access if user owns the analysis OR user is admin
      const userOwnsAnalysis = req.isAuthenticated() && analysis.userId === req.user!.id;
      const isAdmin = req.isAuthenticated() && req.user!.role === 'admin';
      
      if (!userOwnsAnalysis && !isAdmin) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You can only view your own analyses'
        });
      }
      
      return res.status(200).json(analysis);
    } catch (error) {
      console.error(`Error in /api/analyses/${req.params.id}:`, error);
      return res.status(500).json({ error: (error as Error).message || 'An error occurred while retrieving the analysis' });
    }
  });
  
  // Update analysis visibility (requires auth)
  app.patch('/api/analyses/:id/visibility', requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }
      
      const { isPublic } = req.body;
      if (typeof isPublic !== 'boolean') {
        return res.status(400).json({ error: 'isPublic must be a boolean' });
      }
      
      const analysis = await storage.getAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }
      
      // Verify ownership
      if (analysis.userId !== req.user!.id) {
        return res.status(403).json({ error: 'You do not have permission to update this analysis' });
      }
      
      // Update visibility
      // Note: We would need to add this method to the storage interface
      // For now, this is just a placeholder
      return res.status(200).json({ id, isPublic, message: 'Visibility updated' });
    } catch (error) {
      console.error(`Error updating analysis visibility:`, error);
      return res.status(500).json({ error: (error as Error).message || 'An error occurred while updating the analysis' });
    }
  });
  
  // PROFESSIONAL APPLICATION API
  // Submit professional account application (public endpoint)
  app.post('/api/professional-applications', async (req: Request, res: Response) => {
    try {
      const validatedData = professionalApplicationSchema.parse(req.body);
      
      const application = await storage.createProfessionalApplication(validatedData);
      
      invalidateCache('admin:professional-applications');
      
      return res.status(201).json({
        id: application.id,
        message: 'Application submitted successfully. We will review and contact you within 24-48 hours.',
        status: application.status
      });
    } catch (error: any) {
      console.error('Error creating professional application:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: error.errors
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to submit application. Please try again.'
      });
    }
  });

  // COE ANALYSIS APIS
  // Analyze CoE document specifically
  app.post('/api/coe-analysis', requireAuth, upload.single('document'), async (req: FileRequest, res: Response) => {
    try {
      const user = req.user!;
      
      // Check if user has remaining analyses
      if (user.analysisCount >= user.maxAnalyses) {
        return res.status(403).json({ 
          error: 'Analysis limit reached',
          message: `You've used all ${user.maxAnalyses} analyses. Please upgrade your plan or contact support.`
        });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No CoE document file provided' });
      }

      const { documentType } = req.body;
      // Strict validation - only CoE documents allowed
      if (documentType !== 'coe') {
        return res.status(400).json({ 
          error: 'Invalid document type for CoE analysis',
          message: 'This endpoint only accepts Confirmation of Enrollment (CoE) documents. Please use the dedicated CoE analysis tool.',
          requiredType: 'coe',
          receivedType: documentType
        });
      }

      // Validate request against schema
      const validationResult = insertEnrollmentAnalysisSchema.safeParse({
        filename: req.file.originalname,
        documentType: 'coe',
        originalText: 'placeholder' // Will be replaced with extracted text
      });

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        });
      }

      console.log(`Starting CoE analysis for user ${user.id}: ${req.file.originalname}`);

      // Extract text from document
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      const extractedText = await extractTextFromDocument(req.file.buffer, fileExtension);

      if (!extractedText || extractedText.trim().length < 50) {
        return res.status(400).json({ 
          error: 'Unable to extract sufficient text from CoE document',
          message: 'Please ensure your CoE document is clear and contains readable text.'
        });
      }

      // Perform CoE-specific analysis
      const { analysis, tokensUsed, processingTime } = await analyzeEnrollmentDocument(
        extractedText,
        'coe',
        req.file.originalname
      );

      // Save analysis to database with complete structured response
      const analysisData = {
        filename: req.file.originalname,
        documentType: 'coe',
        originalText: extractedText,
        analysis: JSON.stringify(analysis), // Store complete OpenAI response as JSON
        ...analysis, // Also store individual fields for backward compatibility
        tokensUsed,
        processingTime
      };

      const savedAnalysis = await storage.saveEnrollmentAnalysis(analysisData, user.id);

      // Update user's analysis count
      await storage.incrementUserAnalysisCount(user.id);

      console.log(`CoE analysis completed for user ${user.id}: ID ${savedAnalysis.id}`);

      // Return analysis without the full original text to reduce response size
      const { originalText, ...responseData } = savedAnalysis;
      
      return res.status(201).json({
        ...responseData,
        message: 'COE document analysis completed successfully'
      });
      
    } catch (error) {
      console.error('Error in COE analysis:', error);
      return res.status(500).json({ 
        error: 'COE analysis failed',
        message: 'An error occurred while analyzing your COE document. Please try again.'
      });
    }
  });

  // Get user's COE analyses
  app.get('/api/coe-analyses', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const analyses = await storage.getUserEnrollmentAnalyses(user.id);
      
      // Filter to only COE analyses and remove original text from response
      const coeAnalyses = analyses
        .filter(analysis => analysis.documentType === 'coe')
        .map(analysis => {
          const { originalText, ...safeAnalysis } = analysis;
          return safeAnalysis;
        });
      
      return res.status(200).json(coeAnalyses);
    } catch (error) {
      console.error('Error fetching COE analyses:', error);
      return res.status(500).json({ error: 'Failed to fetch COE analyses' });
    }
  });

  // Get specific COE analysis by ID (accessible by user or admin)
  app.get('/api/coe-analyses/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const analysisId = parseInt(req.params.id);
      
      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }
      
      const analysis = await storage.getEnrollmentAnalysisById(analysisId);
      
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }
      
      // Check access: user can access their own analyses, admin can access all
      if (user.role !== 'admin' && analysis.userId !== user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Ensure it's a COE analysis
      if (analysis.documentType !== 'coe') {
        return res.status(404).json({ error: 'COE analysis not found' });
      }
      
      // Remove original text from response for security
      const { originalText, ...safeAnalysis } = analysis;
      return res.status(200).json(safeAnalysis);
      
    } catch (error) {
      console.error('Error fetching COE analysis:', error);
      return res.status(500).json({ error: 'Failed to fetch COE analysis' });
    }
  });

  // ENROLLMENT ANALYSIS APIS (Legacy - kept for backward compatibility)
  // Analyze enrollment document (I-20, CAS, admission letter, etc.)
  app.post('/api/enrollment-analysis', requireAuth, upload.single('document'), async (req: FileRequest, res: Response) => {
    try {
      const user = req.user!;
      
      // Check if user has remaining analyses
      if (user.analysisCount >= user.maxAnalyses) {
        return res.status(403).json({ 
          error: 'Analysis limit reached',
          message: `You've used all ${user.maxAnalyses} analyses. Please upgrade your plan or contact support.`
        });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No document file provided' });
      }

      const { documentType } = req.body;
      const validTypes = ['coe']; // Only CoE documents are currently supported
      if (!documentType || !validTypes.includes(documentType)) {
        return res.status(400).json({ 
          error: 'Invalid document type. Currently only Confirmation of Enrollment (CoE) documents are supported.',
          message: 'We are working on adding support for other document types like I-20, CAS, and Admission Letters. Please use CoE documents for now.',
          validTypes,
          supportedTypes: ['Confirmation of Enrollment (CoE)']
        });
      }

      // Validate request against schema
      const validationResult = insertEnrollmentAnalysisSchema.safeParse({
        filename: req.file.originalname,
        documentType,
        originalText: 'placeholder' // Will be replaced with extracted text
      });

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: validationResult.error.errors
        });
      }

      console.log(`Starting enrollment analysis for user ${user.id}: ${req.file.originalname} (${documentType})`);

      // Extract text from document
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      const documentText = await extractTextFromDocument(req.file.buffer, fileExtension);
      if (!documentText || documentText.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Could not extract text from document',
          message: 'Please ensure the document is readable and contains text.'
        });
      }

      // Analyze document with OpenAI
      const { analysis, tokensUsed, processingTime } = await analyzeEnrollmentDocument(
        documentText,
        documentType,
        req.file.originalname
      );

      // Save analysis to database with complete structured response
      const savedAnalysis = await storage.saveEnrollmentAnalysis({
        filename: req.file.originalname,
        documentType,
        originalText: documentText,
        analysis: JSON.stringify(analysis), // Store complete OpenAI response as JSON
        ...analysis, // Also store individual fields for backward compatibility
        tokensUsed,
        processingTime
      }, user.id);

      // Increment user's analysis count only after successful completion
      await storage.incrementUserAnalysisCount(user.id);

      console.log(`Enrollment analysis completed for user ${user.id}: ID ${savedAnalysis.id}`);

      // Return analysis without the full original text to reduce response size
      const { originalText, ...responseData } = savedAnalysis;
      
      return res.status(201).json({
        ...responseData,
        message: 'Document analysis completed successfully'
      });
      
    } catch (error) {
      console.error('Error in enrollment analysis:', error);
      return res.status(500).json({ 
        error: 'Analysis failed',
        message: 'An error occurred while analyzing your document. Please try again.'
      });
    }
  });

  // Get user's enrollment analyses
  app.get('/api/enrollment-analyses', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const analyses = await storage.getUserEnrollmentAnalyses(user.id);
      
      // Remove original text from response to reduce size
      const safeAnalyses = analyses.map(analysis => {
        const { originalText, ...safeAnalysis } = analysis;
        return safeAnalysis;
      });
      
      return res.status(200).json(safeAnalyses);
    } catch (error) {
      console.error('Error fetching enrollment analyses:', error);
      return res.status(500).json({ error: 'Failed to fetch analyses' });
    }
  });

  // Get specific enrollment analysis
  app.get('/api/enrollment-analyses/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const analysisId = parseInt(req.params.id);
      const user = req.user!;
      
      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }
      
      const analysis = await storage.getEnrollmentAnalysis(analysisId);
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }
      
      // Check ownership (users can only see their own analyses, admins can see all)
      if (user.role !== 'admin' && analysis.userId !== user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      return res.status(200).json(analysis);
    } catch (error) {
      console.error('Error fetching enrollment analysis:', error);
      return res.status(500).json({ error: 'Failed to fetch analysis' });
    }
  });

  // Get public enrollment analyses (for sharing/examples)
  app.get('/api/public-enrollment-analyses', async (req: Request, res: Response) => {
    try {
      const cacheKey = 'public-enrollment-analyses';
      const cached = getCachedData(cacheKey);
      
      if (cached) {
        return res.status(200).json(cached);
      }
      
      const analyses = await storage.getPublicEnrollmentAnalyses();
      
      // Remove original text and sensitive data
      const safeAnalyses = analyses.map(analysis => {
        const { originalText, userId, ...safeAnalysis } = analysis;
        return safeAnalysis;
      });
      
      setCacheData(cacheKey, safeAnalyses, 10); // Cache for 10 minutes
      return res.status(200).json(safeAnalyses);
    } catch (error) {
      console.error('Error fetching public enrollment analyses:', error);
      return res.status(500).json({ error: 'Failed to fetch public analyses' });
    }
  });

  // APPOINTMENT APIS
  // Book a consultation appointment (requires auth)
  app.post('/api/appointments', requireAuth, async (req: Request, res: Response) => {
    try {
      // Simple validation without strict schema parsing for dates
      const { name, email, phoneNumber, preferredContact, subject, message, requestedDate } = req.body;
      
      if (!name || !email || !phoneNumber || !preferredContact || !subject) {
        return res.status(400).json({ 
          error: 'Missing required fields: name, email, phoneNumber, preferredContact, subject'
        });
      }
      
      const appointmentData = {
        name,
        email, 
        phoneNumber,
        preferredContact,
        subject,
        message: message || null,
        requestedDate: requestedDate ? new Date(requestedDate) : new Date()
      };
      
      const appointment = await storage.createAppointment(
        appointmentData, 
        req.user!.id
      );
      
      return res.status(201).json(appointment);
    } catch (error) {
      console.error('Error creating appointment:', error);
      return res.status(500).json({ error: (error as Error).message || 'An error occurred while creating the appointment' });
    }
  });
  
  // Get user's appointments (requires auth)
  app.get('/api/appointments', requireAuth, async (req: Request, res: Response) => {
    try {
      const appointments = await storage.getUserAppointments(req.user!.id);
      return res.status(200).json(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return res.status(500).json({ error: (error as Error).message || 'An error occurred while fetching appointments' });
    }
  });

  // Cancel user's appointment (requires auth)
  app.patch('/api/appointments/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const { status } = req.body;

      if (isNaN(appointmentId)) {
        return res.status(400).json({ error: 'Invalid appointment ID' });
      }

      if (status !== 'cancelled') {
        return res.status(400).json({ error: 'Only cancellation is allowed for this endpoint' });
      }

      // Get the appointment first to verify ownership
      const appointments = await storage.getUserAppointments(req.user!.id);
      const appointment = appointments.find(a => a.id === appointmentId);

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found or you do not have permission to modify it' });
      }

      if (appointment.status === 'cancelled') {
        return res.status(400).json({ error: 'Appointment is already cancelled' });
      }

      if (appointment.status === 'completed') {
        return res.status(400).json({ error: 'Cannot cancel a completed appointment' });
      }

      const updatedAppointment = await storage.updateAppointmentStatus(appointmentId, status);
      if (!updatedAppointment) {
        return res.status(404).json({ error: 'Failed to update appointment' });
      }

      return res.status(200).json(updatedAppointment);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return res.status(500).json({ error: 'Failed to cancel appointment' });
    }
  });

  // ADMIN ROUTES
  // Helper function to check if user is admin
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };

  // Get all users (admin only)
  app.get('/api/admin/users', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const cacheKey = 'admin:users';
      const cached = getCachedData(cacheKey);
      
      if (cached) {
        return res.status(200).json(cached);
      }
      
      const users = await storage.getAllUsers();
      // Remove password from response for security
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      setCacheData(cacheKey, safeUsers, 3); // Cache for 3 minutes
      return res.status(200).json(safeUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Update user's max analyses (admin only)
  app.patch('/api/admin/users/:id/max-analyses', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { maxAnalyses } = req.body;

      if (isNaN(userId) || typeof maxAnalyses !== 'number' || maxAnalyses < 0) {
        return res.status(400).json({ error: 'Invalid user ID or max analyses value' });
      }

      const updatedUser = await storage.updateUserMaxAnalyses(userId, maxAnalyses);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Invalidate cache when user data changes
      invalidateCache('admin:users');
      
      const { password, ...safeUser } = updatedUser;
      return res.status(200).json(safeUser);
    } catch (error) {
      console.error('Error updating user max analyses:', error);
      return res.status(500).json({ error: 'Failed to update user' });
    }
  });

  // Update user role (admin only)
  app.patch('/api/admin/users/:id/role', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;

      if (isNaN(userId) || !role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid user ID or role value' });
      }

      const updatedUser = await storage.updateUserRole(userId, role);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Invalidate cache when user data changes
      invalidateCache('admin:users');
      
      const { password, ...safeUser } = updatedUser;
      return res.status(200).json(safeUser);
    } catch (error) {
      console.error('Error updating user role:', error);
      return res.status(500).json({ error: 'Failed to update user role' });
    }
  });

  // Update user status (admin only)
  app.patch('/api/admin/users/:id/status', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { status } = req.body;

      if (isNaN(userId) || !status || !['active', 'inactive', 'suspended'].includes(status)) {
        return res.status(400).json({ error: 'Invalid user ID or status value' });
      }

      const updatedUser = await storage.updateUserStatus(userId, status);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Invalidate cache when user data changes
      invalidateCache('admin:users');
      
      const { password, ...safeUser } = updatedUser;
      return res.status(200).json(safeUser);
    } catch (error) {
      console.error('Error updating user status:', error);
      return res.status(500).json({ error: 'Failed to update user status' });
    }
  });

  // Get all analyses with user info (admin only)
  app.get('/api/admin/analyses', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const cacheKey = 'admin:analyses';
      const cached = getCachedData(cacheKey);
      
      if (cached) {
        return res.status(200).json(cached);
      }
      
      const analyses = await storage.getAllAnalysesWithUsers();
      setCacheData(cacheKey, analyses, 2); // Cache for 2 minutes
      return res.status(200).json(analyses);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      return res.status(500).json({ error: 'Failed to fetch analyses' });
    }
  });

  // Get all appointments with user info (admin only)
  app.get('/api/admin/appointments', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const cacheKey = 'admin:appointments';
      const cached = getCachedData(cacheKey);
      
      if (cached) {
        return res.status(200).json(cached);
      }
      
      const appointments = await storage.getAllAppointmentsWithUsers();
      setCacheData(cacheKey, appointments, 2); // Cache for 2 minutes
      return res.status(200).json(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  });

  // Update appointment status (admin only)
  app.patch('/api/admin/appointments/:id/status', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const { status } = req.body;

      if (isNaN(appointmentId) || !status) {
        return res.status(400).json({ error: 'Invalid appointment ID or status' });
      }

      const updatedAppointment = await storage.updateAppointmentStatus(appointmentId, status);
      if (!updatedAppointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Invalidate cache when appointment data changes
      invalidateCache('admin:appointments');
      
      return res.status(200).json(updatedAppointment);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return res.status(500).json({ error: 'Failed to update appointment status' });
    }
  });

  // Get platform statistics for public/user display
  app.get('/api/platform-stats', async (req: Request, res: Response) => {
    try {
      const cacheKey = 'platform:stats';
      const cached = getCachedData(cacheKey);
      
      if (cached) {
        return res.status(200).json(cached);
      }
      
      // Get authentic platform statistics from database
      const stats = await storage.getPlatformStatistics();
      setCacheData(cacheKey, stats, 30); // Cache for 30 minutes
      return res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching platform statistics:', error);
      return res.status(500).json({ error: 'Failed to fetch platform statistics' });
    }
  });

  // Get document categories for public use (no authentication required)
  app.get('/api/document-categories', async (req: Request, res: Response) => {
    try {
      const cacheKey = 'public:document-categories';
      const cached = getCachedData(cacheKey);
      
      if (cached) {
        return res.status(200).json(cached);
      }
      
      // Get active document categories only
      const categories = await storage.getActiveDocumentCategories();
      setCacheData(cacheKey, categories, 30); // Cache for 30 minutes
      return res.status(200).json(categories);
    } catch (error) {
      console.error('Error fetching document categories:', error);
      return res.status(500).json({ error: 'Failed to fetch document categories' });
    }
  });

  // Get all professional applications (admin only)
  app.get('/api/admin/professional-applications', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const cacheKey = 'admin:professional-applications';
      const cached = getCachedData(cacheKey);
      
      if (cached) {
        return res.status(200).json(cached);
      }
      
      const applications = await storage.getAllProfessionalApplications();
      setCacheData(cacheKey, applications, 2); // Cache for 2 minutes
      return res.status(200).json(applications);
    } catch (error) {
      console.error('Error fetching professional applications:', error);
      return res.status(500).json({ error: 'Failed to fetch professional applications' });
    }
  });

  // Update professional application status (admin only)
  app.patch('/api/admin/professional-applications/:id/status', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { status, adminNotes } = req.body;

      if (isNaN(applicationId) || !status) {
        return res.status(400).json({ error: 'Invalid application ID or status' });
      }

      const updatedApplication = await storage.updateProfessionalApplicationStatus(
        applicationId, 
        status, 
        adminNotes, 
        req.user!.id
      );
      
      if (!updatedApplication) {
        return res.status(404).json({ error: 'Application not found' });
      }

      // Invalidate cache when application data changes
      invalidateCache('admin:professional-applications');
      
      return res.status(200).json(updatedApplication);
    } catch (error) {
      console.error('Error updating application status:', error);
      return res.status(500).json({ error: 'Failed to update application status' });
    }
  });

  // Create new user (admin only)
  app.post('/api/admin/users', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      
      // Validate required fields
      if (!userData.username || !userData.email || !userData.password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
      }

      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const newUser = await storage.createUser(userData);
      const { password, ...safeUser } = newUser;
      
      // Invalidate cache when user data changes
      invalidateCache('admin:users');
      
      return res.status(201).json(safeUser);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // Update user details (admin only)
  app.patch('/api/admin/users/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Invalidate cache when user data changes
      invalidateCache('admin:users');

      const { password, ...safeUser } = updatedUser;
      return res.status(200).json(safeUser);
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Failed to update user' });
    }
  });

  // Delete user (admin only)
  app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const deleted = await storage.deleteUser(userId);
      if (!deleted) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Invalidate cache when user data changes
      invalidateCache('admin:users');

      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Get all COE analyses for admin (admin only)
  app.get('/api/admin/coe-analyses', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const cacheKey = 'admin:coe-analyses';
      const cached = getCachedData(cacheKey);
      if (cached) {
        return res.status(200).json(cached);
      }

      const analyses = await storage.getAllEnrollmentAnalyses();
      
      // Filter to only COE analyses and remove original text from response for security
      const coeAnalyses = analyses
        .filter(analysis => analysis.documentType === 'coe')
        .map(analysis => {
          const { originalText, ...safeAnalysis } = analysis;
          return safeAnalysis;
        });
      
      setCacheData(cacheKey, coeAnalyses, 10);
      return res.status(200).json(coeAnalyses);
    } catch (error) {
      console.error('Error fetching admin COE analyses:', error);
      return res.status(500).json({ error: 'Failed to fetch COE analyses' });
    }
  });

  // Get specific COE analysis by ID for admin (admin only)
  app.get('/api/admin/coe-analyses/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const analysisId = parseInt(req.params.id);
      
      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }
      
      const analysis = await storage.getEnrollmentAnalysisById(analysisId);
      
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }
      
      // Ensure it's a COE analysis
      if (analysis.documentType !== 'coe') {
        return res.status(404).json({ error: 'COE analysis not found' });
      }
      
      // Remove original text from response for security
      const { originalText, ...safeAnalysis } = analysis;
      return res.status(200).json(safeAnalysis);
      
    } catch (error) {
      console.error('Error fetching admin COE analysis:', error);
      return res.status(500).json({ error: 'Failed to fetch COE analysis' });
    }
  });

  // Get all visa analyses for admin (admin only)
  app.get('/api/admin/visa-analyses', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const cacheKey = 'admin:visa-analyses';
      const cached = getCachedData(cacheKey);
      if (cached) {
        return res.status(200).json(cached);
      }

      const analyses = await storage.getAllAnalyses();
      
      // Remove original text from response for security
      const visaAnalyses = analyses.map(analysis => {
        const { originalText, ...safeAnalysis } = analysis;
        return safeAnalysis;
      });
      
      setCacheData(cacheKey, visaAnalyses, 10);
      return res.status(200).json(visaAnalyses);
    } catch (error) {
      console.error('Error fetching admin visa analyses:', error);
      return res.status(500).json({ error: 'Failed to fetch visa analyses' });
    }
  });

  // Get specific visa analysis by ID for admin (admin only)
  app.get('/api/admin/visa-analyses/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const analysisId = parseInt(req.params.id);
      
      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }
      
      const analysis = await storage.getAnalysis(analysisId);
      
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }
      
      // Remove original text from response for security
      const { originalText, ...safeAnalysis } = analysis;
      return res.status(200).json(safeAnalysis);
      
    } catch (error) {
      console.error('Error fetching admin visa analysis:', error);
      return res.status(500).json({ error: 'Failed to fetch visa analysis' });
    }
  });

  // Get specific offer letter analysis by ID for admin (admin only)
  app.get('/api/admin/offer-letter-analyses/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const analysisId = parseInt(req.params.id);
      
      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }
      
      const analysis = await storage.getOfferLetterAnalysisById(analysisId);
      
      if (!analysis) {
        return res.status(404).json({ error: 'Offer letter analysis not found' });
      }

      // Check if this is a failed analysis
      if (!analysis.analysisResults || Object.keys(analysis.analysisResults).length === 0) {
        return res.status(404).json({ error: 'Analysis failed or corrupted' });
      }

      // Parse analysis results if available
      let parsedAnalysis = null;
      if (analysis.analysisResults) {
        try {
          parsedAnalysis = typeof analysis.analysisResults === 'string' 
            ? JSON.parse(analysis.analysisResults) 
            : analysis.analysisResults;
        } catch (error) {
          console.error('Error parsing analysis results:', error);
        }
      }

      // Return the complete parsed analysis data
      return res.status(200).json({
        ...analysis,
        documentAnalysis: {
          totalPages: "Complete document processed",
          documentSections: ["Full offer letter analysis completed"],
          termsAndConditions: {
            academicRequirements: [],
            financialObligations: [],
            enrollmentConditions: [],
            academicProgress: [],
            complianceRequirements: [],
            hiddenClauses: [],
            criticalDeadlines: [],
            penalties: [],
          },
          riskAssessment: {
            highRiskFactors: [],
            financialRisks: [],
            academicRisks: [],
            complianceRisks: [],
            mitigationStrategies: [],
          }
        },
        profileAnalysis: parsedAnalysis?.profileAnalysis || {
          academicStanding: "Not specified",
          gpa: "Not specified",
          financialStatus: "Not specified",
          relevantSkills: [],
          strengths: [],
          weaknesses: [],
        },
        universityInfo: parsedAnalysis?.universityInfo || {
          name: "Not specified",
          location: "Not specified",
          program: "Not specified",
          tuition: "Not specified",
          duration: "Not specified",
        },
        scholarshipOpportunities: parsedAnalysis?.scholarshipOpportunities || [],
        costSavingStrategies: parsedAnalysis?.costSavingStrategies || [],
        recommendations: parsedAnalysis?.recommendations || [],
        nextSteps: parsedAnalysis?.nextSteps || [],
      });
      
    } catch (error) {
      console.error('Error fetching admin offer letter analysis:', error);
      return res.status(500).json({ error: 'Failed to fetch offer letter analysis' });
    }
  });

  // Get all analyses for admin (admin only)
  app.get('/api/admin/analyses', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const cacheKey = 'admin:analyses';
      const cached = getCachedData(cacheKey);
      if (cached) {
        return res.status(200).json(cached);
      }

      // Use existing method that combines both types with user data
      const allAnalyses = await storage.getAllAnalysesWithUsers();

      setCacheData(cacheKey, allAnalyses, 10);
      return res.status(200).json(allAnalyses);
    } catch (error) {
      console.error('Error fetching admin analyses:', error);
      return res.status(500).json({ error: 'Failed to fetch analyses' });
    }
  });

  // Get user details with analyses (admin only)
  app.get('/api/admin/users/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const visaAnalyses = await storage.getUserAnalyses(userId);
      const enrollmentAnalyses = await storage.getUserEnrollmentAnalyses(userId);
      const appointments = await storage.getUserAppointments(userId);

      // Combine analyses with consistent structure
      const allAnalyses = [
        ...visaAnalyses.map(analysis => ({
          ...analysis,
          analysisType: 'visa_analysis' as const
        })),
        ...enrollmentAnalyses.map(analysis => ({
          ...analysis,
          analysisType: 'enrollment_analysis' as const
        }))
      ];

      const { password, ...safeUser } = user;
      return res.status(200).json({
        ...safeUser,
        analyses: allAnalyses,
        appointments
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      return res.status(500).json({ error: 'Failed to fetch user details' });
    }
  });

  // Helper function to convert data to CSV format
  function convertToCSV(data: any[], filename: string): string {
    if (!data || data.length === 0) {
      return '';
    }

    let headers: string[] = [];
    let rows: string[] = [];

    if (filename === 'users') {
      headers = ['ID', 'Username', 'Email', 'Full Name', 'Qualification', 'Graduation Year', 'Phone Number', 'Role', 'Analysis Count', 'Max Analyses', 'Created At'];
      rows = data.map(user => [
        user.id,
        user.username,
        user.email,
        user.fullName || '',
        user.qualification || '',
        user.graduationYear || '',
        user.phoneNumber || '',
        user.role,
        user.analysisCount,
        user.maxAnalyses,
        new Date(user.createdAt).toISOString()
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
    } else if (filename === 'analyses') {
      headers = ['ID', 'User ID', 'File Name', 'Summary', 'Created At', 'Is Public'];
      rows = data.map(analysis => [
        analysis.id,
        analysis.userId || '',
        analysis.filename || analysis.fileName || '',
        (analysis.summary || '').replace(/\n/g, ' ').substring(0, 500),
        new Date(analysis.createdAt).toISOString(),
        analysis.isPublic ? 'Yes' : 'No'
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
    } else if (filename === 'appointments') {
      headers = ['ID', 'User ID', 'Name', 'Email', 'Phone Number', 'Preferred Contact', 'Subject', 'Message', 'Requested Date', 'Status', 'Created At'];
      rows = data.map(appointment => [
        appointment.id,
        appointment.userId,
        appointment.name,
        appointment.email,
        appointment.phoneNumber || '',
        appointment.preferredContact,
        appointment.subject,
        (appointment.message || '').replace(/\n/g, ' ').substring(0, 200),
        appointment.requestedDate ? new Date(appointment.requestedDate).toISOString() : '',
        appointment.status,
        new Date(appointment.createdAt).toISOString()
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
    }

    return [headers.join(','), ...rows].join('\n');
  }

  // Export users data (admin only)
  app.get('/api/admin/export/users', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const format = req.query.format as string;
      const users = await storage.getAllUsers();
      
      // Remove password from exported data
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });

      if (format === 'csv') {
        const csv = convertToCSV(safeUsers, 'users');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="users-export.csv"');
        return res.send(csv);
      } else {
        return res.json(safeUsers);
      }
    } catch (error) {
      console.error('Error exporting users:', error);
      return res.status(500).json({ error: 'Failed to export users data' });
    }
  });

  // Export analyses data (admin only)
  app.get('/api/admin/export/analyses', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const format = req.query.format as string;
      const analyses = await storage.getAllAnalyses();

      if (format === 'csv') {
        const csv = convertToCSV(analyses, 'analyses');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="analyses-export.csv"');
        return res.send(csv);
      } else {
        return res.json(analyses);
      }
    } catch (error) {
      console.error('Error exporting analyses:', error);
      return res.status(500).json({ error: 'Failed to export analyses data' });
    }
  });

  // Export appointments data (admin only)
  app.get('/api/admin/export/appointments', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const format = req.query.format as string;
      const appointments = await storage.getAllAppointmentsWithUsers();

      if (format === 'csv') {
        const csv = convertToCSV(appointments, 'appointments');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="appointments-export.csv"');
        return res.send(csv);
      } else {
        return res.json(appointments);
      }
    } catch (error) {
      console.error('Error exporting appointments:', error);
      return res.status(500).json({ error: 'Failed to export appointments data' });
    }
  });

  // Get system statistics (admin only)
  app.get('/api/admin/system-stats', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      const analyses = await storage.getAllAnalyses();
      const appointments = await storage.getAllAppointmentsWithUsers();

      const stats = {
        totalUsers: users.length,
        totalAnalyses: analyses.length,
        totalAppointments: appointments.length,
        adminUsers: users.filter(user => user.role === 'admin').length,
        activeUsers: users.filter(user => user.status === 'active' || !user.status).length,
        recentAnalyses: analyses.filter(analysis => {
          const analysisDate = new Date(analysis.createdAt);
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          return analysisDate >= lastWeek;
        }).length,
        systemAnnouncement: process.env.SYSTEM_ANNOUNCEMENT || '',
        defaultMaxAnalyses: parseInt(process.env.DEFAULT_MAX_ANALYSES || '3')
      };

      return res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return res.status(500).json({ error: 'Failed to fetch system statistics' });
    }
  });

  // Update system settings (admin only)
  app.patch('/api/admin/system-settings', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { defaultMaxAnalyses, systemAnnouncement } = req.body;

      // Validate input
      if (defaultMaxAnalyses !== undefined && (typeof defaultMaxAnalyses !== 'number' || defaultMaxAnalyses < 1)) {
        return res.status(400).json({ error: 'Default max analyses must be a positive number' });
      }

      if (systemAnnouncement !== undefined && typeof systemAnnouncement !== 'string') {
        return res.status(400).json({ error: 'System announcement must be a string' });
      }

      // Update environment variables (note: these won't persist across restarts without proper env file management)
      if (defaultMaxAnalyses !== undefined) {
        process.env.DEFAULT_MAX_ANALYSES = defaultMaxAnalyses.toString();
      }

      if (systemAnnouncement !== undefined) {
        process.env.SYSTEM_ANNOUNCEMENT = systemAnnouncement;
      }

      // Return updated settings
      const updatedSettings = {
        defaultMaxAnalyses: parseInt(process.env.DEFAULT_MAX_ANALYSES || '3'),
        systemAnnouncement: process.env.SYSTEM_ANNOUNCEMENT || '',
        message: 'System settings updated successfully'
      };

      return res.status(200).json(updatedSettings);
    } catch (error) {
      console.error('Error updating system settings:', error);
      return res.status(500).json({ error: 'Failed to update system settings' });
    }
  });

  // User Stats API Route
  app.get('/api/user/stats', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      
      // Get the most recent analysis date across all analysis types
      const lastAnalysisDate = await storage.getLastAnalysisDate(user.id);
      
      const stats = {
        analysisCount: user.analysisCount,
        maxAnalyses: user.maxAnalyses,
        remainingAnalyses: user.maxAnalyses - user.analysisCount,
        lastAnalysisDate: lastAnalysisDate
      };
      
      return res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
  });

  // Profile Image Upload Route
  app.post('/api/user/profile-image', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { imageData } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ error: 'No image data provided' });
      }
      
      // Validate base64 image data
      if (!imageData.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Invalid image format' });
      }
      
      // Update user's profile image
      await storage.updateUserProfileImage(user.id, imageData);
      
      res.json({ 
        success: true, 
        message: 'Profile image updated successfully',
        imageUrl: imageData 
      });
    } catch (error) {
      console.error('Error updating profile image:', error);
      res.status(500).json({ error: 'Failed to update profile image' });
    }
  });

  // Get profile completion status
  app.get('/api/user/profile-completion', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      
      // Required fields for destination analysis based on comprehensive profile
      const requiredFields = {
        'Personal Information': user.dateOfBirth && user.gender && user.nationality,
        'Academic Qualification': user.highestQualification && user.highestInstitution && user.highestGpa,
        'Study Preferences': user.interestedCourse && user.fieldOfStudy && user.preferredIntake,
        'Budget Range': user.budgetRange,
        'Preferred Countries': (user.preferredCountries && Array.isArray(user.preferredCountries) && user.preferredCountries.length > 0) ? user.preferredCountries : null,
        'Employment Status': user.currentEmploymentStatus,
        'English Proficiency': user.englishProficiencyTests && Array.isArray(user.englishProficiencyTests) && user.englishProficiencyTests.length > 0,
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([, value]) => !value)
        .map(([key]) => key);

      const completedFields = Object.keys(requiredFields).length - missingFields.length;
      const completionPercentage = Math.round((completedFields / Object.keys(requiredFields).length) * 100);
      const isComplete = missingFields.length === 0;

      res.json({
        isComplete,
        completionPercentage,
        missingFields,
        completedSections: Object.entries(requiredFields)
          .filter(([, value]) => value)
          .map(([key]) => key),
        pendingSections: missingFields, // Add pending sections for the popup component
        totalFields: Object.keys(requiredFields).length,
        completedFields
      });
    } catch (error) {
      console.error('Error checking profile completion:', error);
      res.status(500).json({ error: 'Failed to check profile completion' });
    }
  });

  // Complete user profile - flexible endpoint for any profile field updates
  app.patch('/api/user/complete-profile', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Flexible validation schema that accepts any profile field and handles null values
      const profileSchema = z.object({
        // Personal Information
        firstName: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        lastName: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        dateOfBirth: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        gender: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        nationality: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        passportNumber: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        phoneNumber: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        secondaryNumber: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        address: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        
        // Academic Information
        highestQualification: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        highestInstitution: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        highestCountry: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        highestGpa: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        graduationYear: z.union([z.string(), z.number()]).nullable().optional().transform(val => val === null ? undefined : val),
        currentAcademicGap: z.union([z.string(), z.number()]).nullable().optional().transform(val => val === null ? undefined : (typeof val === 'string' ? parseInt(val) || undefined : val)),
        educationHistory: z.array(z.any()).nullable().optional().transform(val => val === null ? undefined : val),
        
        // Study Preferences
        interestedCourse: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        fieldOfStudy: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        preferredIntake: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        budgetRange: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        preferredCountries: z.array(z.string()).nullable().optional().transform(val => val === null ? undefined : val),
        interestedServices: z.array(z.string()).nullable().optional().transform(val => val === null ? undefined : val),
        partTimeInterest: z.boolean().nullable().optional().transform(val => val === null ? undefined : val),
        accommodationRequired: z.boolean().nullable().optional().transform(val => val === null ? undefined : val),
        hasDependents: z.boolean().nullable().optional().transform(val => val === null ? undefined : val),
        
        // Financial Information
        fundingSource: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        estimatedBudget: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        savingsAmount: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        loanApproval: z.boolean().nullable().optional().transform(val => val === null ? undefined : val),
        loanAmount: z.union([z.string(), z.number()]).nullable().optional().transform(val => val === null ? undefined : (typeof val === 'string' ? parseInt(val) || undefined : val)),
        sponsorDetails: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        financialDocuments: z.boolean().nullable().optional().transform(val => val === null ? undefined : val),
        
        // Employment Information
        currentEmploymentStatus: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        workExperienceYears: z.union([z.string(), z.number()]).nullable().optional().transform(val => val === null ? undefined : (typeof val === 'number' ? val : (typeof val === 'string' ? parseInt(val) || undefined : val))),
        jobTitle: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        organizationName: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        fieldOfWork: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        gapReasonIfAny: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        
        // Language Proficiency
        englishProficiencyTests: z.array(z.any()).nullable().optional().transform(val => val === null ? undefined : val),
        standardizedTests: z.array(z.any()).nullable().optional().transform(val => val === null ? undefined : val),
        
        // Legacy fields for compatibility
        studyLevel: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        preferredStudyFields: z.array(z.string()).nullable().optional().transform(val => val === null ? undefined : val),
        startDate: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        studyDestination: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        languagePreferences: z.array(z.string()).nullable().optional().transform(val => val === null ? undefined : val),
        climatePreference: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        universityRankingImportance: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        workPermitImportance: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        culturalPreferences: z.array(z.string()).nullable().optional().transform(val => val === null ? undefined : val),
        careerGoals: z.string().nullable().optional().transform(val => val === null ? undefined : val),
        counsellingMode: z.string().nullable().optional().transform(val => val === null ? undefined : val),
      });

      console.log('Profile update request body:', req.body);
      const validatedData = profileSchema.parse(req.body);
      console.log('Validated data:', validatedData);
      
      // Update user profile with validated data
      const updatedUser = await storage.updateUserProfile(userId, validatedData);
      console.log('Updated user:', updatedUser);
      
      // Invalidate cache
      invalidateCache(`user:${userId}`);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
        updatedFields: Object.keys(validatedData).filter(key => (validatedData as any)[key] !== undefined)
      });
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Update user profile (comprehensive including English proficiency)
  app.patch('/api/user/profile', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Comprehensive validation schema for full profile updates
      const fullProfileSchema = z.object({
        studyLevel: z.string().optional(),
        preferredStudyFields: z.array(z.string()).optional(),
        startDate: z.string().optional(),
        budgetRange: z.string().optional(),
        languagePreferences: z.array(z.string()).optional(),
        climatePreference: z.string().optional(),
        universityRankingImportance: z.string().optional(),
        workPermitImportance: z.string().optional(),
        culturalPreferences: z.array(z.string()).optional(),
        careerGoals: z.string().optional(),
        counsellingMode: z.string().optional(),
        
        // English Language Proficiency
        englishProficiency: z.string().optional(),
        englishTestType: z.string().optional(),
        englishTestScore: z.string().optional(),
        englishTestDate: z.string().optional(),
        englishTestExpiry: z.string().optional(),
        needsEnglishImprovement: z.boolean().optional(),
      });
      
      const validatedData = fullProfileSchema.parse(req.body);
      
      // Update user profile with English proficiency fields
      const updatedUser = await storage.updateUserProfile(userId, validatedData);
      
      // Invalidate cache
      invalidateCache(`user:${userId}`);
      
      res.json({
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Selective profile update for document analysis integration
  app.patch('/api/user/profile-selective-update', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Flexible validation schema that accepts any profile field
      const selectiveUpdateSchema = z.object({
        // Personal Information
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        dateOfBirth: z.string().optional(),
        gender: z.string().optional(),
        nationality: z.string().optional(),
        passportNumber: z.string().optional(),
        phoneNumber: z.string().optional(),
        secondaryNumber: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        
        // Academic Information
        highestQualification: z.string().optional(),
        highestInstitution: z.string().optional(),
        highestCountry: z.string().optional(),
        highestGpa: z.string().optional(),
        graduationYear: z.union([z.string(), z.number()]).optional(),
        currentAcademicGap: z.union([z.string(), z.number()]).optional(),
        educationHistory: z.string().optional(),
        
        // Study Preferences
        interestedCourse: z.string().optional(),
        fieldOfStudy: z.string().optional(),
        preferredIntake: z.string().optional(),
        budgetRange: z.string().optional(),
        preferredCountries: z.array(z.string()).optional(),
        interestedServices: z.array(z.string()).optional(),
        partTimeInterest: z.boolean().optional(),
        accommodationRequired: z.boolean().optional(),
        hasDependents: z.boolean().optional(),
        
        // Financial Information
        fundingSource: z.string().optional(),
        estimatedBudget: z.string().optional(),
        savingsAmount: z.union([z.string(), z.number()]).optional(),
        loanApproval: z.boolean().optional(),
        loanAmount: z.union([z.string(), z.number()]).optional(),
        sponsorDetails: z.string().optional(),
        financialDocuments: z.string().optional(),
        
        // Employment Information
        currentEmploymentStatus: z.string().optional(),
        workExperienceYears: z.union([z.string(), z.number()]).optional(),
        jobTitle: z.string().optional(),
        organizationName: z.string().optional(),
        fieldOfWork: z.string().optional(),
        gapReasonIfAny: z.string().optional(),
        
        // Language Proficiency
        englishProficiencyTests: z.array(z.any()).optional(),
        standardizedTests: z.array(z.any()).optional(),
      });
      
      const validatedData = selectiveUpdateSchema.parse(req.body);
      
      // Convert graduation year to number if provided as string
      if (validatedData.graduationYear && typeof validatedData.graduationYear === 'string') {
        const yearNum = parseInt(validatedData.graduationYear);
        if (!isNaN(yearNum)) {
          validatedData.graduationYear = yearNum;
        }
      }
      
      // Convert numeric fields if provided as strings
      if (validatedData.currentAcademicGap && typeof validatedData.currentAcademicGap === 'string') {
        const gapNum = parseInt(validatedData.currentAcademicGap);
        if (!isNaN(gapNum)) {
          validatedData.currentAcademicGap = gapNum;
        }
      }
      
      if (validatedData.workExperienceYears && typeof validatedData.workExperienceYears === 'string') {
        const yearsNum = parseInt(validatedData.workExperienceYears);
        if (!isNaN(yearsNum)) {
          validatedData.workExperienceYears = yearsNum;
        }
      }
      
      // Update user profile
      const updatedUser = await storage.updateUserProfile(userId, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Log the successful update
      console.log(`Selective profile update successful for user ${userId}:`, Object.keys(validatedData));
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        updatedFields: Object.keys(validatedData),
        user: updatedUser
      });
      
    } catch (error: any) {
      console.error('Error in selective profile update:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: 'Invalid data format', 
          details: error.errors 
        });
      }
      
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Destination suggestion routes removed - feature discontinued

  // Profile Image Upload endpoint
  const profileImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB limit for profile images
    },
    fileFilter: (_req, file, cb) => {
      console.log('Multer fileFilter called with:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype
      });
      
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ];
      
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      
      if (allowedTypes.includes(file.mimetype) && validExtensions.includes(fileExtension)) {
        console.log('File passed validation');
        cb(null, true);
      } else {
        console.log('File failed validation');
        cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.'));
      }
    }
  }).single('profileImage');

  app.post('/api/user/upload-profile-image', requireAuth, (req: Request, res: Response, next: NextFunction) => {
    console.log('=== MULTER UPLOAD MIDDLEWARE START ===');
    
    profileImageUpload(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        if (err instanceof multer.MulterError) {
          console.error('Multer error type:', err.code);
          console.error('Multer error message:', err.message);
          return res.status(400).json({ 
            error: 'File upload error', 
            message: err.message,
            code: err.code 
          });
        } else {
          console.error('Non-Multer error:', err);
          return res.status(400).json({ 
            error: 'File validation error', 
            message: err.message 
          });
        }
      }
      console.log('Multer processing completed successfully');
      next();
    });
  }, async (req: Request, res: Response) => {
    try {
      console.log('=== PROFILE IMAGE UPLOAD SERVER ENDPOINT ===');
      console.log('Request headers:', req.headers);
      console.log('Request content-type:', req.get('content-type'));
      console.log('Request body keys:', Object.keys(req.body || {}));
      console.log('File object:', req.file);
      console.log('Files object:', req.files);
      
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        console.error('No file found in request');
        return res.status(400).json({ error: 'No image file provided' });
      }

      console.log('File details:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer ? 'Present' : 'Missing'
      });

      // For now, we'll store the image as base64 in the database
      // In a production environment, you'd want to upload to a cloud storage service
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      // Update user profile with new image URL
      const updatedUser = await storage.updateUserProfileImage(userId, base64Image);

      console.log(`Profile image updated for user ${userId}`);
      
      // Invalidate user cache
      invalidateCache(`user-${userId}`);
      
      return res.status(200).json({
        message: 'Profile image updated successfully',
        profileImageUrl: base64Image,
        user: updatedUser
      });

    } catch (error) {
      console.error('Error uploading profile image:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return res.status(500).json({ 
        error: 'Failed to upload profile image',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Updates/Notifications API Routes

  // Get updates for current user (only show updates created after user signup)
  app.get('/api/updates', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const updates = await storage.getUpdatesForUser(user.id, 'students');
      
      // Filter updates to only show those created after user's signup date
      const filteredUpdates = updates.filter(update => 
        new Date(update.createdAt) >= new Date(user.createdAt)
      );
      
      return res.status(200).json(filteredUpdates);
    } catch (error) {
      console.error('Error fetching user updates:', error);
      return res.status(500).json({ error: 'Failed to fetch updates' });
    }
  });

  // Mark update as viewed
  app.post('/api/updates/:id/view', requireAuth, async (req: Request, res: Response) => {
    try {
      const updateId = parseInt(req.params.id);
      const view = await storage.markUpdateAsViewed(req.user!.id, updateId);
      return res.status(200).json(view);
    } catch (error) {
      console.error('Error marking update as viewed:', error);
      return res.status(500).json({ error: 'Failed to mark update as viewed' });
    }
  });

  // Mark update action as taken
  app.post('/api/updates/:id/action', requireAuth, async (req: Request, res: Response) => {
    try {
      const updateId = parseInt(req.params.id);
      const view = await storage.markUpdateActionTaken(req.user!.id, updateId);
      return res.status(200).json(view);
    } catch (error) {
      console.error('Error marking update action taken:', error);
      return res.status(500).json({ error: 'Failed to mark action taken' });
    }
  });

  // Admin Document Categories Management Routes

  // Get all document categories (admin only)
  app.get('/api/admin/document-categories', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const cached = getCachedData('admin-document-categories');
      if (cached) return res.status(200).json(cached);
      
      const categories = await storage.getAllDocumentCategories();
      setCacheData('admin-document-categories', categories, 5);
      return res.status(200).json(categories);
    } catch (error) {
      console.error('Error fetching document categories:', error);
      return res.status(500).json({ error: 'Failed to fetch document categories' });
    }
  });

  // Create document category (admin only)
  app.post('/api/admin/document-categories', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertDocumentCategorySchema.parse(req.body);
      const category = await storage.createDocumentCategory(validatedData);
      invalidateCache('document-categories');
      invalidateCache('dropdown-options');
      return res.status(201).json(category);
    } catch (error) {
      console.error('Error creating document category:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid category data', details: error.errors });
      }
      return res.status(500).json({ error: 'Failed to create document category' });
    }
  });

  // Update document category (admin only)
  app.patch('/api/admin/document-categories/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const category = await storage.updateDocumentCategory(id, updates);
      
      if (!category) {
        return res.status(404).json({ error: 'Document category not found' });
      }
      
      invalidateCache('document-categories');
      invalidateCache('dropdown-options');
      return res.status(200).json(category);
    } catch (error) {
      console.error('Error updating document category:', error);
      return res.status(500).json({ error: 'Failed to update document category' });
    }
  });

  // Delete document category (admin only)
  app.delete('/api/admin/document-categories/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDocumentCategory(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Document category not found' });
      }
      
      invalidateCache('document-categories');
      invalidateCache('dropdown-options');
      return res.status(200).json({ message: 'Document category deleted successfully' });
    } catch (error) {
      console.error('Error deleting document category:', error);
      return res.status(500).json({ error: 'Failed to delete document category' });
    }
  });

  // Admin Document Types Management Routes

  // Get all document types (admin only)
  app.get('/api/admin/document-types', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const cached = getCachedData('admin-document-types');
      if (cached) return res.status(200).json(cached);
      
      const types = await storage.getAllDocumentTypes();
      setCacheData('admin-document-types', types, 5);
      return res.status(200).json(types);
    } catch (error) {
      console.error('Error fetching document types:', error);
      return res.status(500).json({ error: 'Failed to fetch document types' });
    }
  });

  // Create document type (admin only)
  app.post('/api/admin/document-types', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertDocumentTypeSchema.parse(req.body);
      const type = await storage.createDocumentType(validatedData);
      invalidateCache('document-types');
      invalidateCache('dropdown-options');
      return res.status(201).json(type);
    } catch (error) {
      console.error('Error creating document type:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid document type data', details: error.errors });
      }
      return res.status(500).json({ error: 'Failed to create document type' });
    }
  });

  // Update document type (admin only)
  app.patch('/api/admin/document-types/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const type = await storage.updateDocumentType(id, updates);
      
      if (!type) {
        return res.status(404).json({ error: 'Document type not found' });
      }
      
      invalidateCache('document-types');
      invalidateCache('dropdown-options');
      return res.status(200).json(type);
    } catch (error) {
      console.error('Error updating document type:', error);
      return res.status(500).json({ error: 'Failed to update document type' });
    }
  });

  // Delete document type (admin only)
  app.delete('/api/admin/document-types/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDocumentType(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Document type not found' });
      }
      
      invalidateCache('document-types');
      invalidateCache('dropdown-options');
      return res.status(200).json({ message: 'Document type deleted successfully' });
    } catch (error) {
      console.error('Error deleting document type:', error);
      return res.status(500).json({ error: 'Failed to delete document type' });
    }
  });

  // Admin Updates Management Routes

  // Get all updates (admin only)
  app.get('/api/admin/updates', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const updates = await storage.getAllUpdates();
      return res.status(200).json(updates);
    } catch (error) {
      console.error('Error fetching admin updates:', error);
      return res.status(500).json({ error: 'Failed to fetch updates' });
    }
  });

  // Create new update (admin only)
  app.post('/api/admin/updates', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const updateData = {
        ...req.body,
        createdBy: req.user!.id,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      };
      
      const update = await storage.createUpdate(updateData);
      return res.status(201).json(update);
    } catch (error) {
      console.error('Error creating update:', error);
      return res.status(500).json({ error: 'Failed to create update' });
    }
  });

  // Update existing update (admin only)
  app.patch('/api/admin/updates/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const updateId = parseInt(req.params.id);
      const updateData = {
        ...req.body,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      };
      
      const update = await storage.updateUpdate(updateId, updateData);
      if (!update) {
        return res.status(404).json({ error: 'Update not found' });
      }
      
      return res.status(200).json(update);
    } catch (error) {
      console.error('Error updating update:', error);
      return res.status(500).json({ error: 'Failed to update update' });
    }
  });

  // Delete update (admin only)
  app.delete('/api/admin/updates/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const updateId = parseInt(req.params.id);
      const success = await storage.deleteUpdate(updateId);
      
      if (!success) {
        return res.status(404).json({ error: 'Update not found' });
      }
      
      return res.status(200).json({ message: 'Update deleted successfully' });
    } catch (error) {
      console.error('Error deleting update:', error);
      return res.status(500).json({ error: 'Failed to delete update' });
    }
  });

  // Document Templates API Routes
  app.get('/api/document-templates', async (req: Request, res: Response) => {
    try {
      const cacheKey = 'document-templates';
      const cached = getCachedData(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const templates = await storage.getActiveDocumentTemplates();
      setCacheData(cacheKey, templates, 60); // Cache for 1 hour
      res.json(templates);
    } catch (error) {
      console.error('Error fetching document templates:', error);
      res.status(500).json({ error: 'Failed to fetch document templates' });
    }
  });

  // Download document template file
  app.get('/api/document-templates/:id/download', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const template = await storage.getDocumentTemplate(parseInt(id));
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Check if file path exists
      if (!template.filePath) {
        return res.status(404).json({ error: 'Template file not available for download' });
      }

      const { getTemplateFile } = await import('./fileStorage');
      const fileBuffer = await getTemplateFile(template.filePath);
      
      res.setHeader('Content-Disposition', `attachment; filename="${template.fileName || 'document'}"`);
      if (template.fileType) {
        res.setHeader('Content-Type', template.fileType);
      } else {
        res.setHeader('Content-Type', 'application/octet-stream');
      }
      res.setHeader('Content-Length', template.fileSize || fileBuffer.length);
      
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error downloading template:', error);
      res.status(500).json({ error: 'Failed to download template' });
    }
  });

  app.get('/api/admin/document-templates', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const cacheKey = 'admin-document-templates';
      const cached = getCachedData(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const templates = await storage.getAllDocumentTemplates();
      setCacheData(cacheKey, templates, 5); // Cache for 5 minutes
      res.json(templates);
    } catch (error) {
      console.error('Error fetching all document templates:', error);
      res.status(500).json({ error: 'Failed to fetch document templates' });
    }
  });

  app.post('/api/admin/document-templates', requireAuth, requireAdmin, upload.single('file'), async (req: FileRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { saveTemplateFile, isAllowedFileType, getFileSizeInBytes } = await import('./fileStorage');
      
      if (!isAllowedFileType(req.file.originalname)) {
        return res.status(400).json({ error: 'Invalid file type. Only PDF, DOC, DOCX, TXT, and RTF files are allowed.' });
      }

      // Save file to storage
      const filePath = await saveTemplateFile(req.file.buffer, req.file.originalname);
      
      // Parse and validate form data
      const formData = {
        ...req.body,
        visaTypes: Array.isArray(req.body.visaTypes) ? req.body.visaTypes : JSON.parse(req.body.visaTypes || '[]'),
        countries: Array.isArray(req.body.countries) ? req.body.countries : JSON.parse(req.body.countries || '[]'),
        instructions: Array.isArray(req.body.instructions) ? req.body.instructions : JSON.parse(req.body.instructions || '[]'),
        tips: Array.isArray(req.body.tips) ? req.body.tips : JSON.parse(req.body.tips || '[]'),
        requirements: Array.isArray(req.body.requirements) ? req.body.requirements : JSON.parse(req.body.requirements || '[]'),
        isActive: req.body.isActive === 'true' || req.body.isActive === true,
        fileName: req.file.originalname,
        filePath: filePath,
        fileSize: getFileSizeInBytes(req.file.buffer),
        fileType: req.file.mimetype,
        uploadedBy: req.user!.id,
      };

      const template = await storage.createDocumentTemplate(formData);
      
      invalidateCache('document-templates');
      invalidateCache('admin-document-templates');
      invalidateCache('dropdown-options');
      
      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating document template:', error);
      res.status(500).json({ error: 'Failed to create document template' });
    }
  });

  app.patch('/api/admin/document-templates/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const template = await storage.updateDocumentTemplate(parseInt(id), req.body);
      
      if (template) {
        invalidateCache('document-templates');
        invalidateCache('admin-document-templates');
        res.json(template);
      } else {
        res.status(404).json({ error: 'Document template not found' });
      }
    } catch (error) {
      console.error('Error updating document template:', error);
      res.status(500).json({ error: 'Failed to update document template' });
    }
  });

  app.delete('/api/admin/document-templates/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteDocumentTemplate(parseInt(id));
      
      if (success) {
        invalidateCache('document-templates');
        invalidateCache('admin-document-templates');
        invalidateCache('dropdown-options');
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Document template not found' });
      }
    } catch (error) {
      console.error('Error deleting document template:', error);
      res.status(500).json({ error: 'Failed to delete document template' });
    }
  });

  // Get unique dropdown options from database
  app.get('/api/dropdown-options', async (req: Request, res: Response) => {
    try {
      const cachedData = getCachedData('dropdown-options');
      if (cachedData) {
        return res.status(200).json(cachedData);
      }

      const [checklists, templates, categories, documentTypes] = await Promise.all([
        storage.getAllDocumentChecklists(),
        storage.getAllDocumentTemplates(),
        storage.getActiveDocumentCategories(),
        storage.getActiveDocumentTypes()
      ]);

      const activeChecklists = checklists.filter((checklist: any) => checklist.isActive);
      const activeTemplates = templates.filter((template: any) => template.isActive);

      // Extract countries from templates and checklists, add "Other" as contingency
      const extractedCountries = Array.from(new Set([
        ...activeChecklists.map((c: any) => c.country),
        ...activeTemplates.flatMap((t: any) => t.countries || [])
      ])).filter(item => item && typeof item === 'string' && item.trim() && item !== 'all');
      
      const countries = Array.from(new Set([...extractedCountries, "Other"])).sort((a, b) => {
        if (a === "Other") return 1;
        if (b === "Other") return -1;
        return a.localeCompare(b);
      });

      // Extract visa types, add "Other" as contingency
      const extractedVisaTypes = Array.from(new Set([
        ...activeChecklists.map((c: any) => c.visaType),
        ...activeTemplates.flatMap((t: any) => t.visaTypes || [])
      ])).filter(item => item && typeof item === 'string' && item.trim() && item !== 'all');
      
      const visaTypes = Array.from(new Set([...extractedVisaTypes, "Other"])).sort((a, b) => {
        if (a === "Other") return 1;
        if (b === "Other") return -1;
        return a.localeCompare(b);
      });

      // Extract user types, add "Other" as contingency
      const extractedUserTypes = Array.from(new Set([
        ...activeChecklists.map((c: any) => c.userType)
      ])).filter(item => item && typeof item === 'string' && item.trim() && item !== 'all');
      
      const userTypes = Array.from(new Set([...extractedUserTypes, "Other"])).sort((a, b) => {
        if (a === "Other") return 1;
        if (b === "Other") return -1;
        return a.localeCompare(b);
      });

      // Get dynamic categories from database, add "Other" as contingency
      const dynamicCategories = categories.map(cat => cat.name);
      const categoriesWithOther = Array.from(new Set([...dynamicCategories, "Others"])).sort((a, b) => {
        if (a === "Others") return 1;
        if (b === "Others") return -1;
        return a.localeCompare(b);
      });

      // Get dynamic document types from database, add "Other" as contingency
      const dynamicDocumentTypes = documentTypes.map(type => type.name);
      const documentTypesWithOther = Array.from(new Set([...dynamicDocumentTypes, "Other"])).sort((a, b) => {
        if (a === "Other") return 1;
        if (b === "Other") return -1;
        return a.localeCompare(b);
      });

      const options = {
        countries,
        visaTypes,
        userTypes,
        categories: categoriesWithOther,
        documentTypes: documentTypesWithOther
      };
      
      setCacheData('dropdown-options', options, 30);
      return res.status(200).json(options);
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
      return res.status(500).json({ error: 'Failed to fetch dropdown options' });
    }
  });

  // Offer Letter Analysis API Routes
  
  // Get user's offer letter analyses
  app.get('/api/offer-letter-analyses', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const analyses = await storage.getOfferLetterAnalysesByUser(userId);
      
      return res.status(200).json(analyses.map(analysis => ({
        id: analysis.id,
        fileName: analysis.fileName,
        fileSize: analysis.fileSize,
        analysisDate: analysis.createdAt,
        processingTime: analysis.processingTime,
        tokensUsed: analysis.tokensUsed,
        scrapingTime: analysis.scrapingTime,
        analysis: analysis.hybridAnalysisResults || analysis.gptAnalysisResults || analysis.claudeAnalysisResults || {}
      })));
    } catch (error) {
      console.error('Error fetching offer letter analyses:', error);
      return res.status(500).json({ error: 'Failed to fetch analyses' });
    }
  });

  // Analyze offer letter document (new endpoint)
  app.post('/api/offer-letter-analyses/analyze', requireAuth, upload.single('document'), async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check analysis quota
      if (user.analysisCount >= user.maxAnalyses) {
        return res.status(403).json({ 
          error: 'Analysis quota exceeded',
          message: `You have used all ${user.maxAnalyses} of your analyses. Please upgrade your plan or contact support.`
        });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileExtension = file.originalname.toLowerCase().split('.').pop();
      const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
      
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({ 
          error: 'Invalid file type',
          message: 'Please upload a PDF, JPG, or PNG file.'
        });
      }

      // Extract text from document - ensure extension has dot prefix
      const extractedText = await extractTextFromDocument(file.buffer, `.${fileExtension}`);
      
      if (!extractedText || extractedText.trim().length < 50) {
        return res.status(400).json({ 
          error: 'Could not extract sufficient text from the document. Please ensure the document is clear and readable.' 
        });
      }

      // Step 1: Extract core student information from document
      const coreInfo = extractCoreStudentInfo(extractedText, file.originalname);
      console.log('Core student information extracted:', coreInfo);

      // Step 2: Analyze offer letter with comprehensive strategic analysis
      const { analysis, tokensUsed, processingTime } = await analyzeOfferLetterComprehensive(
        extractedText,
        file.originalname
      );

      // Save comprehensive analysis with core student information to database
      const savedAnalysis = await storage.saveOfferLetterAnalysis({
        fileName: file.originalname,
        fileSize: file.size,
        analysisResults: {
          ...analysis,
          coreStudentInfo: coreInfo, // Add core student info to analysis results
          extractedText: extractedText // Include extracted text in analysis results
        },
        tokensUsed,
        processingTime,
        isPublic: false,
      }, userId);

      // Update user's analysis count
      await storage.updateUser(userId, { 
        analysisCount: user.analysisCount + 1 
      });

      // Invalidate relevant caches
      invalidateCache(`user:${userId}:stats`);
      invalidateCache(`user:${userId}:offer-letter-analyses`);
      invalidateCache('admin:offer-letter-analyses');

      return res.status(201).json({
        message: 'Offer letter analysis completed successfully',
        analysisId: savedAnalysis.id,
        tokensUsed,
        processingTime
      });

    } catch (error) {
      console.error('Error analyzing offer letter:', error);
      return res.status(500).json({ 
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred during analysis'
      });
    }
  });

  // Create new offer letter analysis
  app.post('/api/offer-letter-analyses', requireAuth, upload.single('document'), async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check analysis quota
      if (user.analysisCount >= user.maxAnalyses) {
        return res.status(403).json({ 
          error: 'Analysis quota exceeded',
          details: `You have used ${user.analysisCount} out of ${user.maxAnalyses} allowed analyses`
        });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = req.file;
      const fileExtension = path.extname(file.originalname).toLowerCase();
      
      // Validate file type
      const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
      if (!allowedTypes.includes(fileExtension)) {
        return res.status(400).json({ 
          error: 'Invalid file type. Please upload PDF, JPG, or PNG files only.' 
        });
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return res.status(400).json({ 
          error: 'File too large. Please upload files smaller than 10MB.' 
        });
      }

      // Extract text from document
      const extractedText = await extractTextFromDocument(file.buffer, fileExtension);
      
      if (!extractedText || extractedText.trim().length < 50) {
        return res.status(400).json({ 
          error: 'Could not extract sufficient text from the document. Please ensure the document is clear and readable.' 
        });
      }

      // Step 1: Extract core student information from document
      const coreInfo = extractCoreStudentInfo(extractedText, file.originalname);
      console.log('Core student information extracted:', coreInfo);

      // Step 2: Analyze offer letter with comprehensive strategic analysis
      const { analysis, tokensUsed, processingTime } = await analyzeOfferLetterComprehensive(
        extractedText,
        file.originalname
      );

      // Save comprehensive analysis to database
      const savedAnalysis = await storage.saveOfferLetterAnalysis({
        fileName: file.originalname,
        fileSize: file.size,
        analysisResults: {
          ...analysis,
          coreStudentInfo: coreInfo,
          extractedText: extractedText
        },
        tokensUsed,
        processingTime,
        isPublic: false,
      }, userId);

      // Update user's analysis count
      await storage.updateUser(userId, { 
        analysisCount: user.analysisCount + 1 
      });

      // Invalidate relevant caches
      invalidateCache(`user:${userId}:stats`);
      invalidateCache(`user:${userId}:analyses`);

      return res.status(201).json({
        message: 'Offer letter analysis completed successfully',
        analysis: {
          id: savedAnalysis.id,
          fileName: savedAnalysis.fileName,
          fileSize: savedAnalysis.fileSize,
          analysisDate: savedAnalysis.createdAt,
          analysisResults: analysis,
        },
        tokensUsed,
        processingTime,
      });

    } catch (error) {
      console.error('Error analyzing offer letter:', error);
      return res.status(500).json({ 
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Get specific offer letter analysis by ID
  app.get('/api/offer-letter-analyses/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const analysisId = parseInt(req.params.id);
      
      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }

      const analysis = await storage.getOfferLetterAnalysisById(analysisId, userId);
      
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }

      // Parse analysis results from the stored JSON
      let parsedAnalysis = null;
      if (analysis.analysisResults) {
        try {
          parsedAnalysis = typeof analysis.analysisResults === 'string' 
            ? JSON.parse(analysis.analysisResults) 
            : analysis.analysisResults;
        } catch (error) {
          console.error('Error parsing analysis results:', error);
        }
      }

      // Return the complete analysis data
      return res.status(200).json({
        id: analysis.id,
        fileName: analysis.fileName,
        fileSize: analysis.fileSize,
        analysisDate: analysis.createdAt,
        analysisResults: parsedAnalysis,
        createdAt: analysis.createdAt
      });
    } catch (error) {
      console.error('Error fetching offer letter analysis:', error);
      return res.status(500).json({ error: 'Failed to fetch analysis' });
    }
  });

  // Admin routes for offer letter analyses
  app.get('/api/admin/offer-letter-analyses', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const cacheKey = 'admin:offer-letter-analyses';
      const cached = getCachedData(cacheKey);
      
      if (cached) {
        return res.status(200).json(cached);
      }
      
      const analyses = await storage.getAllOfferLetterAnalysesWithUsers();
      setCacheData(cacheKey, analyses, 2);
      return res.status(200).json(analyses);
    } catch (error) {
      console.error('Error fetching offer letter analyses:', error);
      return res.status(500).json({ error: 'Failed to fetch analyses' });
    }
  });

  // Document Checklists API Routes
  app.get('/api/document-checklists', async (req: Request, res: Response) => {
    try {
      const cacheKey = 'document-checklists';
      const cached = getCachedData(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const checklists = await storage.getActiveDocumentChecklists();
      setCacheData(cacheKey, checklists, 60); // Cache for 1 hour
      res.json(checklists);
    } catch (error) {
      console.error('Error fetching document checklists:', error);
      res.status(500).json({ error: 'Failed to fetch document checklists' });
    }
  });

  app.get('/api/admin/document-checklists', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const cacheKey = 'admin-document-checklists';
      const cached = getCachedData(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const checklists = await storage.getAllDocumentChecklists();
      setCacheData(cacheKey, checklists, 5); // Cache for 5 minutes
      res.json(checklists);
    } catch (error) {
      console.error('Error fetching all document checklists:', error);
      res.status(500).json({ error: 'Failed to fetch document checklists' });
    }
  });

  app.post('/api/admin/document-checklists', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      console.log('=== Document Checklist Create Debug ===');
      console.log('Raw request body:', JSON.stringify(req.body, null, 2));
      
      // Validate required fields before processing
      const requiredFields = ['title', 'description', 'country', 'visaType', 'estimatedProcessingTime', 'totalFees'];
      const missingFields = requiredFields.filter(field => !req.body[field] || String(req.body[field]).trim().length === 0);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        });
      }

      // Validate checklist items
      if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
        return res.status(400).json({ 
          error: 'At least one checklist item is required' 
        });
      }

      // Validate each item has required fields
      const itemErrors: string[] = [];
      req.body.items.forEach((item: any, index: number) => {
        if (!item.name || String(item.name).trim().length === 0) {
          itemErrors.push(`Item ${index + 1}: Name is required`);
        }
        if (!item.description || String(item.description).trim().length === 0) {
          itemErrors.push(`Item ${index + 1}: Description is required`);
        }
      });

      if (itemErrors.length > 0) {
        return res.status(400).json({ 
          error: `Item validation errors: ${itemErrors.join(', ')}` 
        });
      }

      // Create clean data object with validated fields
      const userType = ['student', 'tourist', 'work', 'family', 'business'].includes(String(req.body.userType).trim()) 
        ? String(req.body.userType).trim() as "student" | "tourist" | "work" | "family" | "business"
        : 'student' as const;

      const cleanData = {
        title: String(req.body.title).trim(),
        description: String(req.body.description).trim(),
        country: String(req.body.country).trim(),
        visaType: String(req.body.visaType).trim(),
        userType,
        estimatedProcessingTime: String(req.body.estimatedProcessingTime).trim(),
        totalFees: String(req.body.totalFees).trim(),
        isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
        importantNotes: Array.isArray(req.body.importantNotes) ? 
          req.body.importantNotes.filter((note: any) => note && String(note).trim().length > 0) : [],
        items: req.body.items.map((item: any, index: number) => ({
          id: String(item.id || `item-${Date.now()}-${index}`).trim(),
          name: String(item.name).trim(),
          description: String(item.description).trim(),
          category: String(item.category || 'documentation'),
          required: Boolean(item.required),
          completed: Boolean(item.completed),
          order: parseInt(String(item.order)) || index + 1,
          tips: Array.isArray(item.tips) ? 
            item.tips.filter((tip: any) => tip && String(tip).trim().length > 0) : []
        }))
      };

      console.log('Final clean data for create:', JSON.stringify(cleanData, null, 2));
      
      const checklist = await storage.createDocumentChecklist(cleanData);
      invalidateCache('document-checklists');
      invalidateCache('admin-document-checklists');
      invalidateCache('dropdown-options');
      res.status(201).json(checklist);
    } catch (error) {
      console.error('Error creating document checklist:', error);
      res.status(500).json({ error: 'Failed to create document checklist' });
    }
  });

  app.patch('/api/admin/document-checklists/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      console.log('=== Document Checklist Update Debug ===');
      console.log('Raw request body:', JSON.stringify(req.body, null, 2));
      
      // Validate required fields before processing
      const requiredFields = ['title', 'description', 'country', 'visaType', 'estimatedProcessingTime', 'totalFees'];
      const missingFields = requiredFields.filter(field => !req.body[field] || String(req.body[field]).trim().length === 0);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        });
      }

      // Validate checklist items
      if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
        return res.status(400).json({ 
          error: 'At least one checklist item is required' 
        });
      }

      // Validate each item has required fields
      const itemErrors: string[] = [];
      req.body.items.forEach((item: any, index: number) => {
        if (!item.name || String(item.name).trim().length === 0) {
          itemErrors.push(`Item ${index + 1}: Name is required`);
        }
        if (!item.description || String(item.description).trim().length === 0) {
          itemErrors.push(`Item ${index + 1}: Description is required`);
        }
      });

      if (itemErrors.length > 0) {
        return res.status(400).json({ 
          error: `Item validation errors: ${itemErrors.join(', ')}` 
        });
      }
      
      // Create completely clean data object after validation
      const cleanData: any = {};
      
      // Handle string fields explicitly with trimming
      cleanData.title = String(req.body.title).trim();
      cleanData.description = String(req.body.description).trim();
      cleanData.country = String(req.body.country).trim();
      cleanData.visaType = String(req.body.visaType).trim();
      cleanData.userType = String(req.body.userType || 'student').trim();
      cleanData.estimatedProcessingTime = String(req.body.estimatedProcessingTime).trim();
      cleanData.totalFees = String(req.body.totalFees).trim();
      cleanData.isActive = req.body.isActive !== undefined ? Boolean(req.body.isActive) : true;
      
      // Handle importantNotes with strict validation
      if (req.body.importantNotes !== undefined) {
        console.log('Processing importantNotes:', req.body.importantNotes);
        if (Array.isArray(req.body.importantNotes)) {
          cleanData.importantNotes = req.body.importantNotes
            .filter((note: any) => note !== null && note !== undefined)
            .map((note: any) => String(note).trim())
            .filter((note: string) => note.length > 0 && note.length < 500);
        } else {
          cleanData.importantNotes = [];
        }
        console.log('Cleaned importantNotes:', cleanData.importantNotes);
      }
      
      // Handle items with complete validation
      if (req.body.items !== undefined) {
        console.log('Processing items:', req.body.items?.length || 0);
        if (Array.isArray(req.body.items)) {
          cleanData.items = req.body.items.map((item: any, index: number) => {
            const cleanItem = {
              id: String(item.id || `item_${index}`).trim(),
              name: String(item.name || '').trim(),
              description: String(item.description || '').trim(),
              category: String(item.category || 'documentation'),
              required: Boolean(item.required),
              completed: Boolean(item.completed),
              order: parseInt(String(item.order)) || index + 1,
              tips: []
            };
            
            if (Array.isArray(item.tips)) {
              cleanItem.tips = item.tips
                .filter((tip: any) => tip && typeof tip === 'string')
                .map((tip: any) => String(tip).trim())
                .filter((tip: string) => tip.length > 0 && tip.length < 200);
            }
            
            return cleanItem;
          });
        } else {
          cleanData.items = [];
        }
        console.log('Cleaned items count:', cleanData.items?.length || 0);
      }
      
      // Handle array fields
      if (req.body.originCountries !== undefined) {
        cleanData.originCountries = Array.isArray(req.body.originCountries) ? req.body.originCountries : [];
      }
      if (req.body.destinationCountries !== undefined) {
        cleanData.destinationCountries = Array.isArray(req.body.destinationCountries) ? req.body.destinationCountries : [];
      }
      
      console.log('Final clean data:', JSON.stringify(cleanData, null, 2));
      
      const checklist = await storage.updateDocumentChecklist(parseInt(id), cleanData);
      
      if (checklist) {
        invalidateCache('document-checklists');
        invalidateCache('admin-document-checklists');
        res.json(checklist);
      } else {
        res.status(404).json({ error: 'Document checklist not found' });
      }
    } catch (error) {
      console.error('Error updating document checklist:', error);
      res.status(500).json({ error: 'Failed to update document checklist' });
    }
  });

  app.delete('/api/admin/document-checklists/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteDocumentChecklist(parseInt(id));
      
      if (success) {
        invalidateCache('document-checklists');
        invalidateCache('admin-document-checklists');
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Document checklist not found' });
      }
    } catch (error) {
      console.error('Error deleting document checklist:', error);
      res.status(500).json({ error: 'Failed to delete document checklist' });
    }
  });

  // Admin Information Reports API Routes
  // Get all offer letter information (admin only)
  app.get('/api/admin/offer-letter-info', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const cacheKey = 'admin:offer-letter-info';
      const cached = getCachedData(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const offerLetterInfo = await storage.getAllOfferLetterInfo();
      setCacheData(cacheKey, offerLetterInfo, 30); // Cache for 30 minutes
      res.json(offerLetterInfo);
    } catch (error) {
      console.error('Error fetching admin offer letter info:', error);
      res.status(500).json({ error: 'Failed to fetch offer letter information' });
    }
  });

  // Get all COE information (admin only)
  app.get('/api/admin/coe-info', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const cacheKey = 'admin:coe-info';
      const cached = getCachedData(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const coeInfo = await storage.getAllCoeInfo();
      setCacheData(cacheKey, coeInfo, 30); // Cache for 30 minutes
      res.json(coeInfo);
    } catch (error) {
      console.error('Error fetching admin COE info:', error);
      res.status(500).json({ error: 'Failed to fetch COE information' });
    }
  });

  // Get specific COE information by ID (admin only)
  app.get('/api/admin/coe-info/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid COE ID' });
      }

      const coeInfo = await storage.getCoeInfoById(id);

      if (!coeInfo) {
        return res.status(404).json({ error: 'COE information not found' });
      }

      res.json(coeInfo);

    } catch (error) {
      console.error('Error fetching admin COE info:', error);
      res.status(500).json({ error: 'Failed to fetch COE information' });
    }
  });

  // Analysis Feedback API Routes
  // Submit feedback for an analysis
  app.post('/api/analyses/:id/feedback', requireAuth, async (req: Request, res: Response) => {
    try {
      const analysisId = parseInt(req.params.id);
      const userId = req.user!.id;

      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }

      // Validate request body
      const validatedData = insertAnalysisFeedbackSchema.parse({
        ...req.body,
        analysisId,
        userId,
      });

      const feedback = await storage.createAnalysisFeedback(validatedData);
      
      res.status(201).json(feedback);
    } catch (error) {
      console.error('Error creating analysis feedback:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid feedback data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to submit feedback' });
    }
  });

  // Get feedback for an analysis
  app.get('/api/analyses/:id/feedback', requireAuth, async (req: Request, res: Response) => {
    try {
      const analysisId = parseInt(req.params.id);
      const userId = req.user!.id;

      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }

      const feedback = await storage.getAnalysisFeedback(analysisId, userId);
      
      res.status(200).json(feedback);
    } catch (error) {
      console.error('Error fetching analysis feedback:', error);
      res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  });

  // Update existing feedback
  app.patch('/api/analyses/:id/feedback', requireAuth, async (req: Request, res: Response) => {
    try {
      const analysisId = parseInt(req.params.id);
      const userId = req.user!.id;

      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }

      const feedback = await storage.updateAnalysisFeedback(analysisId, userId, req.body);
      
      if (!feedback) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      
      res.status(200).json(feedback);
    } catch (error) {
      console.error('Error updating analysis feedback:', error);
      res.status(500).json({ error: 'Failed to update feedback' });
    }
  });

  // Admin endpoint to view feedback for specific analysis
  app.get('/api/admin/analyses/:id/feedback', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const analysisId = parseInt(req.params.id);
      
      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }

      const feedback = await storage.getAdminAnalysisFeedback(analysisId);
      res.status(200).json(feedback);
    } catch (error) {
      console.error('Error fetching analysis feedback:', error);
      res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  });

  // Admin endpoint to get all feedback
  app.get('/api/admin/feedback', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const feedback = await storage.getAllFeedback();
      res.status(200).json(feedback);
    } catch (error) {
      console.error('Error fetching all feedback:', error);
      res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  });

  // Admin routes for feedback analytics
  app.get('/api/admin/feedback-analytics', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const analytics = await storage.getFeedbackAnalytics();
      res.status(200).json(analytics);
    } catch (error) {
      console.error('Error fetching feedback analytics:', error);
      res.status(500).json({ error: 'Failed to fetch feedback analytics' });
    }
  });

  // Setup comprehensive multi-AI offer letter analysis routes
  setupOfferLetterRoutes(app, requireAuth, requireAdmin);
  
  // Setup gamification routes with authentication
  app.use('/api/gamification', requireAuth, gamificationRoutes);

  // Setup student application routes
  const { registerStudentApplicationRoutes } = await import("./studentApplicationRoutes");
  registerStudentApplicationRoutes(app, requireAuth, requireAdmin);
  console.log('✓ Student application routes registered successfully');

  // ===== CV ANALYSIS ROUTES =====
  console.log("[INFO] [express] ✓ Setting up CV analysis routes...");

  // Upload and analyze CV
  app.post('/api/cv-analysis', requireAuth, upload.single('cv'), async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No CV file provided' });
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: 'Invalid file type. Please upload PDF, JPG, or PNG files.' });
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      }

      let extractedText: string;

      // Extract text based on file type
      if (file.mimetype === 'application/pdf') {
        const pdfParse = await import('pdf-parse');
        const pdfData = await pdfParse.default(file.buffer);
        extractedText = pdfData.text;
      } else {
        // Image files - use Tesseract OCR
        const Tesseract = await import('tesseract.js');
        const { data: { text } } = await Tesseract.recognize(file.buffer, 'eng');
        extractedText = text;
      }

      if (!extractedText || extractedText.trim().length < 100) {
        return res.status(400).json({ error: 'Could not extract sufficient text from the CV. Please ensure the file is clear and readable.' });
      }

      // Analyze CV content using OpenAI
      const { analyzeCvContent } = await import('./cvAnalysisService');
      const { analysisResults, tokensUsed, processingTime } = await analyzeCvContent(extractedText);

      // Save to database
      const cvAnalysis = await storage.createCvAnalysis({
        userId,
        fileName: file.originalname,
        fileSize: file.size,
        extractedText,
        analysisResults,
        tokensUsed,
        processingTime,
      });

      res.json({
        id: cvAnalysis.id,
        fileName: file.originalname,
        fileSize: file.size,
        analysisResults,
        processingTime,
        tokensUsed,
        createdAt: cvAnalysis.createdAt,
      });

    } catch (error) {
      console.error('Error in CV analysis:', error);
      res.status(500).json({ error: 'CV analysis failed. Please try again.' });
    }
  });

  // Get user's CV analyses
  app.get('/api/cv-analyses', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const analyses = await storage.getUserCvAnalyses(userId);
      res.json(analyses);
    } catch (error) {
      console.error('Error fetching CV analyses:', error);
      res.status(500).json({ error: 'Failed to fetch CV analyses' });
    }
  });

  // Get specific CV analysis
  app.get('/api/cv-analyses/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const analysisId = parseInt(req.params.id);

      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }

      const analysis = await storage.getCvAnalysisById(analysisId, userId);
      
      if (!analysis) {
        return res.status(404).json({ error: 'CV analysis not found' });
      }

      res.json(analysis);
    } catch (error) {
      console.error('Error fetching CV analysis:', error);
      res.status(500).json({ error: 'Failed to fetch CV analysis' });
    }
  });

  // Apply CV data to user profile
  app.post('/api/cv-analyses/:id/apply-to-profile', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const analysisId = parseInt(req.params.id);

      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }

      const analysis = await storage.getCvAnalysisById(analysisId, userId);
      
      if (!analysis) {
        return res.status(404).json({ error: 'CV analysis not found' });
      }

      // Apply CV data to user profile
      const result = await storage.applyCvDataToProfile(userId, analysis.analysisResults);
      
      // Mark analysis as applied
      await storage.markCvAnalysisAsApplied(analysisId);

      res.json({ 
        success: true, 
        message: 'CV data successfully applied to profile',
        updatedFields: result.updatedFields 
      });

    } catch (error) {
      console.error('Error applying CV data to profile:', error);
      res.status(500).json({ error: 'Failed to apply CV data to profile' });
    }
  });

  // Delete CV analysis
  app.delete('/api/cv-analyses/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const analysisId = parseInt(req.params.id);

      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }

      const success = await storage.deleteCvAnalysis(analysisId, userId);
      
      if (!success) {
        return res.status(404).json({ error: 'CV analysis not found' });
      }

      res.json({ success: true, message: 'CV analysis deleted successfully' });

    } catch (error) {
      console.error('Error deleting CV analysis:', error);
      res.status(500).json({ error: 'Failed to delete CV analysis' });
    }
  });

  console.log("[INFO] [express] ✓ CV analysis routes registered successfully");

  // ===== ACADEMIC DOCUMENT ANALYSIS ROUTES =====
  console.log("[INFO] [express] ✓ Setting up Academic Document analysis routes...");

  // Upload and analyze academic document
  app.post('/api/academic-document-analysis', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const file = req.file;
      


      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // File validation
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: 'Only PDF, JPG, and PNG files are allowed' });
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return res.status(400).json({ error: 'File size must be less than 10MB' });
      }

      // Use new enhanced document analysis with validation
      console.log(`Analyzing ${file.mimetype} document: ${file.originalname}`);
      
      let analysisResult;
      try {
        const { analyzeDocumentSimplified } = await import('./documentAnalysisNew');
        analysisResult = await analyzeDocumentSimplified(file.buffer, file.mimetype);
        
        console.log(`Document analysis completed successfully`);
        console.log(`Extracted ${analysisResult.extractedText.length} characters with ${(analysisResult.confidence * 100).toFixed(1)}% confidence`);
      } catch (analysisError: any) {
        console.error('Document analysis failed:', analysisError.message);
        
        // Handle specific analysis errors gracefully
        if (analysisError.message?.includes('OCR') || analysisError.message?.includes('tesseract')) {
          throw new Error('Document processing failed due to OCR limitations. Please try converting your PDF to a JPG or PNG image for better results.');
        } else if (analysisError.message?.includes('pdf2pic') || analysisError.message?.includes('PDF to image')) {
          throw new Error('PDF conversion failed. Please try uploading the document as a JPG or PNG image instead.');
        } else if (analysisError.message?.includes('OpenAI') || analysisError.message?.includes('API')) {
          throw new Error('AI analysis service is temporarily unavailable. Please try again in a few moments.');
        } else {
          throw new Error(`Document analysis failed: ${analysisError.message}`);
        }
      }

      // Check for conflicts with existing academic documents
      const results = analysisResult.results;
      const extractedText = analysisResult.extractedText;
      const confidence = analysisResult.confidence;
      
      // Step 3: Check for existing academic documents from the same institution/qualification
      const existingDocuments = await storage.getUserAcademicDocumentAnalyses(userId);
      const conflictingDocuments = existingDocuments.filter((doc: any) => {
        const existing = doc.analysisResults;
        return (
          existing.institutionName?.toLowerCase() === results.institutionName?.toLowerCase() ||
          (existing.qualificationTitle?.toLowerCase() === results.qualificationTitle?.toLowerCase() && 
           existing.qualificationLevel?.toLowerCase() === results.qualificationLevel?.toLowerCase())
        );
      });

      // Step 4: Handle conflicts - only save latest academic documents
      if (conflictingDocuments.length > 0) {
        console.log(`Found ${conflictingDocuments.length} conflicting academic documents for user ${userId}`);
        
        // Check if this is a newer/better document (higher confidence or more recent)
        const shouldReplace = conflictingDocuments.some((doc: any) => {
          const existingDate = new Date(doc.createdAt);
          const daysDifference = Math.abs((Date.now() - existingDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Replace if confidence is significantly higher or if document is more recent and similar confidence
          return confidence > (doc.analysisResults.confidence || 0.5) + 0.2 || 
                 (daysDifference < 7 && confidence >= (doc.analysisResults.confidence || 0.5) - 0.1);
        });

        if (shouldReplace) {
          // Delete conflicting documents before saving new one
          for (const doc of conflictingDocuments) {
            await storage.deleteAcademicDocumentAnalysis(doc.id, userId);
            console.log(`Replaced older academic document: ${doc.fileName}`);
          }
        } else {
          // Return conflict information for user decision
          return res.status(409).json({
            error: 'ACADEMIC_DOCUMENT_CONFLICT',
            message: 'A similar academic document already exists. Please review and decide.',
            conflictingDocuments: conflictingDocuments.map((doc: any) => ({
              id: doc.id,
              fileName: doc.fileName,
              institutionName: doc.analysisResults.institutionName,
              qualificationTitle: doc.analysisResults.qualificationTitle,
              qualificationLevel: doc.analysisResults.qualificationLevel,
              createdAt: doc.createdAt,
              confidence: doc.analysisResults.confidence || 0.5
            })),
            newDocument: {
              fileName: file.originalname,
              institutionName: results.institutionName,
              qualificationTitle: results.qualificationTitle,
              qualificationLevel: results.qualificationLevel,
              confidence: confidence
            }
          });
        }
      }

      // Step 5: Save validated academic document to database
      const academicDocumentAnalysis = await storage.createAcademicDocumentAnalysis({
        userId,
        fileName: file.originalname,
        fileSize: file.size,
        extractedText,
        analysisResults: results,
        tokensUsed: analysisResult.tokensUsed,
        processingTime: analysisResult.processingTime,
      });

      res.json({
        id: academicDocumentAnalysis.id,
        fileName: file.originalname,
        fileSize: file.size,
        analysisResults: results,
        processingTime: analysisResult.processingTime,
        confidence: analysisResult.confidence || confidence || 1.0,
        tokensUsed: analysisResult.tokensUsed,
        extractedText: analysisResult.extractedText,
        createdAt: academicDocumentAnalysis.createdAt,
      });

    } catch (error: any) {
      console.error('Error in academic document analysis:', error);
      
      // Provide specific error messages based on error type
      if (error.message?.includes('AI service temporarily unavailable')) {
        res.status(503).json({ error: error.message });
      } else if (error.message?.includes('Service is currently busy')) {
        res.status(429).json({ error: error.message });
      } else if (error.message?.includes('timeout')) {
        res.status(408).json({ error: error.message });
      } else if (error.message?.includes('Unable to process document content')) {
        res.status(400).json({ error: error.message });
      } else if (error.message?.includes('text extraction')) {
        res.status(400).json({ error: 'Could not extract text from the document. Please ensure the file is not corrupted and contains readable text.' });
      } else {
        res.status(500).json({ error: 'Academic document analysis failed. Please ensure your document is clear and readable, then try again.' });
      }
    }
  });

  // Get user's academic document analyses
  app.get('/api/academic-document-analyses', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const analyses = await storage.getUserAcademicDocumentAnalyses(userId);
      res.json(analyses);
    } catch (error) {
      console.error('Error fetching academic document analyses:', error);
      res.status(500).json({ error: 'Failed to fetch academic document analyses' });
    }
  });

  // Get specific academic document analysis
  app.get('/api/academic-document-analyses/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const analysisId = parseInt(req.params.id);

      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }

      const analysis = await storage.getAcademicDocumentAnalysisById(analysisId, userId);
      
      if (!analysis) {
        return res.status(404).json({ error: 'Academic document analysis not found' });
      }

      res.json(analysis);
    } catch (error) {
      console.error('Error fetching academic document analysis:', error);
      res.status(500).json({ error: 'Failed to fetch academic document analysis' });
    }
  });

  // Apply academic document data to user profile
  app.post('/api/academic-document-analyses/:id/apply-to-profile', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const analysisId = parseInt(req.params.id);

      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }

      const analysis = await storage.getAcademicDocumentAnalysisById(analysisId, userId);
      
      if (!analysis) {
        return res.status(404).json({ error: 'Academic document analysis not found' });
      }

      // Apply academic document data to user profile
      const result = await storage.applyAcademicDocumentDataToProfile(userId, analysis.analysisResults);
      
      // Mark analysis as applied
      await storage.markAcademicDocumentAnalysisAsApplied(analysisId);

      res.json({ 
        success: true, 
        message: 'Academic document data successfully applied to profile',
        updatedFields: result.updatedFields 
      });

    } catch (error) {
      console.error('Error applying academic document data to profile:', error);
      res.status(500).json({ error: 'Failed to apply academic document data to profile' });
    }
  });

  // Delete academic document analysis
  app.delete('/api/academic-document-analyses/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const analysisId = parseInt(req.params.id);

      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }

      const success = await storage.deleteAcademicDocumentAnalysis(analysisId, userId);
      
      if (!success) {
        return res.status(404).json({ error: 'Academic document analysis not found' });
      }

      res.json({ success: true, message: 'Academic document analysis deleted successfully' });

    } catch (error) {
      console.error('Error deleting academic document analysis:', error);
      res.status(500).json({ error: 'Failed to delete academic document analysis' });
    }
  });

  console.log("[INFO] [express] ✓ Academic Document analysis routes registered successfully");

  // Import and register expert routes
  const expertRoutes = await import('./expertRoutes');
  app.use('/api/expert', expertRoutes.default);

  console.log("[INFO] [express] ✓ Expert routes registered successfully");

  // ========================================================================================
  // COMPREHENSIVE STUDENT MANAGEMENT CRM API ROUTES
  // ========================================================================================

  // Get all students with CRM filtering and categorization
  app.get('/api/admin/students', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { 
        search = '', 
        leadCategory = '', 
        studentStage = '', 
        assignedExpert = '', 
        priority = '', 
        source = '',
        page = '1',
        limit = '50'
      } = req.query;

      // Build filter conditions based on existing user fields
      const filters: any = {};
      if (search) {
        // Use SQL LIKE search across multiple fields
      }

      // Get all users with role='user' (students) and transform for CRM display
      const allUsers = await storage.getAllUsers();
      
      // Transform users into CRM student format using actual database fields
      const students = allUsers
        .filter(user => user.role === 'user')
        .map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          // Use actual CRM database fields
          leadCategory: user.leadCategory || 'warm',
          studentStage: user.studentStage || 'potential',
          assignedExpertId: user.assignedExpertId,
          assignedExpertName: user.assignedExpertId ? 'Expert Name' : null, // TODO: Join with experts table
          assignedAt: user.assignedAt,
          lastContactDate: user.lastContactDate,
          priority: user.priority || 'normal',
          notes: user.notes || '',
          tags: user.tags || [],
          source: user.source || 'website',
          profileImageUrl: user.profileImageUrl,
          createdAt: user.createdAt,
          country: user.country,
          studyDestination: user.studyDestination,
          interestedCourse: user.interestedCourse,
          estimatedBudget: user.budgetRange
        }));

      // Apply filters
      const filteredStudents = students.filter(student => {
        const matchesSearch = !search || 
          `${student.firstName} ${student.lastName} ${student.email}`.toLowerCase().includes(search.toString().toLowerCase());
        const matchesCategory = !leadCategory || student.leadCategory === leadCategory;
        const matchesStage = !studentStage || student.studentStage === studentStage;
        const matchesExpert = !assignedExpert || 
          (assignedExpert === 'assigned' && student.assignedExpertId) ||
          (assignedExpert === 'unassigned' && !student.assignedExpertId);
        const matchesPriority = !priority || student.priority === priority;
        
        return matchesSearch && matchesCategory && matchesStage && matchesExpert && matchesPriority;
      });

      res.json(filteredStudents);
    } catch (error) {
      console.error('Error fetching students for CRM:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  });

  // Update student CRM information
  app.patch('/api/admin/students/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const studentId = parseInt(req.params.id);
      const updateData = req.body;

      if (isNaN(studentId)) {
        return res.status(400).json({ error: 'Invalid student ID' });
      }

      // Update the actual CRM fields in the database
      const updatedUser = await storage.updateUser(studentId, updateData);

      if (!updatedUser) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json({ success: true, message: 'Student updated successfully' });
    } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).json({ error: 'Failed to update student' });
    }
  });

  // Get available experts for assignment
  app.get('/api/admin/experts', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      // Get users with role='expert' and transform for expert assignment
      const allUsers = await storage.getAllUsers();
      const experts = allUsers
        .filter(user => user.role === 'expert')
        .map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          expertType: 'counselor', // Default type
          specializations: ['General Counseling'],
          isAvailable: true,
          currentStudentCount: 0,
          maxStudentsAllowed: 20
        }));

      res.json(experts);
    } catch (error) {
      console.error('Error fetching experts:', error);
      res.status(500).json({ error: 'Failed to fetch experts' });
    }
  });

  // Create expert assignment
  app.post('/api/admin/expert-assignments', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { studentId, expertId, assignmentType, assignmentReason, priority } = req.body;

      if (!studentId || !expertId || !assignmentReason) {
        return res.status(400).json({ error: 'Missing required assignment data' });
      }

      // For now, we'll store assignment data in a simple format
      // In full implementation, this would use the studentExpertAssignments table
      const assignmentData = {
        id: Date.now(), // Simple ID generation
        studentId,
        expertId,
        assignmentType: assignmentType || 'primary',
        assignmentReason,
        priority: priority || 'normal',
        assignedBy: req.user!.id,
        assignedAt: new Date().toISOString(),
        status: 'active'
      };

      // Store assignment (simplified - in full implementation would use proper database table)
      console.log('Expert assignment created:', assignmentData);

      res.json({ success: true, message: 'Expert assigned successfully', assignment: assignmentData });
    } catch (error) {
      console.error('Error creating expert assignment:', error);
      res.status(500).json({ error: 'Failed to assign expert' });
    }
  });

  // Bulk update students
  app.post('/api/admin/students/bulk-update', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { action, studentIds, data } = req.body;

      if (!action || !studentIds || !Array.isArray(studentIds)) {
        return res.status(400).json({ error: 'Invalid bulk update request' });
      }

      const results = [];
      for (const studentId of studentIds) {
        try {
          // Map bulk actions to proper CRM field updates
          let updateData: any = {};
          
          if (action.startsWith('category_')) {
            updateData.leadCategory = action.split('_')[1];
          } else if (action.startsWith('stage_')) {
            updateData.studentStage = action.split('_')[1];
          } else if (action.startsWith('priority_')) {
            updateData.priority = action.split('_')[1];
          }

          if (Object.keys(updateData).length > 0) {
            await storage.updateUser(studentId, updateData);
          }
          
          results.push({ studentId, success: true });
        } catch (error) {
          results.push({ studentId, success: false, error: error.message });
        }
      }

      res.json({ success: true, results });
    } catch (error) {
      console.error('Error performing bulk update:', error);
      res.status(500).json({ error: 'Failed to perform bulk update' });
    }
  });

  // Expert Dashboard: Get assigned students
  app.get('/api/expert/assigned-students', requireAuth, async (req: Request, res: Response) => {
    try {
      const expertId = req.user!.id;
      
      // For demonstration, return students assigned to this expert
      // In full implementation, this would query the studentExpertAssignments table
      const allUsers = await storage.getAllUsers();
      const assignedStudents = allUsers
        .filter(user => user.role === 'user')
        .slice(0, 5) // Limit for demo
        .map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          leadCategory: user.analysisCount > 2 ? 'hot' : 'warm',
          studentStage: user.analysisCount > 0 ? 'applied' : 'potential',
          assignedAt: user.createdAt,
          lastContactDate: user.createdAt,
          priority: user.analysisCount > 2 ? 'high' : 'normal',
          engagementScore: Math.min(user.analysisCount * 25, 100),
          totalInteractions: user.analysisCount,
          country: user.country,
          studyDestination: user.studyDestination,
          interestedCourse: user.interestedCourse
        }));

      res.json(assignedStudents);
    } catch (error) {
      console.error('Error fetching assigned students:', error);
      res.status(500).json({ error: 'Failed to fetch assigned students' });
    }
  });

  console.log("[INFO] [express] ✓ Comprehensive Student Management CRM routes registered successfully");

  // Document Management Routes - Import from document management module
  app.use('/api/documents', (await import('./documentManagementRoutes')).default);
  // Document Analysis Route with Resource Optimization
  app.post('/api/documents/:id/analyze', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const documentId = parseInt(req.params.id);
      
      if (isNaN(documentId)) {
        return res.status(400).json({ error: 'Invalid document ID' });
      }

      // Import required database modules
      const { db } = await import('./db');
      const { userDocuments } = await import('@shared/schema');
      const { and, eq } = await import('drizzle-orm');

      // Get document and check ownership
      const document = await db.select()
        .from(userDocuments)
        .where(and(eq(userDocuments.id, documentId), eq(userDocuments.userId, userId)))
        .limit(1);

      if (document.length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const doc = document[0];

      // Resource optimization: Check if already analyzed
      if (doc.isAnalyzed && doc.analysisAttempts > 0) {
        return res.status(400).json({ 
          error: 'Document already analyzed',
          message: 'This document has already been analyzed. Each document can only be analyzed once to optimize resources.',
          analysisDate: doc.firstAnalysisDate,
          attempts: doc.analysisAttempts
        });
      }

      // Check if analysis is allowed (admin override)
      if (!doc.canReanalyze && doc.analysisAttempts > 0) {
        return res.status(403).json({ 
          error: 'Re-analysis not permitted',
          message: 'This document cannot be re-analyzed. Contact support if you need assistance.',
          attempts: doc.analysisAttempts
        });
      }

      // Update analysis attempt tracking
      const now = new Date();
      await db.update(userDocuments)
        .set({
          analysisAttempts: (doc.analysisAttempts || 0) + 1,
          lastAnalysisAttempt: now,
          firstAnalysisDate: doc.firstAnalysisDate || now
        })
        .where(eq(userDocuments.id, documentId));

      try {
        // Perform analysis using document analysis service
        const documentAnalysisService = await import('./documentAnalysisService');
        const analysisResult = await documentAnalysisService.documentAnalysisService.analyzeDocument(
          doc.filePath, 
          doc.documentCategory
        );

        // Update document with analysis results
        await db.update(userDocuments)
          .set({
            isAnalyzed: true,
            analysisData: analysisResult,
            extractedFields: analysisResult,
            validationStatus: 'valid',
            updatedAt: now
          })
          .where(eq(userDocuments.id, documentId));

        res.json({
          success: true,
          message: 'Document analyzed successfully',
          analysisResult,
          documentId,
          analysisAttempts: (doc.analysisAttempts || 0) + 1
        });

      } catch (analysisError: any) {
        console.error('Document analysis failed:', analysisError);
        
        // Update status even if analysis failed to prevent retry abuse
        await db.update(userDocuments)
          .set({
            validationStatus: 'invalid',
            validationIssues: [analysisError.message || 'Analysis failed'],
            updatedAt: now
          })
          .where(eq(userDocuments.id, documentId));

        res.status(500).json({
          error: 'Analysis failed',
          message: analysisError.message || 'Document analysis could not be completed',
          documentId,
          analysisAttempts: doc.analysisAttempts + 1
        });
      }

    } catch (error: any) {
      console.error('Error in document analysis:', error);
      res.status(500).json({ 
        error: 'Failed to analyze document',
        details: error.message 
      });
    }
  });

  console.log("[INFO] [express] ✓ Document management routes registered successfully");

  const httpServer = createServer(app);

  return httpServer;
}
