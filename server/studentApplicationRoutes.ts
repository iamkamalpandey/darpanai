import type { Express, Request, Response, NextFunction } from "express";
import { studentApplicationService } from "./studentApplicationService";
import { enhancedAIService } from "./enhancedAIService";
import { personalInfoStepSchema, academicInfoStepSchema, documentsStepSchema, financialInfoStepSchema, applicationSubmissionSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { randomBytes } from "crypto";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/applications/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(pdf|jpg|jpeg|png)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed'));
    }
  }
});

export function registerStudentApplicationRoutes(
  app: Express, 
  requireAuth: (req: Request, res: Response, next: NextFunction) => void,
  requireAdmin: (req: Request, res: Response, next: NextFunction) => void
): void {
  // Create new application
  app.post('/api/applications', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const applicationData = req.body;

      const application = await studentApplicationService.createApplication(userId, applicationData);
      
      res.status(201).json({
        success: true,
        application,
        message: 'Application created successfully'
      });
    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create application' 
      });
    }
  });

  // Get user's applications
  app.get('/api/applications/my', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const applications = await studentApplicationService.getUserApplications(userId);
      
      res.json({
        success: true,
        applications
      });
    } catch (error) {
      console.error('Error fetching user applications:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch applications' 
      });
    }
  });

  // Get specific application
  app.get('/api/applications/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const applicationId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role;
      
      const application = await studentApplicationService.getApplicationById(applicationId);
      
      if (!application) {
        return res.status(404).json({ 
          success: false, 
          error: 'Application not found' 
        });
      }

      // Check permissions - user can only see their own applications, admins can see all
      if (userRole !== 'admin' && application.userId !== userId) {
        return res.status(403).json({ 
          success: false, 
          error: 'Unauthorized access' 
        });
      }

      res.json({
        success: true,
        application
      });
    } catch (error) {
      console.error('Error fetching application:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch application' 
      });
    }
  });

  // Update application step
  app.patch('/api/applications/:id/step', requireAuth, async (req: Request, res: Response) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { step, data } = req.body;
      const userId = (req.user as any).id;

      // Verify user owns this application
      const application = await studentApplicationService.getApplicationById(applicationId);
      if (!application || application.userId !== userId) {
        return res.status(403).json({ 
          success: false, 
          error: 'Unauthorized access' 
        });
      }

      // Validate step data based on step type
      let validatedData;
      switch (step) {
        case 'personal_info':
          validatedData = personalInfoStepSchema.parse(data);
          break;
        case 'academic_info':
          validatedData = academicInfoStepSchema.parse(data);
          break;
        case 'documents':
          validatedData = documentsStepSchema.parse(data);
          break;
        case 'financial_info':
          validatedData = financialInfoStepSchema.parse(data);
          break;
        default:
          validatedData = data;
      }

      const updatedApplication = await studentApplicationService.updateApplicationStep(
        applicationId, 
        validatedData
      );

      // Complete the step
      await studentApplicationService.completeApplicationStep(applicationId, step);

      res.json({
        success: true,
        application: updatedApplication,
        message: `${step} updated successfully`
      });
    } catch (error) {
      console.error('Error updating application step:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update application step' 
      });
    }
  });

  // Upload document
  app.post('/api/applications/:id/documents', requireAuth, upload.single('document'), async (req: Request, res: Response) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { documentType } = req.body;
      const userId = (req.user as any).id;
      
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No file uploaded' 
        });
      }

      // Verify user owns this application
      const application = await studentApplicationService.getApplicationById(applicationId);
      if (!application || application.userId !== userId) {
        return res.status(403).json({ 
          success: false, 
          error: 'Unauthorized access' 
        });
      }

      const document = {
        documentType,
        fileName: req.file.originalname,
        filePath: req.file.path,
        uploadedAt: new Date().toISOString(),
      };

      await studentApplicationService.addDocument(applicationId, document);

      res.json({
        success: true,
        document,
        message: 'Document uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to upload document' 
      });
    }
  });

  // Submit application
  app.post('/api/applications/:id/submit', requireAuth, async (req: Request, res: Response) => {
    try {
      const applicationId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      const submissionData = req.body;

      // Verify user owns this application
      const application = await studentApplicationService.getApplicationById(applicationId);
      if (!application || application.userId !== userId) {
        return res.status(403).json({ 
          success: false, 
          error: 'Unauthorized access' 
        });
      }

      // Validate submission data
      const validatedData = applicationSubmissionSchema.parse(submissionData);

      // Update application with final submission data
      await studentApplicationService.updateApplicationStep(applicationId, {
        ...validatedData,
        currentStep: 'submitted'
      });

      // Submit for review
      await studentApplicationService.submitApplication(applicationId);

      res.json({
        success: true,
        message: 'Application submitted successfully for review'
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to submit application' 
      });
    }
  });

  // Get application status history
  app.get('/api/applications/:id/history', requireAuth, async (req: Request, res: Response) => {
    try {
      const applicationId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role;

      // Check permissions
      const application = await studentApplicationService.getApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ 
          success: false, 
          error: 'Application not found' 
        });
      }

      if (userRole !== 'admin' && application.userId !== userId) {
        return res.status(403).json({ 
          success: false, 
          error: 'Unauthorized access' 
        });
      }

      const history = await studentApplicationService.getApplicationStatusHistory(applicationId);
      
      res.json({
        success: true,
        history
      });
    } catch (error) {
      console.error('Error fetching application history:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch application history' 
      });
    }
  });

  // Admin Routes
  
  // Get all applications (admin only)
  app.get('/api/admin/applications', requireAdmin, async (req: Request, res: Response) => {
    try {
      const filters = {
        status: req.query.status as string,
        country: req.query.country as string,
        studyLevel: req.query.studyLevel as string,
        assignedCounselor: req.query.assignedCounselor as string,
        priority: req.query.priority as string,
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (!filters[key as keyof typeof filters]) {
          delete filters[key as keyof typeof filters];
        }
      });

      const applications = await studentApplicationService.getAllApplications(
        Object.keys(filters).length > 0 ? filters : undefined
      );
      
      res.json({
        success: true,
        applications
      });
    } catch (error) {
      console.error('Error fetching all applications:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch applications' 
      });
    }
  });

  // Update application status (admin only)
  app.patch('/api/admin/applications/:id/status', requireAdmin, async (req: Request, res: Response) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { status, reason, notes } = req.body;
      const adminId = (req.user as any).id;

      await studentApplicationService.updateApplicationStatus(
        applicationId, 
        status, 
        adminId, 
        reason, 
        notes
      );

      res.json({
        success: true,
        message: 'Application status updated successfully'
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update application status' 
      });
    }
  });

  // Get application statistics (admin only)
  app.get('/api/admin/applications/statistics', requireAdmin, async (req: Request, res: Response) => {
    try {
      const statistics = await studentApplicationService.getApplicationStatistics();
      
      res.json({
        success: true,
        statistics
      });
    } catch (error) {
      console.error('Error fetching application statistics:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch application statistics' 
      });
    }
  });

  // Get counselor applications (admin only)
  app.get('/api/admin/applications/counselor/:username', requireAdmin, async (req: Request, res: Response) => {
    try {
      const counselorUsername = req.params.username;
      const applications = await studentApplicationService.getCounselorApplications(counselorUsername);
      
      res.json({
        success: true,
        applications
      });
    } catch (error) {
      console.error('Error fetching counselor applications:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch counselor applications' 
      });
    }
  });

  // Add communication log (admin only)
  app.post('/api/admin/applications/:id/communication', requireAdmin, async (req: Request, res: Response) => {
    try {
      const applicationId = parseInt(req.params.id);
      const communicationEntry = {
        ...req.body,
        timestamp: new Date().toISOString(),
        userId: (req.user as any).id
      };

      await studentApplicationService.addCommunicationLog(applicationId, communicationEntry);

      res.json({
        success: true,
        message: 'Communication log added successfully'
      });
    } catch (error) {
      console.error('Error adding communication log:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to add communication log' 
      });
    }
  });

  // Search applications (admin only)
  app.get('/api/admin/applications/search', requireAdmin, async (req: Request, res: Response) => {
    try {
      const searchTerm = req.query.q as string;
      
      if (!searchTerm) {
        return res.status(400).json({ 
          success: false, 
          error: 'Search term is required' 
        });
      }

      const applications = await studentApplicationService.searchApplications(searchTerm);
      
      res.json({
        success: true,
        applications
      });
    } catch (error) {
      console.error('Error searching applications:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to search applications' 
      });
    }
  });

  // AI-powered application analysis
  app.post('/api/applications/:id/ai-analysis', requireAuth, async (req: Request, res: Response) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { documentText, documentType } = req.body;
      const userId = (req.user as any).id;

      // Verify user owns this application
      const application = await studentApplicationService.getApplicationById(applicationId);
      if (!application || application.userId !== userId) {
        return res.status(403).json({ 
          success: false, 
          error: 'Unauthorized access' 
        });
      }

      const analysis = await enhancedAIService.analyzeApplicationDocument(
        documentText,
        documentType,
        application.personalDetails
      );

      res.json({
        success: true,
        analysis
      });
    } catch (error) {
      console.error('Error performing AI analysis:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to perform AI analysis' 
      });
    }
  });

  // Get application requirements
  app.get('/api/applications/requirements/:country/:level', async (req: Request, res: Response) => {
    try {
      const { country, level } = req.params;
      const requirements = await studentApplicationService.getApplicationRequirements(country, level);
      
      res.json({
        success: true,
        requirements
      });
    } catch (error) {
      console.error('Error fetching application requirements:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch application requirements' 
      });
    }
  });
}