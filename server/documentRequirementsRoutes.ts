import { Router, Request, Response } from 'express';
import { documentRequirementsService } from './documentRequirementsService';

// Simple auth middleware
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

const router = Router();

// Public routes - Get document requirements for specific country/level
router.get('/requirements/:countryCode/:studyLevel', async (req: Request, res: Response) => {
  try {
    const { countryCode, studyLevel } = req.params;
    
    if (!countryCode || !studyLevel) {
      return res.status(400).json({ 
        success: false, 
        message: 'Country code and study level are required' 
      });
    }

    const requirements = await documentRequirementsService.getRequirements(countryCode, studyLevel);
    
    res.json({
      success: true,
      requirements,
      country: countryCode.toUpperCase(),
      studyLevel: studyLevel.toLowerCase(),
    });
  } catch (error) {
    console.error('Error fetching document requirements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document requirements',
    });
  }
});

// Get available countries with requirements
router.get('/countries', async (req: Request, res: Response) => {
  try {
    const countries = await documentRequirementsService.getCountriesWithRequirements();
    
    res.json({
      success: true,
      countries,
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch countries',
    });
  }
});

// Admin routes - require authentication
router.use(requireAuth);

// Admin: Get all document requirements
router.get('/admin/all', async (req: Request, res: Response) => {
  try {
    const requirements = await documentRequirementsService.getAllRequirements();
    
    res.json({
      success: true,
      requirements,
    });
  } catch (error) {
    console.error('Error fetching all document requirements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document requirements',
    });
  }
});

// Admin: Create new document requirement
router.post('/admin/create', async (req: Request, res: Response) => {
  try {
    const requirementData = req.body;
    
    // Validate required fields
    const requiredFields = ['countryCode', 'studyLevel', 'documentType', 'documentName', 'description'];
    const missingFields = requiredFields.filter(field => !requirementData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const requirement = await documentRequirementsService.createRequirement(requirementData);
    
    res.status(201).json({
      success: true,
      message: 'Document requirement created successfully',
      requirement,
    });
  } catch (error) {
    console.error('Error creating document requirement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create document requirement',
    });
  }
});

// Admin: Update document requirement
router.put('/admin/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid requirement ID',
      });
    }

    const requirement = await documentRequirementsService.updateRequirement(id, updateData);
    
    res.json({
      success: true,
      message: 'Document requirement updated successfully',
      requirement,
    });
  } catch (error) {
    console.error('Error updating document requirement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document requirement',
    });
  }
});

// Admin: Delete document requirement
router.delete('/admin/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid requirement ID',
      });
    }

    await documentRequirementsService.deleteRequirement(id);
    
    res.json({
      success: true,
      message: 'Document requirement deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting document requirement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document requirement',
    });
  }
});

// Admin: Initialize default requirements
router.post('/admin/initialize', async (req: Request, res: Response) => {
  try {
    await documentRequirementsService.initializeDefaultRequirements();
    
    res.json({
      success: true,
      message: 'Default document requirements initialized successfully',
    });
  } catch (error) {
    console.error('Error initializing default requirements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize default requirements',
    });
  }
});

export default router;