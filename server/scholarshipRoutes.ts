import { Router, type Request, Response } from "express";
import { scholarshipStorage } from "./scholarshipStorage";
import { scholarshipSearchSchema, insertScholarshipSchema } from "@shared/scholarshipSchema";
import { z } from "zod";

const router = Router();

// Search scholarships with filtering and pagination
router.get("/search", async (req: Request, res: Response) => {
  try {
    // Parse and validate query parameters for new schema
    const searchParams = scholarshipSearchSchema.parse({
      search: req.query.search as string,
      providerType: req.query.providerType as string,
      providerCountry: req.query.providerCountry as string,
      studyLevel: req.query.studyLevel as string,
      fieldCategory: req.query.fieldCategory as string,
      fundingType: req.query.fundingType as string,
      difficultyLevel: req.query.difficultyLevel as string,
      minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
      maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
      deadlineFrom: req.query.deadlineFrom as string,
      deadlineTo: req.query.deadlineTo as string,
      renewable: req.query.renewable === 'true' ? true : req.query.renewable === 'false' ? false : undefined,
      leadershipRequired: req.query.leadershipRequired === 'true' ? true : req.query.leadershipRequired === 'false' ? false : undefined,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      offset: req.query.offset ? Number(req.query.offset) : 0
    });

    const result = await scholarshipStorage.searchScholarships(searchParams);
    
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('[Scholarship Search] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search scholarships',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get scholarship by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Scholarship ID is required'
      });
    }

    const scholarship = await scholarshipStorage.getScholarshipById(id);
    
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: 'Scholarship not found'
      });
    }

    res.json({
      success: true,
      data: scholarship
    });

  } catch (error) {
    console.error('[Scholarship Get] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scholarship',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get featured scholarships
router.get("/featured/list", async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const scholarships = await scholarshipStorage.getFeaturedScholarships(limit);
    
    res.json({
      success: true,
      data: scholarships
    });

  } catch (error) {
    console.error('[Featured Scholarships] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get featured scholarships',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get scholarships by provider
router.get("/provider/:providerName", async (req: Request, res: Response) => {
  try {
    const { providerName } = req.params;
    const decodedProvider = decodeURIComponent(providerName);
    
    const scholarships = await scholarshipStorage.getScholarshipsByProvider(decodedProvider);
    
    res.json({
      success: true,
      data: scholarships
    });

  } catch (error) {
    console.error('[Provider Scholarships] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scholarships by provider',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get upcoming deadline scholarships
router.get("/deadlines/upcoming", async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? Number(req.query.days) : 30;
    const scholarships = await scholarshipStorage.getUpcomingDeadlines(days);
    
    res.json({
      success: true,
      data: scholarships
    });

  } catch (error) {
    console.error('[Upcoming Deadlines] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get upcoming deadlines',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get scholarship statistics
router.get("/stats/overview", async (req: Request, res: Response) => {
  try {
    const stats = await scholarshipStorage.getStatistics();
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('[Scholarship Stats] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scholarship statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Admin routes (require authentication)
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

const requireAdmin = (req: Request, res: Response, next: any) => {
  if (!req.isAuthenticated() || (req.user as any)?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Create new scholarship (Admin only)
router.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const scholarshipData = insertScholarshipSchema.parse(req.body);
    const scholarship = await scholarshipStorage.createScholarship(scholarshipData);
    
    res.status(201).json({
      success: true,
      data: scholarship
    });

  } catch (error) {
    console.error('[Create Scholarship] Error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid scholarship data',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create scholarship',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update scholarship (Admin only)
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = insertScholarshipSchema.partial().parse(req.body);
    
    const scholarship = await scholarshipStorage.updateScholarship(id, updateData);
    
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: 'Scholarship not found'
      });
    }

    res.json({
      success: true,
      data: scholarship
    });

  } catch (error) {
    console.error('[Update Scholarship] Error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid update data',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update scholarship',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete scholarship (Admin only)
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await scholarshipStorage.deleteScholarship(id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Scholarship not found'
      });
    }

    res.json({
      success: true,
      message: 'Scholarship deleted successfully'
    });

  } catch (error) {
    console.error('[Delete Scholarship] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete scholarship',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as scholarshipRoutes };