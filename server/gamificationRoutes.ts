import { Router } from "express";
import { gamificationStorage } from "./gamificationStorage";
import { 
  insertLearningPathMilestoneSchema,
  insertUserLearningProgressSchema,
  insertLearningPathActivitySchema,
  insertAchievementBadgeSchema,
  insertLearningPathChallengeSchema
} from "@shared/schema";

const router = Router();

// Note: Authentication middleware will be passed in when routes are mounted

// User Learning Path - Main gamified dashboard
router.get("/user/learning-path", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const learningPath = await gamificationStorage.getUserLearningPath(userId);
    res.json(learningPath);
  } catch (error) {
    console.error("Error fetching user learning path:", error);
    res.status(500).json({ error: "Failed to fetch learning path" });
  }
});

// User Progress Management
router.get("/user/progress", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const progress = await gamificationStorage.getUserProgress(userId);
    res.json(progress);
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

router.post("/user/progress/:milestoneId", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const milestoneId = parseInt(req.params.milestoneId);
    const updateData = req.body;
    
    const progress = await gamificationStorage.updateUserProgress(userId, milestoneId, updateData);
    res.json(progress);
  } catch (error) {
    console.error("Error updating user progress:", error);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

router.post("/user/complete-milestone/:milestoneId", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const milestoneId = parseInt(req.params.milestoneId);
    const { pointsEarned } = req.body;
    
    const progress = await gamificationStorage.completeUserMilestone(userId, milestoneId, pointsEarned || 0);
    
    // Check for badge eligibility after completing milestone
    await checkAndAwardBadges(userId, 'milestone', milestoneId);
    
    res.json(progress);
  } catch (error) {
    console.error("Error completing milestone:", error);
    res.status(500).json({ error: "Failed to complete milestone" });
  }
});

// User Stats
router.get("/user/stats", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    let stats = await gamificationStorage.getUserStats(userId);
    if (!stats) {
      stats = await gamificationStorage.initializeUserStats(userId);
    }
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Milestones Management
router.get("/milestones", async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const filters: any = {};
    
    if (category) filters.category = category as string;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    
    const milestones = await gamificationStorage.getMilestones(filters);
    res.json(milestones);
  } catch (error) {
    console.error("Error fetching milestones:", error);
    res.status(500).json({ error: "Failed to fetch milestones" });
  }
});

router.get("/milestones/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const milestone = await gamificationStorage.getMilestoneById(id);
    
    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }
    
    res.json(milestone);
  } catch (error) {
    console.error("Error fetching milestone:", error);
    res.status(500).json({ error: "Failed to fetch milestone" });
  }
});

router.get("/milestones/:id/activities", async (req, res) => {
  try {
    const milestoneId = parseInt(req.params.id);
    const activities = await gamificationStorage.getActivitiesByMilestone(milestoneId);
    res.json(activities);
  } catch (error) {
    console.error("Error fetching milestone activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

// Activity Progress
router.get("/user/activity/:activityId", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const activityId = parseInt(req.params.activityId);
    const progress = await gamificationStorage.getUserActivityProgress(userId, activityId);
    res.json(progress);
  } catch (error) {
    console.error("Error fetching activity progress:", error);
    res.status(500).json({ error: "Failed to fetch activity progress" });
  }
});

router.post("/user/activity/:activityId/progress", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const activityId = parseInt(req.params.activityId);
    const updateData = req.body;
    
    const progress = await gamificationStorage.updateUserActivityProgress(userId, activityId, updateData);
    res.json(progress);
  } catch (error) {
    console.error("Error updating activity progress:", error);
    res.status(500).json({ error: "Failed to update activity progress" });
  }
});

router.post("/user/activity/:activityId/complete", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const activityId = parseInt(req.params.activityId);
    const { milestoneId, pointsEarned } = req.body;
    
    const progress = await gamificationStorage.completeUserActivity(
      userId, 
      activityId, 
      milestoneId, 
      pointsEarned || 0
    );
    
    // Check for badge eligibility after completing activity
    await checkAndAwardBadges(userId, 'activity', activityId);
    
    res.json(progress);
  } catch (error) {
    console.error("Error completing activity:", error);
    res.status(500).json({ error: "Failed to complete activity" });
  }
});

// Badge System
router.get("/badges", async (req, res) => {
  try {
    const { badgeType, rarity, isSecret } = req.query;
    const filters: any = {};
    
    if (badgeType) filters.badgeType = badgeType as string;
    if (rarity) filters.rarity = rarity as string;
    if (isSecret !== undefined) filters.isSecret = isSecret === 'true';
    
    const badges = await gamificationStorage.getBadges(filters);
    res.json(badges);
  } catch (error) {
    console.error("Error fetching badges:", error);
    res.status(500).json({ error: "Failed to fetch badges" });
  }
});

