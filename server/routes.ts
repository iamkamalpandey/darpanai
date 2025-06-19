import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { extractTextFromDocument } from "./fileProcessing";
import { analyzeRejectionLetter } from "./openai";
import { analyzeEnrollmentDocument } from "./enrollmentAnalysis";
import { analysisResponseSchema, professionalApplicationSchema, insertDocumentTemplateSchema, insertEnrollmentAnalysisSchema, insertDocumentCategorySchema, insertDocumentTypeSchema } from "@shared/schema";
import { z } from 'zod';
import { setupAuth } from "./auth";

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
  
  // ANALYZE API
  // Analyze rejection letter
  app.post('/api/analyze', upload.single('file'), async (req: FileRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
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
            error: 'Failed to extract meaningful text from the document. Please ensure your document contains readable text.'
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
            error: 'Analysis completed but response format is invalid',
            details: validationResult.error.issues 
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
          error: `Text extraction failed: ${(extractionError as Error).message}. Please ensure your document is not corrupted and contains readable text.`
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
      
      const analysis = await storage.getAnalysisById(analysisId);
      
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

  const httpServer = createServer(app);

  return httpServer;
}
