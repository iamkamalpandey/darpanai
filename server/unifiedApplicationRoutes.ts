import { Router, Request, Response } from 'express';
import { unifiedApplicationService } from './unifiedApplicationService';
import { requireAuth } from './auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads', 'applications');
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'), false);
    }
  }
});

// Institution and Course Routes
router.get('/institutions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { country, search } = req.query;
    const institutions = await unifiedApplicationService.getInstitutions(
      country as string, 
      search as string
    );
    res.json(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch institutions' 
    });
  }
});

router.get('/institutions/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const institutionId = parseInt(req.params.id);
    if (isNaN(institutionId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid institution ID' 
      });
    }

    const institution = await unifiedApplicationService.getInstitutionById(institutionId);
    if (!institution) {
      return res.status(404).json({ 
        success: false, 
        error: 'Institution not found' 
      });
    }

    res.json(institution);
  } catch (error) {
    console.error('Error fetching institution:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch institution' 
    });
  }
});

router.get('/institutions/:id/courses', requireAuth, async (req: Request, res: Response) => {
  try {
    const institutionId = parseInt(req.params.id);
    if (isNaN(institutionId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid institution ID' 
      });
    }

    const courses = await unifiedApplicationService.getCoursesByInstitution(institutionId);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch courses' 
    });
  }
});

router.get('/courses/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid course ID' 
      });
    }

    const courseDetails = await unifiedApplicationService.getCourseWithInstitution(courseId);
    if (!courseDetails) {
      return res.status(404).json({ 
        success: false, 
        error: 'Course not found' 
      });
    }

    res.json(courseDetails);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch course' 
    });
  }
});

// Scholarship Integration Routes
router.get('/courses/:id/scholarships', requireAuth, async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid course ID' 
      });
    }

    const user = req.user as any;
    const scholarships = await unifiedApplicationService.getApplicableScholarships(
      courseId, 
      user.country
    );
    
    res.json(scholarships);
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch scholarships' 
    });
  }
});

// Fee Calculation Route
router.post('/courses/:id/calculate-fees', requireAuth, async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid course ID' 
      });
    }

    const { scholarshipIds = [] } = req.body;
    
    const feeCalculation = await unifiedApplicationService.calculateApplicationFees(
      courseId, 
      scholarshipIds
    );
    
    res.json(feeCalculation);
  } catch (error) {
    console.error('Error calculating fees:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to calculate fees' 
    });
  }
});

// Required Documents Routes
router.get('/required-documents', requireAuth, async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const documents = await unifiedApplicationService.getRequiredDocumentsByCategory(
      category as string
    );
    res.json(documents);
  } catch (error) {
    console.error('Error fetching required documents:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch required documents' 
    });
  }
});

// Application Routes
router.post('/applications', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const applicationData = {
      ...req.body,
      userId: user.id
    };

    const application = await unifiedApplicationService.createApplication(applicationData);
    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create application' 
    });
  }
});

router.get('/applications', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userRole = user.role;

    let applications;
    if (userRole === 'admin') {
      applications = await unifiedApplicationService.getAllApplications();
    } else {
      applications = await unifiedApplicationService.getUserApplications(user.id);
    }

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch applications' 
    });
  }
});

router.get('/applications/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userRole = user.role;
    
    const stats = await unifiedApplicationService.getApplicationStats(
      userRole === 'admin' ? undefined : user.id
    );
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch application statistics' 
    });
  }
});

router.get('/applications/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id);
    if (isNaN(applicationId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid application ID' 
      });
    }

    const user = req.user as any;
    const application = await unifiedApplicationService.getApplicationWithDetails(applicationId);
    
    if (!application) {
      return res.status(404).json({ 
        success: false, 
        error: 'Application not found' 
      });
    }

    // Check permissions - user can only see their own applications, admins can see all
    if (user.role !== 'admin' && application.application.userId !== user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch application' 
    });
  }
});

router.patch('/applications/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id);
    if (isNaN(applicationId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid application ID' 
      });
    }

    const user = req.user as any;
    const existingApplication = await unifiedApplicationService.getApplicationById(applicationId);
    
    if (!existingApplication) {
      return res.status(404).json({ 
        success: false, 
        error: 'Application not found' 
      });
    }

    // Check permissions
    if (user.role !== 'admin' && existingApplication.userId !== user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }

    const updatedApplication = await unifiedApplicationService.updateApplication(
      applicationId, 
      req.body
    );
    
    res.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update application' 
    });
  }
});

// Document Upload Routes
router.post('/applications/:id/documents', requireAuth, upload.single('document'), async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id);
    if (isNaN(applicationId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid application ID' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    const { documentId } = req.body;
    if (!documentId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Document type ID is required' 
      });
    }

    const user = req.user as any;
    const application = await unifiedApplicationService.getApplicationById(applicationId);
    
    if (!application) {
      return res.status(404).json({ 
        success: false, 
        error: 'Application not found' 
      });
    }

    // Check permissions
    if (user.role !== 'admin' && application.userId !== user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }

    const documentData = {
      applicationId,
      documentId: parseInt(documentId),
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileType: req.file.mimetype
    };

    const uploadedDocument = await unifiedApplicationService.uploadApplicationDocument(documentData);
    res.status(201).json(uploadedDocument);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload document' 
    });
  }
});

router.get('/applications/:id/documents', requireAuth, async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id);
    if (isNaN(applicationId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid application ID' 
      });
    }

    const user = req.user as any;
    const application = await unifiedApplicationService.getApplicationById(applicationId);
    
    if (!application) {
      return res.status(404).json({ 
        success: false, 
        error: 'Application not found' 
      });
    }

    // Check permissions
    if (user.role !== 'admin' && application.userId !== user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }

    const documents = await unifiedApplicationService.getApplicationDocuments(applicationId);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching application documents:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch application documents' 
    });
  }
});

// Admin-only document verification
router.patch('/documents/:id/verify', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }

    const documentId = parseInt(req.params.id);
    if (isNaN(documentId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid document ID' 
      });
    }

    const { status, comments } = req.body;
    if (!status || !['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid status (verified/rejected) is required' 
      });
    }

    const verifiedDocument = await unifiedApplicationService.verifyDocument(
      documentId,
      user.id,
      status,
      comments
    );

    res.json(verifiedDocument);
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify document' 
    });
  }
});

export function registerUnifiedApplicationRoutes(app: any) {
  app.use('/api/unified-applications', router);
  console.log('✓ Unified Application Management routes registered successfully');
}