router.get("/user/badges", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const badges = await gamificationStorage.getUserBadges(userId);
    res.json(badges);
  } catch (error) {
    console.error("Error fetching user badges:", error);
    res.status(500).json({ error: "Failed to fetch user badges" });
  }
});

// Challenge System
router.get("/challenges", async (req, res) => {
  try {
    const challenges = await gamificationStorage.getActiveChallenges();
    res.json(challenges);
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ error: "Failed to fetch challenges" });
  }
});

router.post("/challenges/:challengeId/join", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const challengeId = parseInt(req.params.challengeId);
    const participation = await gamificationStorage.joinChallenge(userId, challengeId);
    res.json(participation);
  } catch (error) {
    console.error("Error joining challenge:", error);
    res.status(500).json({ error: "Failed to join challenge" });
  }
});

router.get("/user/challenges", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const challenges = await gamificationStorage.getUserChallenges(userId);
    res.json(challenges);
  } catch (error) {
    console.error("Error fetching user challenges:", error);
    res.status(500).json({ error: "Failed to fetch user challenges" });
  }
});

router.get("/challenges/:challengeId/leaderboard", async (req, res) => {
  try {
    const challengeId = parseInt(req.params.challengeId);
    const limit = parseInt(req.query.limit as string) || 10;
    
    const leaderboard = await gamificationStorage.getChallengeLeaderboard(challengeId, limit);
    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching challenge leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await gamificationStorage.getUserLeaderboard(limit);
    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Admin routes for content management
router.post("/admin/milestones", async (req: any, res) => {
  try {
    // Add admin check here if needed
    const validatedData = insertLearningPathMilestoneSchema.parse(req.body);
    const milestone = await gamificationStorage.createMilestone(validatedData);
    res.status(201).json(milestone);
  } catch (error) {
    console.error("Error creating milestone:", error);
    res.status(500).json({ error: "Failed to create milestone" });
  }
});

router.post("/admin/activities", async (req: any, res) => {
  try {
    const validatedData = insertLearningPathActivitySchema.parse(req.body);
    const activity = await gamificationStorage.createActivity(validatedData);
    res.status(201).json(activity);
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ error: "Failed to create activity" });
  }
});

router.post("/admin/badges", async (req: any, res) => {
  try {
    const validatedData = insertAchievementBadgeSchema.parse(req.body);
    const badge = await gamificationStorage.createBadge(validatedData);
    res.status(201).json(badge);
  } catch (error) {
    console.error("Error creating badge:", error);
    res.status(500).json({ error: "Failed to create badge" });
  }
});

router.post("/admin/challenges", async (req: any, res) => {
  try {
    const validatedData = insertLearningPathChallengeSchema.parse(req.body);
    const challenge = await gamificationStorage.createChallenge(validatedData);
    res.status(201).json(challenge);
  } catch (error) {
    console.error("Error creating challenge:", error);
    res.status(500).json({ error: "Failed to create challenge" });
  }
});

// Helper function to check and award badges
async function checkAndAwardBadges(userId: number, contextType: string, contextId: number) {
  try {
    // Get user stats and progress
    const stats = await gamificationStorage.getUserStats(userId);
    if (!stats) return;

    // Example badge criteria - these would be more sophisticated in production
    const badgeChecks = [
      {
        id: 1, // "First Steps" badge
        criteria: () => stats.completedMilestones >= 1,
        contextType: 'milestone'
      },
      {
        id: 2, // "Milestone Master" badge
        criteria: () => stats.completedMilestones >= 5,
        contextType: 'milestone'
      },
      {
        id: 3, // "Streak Warrior" badge
        criteria: () => stats.currentStreak >= 7,
        contextType: 'streak'
      },
      {
        id: 4, // "Point Collector" badge
        criteria: () => stats.totalPoints >= 1000,
        contextType: 'points'
      }
    ];

    for (const badgeCheck of badgeChecks) {
      if (badgeCheck.criteria()) {
        const isEligible = await gamificationStorage.checkBadgeEligibility(userId, badgeCheck.id);
        if (isEligible) {
          await gamificationStorage.awardBadge(userId, badgeCheck.id, contextType, contextId);
        }
      }
    }
  } catch (error) {
    console.error("Error checking badge eligibility:", error);
  }
}

export default router;