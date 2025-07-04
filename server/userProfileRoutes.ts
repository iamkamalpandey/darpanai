// User Profile and Leads Management API Routes
import express from 'express';
import { simpleUserProfileService } from './simpleUserProfileService';
import { insertUserProfileSchema, insertLeadActivitySchema, insertLeadNoteSchema } from '@shared/schema';
import { z } from 'zod';

const router = express.Router();

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// ============================================================================
// USER PROFILE ENDPOINTS
// ============================================================================

// Get user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const profile = await simpleUserProfileService.getUserProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch profile' });
  }
});

// Create user profile
router.post('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Validate request body
    const validatedData = insertUserProfileSchema.parse({
      ...req.body,
      userId
    });
    
    const profile = await userProfileService.createUserProfile(validatedData);
    res.status(201).json(profile);
  } catch (error: any) {
    console.error('Error creating user profile:', error);
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: 'Profile already exists' });
    }
    res.status(400).json({ error: error.message || 'Failed to create profile' });
  }
});

// Update user profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Validate partial update data
    const updateSchema = insertUserProfileSchema.partial().omit({ userId: true });
    const validatedData = updateSchema.parse(req.body);
    
    const profile = await userProfileService.updateUserProfile(userId, validatedData);
    res.json(profile);
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    res.status(400).json({ error: error.message || 'Failed to update profile' });
  }
});

// Get profile completion status
router.get('/profile/completion', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const profile = await userProfileService.getUserProfile(userId);
    
    if (!profile) {
      return res.json({
        isComplete: false,
        completionPercentage: 0,
        missingFields: ['All profile information']
      });
    }
    
    // Determine missing fields
    const requiredFields = {
      'Personal Information': ['firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'gender'],
      'Contact Information': ['country', 'city', 'address'],
      'Academic Background': ['currentEducationLevel', 'fieldOfStudy'],
      'Study Preferences': ['studyLevel', 'preferredCountries', 'intakePreference'],
      'Budget Information': ['budgetRange']
    };
    
    const missingFields: string[] = [];
    const completedSections: string[] = [];
    
    for (const [section, fields] of Object.entries(requiredFields)) {
      const hasAllFields = fields.every(field => {
        const value = profile[field as keyof typeof profile];
        return value !== null && value !== undefined && value !== '' && 
               (Array.isArray(value) ? value.length > 0 : true);
      });
      
      if (hasAllFields) {
        completedSections.push(section);
      } else {
        missingFields.push(section);
      }
    }
    
    const isComplete = missingFields.length === 0;
    const completionPercentage = profile.profileCompletionPercentage || 0;
    
    res.json({
      isComplete,
      completionPercentage,
      missingFields,
      completedSections,
      pendingSections: missingFields
    });
  } catch (error: any) {
    console.error('Error fetching profile completion:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch completion status' });
  }
});

// ============================================================================
// LEADS MANAGEMENT ENDPOINTS (Admin/Staff only)
// ============================================================================

// Get all leads with filtering and pagination
router.get('/leads', requireAuth, async (req, res) => {
  try {
    // Check if user has admin/staff permissions
    if (req.user!.role !== 'admin' && req.user!.role !== 'expert') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const filters = {
      leadStatus: req.query.leadStatus as string,
      leadPriority: req.query.leadPriority as string,
      assignedCounselor: req.query.assignedCounselor ? parseInt(req.query.assignedCounselor as string) : undefined,
      leadSource: req.query.leadSource as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };
    
    const result = await userProfileService.getAllLeads(filters);
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch leads' });
  }
});

// Update lead status
router.put('/leads/:userId/status', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'admin' && req.user!.role !== 'expert') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const userId = parseInt(req.params.userId);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const validStatuses = ['new', 'contacted', 'qualified', 'interested', 'enrolled', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const updated = await userProfileService.updateLeadStatus(userId, status, req.user!.id);
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating lead status:', error);
    res.status(500).json({ error: error.message || 'Failed to update lead status' });
  }
});

// Assign lead to counselor
router.put('/leads/:userId/assign', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin permissions required' });
    }
    
    const userId = parseInt(req.params.userId);
    const { counselorId, reason } = req.body;
    
    if (!counselorId) {
      return res.status(400).json({ error: 'Counselor ID is required' });
    }
    
    await userProfileService.assignLead(userId, counselorId, req.user!.id, reason);
    res.json({ success: true, message: 'Lead assigned successfully' });
  } catch (error: any) {
    console.error('Error assigning lead:', error);
    res.status(500).json({ error: error.message || 'Failed to assign lead' });
  }
});

// ============================================================================
// ACTIVITIES MANAGEMENT
// ============================================================================

// Get current user's activities (default route)
router.get('/activities', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    const activities = await userProfileService.getUserActivities(userId, limit);
    res.json(activities);
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch user activities' });
  }
});

