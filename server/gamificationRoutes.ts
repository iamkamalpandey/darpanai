import { Router, Request, Response } from "express";
import { gamificationService } from "./services/gamificationService";
import { db } from "./db";
import { achievements, milestones } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

/**
 * Get user's gamification stats and progress
 */
router.get("/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const stats = await gamificationService.getGamificationStats(userId);
    
    console.log(`[Gamification API] Retrieved stats for user ${userId}:`, {
      points: stats.points,
      level: stats.level,
      achievementCount: stats.achievements.length,
      milestoneCount: stats.milestones.length
    });

    res.json(stats);
  } catch (error) {
    console.error('[Gamification API] Error getting user stats:', error);
    res.status(500).json({ error: "Failed to get gamification stats" });
  }
});

/**
 * Track scholarship view activity
 */
router.post("/track/scholarship-view", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    await gamificationService.trackScholarshipView(userId);
    
    console.log(`[Gamification API] Tracked scholarship view for user ${userId}`);
    
    res.json({ success: true, message: "Scholarship view tracked" });
  } catch (error) {
    console.error('[Gamification API] Error tracking scholarship view:', error);
    res.status(500).json({ error: "Failed to track scholarship view" });
  }
});

/**
 * Track scholarship save activity
 */
router.post("/track/scholarship-save", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    await gamificationService.trackScholarshipSave(userId);
    
    console.log(`[Gamification API] Tracked scholarship save for user ${userId}`);
    
    res.json({ success: true, message: "Scholarship save tracked" });
  } catch (error) {
    console.error('[Gamification API] Error tracking scholarship save:', error);
    res.status(500).json({ error: "Failed to track scholarship save" });
  }
});

/**
 * Award points for specific actions
 */
router.post("/award-points", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { points, action, updateStreak } = req.body;
    
    if (!points || !action) {
      return res.status(400).json({ error: "Points and action are required" });
    }

    const result = await gamificationService.awardPoints(userId, points, action, updateStreak);
    
    console.log(`[Gamification API] Awarded ${points} points to user ${userId} for ${action}`, {
      leveledUp: result.leveledUp,
      newAchievements: result.unlockedAchievements.length,
      newMilestones: result.unlockedMilestones.length
    });

    res.json({
      success: true,
      progress: result.newProgress,
      leveledUp: result.leveledUp,
      unlockedAchievements: result.unlockedAchievements,
      unlockedMilestones: result.unlockedMilestones
    });
  } catch (error) {
    console.error('[Gamification API] Error awarding points:', error);
    res.status(500).json({ error: "Failed to award points" });
  }
});

/**
 * Get all available achievements
 */
router.get("/achievements", requireAuth, async (req: Request, res: Response) => {
  try {
    const allAchievements = await db
      .select()
      .from(achievements)
      .where(eq(achievements.isActive, true))
      .orderBy(achievements.pointsRequired);

    res.json(allAchievements);
  } catch (error) {
    console.error('[Gamification API] Error getting achievements:', error);
    res.status(500).json({ error: "Failed to get achievements" });
  }
});

/**
 * Get all available milestones
 */
router.get("/milestones", requireAuth, async (req: Request, res: Response) => {
  try {
    const allMilestones = await db
      .select()
      .from(milestones)
      .where(eq(milestones.isActive, true))
      .orderBy(milestones.order);

    res.json(allMilestones);
  } catch (error) {
    console.error('[Gamification API] Error getting milestones:', error);
    res.status(500).json({ error: "Failed to get milestones" });
  }
});

/**
 * Initialize gamification data (achievements and milestones)
 */
