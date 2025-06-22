import { Router, Request, Response } from "express";
import { scholarshipStorage } from "./scholarshipStorage";
import { scholarshipSearchSchema, insertScholarshipSchema } from "@shared/scholarshipSchema";

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
      error: "Failed to search scholarships"
    });
  }
});

// Get scholarship by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const scholarship = await scholarshipStorage.getScholarshipById(id);
    
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: "Scholarship not found"
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
      error: "Failed to get scholarship"
    });
  }
});

// Get featured scholarships (using getAllScholarships with limit)
router.get("/featured/list", async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const result = await scholarshipStorage.getAllScholarships(limit, 0);
    
    res.json({
      success: true,
      data: result.scholarships
    });
  } catch (error) {
    console.error('[Featured Scholarships] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to get featured scholarships"
    });
  }
});

// Get scholarships by provider (using search functionality)
router.get("/provider/:providerName", async (req: Request, res: Response) => {
  try {
    const { providerName } = req.params;
    const limit = Number(req.query.limit) || 20;
    const offset = Number(req.query.offset) || 0;
    
    const result = await scholarshipStorage.searchScholarships({
      search: providerName,
      limit,
      offset
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[Provider Scholarships] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to get provider scholarships"
    });
  }
});

// Get upcoming deadlines (using search with date filtering)
router.get("/deadlines/upcoming", async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const today = new Date().toISOString().split('T')[0];
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    
    const result = await scholarshipStorage.searchScholarships({
      deadlineFrom: today,
      deadlineTo: oneYearLater.toISOString().split('T')[0],
      limit,
      offset: 0
    });
    
    res.json({
      success: true,
      data: result.scholarships
    });
  } catch (error) {
    console.error('[Upcoming Deadlines] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to get upcoming deadlines"
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
      error: "Failed to get statistics"
    });
  }
});

// Authentication middleware for admin operations
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required"
    });
  }
  next();
};

// Admin role check
const requireAdmin = (req: Request, res: Response, next: any) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: "Admin access required"
    });
  }
  next();
};

// ADMIN ROUTES - Protected by authentication

// Get all scholarships for admin management with filtering
router.get("/admin/scholarships", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { 
      search = '', 
      status = '', 
      providerType = '',
      limit = '20', 
      offset = '0' 
    } = req.query;

    const result = await scholarshipStorage.searchScholarships({
      search: search as string,
      status: status as string,
      providerType: providerType as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.json({
      success: true,
      data: {
        scholarships: result.scholarships,
        total: result.total || result.scholarships.length,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Error fetching admin scholarships:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scholarships'
    });
  }
});

// Create new scholarship (admin endpoint)
router.post("/admin/scholarships", requireAdmin, async (req: Request, res: Response) => {
  try {
    const scholarshipData = insertScholarshipSchema.parse(req.body);
    const scholarship = await scholarshipStorage.createScholarship(scholarshipData);
    
    res.status(201).json({
      success: true,
      data: scholarship
    });
  } catch (error) {
    console.error('[Admin Scholarship Create] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to create scholarship"
    });
  }
});

// Update scholarship (admin endpoint)
router.put("/admin/scholarships/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const scholarshipData = insertScholarshipSchema.parse(req.body);
    
    const scholarship = await scholarshipStorage.updateScholarshipById(id, scholarshipData);
    
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: "Scholarship not found"
      });
    }
    
    res.json({
      success: true,
      data: scholarship
    });
  } catch (error) {
    console.error('[Admin Scholarship Update] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to update scholarship"
    });
  }
});

// Delete scholarship (admin endpoint)
router.delete("/admin/scholarships/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await scholarshipStorage.deleteScholarshipById(id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: "Scholarship not found"
      });
    }
    
    res.json({
      success: true,
      message: "Scholarship deleted successfully"
    });
  } catch (error) {
    console.error('[Admin Scholarship Delete] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to delete scholarship"
    });
  }
});

// Create new scholarship
router.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const scholarshipData = insertScholarshipSchema.parse(req.body);
    const scholarship = await scholarshipStorage.createScholarship({
      ...scholarshipData,
      scholarshipId: `${scholarshipData.providerType.toUpperCase()}_${Date.now()}`
    });
    
    res.status(201).json({
      success: true,
      data: scholarship
    });
  } catch (error) {
    console.error('[Scholarship Create] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to create scholarship"
    });
  }
});

// Update scholarship
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const scholarshipData = insertScholarshipSchema.parse(req.body);
    
    const scholarship = await scholarshipStorage.updateScholarship(id, scholarshipData);
    
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: "Scholarship not found"
      });
    }
    
    res.json({
      success: true,
      data: scholarship
    });
  } catch (error) {
    console.error('[Scholarship Update] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to update scholarship"
    });
  }
});

// Delete scholarship
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await scholarshipStorage.deleteScholarship(id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: "Scholarship not found"
      });
    }
    
    res.json({
      success: true,
      message: "Scholarship deleted successfully"
    });
  } catch (error) {
    console.error('[Scholarship Delete] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to delete scholarship"
    });
  }
});

export default router;