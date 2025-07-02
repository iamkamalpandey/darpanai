import { Router, Request, Response } from 'express';
import { institutionStorage } from './institutionStorage';
import { requireAuth } from './auth';
import { z } from 'zod';

const router = Router();

// Get all institutions with optional filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = {
      country: req.query.country as string,
      institutionType: req.query.institutionType as string,
      isPartner: req.query.isPartner === 'true',
      searchTerm: req.query.search as string
    };

    const institutions = await institutionStorage.getAllInstitutions(filters);
    res.json(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({ error: 'Failed to fetch institutions' });
  }
});

// Get recommended institutions based on user profile
router.get('/recommended', requireAuth, async (req: Request, res: Response) => {
  try {
    const userProfile = {
      preferredCountries: req.user?.preferredCountries,
      fieldOfStudy: req.user?.fieldOfStudy,
      studyLevel: req.user?.studyLevel,
      budgetRange: req.user?.budgetRange
    };

    const recommended = await institutionStorage.getRecommendedInstitutions(userProfile);
    res.json(recommended);
  } catch (error) {
    console.error('Error fetching recommended institutions:', error);
    res.status(500).json({ error: 'Failed to fetch recommended institutions' });
  }
});

// Get institution by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid institution ID' });
    }

    const institution = await institutionStorage.getInstitutionById(id);
    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    res.json(institution);
  } catch (error) {
    console.error('Error fetching institution:', error);
    res.status(500).json({ error: 'Failed to fetch institution' });
  }
});

// Get programs by institution
router.get('/:id/programs', async (req: Request, res: Response) => {
  try {
    const institutionId = parseInt(req.params.id);
    if (isNaN(institutionId)) {
      return res.status(400).json({ error: 'Invalid institution ID' });
    }

    const programs = await institutionStorage.getProgramsByInstitution(institutionId);
    res.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

// Search programs across all institutions
router.get('/programs/search', async (req: Request, res: Response) => {
  try {
    const filters = {
      field: req.query.field as string,
      degree: req.query.degree as string,
      country: req.query.country as string,
      studyMode: req.query.studyMode as string,
      searchTerm: req.query.search as string
    };

    const programs = await institutionStorage.searchPrograms(filters);
    res.json(programs);
  } catch (error) {
    console.error('Error searching programs:', error);
    res.status(500).json({ error: 'Failed to search programs' });
  }
});

// Get program details with fees
router.get('/programs/:programId/details', async (req: Request, res: Response) => {
  try {
    const programId = parseInt(req.params.programId);
    if (isNaN(programId)) {
      return res.status(400).json({ error: 'Invalid program ID' });
    }

    const programDetails = await institutionStorage.getProgramWithFees(programId);
    if (!programDetails) {
      return res.status(404).json({ error: 'Program not found' });
    }

    res.json(programDetails);
  } catch (error) {
    console.error('Error fetching program details:', error);
    res.status(500).json({ error: 'Failed to fetch program details' });
  }
});

// Student Applications

// Create a new application
router.post('/apply', requireAuth, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      institutionId: z.number(),
      programId: z.number(),
      applicationData: z.object({}).optional(),
      priority: z.enum(['high', 'medium', 'low']).default('medium'),
      source: z.string().default('chat')
    });

    const validatedData = schema.parse(req.body);
    
    const applicationData = {
      userId: req.user!.id,
      institutionId: validatedData.institutionId,
      programId: validatedData.programId,
      applicationStatus: 'draft' as const,
      applicationData: validatedData.applicationData || {},
      priority: validatedData.priority,
      source: validatedData.source
    };

    const application = await institutionStorage.createStudentApplication(applicationData);
    
    res.status(201).json({
      message: 'Application created successfully',
      application
    });
  } catch (error) {
    console.error('Error creating application:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid application data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// Get user's applications
router.get('/my-applications', requireAuth, async (req: Request, res: Response) => {
  try {
    const applications = await institutionStorage.getStudentApplications(req.user!.id);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Update application status (for counselors/admins)
router.patch('/applications/:id/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id);
    if (isNaN(applicationId)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    const schema = z.object({
      status: z.enum(['draft', 'submitted', 'under_review', 'accepted', 'rejected']),
      notes: z.string().optional()
    });

    const { status, notes } = schema.parse(req.body);
    
    const updatedApplication = await institutionStorage.updateApplicationStatus(
      applicationId,
      status,
      notes
    );

    if (!updatedApplication) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({
      message: 'Application status updated successfully',
      application: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid status data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Get institution statistics
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    const stats = await institutionStorage.getInstitutionStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching institution stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export { router as institutionRoutes };