router.post("/initialize", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Initialize user progress
    await gamificationService.initializeUserProgress(userId);

    // Initialize default achievements if they don't exist
    const existingAchievements = await db.select().from(achievements).limit(1);
    
    if (existingAchievements.length === 0) {
      const defaultAchievements = [
        {
          name: "Explorer",
          description: "View your first 5 scholarship recommendations",
          icon: "🔍",
          category: "discovery" as const,
          pointsRequired: 0,
          condition: "viewed_5_scholarships",
          rarity: "common" as const
        },
        {
          name: "Scholar Hunter",
          description: "View 10 different scholarship opportunities",
          icon: "🎯",
          category: "discovery" as const,
          pointsRequired: 0,
          condition: "viewed_10_scholarships",
          rarity: "uncommon" as const
        },
        {
          name: "Dedicated Researcher",
          description: "View 25 scholarship opportunities",
          icon: "📚",
          category: "discovery" as const,
          pointsRequired: 0,
          condition: "viewed_25_scholarships",
          rarity: "rare" as const
        },
        {
          name: "Saver",
          description: "Save your first 3 scholarship opportunities",
          icon: "💾",
          category: "engagement" as const,
          pointsRequired: 0,
          condition: "saved_3_scholarships",
          rarity: "common" as const
        },
        {
          name: "Collector",
          description: "Save 5 scholarship opportunities",
          icon: "📋",
          category: "engagement" as const,
          pointsRequired: 0,
          condition: "saved_5_scholarships",
          rarity: "uncommon" as const
        },
        {
          name: "Master Collector",
          description: "Save 10 scholarship opportunities",
          icon: "🏆",
          category: "engagement" as const,
          pointsRequired: 0,
          condition: "saved_10_scholarships",
          rarity: "rare" as const
        },
        {
          name: "Rising Star",
          description: "Reach Level 5",
          icon: "⭐",
          category: "milestone" as const,
          pointsRequired: 0,
          condition: "reached_level_5",
          rarity: "uncommon" as const
        },
        {
          name: "Elite Scholar",
          description: "Reach Level 10",
          icon: "🌟",
          category: "milestone" as const,
          pointsRequired: 0,
          condition: "reached_level_10",
          rarity: "epic" as const
        },
        {
          name: "Consistent",
          description: "Maintain a 7-day activity streak",
          icon: "🔥",
          category: "engagement" as const,
          pointsRequired: 0,
          condition: "streak_7_days",
          rarity: "uncommon" as const
        },
        {
          name: "Dedicated",
          description: "Maintain a 30-day activity streak",
          icon: "🚀",
          category: "engagement" as const,
          pointsRequired: 0,
          condition: "streak_30_days",
          rarity: "legendary" as const
        }
      ];

      await db.insert(achievements).values(defaultAchievements);
    }

    // Initialize default milestones if they don't exist
    const existingMilestones = await db.select().from(milestones).limit(1);
    
    if (existingMilestones.length === 0) {
      const defaultMilestones = [
        {
          name: "Getting Started",
          description: "Begin your scholarship journey",
          icon: "🌱",
          order: 1,
          pointsRequired: 0
        },
        {
          name: "First Steps",
          description: "Earn your first 50 points",
          icon: "👣",
          order: 2,
          pointsRequired: 50
        },
        {
          name: "Active Explorer",
          description: "Reach 100 points",
          icon: "🗺️",
          order: 3,
          pointsRequired: 100
        },
        {
          name: "Scholarship Seeker",
          description: "Accumulate 250 points",
          icon: "🔍",
          order: 4,
          pointsRequired: 250
        },
        {
          name: "Dedicated Student",
          description: "Reach 500 points",
          icon: "📖",
          order: 5,
          pointsRequired: 500
        },
        {
          name: "Scholar",
          description: "Achieve 1000 points",
          icon: "🎓",
          order: 6,
          pointsRequired: 1000
        },
        {
          name: "Master Scholar",
          description: "Reach 2000 points",
          icon: "👑",
          order: 7,
          pointsRequired: 2000
        }
      ];

      await db.insert(milestones).values(defaultMilestones);
    }

    console.log(`[Gamification API] Initialized gamification system for user ${userId}`);
    
    res.json({ success: true, message: "Gamification system initialized" });
  } catch (error) {
    console.error('[Gamification API] Error initializing gamification:', error);
    res.status(500).json({ error: "Failed to initialize gamification system" });
  }
});

export default router;