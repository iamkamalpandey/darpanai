import { Router, Request, Response } from "express";
import { scholarshipStorage } from "./scholarshipStorage";
import { scholarshipSearchSchema, insertScholarshipSchema } from "@shared/scholarshipSchema";
import multer from "multer";

// Helper function to validate and format dates
function validateDate(dateString: string): string | null {
  if (!dateString || dateString.trim() === '') return null;
  
  try {
    // Handle multiple date formats
    let date: Date;
    
    // Try parsing as ISO date first
    if (dateString.includes('-')) {
      date = new Date(dateString);
    } 
    // Try parsing as MM/DD/YYYY or DD/MM/YYYY
    else if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        // Assume MM/DD/YYYY format
        date = new Date(`${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
      } else {
        return null;
      }
    }
    // Try direct parsing
    else {
      date = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format: ${dateString}`);
      return null;
    }
    
    // Return ISO format
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.warn(`Date parsing error for "${dateString}":`, error);
    return null;
  }
}

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

// Get filter options from database
router.get("/filter-options", async (req: Request, res: Response) => {
  try {
    const options = await scholarshipStorage.getFilterOptions();
    
    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('[Filter Options] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to get filter options"
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

// Get filter options from database
router.get("/filter-options", async (req: Request, res: Response) => {
  try {
    const options = await scholarshipStorage.getFilterOptions();
    
    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('[Filter Options] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to get filter options"
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
      country = '',
      fundingType = '',
      difficulty = '',
      limit = '20', 
      offset = '0' 
    } = req.query;

    const result = await scholarshipStorage.searchScholarships({
      search: search as string,
      status: status as string,
      providerType: providerType as string,
      providerCountry: country as string,
      fundingType: fundingType as string,
      difficultyLevel: difficulty as string,
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

// Export scholarships to CSV (admin endpoint) - MUST BE BEFORE /:id route
router.get("/admin/scholarships/export", requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await scholarshipStorage.getAllScholarships(1000, 0);
    const allScholarships = result.scholarships;
    
    if (!allScholarships || allScholarships.length === 0) {
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
    
    allScholarships.forEach((scholarship: any) => {
      const row = headers.map((header: string) => {
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

// Generate sample CSV template (admin endpoint) - MUST BE BEFORE /:id route
router.get("/admin/scholarships/sample-csv", requireAdmin, async (req: Request, res: Response) => {
  try {
    const headers = [
      'scholarshipId', 'name', 'shortName', 'providerName', 'providerType', 'providerCountry',
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
      'dataSource', 'verified'
    ];

    // Sample data
    const sampleData = [
      'SAMPLE_SCHOLARSHIP_2025',
      'Sample International Scholarship',
      'Sample Scholarship',
      'Sample University',
      'institution',
      'AU',
      '["AU","US","CA"]',
      '["global"]',
      '["undergraduate","postgraduate"]',
      '["STEM","Business"]',
      'Computer Science',
      'full',
      'AUD',
      '100',
      '25000',
      'annually',
      '50000',
      '60000',
      '2025-01-01',
      '2025-06-30',
      '2025-08-15',
      '2026-02-01',
      '4',
      'years',
      '3.5',
      '4.0',
      'bachelors',
      '18',
      '35',
      'any',
      '0',
      'false',
      '{"IELTS": 6.5, "TOEFL": 90}',
      'https://university.edu/scholarships',
      '100',
      'AUD',
      'true',
      '["transcript","recommendation","essay"]',
      'true',
      'true',
      'true',
      '3',
      'Academic excellence maintained',
      'No restrictions',
      'No restrictions',
      'true',
      'true',
      'true',
      'true',
      'true',
      'Comprehensive scholarship for international students',
      '["merit-based","international","STEM"]',
      'medium',
      '1000',
      '10',
      'active',
      'university_website',
      'true'
    ];

    let csvContent = headers.join(',') + '\n';
    csvContent += sampleData.join(',') + '\n';

    const filename = `scholarship-template-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(csvContent);
  } catch (error: any) {
    console.error('[Sample CSV] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to generate sample CSV"
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
    
    res.json({
      success: true,
      data: scholarship
    });
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

// Update scholarship (admin endpoint) - PUT for full updates
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

// Update scholarship (admin endpoint) - PATCH for partial updates
router.patch("/admin/scholarships/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const scholarshipData = req.body; // Allow partial updates without full schema validation
    
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
    console.error('[Admin Scholarship Patch] Error:', error);
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

// Import scholarships from CSV file (admin endpoint)
router.post("/admin/scholarships/import", requireAdmin, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded"
      });
    }

    if (!req.file.originalname?.endsWith('.csv')) {
      return res.status(400).json({
        success: false,
        error: "Only CSV files are supported"
      });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return res.status(400).json({
        success: false,
        error: "CSV file must contain headers and at least one data row"
      });
    }

    // Parse CSV headers and validate structure
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Required fields for import
    const requiredFields = ['name', 'providerName', 'providerType', 'providerCountry', 'fundingType'];
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required columns: ${missingFields.join(', ')}`
      });
    }

    console.log(`[Import] Processing CSV with ${lines.length - 1} rows`);

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    let errors: string[] = [];
    const processedIds = new Set<string>();

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
          continue;
        }

        const rawData: any = {};
        headers.forEach((header, index) => {
          const value = values[index];
          if (value && value !== '' && value !== 'null') {
            rawData[header] = value;
          }
        });

        // Skip rows without essential data
        if (!rawData.name || !rawData.providerName) {
          errors.push(`Row ${i + 1}: Missing name or provider name`);
          continue;
        }

        // Generate unique scholarship ID
        let scholarshipId = rawData.scholarshipId || `IMPORT_${Date.now()}_${i}`;
        
        // Handle duplicates within import
        if (processedIds.has(scholarshipId)) {
          scholarshipId = `${scholarshipId}_DUP_${i}`;
        }
        processedIds.add(scholarshipId);

        // Prepare cleaned data with proper types
        const scholarshipData = {
          scholarshipId,
          name: rawData.name,
          shortName: rawData.shortName || null,
          providerName: rawData.providerName,
          providerType: rawData.providerType || 'institution',
          providerCountry: rawData.providerCountry || 'US',
          providerWebsite: rawData.providerWebsite || null,
          hostCountries: rawData.hostCountries ? rawData.hostCountries.split(';').map((s: string) => s.trim()).filter((s: string) => s) : null,
          eligibleCountries: rawData.eligibleCountries ? rawData.eligibleCountries.split(';').map((s: string) => s.trim()).filter((s: string) => s) : null,
          studyLevels: rawData.studyLevels ? rawData.studyLevels.split(';').map((s: string) => s.trim()).filter((s: string) => s) : null,
          fieldCategories: rawData.fieldCategories ? rawData.fieldCategories.split(';').map((s: string) => s.trim()).filter((s: string) => s) : null,
          specificFields: rawData.specificFields ? rawData.specificFields.split(';').map((s: string) => s.trim()).filter((s: string) => s) : null,
          fundingType: rawData.fundingType || 'partial',
          fundingCurrency: rawData.fundingCurrency || null,
          tuitionCoveragePercentage: rawData.tuitionCoveragePercentage ? rawData.tuitionCoveragePercentage.toString() : null,
          livingAllowanceAmount: rawData.livingAllowanceAmount || null,
          livingAllowanceFrequency: rawData.livingAllowanceFrequency || null,
          totalValueMin: rawData.totalValueMin || null,
          totalValueMax: rawData.totalValueMax || null,
          applicationOpenDate: rawData.applicationOpenDate || null,
          applicationDeadline: rawData.applicationDeadline || null,
          notificationDate: rawData.notificationDate || null,
          programStartDate: rawData.programStartDate || null,
          durationValue: rawData.durationValue ? parseInt(rawData.durationValue) : null,
          durationUnit: rawData.durationUnit || null,
          minGpa: rawData.minGpa ? rawData.minGpa.toString() : null,
          gpaScale: rawData.gpaScale ? rawData.gpaScale.toString() : null,
          degreeRequired: rawData.degreeRequired ? rawData.degreeRequired.split(';').map((s: string) => s.trim()).filter((s: string) => s) : null,
          minAge: rawData.minAge ? parseInt(rawData.minAge) : null,
          maxAge: rawData.maxAge ? parseInt(rawData.maxAge) : null,
          genderRequirement: rawData.genderRequirement || null,
          nationalityRestrictions: rawData.nationalityRestrictions || null,
          minWorkExperience: rawData.minWorkExperience ? parseInt(rawData.minWorkExperience) : null,
          leadershipRequired: rawData.leadershipRequired === 'true',
          languageRequirements: rawData.languageRequirements ? [{ language: 'english', minimumScore: rawData.languageRequirements }] : null,
          applicationFeeAmount: rawData.applicationFeeAmount || null,
          applicationFeeCurrency: rawData.applicationFeeCurrency || null,
          feeWaiverAvailable: rawData.feeWaiverAvailable === 'true',
          documentsRequired: rawData.documentsRequired ? rawData.documentsRequired.split(';').map((s: string) => s.trim()).filter((s: string) => s) : null,
          interviewRequired: rawData.interviewRequired === 'true',
          essayRequired: rawData.essayRequired === 'true',
          renewable: rawData.renewable === 'true',
          maxRenewalDuration: rawData.maxRenewalDuration || null,
          renewalCriteria: rawData.renewalCriteria ? rawData.renewalCriteria.split(';').map((s: string) => s.trim()).filter((s: string) => s) : null,
          workRestrictions: rawData.workRestrictions || null,
          travelRestrictions: rawData.travelRestrictions || null,
          otherScholarshipsAllowed: rawData.otherScholarshipsAllowed || null,
          mentorshipAvailable: rawData.mentorshipAvailable === 'true',
          networkingOpportunities: rawData.networkingOpportunities === 'true',
          internshipOpportunities: rawData.internshipOpportunities === 'true',
          researchOpportunities: rawData.researchOpportunities === 'true',
          description: rawData.description || '',
          tags: rawData.tags ? rawData.tags.split(';').map((s: string) => s.trim()).filter((s: string) => s) : null,
          difficultyLevel: rawData.difficultyLevel || null,
          totalApplicantsPerYear: rawData.totalApplicantsPerYear ? parseInt(rawData.totalApplicantsPerYear) : null,
          acceptanceRate: rawData.acceptanceRate ? rawData.acceptanceRate.toString() : null,
          status: rawData.status || 'active',
          dataSource: rawData.dataSource || 'import',
          verified: rawData.verified === 'true'
        };

        // Check for existing scholarship by scholarshipId
        const existingScholarship = await scholarshipStorage.getScholarshipById(scholarshipData.scholarshipId);

        if (existingScholarship) {
          // Update existing scholarship
          await scholarshipStorage.updateScholarship(scholarshipData.scholarshipId, scholarshipData);
          updated++;
          console.log(`[Import] Updated scholarship: ${scholarshipData.name}`);
        } else {
          // Create new scholarship  
          await scholarshipStorage.createScholarship(scholarshipData);
          imported++;
          console.log(`[Import] Created scholarship: ${scholarshipData.name}`);
        }

      } catch (error: any) {
        console.error(`[Import] Error processing row ${i + 1}:`, error.message);
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      data: {
        imported,
        updated,
        skipped,
        total: lines.length - 1,
        errors: errors.slice(0, 20)
      }
    });

  } catch (error: any) {
    console.error('[Scholarship Import] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to import scholarships: " + error.message
    });
  }
});

export default router;