// Get user activities by ID (admin/expert only)
router.get('/activities/:userId', requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId ? parseInt(req.params.userId) : req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    // Users can view their own activities, admin/expert can view any activities
    if (req.user!.role !== 'admin' && req.user!.role !== 'expert' && userId !== req.user!.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const activities = await userProfileService.getUserActivities(userId, limit);
    res.json(activities);
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch activities' });
  }
});

// Add activity
router.post('/activities', requireAuth, async (req, res) => {
  try {
    // Users can create activities for themselves, admin/expert can create for anyone
    const targetUserId = req.body.userId || req.user!.id;
    
    if (req.user!.role !== 'admin' && req.user!.role !== 'expert' && targetUserId !== req.user!.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const validatedData = insertLeadActivitySchema.parse({
      ...req.body,
      userId: targetUserId,
      performedBy: req.user!.id
    });
    
    const activity = await userProfileService.addActivity(validatedData);
    res.status(201).json(activity);
  } catch (error: any) {
    console.error('Error adding activity:', error);
    res.status(400).json({ error: error.message || 'Failed to add activity' });
  }
});

// ============================================================================
// NOTES MANAGEMENT
// ============================================================================

// Get current user's notes (default route)
router.get('/notes', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const includeInternal = false; // Regular users cannot see internal notes
    
    const notes = await userProfileService.getUserNotes(userId, includeInternal);
    res.json(notes);
  } catch (error: any) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch notes' });
  }
});

// Get user notes by ID (admin/expert only)
router.get('/notes/:userId', requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId ? parseInt(req.params.userId) : req.user!.id;
    const includeInternal = req.query.includeInternal === 'true' && 
                           (req.user!.role === 'admin' || req.user!.role === 'expert');
    
    // Non-admin users can only view their own notes (excluding internal)
    if (req.user!.role !== 'admin' && req.user!.role !== 'expert' && userId !== req.user!.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const notes = await userProfileService.getUserNotes(userId, includeInternal);
    res.json(notes);
  } catch (error: any) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch notes' });
  }
});

// Add note
router.post('/notes', requireAuth, async (req, res) => {
  try {
    const validatedData = insertLeadNoteSchema.parse({
      ...req.body,
      addedBy: req.user!.id
    });
    
    // Only admin/expert can add internal notes
    if (validatedData.isInternal && req.user!.role !== 'admin' && req.user!.role !== 'expert') {
      return res.status(403).json({ error: 'Cannot add internal notes' });
    }
    
    const note = await userProfileService.addNote(validatedData);
    res.status(201).json(note);
  } catch (error: any) {
    console.error('Error adding note:', error);
    res.status(400).json({ error: error.message || 'Failed to add note' });
  }
});

// ============================================================================
// ANALYTICS ENDPOINTS (Admin only)
// ============================================================================

// Get leads analytics
router.get('/analytics/leads', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin permissions required' });
    }
    
    const analytics = await userProfileService.getLeadsAnalytics();
    res.json(analytics);
  } catch (error: any) {
    console.error('Error fetching leads analytics:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch analytics' });
  }
});

// Get counselor performance
router.get('/analytics/counselors/:counselorId?', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'admin' && req.user!.role !== 'expert') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const counselorId = req.params.counselorId ? parseInt(req.params.counselorId) : undefined;
    
    // Non-admin users can only view their own performance
    if (req.user!.role !== 'admin' && counselorId && counselorId !== req.user!.id) {
      return res.status(403).json({ error: 'Can only view own performance' });
    }
    
    const performance = await userProfileService.getCounselorPerformance(counselorId);
    res.json(performance);
  } catch (error: any) {
    console.error('Error fetching counselor performance:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch performance data' });
  }
});

// ============================================================================
// BULK OPERATIONS (Admin only)
// ============================================================================

// Bulk update lead status
router.put('/leads/bulk/status', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin permissions required' });
    }
    
    const { userIds, status } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const promises = userIds.map(userId => 
      userProfileService.updateLeadStatus(userId, status, req.user!.id)
    );
    
    await Promise.all(promises);
    res.json({ success: true, message: `Updated ${userIds.length} leads` });
  } catch (error: any) {
    console.error('Error bulk updating leads:', error);
    res.status(500).json({ error: error.message || 'Failed to bulk update leads' });
  }
});

// Bulk assign leads
router.put('/leads/bulk/assign', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin permissions required' });
    }
    
    const { userIds, counselorId, reason } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }
    
    if (!counselorId) {
      return res.status(400).json({ error: 'Counselor ID is required' });
    }
    
    const promises = userIds.map(userId => 
      userProfileService.assignLead(userId, counselorId, req.user!.id, reason)
    );
    
    await Promise.all(promises);
    res.json({ success: true, message: `Assigned ${userIds.length} leads` });
  } catch (error: any) {
    console.error('Error bulk assigning leads:', error);
    res.status(500).json({ error: error.message || 'Failed to bulk assign leads' });
  }
});

export { router as userProfileRoutes };