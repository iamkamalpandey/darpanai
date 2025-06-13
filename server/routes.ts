import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { extractTextFromDocument } from "./fileProcessing";
import { analyzeRejectionLetter } from "./openai";
import { analysisResponseSchema } from "@shared/schema";
import { setupAuth } from "./auth";

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
        
        // Check usage limits for authenticated users
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
          
          // Increment user's analysis count if authenticated
          if (userId) {
            await storage.incrementUserAnalysisCount(userId);
          }
          
          // Return the analysis results with the saved ID for reference
          return res.status(200).json({
            ...analysisResult,
            id: savedAnalysis.id,
            isAuthenticated: req.isAuthenticated()
          });
        } catch (dbError) {
          console.error('Error saving analysis to database:', dbError);
          // Continue even if saving to DB fails
          return res.status(200).json({
            ...analysisResult,
            isAuthenticated: req.isAuthenticated()
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
      
      // Check if user has access to this analysis
      // Allow if: analysis is public, or user is authenticated and owns the analysis
      const userOwnsAnalysis = req.isAuthenticated() && analysis.userId === req.user!.id;
      
      if (!analysis.isPublic && !userOwnsAnalysis) {
        return res.status(403).json({ 
          error: 'Access denied',
          preview: {
            id: analysis.id,
            summary: analysis.summary.substring(0, 100) + '...',
            message: 'Please log in to view the full analysis'
          }
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
      const users = await storage.getAllUsers();
      // Remove password from response for security
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
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

      const { password, ...safeUser } = updatedUser;
      return res.status(200).json(safeUser);
    } catch (error) {
      console.error('Error updating user role:', error);
      return res.status(500).json({ error: 'Failed to update user role' });
    }
  });

  // Get all analyses with user info (admin only)
  app.get('/api/admin/analyses', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const analyses = await storage.getAllAnalysesWithUsers();
      return res.status(200).json(analyses);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      return res.status(500).json({ error: 'Failed to fetch analyses' });
    }
  });

  // Get all appointments with user info (admin only)
  app.get('/api/admin/appointments', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const appointments = await storage.getAllAppointmentsWithUsers();
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

      return res.status(200).json(updatedAppointment);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return res.status(500).json({ error: 'Failed to update appointment status' });
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

      const analyses = await storage.getUserAnalyses(userId);
      const appointments = await storage.getUserAppointments(userId);

      const { password, ...safeUser } = user;
      return res.status(200).json({
        ...safeUser,
        analyses,
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

  const httpServer = createServer(app);

  return httpServer;
}
