import { Router, Request, Response, NextFunction } from "express";
import { scholarshipRecommendationService } from "./services/scholarshipRecommendationService";

const router = Router();

// Simple auth middleware
const requireAuth = (req: any, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Get personalized scholarship recommendations
router.get("/recommendations", requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    console.log(`[Scholarship Recommendations] Getting recommendations for user ${userId}`);
    console.log(`[Scholarship Recommendations] User object:`, req.user);
    
    const recommendations = await scholarshipRecommendationService.getRecommendations(userId);
    
    console.log(`[Scholarship Recommendations] Service returned ${recommendations.length} recommendations`);
    console.log(`[Scholarship Recommendations] Response data:`, {
      recommendations: recommendations.length,
      total: recommendations.length,
      firstRecommendation: recommendations[0] ? {
        name: recommendations[0].scholarship.name,
        score: recommendations[0].matchScore
      } : 'none'
    });
    
    res.json({
      recommendations,
      total: recommendations.length,
    });
  } catch (error: any) {
    console.error('[Scholarship Recommendations] Error:', error);
    res.status(500).json({
      error: "Failed to get scholarship recommendations",
      message: error.message,
    });
  }
});

// Get user's saved scholarships
router.get("/user/saved", requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    console.log(`[Saved Scholarships] Getting saved scholarships for user ${userId}`);
    
    const scholarships = await scholarshipRecommendationService.getSavedScholarships(userId);
    
    res.json({
      scholarships,
      total: scholarships.length,
    });
  } catch (error: any) {
    console.error('[Saved Scholarships] Error:', error);
    res.status(500).json({
      error: "Failed to get saved scholarships",
      message: error.message,
    });
  }
});

// Save a scholarship
router.post("/:scholarshipId/save", requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const scholarshipId = parseInt(req.params.scholarshipId);
    
    if (isNaN(scholarshipId)) {
      return res.status(400).json({ error: "Invalid scholarship ID" });
    }
    
    console.log(`[Save Scholarship] User ${userId} saving scholarship ${scholarshipId}`);
    
    await scholarshipRecommendationService.toggleSaveScholarship(userId, scholarshipId, true);
    
    res.json({
      success: true,
      message: "Scholarship saved successfully",
    });
  } catch (error: any) {
    console.error('[Save Scholarship] Error:', error);
    res.status(500).json({
      error: "Failed to save scholarship",
      message: error.message,
    });
  }
});

// Remove saved scholarship
router.delete("/:scholarshipId/save", requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const scholarshipId = parseInt(req.params.scholarshipId);
    
    if (isNaN(scholarshipId)) {
      return res.status(400).json({ error: "Invalid scholarship ID" });
    }
    
    console.log(`[Remove Saved] User ${userId} removing scholarship ${scholarshipId}`);
    
    await scholarshipRecommendationService.toggleSaveScholarship(userId, scholarshipId, false);
    
    res.json({
      success: true,
      message: "Scholarship removed from saved list",
    });
  } catch (error: any) {
    console.error('[Remove Saved] Error:', error);
    res.status(500).json({
      error: "Failed to remove saved scholarship",
      message: error.message,
    });
  }
});

// Submit inquiry about a scholarship
router.post("/:scholarshipId/inquire", requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const scholarshipId = parseInt(req.params.scholarshipId);
    const { inquiry_type = 'guidance', message } = req.body;
    
    if (isNaN(scholarshipId)) {
      return res.status(400).json({ error: "Invalid scholarship ID" });
    }
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    console.log(`[Scholarship Inquiry] User ${userId} inquiring about scholarship ${scholarshipId}`);
    
    await scholarshipRecommendationService.createInquiry(
      userId,
      scholarshipId,
      inquiry_type,
      message
    );
    
    res.json({
      success: true,
      message: "Inquiry submitted successfully. Our experts will contact you within 24 hours.",
    });
  } catch (error: any) {
    console.error('[Scholarship Inquiry] Error:', error);
    res.status(500).json({
      error: "Failed to submit inquiry",
      message: error.message,
    });
  }
});

// Get user preferences (placeholder for now)
router.get("/user/preferences", requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    console.log(`[User Preferences] Getting preferences for user ${userId}`);
    
    // For now, return null as preferences aren't implemented
    res.json({
      preferences: null,
    });
  } catch (error: any) {
    console.error('[User Preferences] Error:', error);
    res.status(500).json({
      error: "Failed to get user preferences",
      message: error.message,
    });
  }
});

export default router;