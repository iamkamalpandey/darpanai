import { db } from "../db";
import { userProgress, achievements, userAchievements, milestones, userMilestones, users } from "@shared/schema";
import { eq, and, desc, sql, notInArray } from "drizzle-orm";
import type { UserProgress, Achievement, UserAchievement, Milestone, UserMilestone } from "@shared/schema";

export interface GamificationStats {
  points: number;
  level: number;
  currentStreak: number;
  maxStreak: number;
  scholarshipsViewed: number;
  scholarshipsSaved: number;
  achievements: UserAchievement[];
  milestones: UserMilestone[];
  nextMilestone?: Milestone;
  levelProgress: number;
}

export interface AchievementUnlock {
  achievement: Achievement;
  pointsEarned: number;
}

export class GamificationService {
  private readonly POINTS_PER_LEVEL = 100;
  private readonly LEVEL_MULTIPLIER = 1.2;

  /**
   * Initialize user progress when they first sign up
   */
  async initializeUserProgress(userId: number): Promise<UserProgress> {
    console.log(`[Gamification] Initializing progress for user ${userId}`);
    
    const existingProgress = await this.getUserProgress(userId);
    if (existingProgress) {
      return existingProgress;
    }

    const [newProgress] = await db.insert(userProgress).values({
      userId,
      points: 0,
      level: 1,
      currentStreak: 0,
      maxStreak: 0,
      scholarshipsViewed: 0,
      scholarshipsSaved: 0,
      profileCompletionBonus: false,
      firstRecommendationBonus: false,
      lastActivityDate: new Date()
    }).returning();

    return newProgress;
  }

  /**
   * Get user's current progress and stats
   */
  async getUserProgress(userId: number): Promise<UserProgress | null> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
    
