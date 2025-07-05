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

// Get stored recommendations (default route)
router.get("/", requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    console.log(`[Stored Recommendations] Getting stored recommendations for user ${userId}`);
    
    const { scholarshipRecommendationStorage } = await import('./scholarshipRecommendationStorage');
    const storedRecommendations = await scholarshipRecommendationStorage.getUserRecommendations(userId);
    
    console.log(`[Stored Recommendations] Found ${storedRecommendations.length} stored recommendations`);
    
    const stats = {
      totalRecommendations: storedRecommendations.length,
      averageMatchScore: storedRecommendations.length > 0 
        ? Math.round(storedRecommendations.reduce((sum, r) => sum + r.matchScore, 0) / storedRecommendations.length)
        : 0
    };
    
    const responseData = {
      recommendations: storedRecommendations,
      stats,
      total: storedRecommendations.length,
    };
    
    console.log(`[Stored Recommendations] Sending response with ${responseData.total} stored recommendations`);
    res.json(responseData);
  } catch (error: any) {
    console.error('[Stored Recommendations] Error:', error);
    res.status(500).json({
      error: "Failed to get stored recommendations",
      message: error.message,
    });
  }
});

// Get personalized scholarship recommendations
router.get("/recommendations", requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    console.log(`[Scholarship Recommendations] Getting recommendations for user ${userId}`);
    console.log(`[Scholarship Recommendations] User object:`, req.user);
    
    const recommendations = await scholarshipRecommendationService.getRecommendations(userId);
    
    console.log(`[Scholarship Recommendations] Service returned ${recommendations.length} recommendations`);
    console.log(`[Scholarship Recommendations] First 2 recommendations:`, 
      recommendations.slice(0, 2).map(r => ({
        name: r.scholarship.name,
        score: r.matchScore,
        reasons: r.matchReasons,
        fieldCategories: r.scholarship.field_categories,
        hostCountries: r.scholarship.host_countries
      }))
    );
    
    const responseData = {
      recommendations,
      total: recommendations.length,
    };
    
    console.log(`[Scholarship Recommendations] Sending response with ${responseData.total} recommendations`);
    res.json(responseData);
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

// Regenerate user recommendations
router.post("/regenerate", requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    console.log(`[Regenerate Recommendations] Generating new recommendations for user ${userId}`);
    
    const result = await scholarshipRecommendationService.regenerateUserRecommendations(userId);
    
    console.log(`[Regenerate Recommendations] Generated ${result.generatedCount} recommendations for user ${userId}`);
    
    res.json({
      success: true,
      message: `Successfully generated ${result.generatedCount} new recommendations`,
      generatedCount: result.generatedCount,
    });
  } catch (error: any) {
    console.error('[Regenerate Recommendations] Error:', error);
    res.status(500).json({
      error: "Failed to regenerate recommendations",
      message: error.message,
    });
  }
});

export default router;