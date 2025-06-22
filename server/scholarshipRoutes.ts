import { Router, Request, Response } from "express";
import { scholarshipStorage } from "./scholarshipStorage";
import { scholarshipSearchSchema, insertScholarshipSchema } from "@shared/scholarshipSchema";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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

// Admin role check with enhanced debugging
const requireAdmin = (req: Request, res: Response, next: any) => {
  console.log('Admin check:', { user: req.user?.username, role: req.user?.role });
  
  if (!req.user) {
    console.log('No user found in admin check');
    return res.status(401).json({
      success: false,
      error: "Authentication required"
    });
  }
  
  if (req.user.role !== 'admin') {
    console.log('User role is not admin:', req.user.role);
    return res.status(403).json({
      success: false,
      error: "Admin access required"
    });
  }
  
  console.log('Admin access granted for user:', req.user.username);
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

// Get individual scholarship by ID (admin endpoint)
router.get("/admin/scholarships/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid scholarship ID"
      });
    }

    const scholarship = await scholarshipStorage.getScholarshipByNumericId(id);
    
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: "Scholarship not found"
      });
    }
    
    res.json(scholarship);
  } catch (error) {
    console.error('[Admin Scholarship Get] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to get scholarship"
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

// Import scholarships from CSV/JSON file (admin endpoint)
router.post("/admin/scholarships/import", requireAdmin, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded"
      });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    let scholarships: any[] = [];

    // Parse JSON or CSV
    if (req.file.mimetype === 'application/json') {
      scholarships = JSON.parse(fileContent);
    } else if (req.file.mimetype === 'text/csv' || req.file.originalname?.endsWith('.csv')) {
      // Parse CSV
      const lines = fileContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const scholarship: any = {};
          
          headers.forEach((header, index) => {
            const value = values[index];
            if (value && value !== '') {
              // Handle JSON fields
              if (['hostCountries', 'eligibleCountries', 'studyLevels', 'fieldCategories', 'specificFields', 'degreeRequired', 'languageRequirements', 'documentsRequired', 'renewalCriteria', 'tags'].includes(header)) {
                try {
                  scholarship[header] = JSON.parse(value);
                } catch {
                  scholarship[header] = value.split(';').map(v => v.trim());
                }
              } else if (['minAge', 'maxAge', 'durationValue', 'totalApplicantsPerYear', 'minWorkExperience'].includes(header)) {
                scholarship[header] = parseInt(value) || null;
              } else if (['tuitionCoveragePercentage', 'livingAllowanceAmount', 'totalValueMin', 'totalValueMax', 'minGpa', 'gpaScale', 'applicationFeeAmount', 'acceptanceRate'].includes(header)) {
                scholarship[header] = parseFloat(value) || null;
              } else if (['leadershipRequired', 'feeWaiverAvailable', 'interviewRequired', 'essayRequired', 'renewable', 'mentorshipAvailable', 'networkingOpportunities', 'internshipOpportunities', 'researchOpportunities', 'verified'].includes(header)) {
                scholarship[header] = value.toLowerCase() === 'true';
              } else if (['applicationOpenDate', 'applicationDeadline', 'notificationDate', 'programStartDate'].includes(header)) {
                scholarship[header] = value ? new Date(value).toISOString().split('T')[0] : null;
              } else {
                scholarship[header] = value;
              }
            }
          });
          
          scholarships.push(scholarship);
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        error: "Unsupported file format. Please upload CSV or JSON files."
      });
    }

    // Validate and import scholarships
    let imported = 0;
    let errors: string[] = [];

    for (const scholarshipData of scholarships) {
      try {
        // Add required fields if missing
        if (!scholarshipData.scholarshipId) {
          scholarshipData.scholarshipId = `IMPORT_${Date.now()}_${imported}`;
        }
        
        // Validate with schema
        const validatedData = insertScholarshipSchema.parse(scholarshipData);
        await scholarshipStorage.createScholarship(validatedData);
        imported++;
      } catch (error: any) {
        errors.push(`Row ${imported + 1}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      data: {
        imported,
        total: scholarships.length,
        errors: errors.slice(0, 10) // Limit error messages
      }
    });
  } catch (error: any) {
    console.error('[Scholarship Import] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to import scholarships"
    });
  }
});

// Export scholarships to CSV (admin endpoint)
router.get("/admin/scholarships/export", requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await scholarshipStorage.getAllScholarships();
    const scholarships = result.scholarships;
    
    if (scholarships.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No scholarships found to export"
      });
    }

    // Define CSV headers (all database fields)
    const headers = [
      'id', 'scholarshipId', 'name', 'shortName', 'providerName', 'providerType', 'providerCountry',
      'hostCountries', 'eligibleCountries', 'studyLevels', 'fieldCategories', 'specificFields',
      'fundingType', 'fundingCurrency', 'tuitionCoveragePercentage', 'livingAllowanceAmount',
      'livingAllowanceFrequency', 'totalValueMin', 'totalValueMax', 'applicationOpenDate',
      'applicationDeadline', 'notificationDate', 'programStartDate', 'durationValue', 'durationUnit',
      'minGpa', 'gpaScale', 'degreeRequired', 'minAge', 'maxAge', 'genderRequirement',
      'minWorkExperience', 'leadershipRequired', 'languageRequirements', 'applicationUrl',
      'applicationFeeAmount', 'applicationFeeCurrency', 'feeWaiverAvailable', 'documentsRequired',
      'interviewRequired', 'essayRequired', 'renewable', 'maxRenewalDuration', 'renewalCriteria',
      'workRestrictions', 'travelRestrictions', 'otherScholarshipsAllowed', 'mentorshipAvailable',
      'networkingOpportunities', 'internshipOpportunities', 'researchOpportunities', 'description',
      'tags', 'difficultyLevel', 'totalApplicantsPerYear', 'acceptanceRate', 'status',
      'dataSource', 'verified', 'createdDate', 'updatedDate'
    ];

    // Generate CSV content
    let csvContent = headers.join(',') + '\n';
    
    scholarships.forEach(scholarship => {
      const row = headers.map(header => {
        let value = scholarship[header as keyof typeof scholarship];
        
        // Handle null/undefined values
        if (value === null || value === undefined) {
          return '';
        }
        
        // Handle arrays and objects (JSON fields)
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        
        // Handle dates
        if (value instanceof Date) {
          value = value.toISOString().split('T')[0];
        }
        
        // Escape quotes and wrap in quotes if contains comma or quote
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      });
      
      csvContent += row.join(',') + '\n';
    });

    // Set headers for file download
    const filename = `scholarships-export-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(csvContent);
  } catch (error: any) {
    console.error('[Scholarship Export] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to export scholarships"
    });
  }
});

export default router;