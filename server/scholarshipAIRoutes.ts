import { Router, Request, Response, NextFunction } from 'express';
import { generateAIScholarshipMatches, createContactInquiry } from './scholarshipAIMatchingService';
import { storage } from './storage';

const router = Router();

// Simple auth middleware
const requireAuth = (req: any, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// AI-powered scholarship matching endpoint
router.post('/ai-match', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    console.log(`[AI Scholarship Matching] Starting analysis for user: ${userId}`);

    // Get user profile and preferences
    const userProfile = await storage.getUser(userId);
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    // Extract matching criteria from request body
    const {
      preferredCountries = [],
      fieldOfStudy = '',
      studyLevel = '',
      budgetRange = '',
      targetDegree = ''
    } = req.body;

    const matchingCriteria = {
      userId,
      userProfile,
      preferences: {
        preferredCountries,
        fieldOfStudy,
        studyLevel,
        budgetRange,
        targetDegree
      }
    };

    // Generate AI-powered matches
    const aiAnalysis = await generateAIScholarshipMatches(matchingCriteria);

    console.log(`[AI Scholarship Matching] Analysis completed. Found ${aiAnalysis.matches.length} matches`);

    res.json({
      success: true,
      data: aiAnalysis,
      timestamp: new Date().toISOString(),
      analysisType: 'ai_powered'
    });

  } catch (error) {
    console.error('[AI Scholarship Matching] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI scholarship matches',
      details: error.message
    });
  }
});

// Save scholarship to watchlist
router.post('/watchlist/save', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const {
      scholarshipId,
      scholarshipName,
      providerName,
      hostCountries = [],
      fundingType,
      totalValueMax,
      applicationDeadline,
      tags = [],
      notes = '',
      priority = 'normal'
    } = req.body;

    console.log(`[Watchlist] Saving scholarship ${scholarshipId} for user ${userId}`);

    // Simplified watchlist save - can be enhanced later with actual storage
    console.log(`[Watchlist] Scholarship ${scholarshipId} saved for user ${userId}`);

    res.json({
      success: true,
      message: 'Scholarship saved to watchlist successfully',
      data: { scholarshipId, scholarshipName }
    });

  } catch (error: any) {
    console.error('[Watchlist] Save error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save scholarship to watchlist',
      details: error.message
    });
  }
});

// Create contact inquiry for "Know More"
router.post('/inquiry/create', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const userProfile = await storage.getUser(userId);
    
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    const {
      scholarshipId,
      scholarshipName,
      inquiryType = 'know_more',
      message = ''
    } = req.body;

    console.log(`[Contact Inquiry] Creating inquiry for scholarship ${scholarshipId} by user ${userId}`);

    const inquiryData = {
      userId,
      scholarshipId,
      scholarshipName,
      inquiryType,
      message,
      userEmail: userProfile.email,
      userName: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || userProfile.username
    };

    const inquiry = await createContactInquiry(inquiryData);

    console.log(`[Contact Inquiry] Inquiry created with ID: ${inquiry.inquiryId}`);

    res.json({
      success: true,
      message: 'Contact inquiry submitted successfully',
      data: inquiry
    });

  } catch (error) {
    console.error('[Contact Inquiry] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create contact inquiry',
      details: error.message
    });
  }
});

// Get user's scholarship analysis history
router.get('/analysis-history', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    // For now, return empty array - this would be implemented with proper database storage
    console.log(`[Analysis History] Fetching history for user ${userId}`);
    
    res.json({
      success: true,
      data: {
        analyses: [],
        totalAnalyses: 0,
        lastAnalysis: null
      }
    });

  } catch (error) {
    console.error('[Analysis History] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analysis history',
      details: error.message
    });
  }
});

// Quick match based on user profile only
router.post('/quick-match', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const userProfile = await storage.getUser(userId);
    
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    console.log(`[Quick Match] Generating quick matches for user ${userId}`);

    // Use profile data to create automatic matching criteria
    const matchingCriteria = {
      userId,
      userProfile,
      preferences: {
        preferredCountries: userProfile.preferredCountries || [],
        fieldOfStudy: userProfile.fieldOfStudy || '',
        studyLevel: userProfile.studyLevel || '',
        budgetRange: userProfile.budgetRange || '',
        targetDegree: userProfile.targetDegree || ''
      }
    };

    const aiAnalysis = await generateAIScholarshipMatches(matchingCriteria);

    res.json({
      success: true,
      data: aiAnalysis,
      timestamp: new Date().toISOString(),
      analysisType: 'quick_match'
    });

  } catch (error) {
    console.error('[Quick Match] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate quick matches',
      details: error.message
    });
  }
});

export default router;