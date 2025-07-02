import { Router } from "express";
import { countryWorkflowStorage } from "./countryWorkflowStorage";
import { 
  insertCountryWorkflowSchema,
  insertChecklistItemSchema,
  insertUserApplicationSchema,
  insertConsultationBookingSchema
} from "@shared/schema";

// Local middleware functions
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

const router = Router();

// ===== ADMIN ROUTES FOR WORKFLOW MANAGEMENT =====

// Get all workflows (Admin only)
router.get('/admin/workflows', requireAdmin, async (req, res) => {
  try {
    const workflows = await countryWorkflowStorage.getWorkflows();
    res.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

// Create new workflow (Admin only)
router.post('/admin/workflows', requireAdmin, async (req, res) => {
  try {
    const validatedData = insertCountryWorkflowSchema.parse(req.body);
    const workflow = await countryWorkflowStorage.createWorkflow(validatedData);
    res.status(201).json(workflow);
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(400).json({ error: 'Invalid workflow data' });
  }
});

// Get specific workflow (Admin only)
router.get('/admin/workflows/:id', requireAdmin, async (req, res) => {
  try {
    const workflowId = parseInt(req.params.id);
    const workflow = await countryWorkflowStorage.getWorkflow(workflowId);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    res.json(workflow);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
});

// Update workflow (Admin only)
router.patch('/admin/workflows/:id', requireAdmin, async (req, res) => {
  try {
    const workflowId = parseInt(req.params.id);
    const updates = insertCountryWorkflowSchema.partial().parse(req.body);
    
    const workflow = await countryWorkflowStorage.updateWorkflow(workflowId, updates);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    res.json(workflow);
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(400).json({ error: 'Invalid update data' });
  }
});

// Delete workflow (Admin only)
router.delete('/admin/workflows/:id', requireAdmin, async (req, res) => {
  try {
    const workflowId = parseInt(req.params.id);
    const deleted = await countryWorkflowStorage.deleteWorkflow(workflowId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

// ===== ADMIN ROUTES FOR CHECKLIST MANAGEMENT =====

// Get checklist items for workflow (Admin only)
router.get('/admin/workflows/:id/checklist', requireAdmin, async (req, res) => {
  try {
    const workflowId = parseInt(req.params.id);
    const items = await countryWorkflowStorage.getChecklistItems(workflowId);
    res.json(items);
  } catch (error) {
    console.error('Error fetching checklist items:', error);
    res.status(500).json({ error: 'Failed to fetch checklist items' });
  }
});

// Add checklist item (Admin only)
router.post('/admin/workflows/:id/checklist', requireAdmin, async (req, res) => {
  try {
    const workflowId = parseInt(req.params.id);
    const itemData = insertChecklistItemSchema.parse({
      ...req.body,
      workflowId
    });
    
    const item = await countryWorkflowStorage.createChecklistItem(itemData);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating checklist item:', error);
    res.status(400).json({ error: 'Invalid checklist item data' });
  }
});

// Update checklist item (Admin only)
router.patch('/admin/checklist/:id', requireAdmin, async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const updates = insertChecklistItemSchema.partial().parse(req.body);
    
    const item = await countryWorkflowStorage.updateChecklistItem(itemId, updates);
    
    if (!item) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error updating checklist item:', error);
    res.status(400).json({ error: 'Invalid update data' });
  }
});

// Delete checklist item (Admin only)
router.delete('/admin/checklist/:id', requireAdmin, async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const deleted = await countryWorkflowStorage.deleteChecklistItem(itemId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }
    
    res.json({ message: 'Checklist item deleted successfully' });
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    res.status(500).json({ error: 'Failed to delete checklist item' });
  }
});

// ===== USER ROUTES FOR APPLICATION WORKFLOW =====

// Get supported countries
router.get('/countries', async (req, res) => {
  try {
    const countries = await countryWorkflowStorage.getSupportedCountries();
    res.json(countries);
  } catch (error) {
    console.error('Error fetching supported countries:', error);
    res.status(500).json({ error: 'Failed to fetch supported countries' });
  }
});

// Check if country workflow exists
router.get('/check-workflow/:countryCode/:studyLevel', async (req, res) => {
  try {
    const { countryCode, studyLevel } = req.params;
    const workflow = await countryWorkflowStorage.getWorkflowByCountry(countryCode.toUpperCase(), studyLevel);
    
    res.json({
      hasWorkflow: !!workflow,
      workflow: workflow || null
    });
  } catch (error) {
    console.error('Error checking workflow:', error);
    res.status(500).json({ error: 'Failed to check workflow availability' });
  }
});

// Get workflow with checklist for user
router.get('/workflow/:countryCode/:studyLevel', requireAuth, async (req, res) => {
  try {
    const { countryCode, studyLevel } = req.params;
    const workflow = await countryWorkflowStorage.getWorkflowByCountry(countryCode.toUpperCase(), studyLevel);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found for this country and study level' });
    }
    
    const checklist = await countryWorkflowStorage.getChecklistItems(workflow.id);
    
    res.json({
      workflow,
      checklist
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
});

// Start user application
router.post('/applications/start', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { workflowId } = req.body;
    
    // Check if user already has an application for this workflow
    const existingApplication = await countryWorkflowStorage.getUserApplicationByWorkflow(userId, workflowId);
    
    if (existingApplication) {
      return res.json(existingApplication);
    }
    
    const applicationData = insertUserApplicationSchema.parse({
      userId,
      workflowId,
      applicationData: {},
      completedItems: [],
      documentsUploaded: [],
      progressPercentage: 0
    });
    
    const application = await countryWorkflowStorage.createUserApplication(applicationData);
    res.status(201).json(application);
  } catch (error) {
    console.error('Error starting application:', error);
    res.status(400).json({ error: 'Failed to start application' });
  }
});

// Get user's applications
router.get('/applications', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const applications = await countryWorkflowStorage.getUserApplications(userId);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get specific user application
router.get('/applications/:id', isAuthenticated, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const application = await countryWorkflowStorage.getUserApplication(applicationId);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Verify ownership
    const userId = (req.user as any).id;
    if (application.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Update application progress
router.patch('/applications/:id/progress', isAuthenticated, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { applicationData, completedItems, progressPercentage } = req.body;
    
    // Verify ownership
    const application = await countryWorkflowStorage.getUserApplication(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const userId = (req.user as any).id;
    if (application.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updated = await countryWorkflowStorage.updateApplicationProgress(
      applicationId,
      applicationData,
      completedItems,
      progressPercentage
    );
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating application progress:', error);
    res.status(400).json({ error: 'Failed to update application progress' });
  }
});

// ===== CONSULTATION BOOKING ROUTES =====

// Book consultation for unsupported country
router.post('/consultations/book', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const bookingData = insertConsultationBookingSchema.parse({
      ...req.body,
      userId
    });
    
    const booking = await countryWorkflowStorage.createConsultationBooking(bookingData);
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error booking consultation:', error);
    res.status(400).json({ error: 'Failed to book consultation' });
  }
});

// Get user's consultation bookings
router.get('/consultations', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const bookings = await countryWorkflowStorage.getConsultationBookings(userId);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching consultation bookings:', error);
    res.status(500).json({ error: 'Failed to fetch consultation bookings' });
  }
});

// Admin: Get all consultation bookings
router.get('/admin/consultations', requireAdmin, async (req, res) => {
  try {
    const bookings = await countryWorkflowStorage.getConsultationBookings();
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching consultation bookings:', error);
    res.status(500).json({ error: 'Failed to fetch consultation bookings' });
  }
});

// Admin: Update consultation booking
router.patch('/admin/consultations/:id', requireAdmin, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const updates = insertConsultationBookingSchema.partial().parse(req.body);
    
    const booking = await countryWorkflowStorage.updateConsultationBooking(bookingId, updates);
    
    if (!booking) {
      return res.status(404).json({ error: 'Consultation booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error updating consultation booking:', error);
    res.status(400).json({ error: 'Failed to update consultation booking' });
  }
});

// Get workflow statistics (Admin only)
router.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await countryWorkflowStorage.getWorkflowStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching workflow stats:', error);
    res.status(500).json({ error: 'Failed to fetch workflow statistics' });
  }
});

export default router;