    return progress || null;
  }

  /**
   * Get comprehensive gamification stats for a user
   */
  async getGamificationStats(userId: number): Promise<GamificationStats> {
    const progress = await this.getUserProgress(userId) || await this.initializeUserProgress(userId);
    
    // Get user achievements
    const userAchievementsList = await db
      .select({
        id: userAchievements.id,
        userId: userAchievements.userId,
        achievementId: userAchievements.achievementId,
        unlockedAt: userAchievements.unlockedAt,
        achievement: achievements
      })
      .from(userAchievements)
      .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));

    // Get user milestones
    const userMilestonesList = await db
      .select({
        id: userMilestones.id,
        userId: userMilestones.userId,
        milestoneId: userMilestones.milestoneId,
        completedAt: userMilestones.completedAt,
        milestone: milestones
      })
      .from(userMilestones)
      .leftJoin(milestones, eq(userMilestones.milestoneId, milestones.id))
      .where(eq(userMilestones.userId, userId));

    // Get next milestone
    const completedMilestoneIds = userMilestonesList.map(um => um.milestoneId);
    const [nextMilestone] = await db
      .select()
      .from(milestones)
      .where(
        and(
          eq(milestones.isActive, true),
          ...(completedMilestoneIds.length > 0 ? 
            [notInArray(milestones.id, completedMilestoneIds)] : [])
        )
      )
      .orderBy(milestones.pointsRequired)
      .limit(1);

    // Calculate level progress
    const pointsForCurrentLevel = this.getPointsRequiredForLevel(progress.level);
    const pointsForNextLevel = this.getPointsRequiredForLevel(progress.level + 1);
    const levelProgress = Math.min(100, 
      ((progress.points - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100
    );

    return {
      points: progress.points,
      level: progress.level,
      currentStreak: progress.currentStreak,
      maxStreak: progress.maxStreak,
      scholarshipsViewed: progress.scholarshipsViewed,
      scholarshipsSaved: progress.scholarshipsSaved,
      achievements: userAchievementsList as UserAchievement[],
      milestones: userMilestonesList as UserMilestone[],
      nextMilestone,
      levelProgress
    };
  }

  /**
   * Award points and check for achievements/level ups
   */
  async awardPoints(
    userId: number, 
    points: number, 
    action: string,
    updateStreak = false
  ): Promise<{ 
    newProgress: UserProgress; 
    leveledUp: boolean; 
    unlockedAchievements: AchievementUnlock[];
    unlockedMilestones: Milestone[];
  }> {
    console.log(`[Gamification] Awarding ${points} points to user ${userId} for ${action}`);
    
    const currentProgress = await this.getUserProgress(userId) || await this.initializeUserProgress(userId);
    const newPoints = currentProgress.points + points;
    const newLevel = this.calculateLevel(newPoints);
    const leveledUp = newLevel > currentProgress.level;

    // Update streak if applicable
    let newStreak = currentProgress.currentStreak;
    let newMaxStreak = currentProgress.maxStreak;
    
    if (updateStreak) {
      const today = new Date();
      const lastActivity = new Date(currentProgress.lastActivityDate);
      const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        newStreak += 1;
        newMaxStreak = Math.max(newMaxStreak, newStreak);
      } else if (daysDiff > 1) {
        newStreak = 1;
      }
    }

    // Update user progress
    const [updatedProgress] = await db
      .update(userProgress)
      .set({
        points: newPoints,
        level: newLevel,
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
        lastActivityDate: new Date()
      })
      .where(eq(userProgress.userId, userId))
      .returning();

    // Check for new achievements
    const unlockedAchievements = await this.checkForNewAchievements(userId, updatedProgress);
    
    // Check for new milestones
    const unlockedMilestones = await this.checkForNewMilestones(userId, newPoints);

    return {
      newProgress: updatedProgress,
      leveledUp,
      unlockedAchievements,
      unlockedMilestones
    };
  }

  /**
   * Track scholarship viewing
   */
  async trackScholarshipView(userId: number): Promise<void> {
    const progress = await this.getUserProgress(userId) || await this.initializeUserProgress(userId);
    
    await db
      .update(userProgress)
      .set({
        scholarshipsViewed: progress.scholarshipsViewed + 1,
        lastActivityDate: new Date()
      })
      .where(eq(userProgress.userId, userId));

    // Award points for scholarship exploration
    await this.awardPoints(userId, 5, "scholarship_view", true);
  }

  /**
   * Track scholarship saving
   */
  async trackScholarshipSave(userId: number): Promise<void> {
    const progress = await this.getUserProgress(userId) || await this.initializeUserProgress(userId);
    
    await db
      .update(userProgress)
      .set({
        scholarshipsSaved: progress.scholarshipsSaved + 1,
        lastActivityDate: new Date()
      })
      .where(eq(userProgress.userId, userId));

    // Award points for saving scholarships
    await this.awardPoints(userId, 15, "scholarship_save", true);
  }

  /**
   * Calculate level based on points
   */
  private calculateLevel(points: number): number {
    let level = 1;
    let requiredPoints = 0;
    
    while (points >= requiredPoints) {
      requiredPoints = this.getPointsRequiredForLevel(level + 1);
      if (points >= requiredPoints) {
        level++;
      }
    }
    
    return level;
  }

  /**
   * Get points required for a specific level
   */
  private getPointsRequiredForLevel(level: number): number {
    if (level === 1) return 0;
    
    let total = 0;
    for (let i = 2; i <= level; i++) {
      total += Math.floor(this.POINTS_PER_LEVEL * Math.pow(this.LEVEL_MULTIPLIER, i - 2));
    }
    return total;
  }

  /**
   * Check for newly unlocked achievements
   */
  private async checkForNewAchievements(userId: number, progress: UserProgress): Promise<AchievementUnlock[]> {
    const allAchievements = await db
      .select()
      .from(achievements)
      .where(eq(achievements.isActive, true));

    const userAchievementIds = await db
      .select({ achievementId: userAchievements.achievementId })
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const unlockedIds = new Set(userAchievementIds.map(ua => ua.achievementId));
    const newUnlocks: AchievementUnlock[] = [];

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;

      const unlocked = this.checkAchievementCondition(achievement, progress);
      if (unlocked) {
        // Unlock the achievement
        await db.insert(userAchievements).values({
          userId,
          achievementId: achievement.id
        });

        newUnlocks.push({
          achievement,
          pointsEarned: achievement.pointsRequired
        });
      }
    }

    return newUnlocks;
  }

  /**
   * Check if achievement condition is met
   */
  private checkAchievementCondition(achievement: Achievement, progress: UserProgress): boolean {
    switch (achievement.condition) {
      case 'viewed_5_scholarships':
        return progress.scholarshipsViewed >= 5;
      case 'viewed_10_scholarships':
        return progress.scholarshipsViewed >= 10;
      case 'viewed_25_scholarships':
        return progress.scholarshipsViewed >= 25;
      case 'saved_3_scholarships':
        return progress.scholarshipsSaved >= 3;
      case 'saved_5_scholarships':
        return progress.scholarshipsSaved >= 5;
      case 'saved_10_scholarships':
        return progress.scholarshipsSaved >= 10;
      case 'reached_level_5':
        return progress.level >= 5;
      case 'reached_level_10':
        return progress.level >= 10;
      case 'streak_7_days':
        return progress.currentStreak >= 7;
      case 'streak_30_days':
        return progress.currentStreak >= 30;
      case 'earned_500_points':
        return progress.points >= 500;
      case 'earned_1000_points':
        return progress.points >= 1000;
      case 'profile_completion':
        return progress.profileCompletionBonus;
      case 'first_recommendation':
        return progress.firstRecommendationBonus;
      default:
        return false;
    }
  }

  /**
   * Check for newly unlocked milestones
   */
  private async checkForNewMilestones(userId: number, points: number): Promise<Milestone[]> {
    const userMilestoneIds = await db
      .select({ milestoneId: userMilestones.milestoneId })
      .from(userMilestones)
      .where(eq(userMilestones.userId, userId));

    const completedIds = new Set(userMilestoneIds.map(um => um.milestoneId));

    const availableMilestones = await db
      .select()
      .from(milestones)
      .where(
        and(
          eq(milestones.isActive, true),
          sql`points_required <= ${points}`
        )
      );

    const newMilestones: Milestone[] = [];

    for (const milestone of availableMilestones) {
      if (!completedIds.has(milestone.id)) {
        // Unlock the milestone
        await db.insert(userMilestones).values({
          userId,
          milestoneId: milestone.id
        });

        newMilestones.push(milestone);
      }
    }

    return newMilestones;
  }
}

export const gamificationService = new GamificationService();