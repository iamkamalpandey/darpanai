import { db } from "./db";
import { 
  learningPathMilestones, 
  userLearningProgress, 
  userGamificationStats,
  learningPathActivities,
  userActivityProgress,
  achievementBadges,
  userEarnedBadges,
  learningPathChallenges,
  userChallengeParticipation,
  type LearningPathMilestone,
  type UserLearningProgress,
  type UserGamificationStats,
  type LearningPathActivity,
  type UserActivityProgress,
  type AchievementBadge,
  type UserEarnedBadge,
  type LearningPathChallenge,
  type UserChallengeParticipation,
  type InsertLearningPathMilestone,
  type InsertUserLearningProgress,
  type InsertUserGamificationStats,
  type InsertLearningPathActivity,
  type InsertUserActivityProgress,
  type InsertAchievementBadge,
  type InsertUserEarnedBadge,
  type InsertLearningPathChallenge,
  type InsertUserChallengeParticipation
} from "@shared/schema";
import { eq, and, desc, asc, sql, count, sum } from "drizzle-orm";

export interface IGamificationStorage {
  // Milestone management
  createMilestone(data: InsertLearningPathMilestone): Promise<LearningPathMilestone>;
  getMilestones(filters?: { category?: string; isActive?: boolean }): Promise<LearningPathMilestone[]>;
  getMilestoneById(id: number): Promise<LearningPathMilestone | undefined>;
  updateMilestone(id: number, data: Partial<InsertLearningPathMilestone>): Promise<LearningPathMilestone>;
  deleteMilestone(id: number): Promise<boolean>;

  // User progress tracking
  getUserProgress(userId: number): Promise<UserLearningProgress[]>;
  getUserMilestoneProgress(userId: number, milestoneId: number): Promise<UserLearningProgress | undefined>;
  updateUserProgress(userId: number, milestoneId: number, data: Partial<InsertUserLearningProgress>): Promise<UserLearningProgress>;
  completeUserMilestone(userId: number, milestoneId: number, pointsEarned: number): Promise<UserLearningProgress>;

  // User gamification stats
  getUserStats(userId: number): Promise<UserGamificationStats | undefined>;
  initializeUserStats(userId: number): Promise<UserGamificationStats>;
  updateUserStats(userId: number, data: Partial<InsertUserGamificationStats>): Promise<UserGamificationStats>;
  addUserPoints(userId: number, points: number): Promise<UserGamificationStats>;
  updateUserStreak(userId: number): Promise<UserGamificationStats>;

  // Activity management
  createActivity(data: InsertLearningPathActivity): Promise<LearningPathActivity>;
  getActivitiesByMilestone(milestoneId: number): Promise<LearningPathActivity[]>;
  getActivityById(id: number): Promise<LearningPathActivity | undefined>;
  updateActivity(id: number, data: Partial<InsertLearningPathActivity>): Promise<LearningPathActivity>;

  // User activity progress
  getUserActivityProgress(userId: number, activityId: number): Promise<UserActivityProgress | undefined>;
  updateUserActivityProgress(userId: number, activityId: number, data: Partial<InsertUserActivityProgress>): Promise<UserActivityProgress>;
  completeUserActivity(userId: number, activityId: number, milestoneId: number, pointsEarned: number): Promise<UserActivityProgress>;

  // Badge system
  createBadge(data: InsertAchievementBadge): Promise<AchievementBadge>;
  getBadges(filters?: { badgeType?: string; rarity?: string; isSecret?: boolean }): Promise<AchievementBadge[]>;
  getBadgeById(id: number): Promise<AchievementBadge | undefined>;
  getUserBadges(userId: number): Promise<UserEarnedBadge[]>;
  awardBadge(userId: number, badgeId: number, contextType?: string, contextId?: number): Promise<UserEarnedBadge>;
  checkBadgeEligibility(userId: number, badgeId: number): Promise<boolean>;

  // Challenge system
  createChallenge(data: InsertLearningPathChallenge): Promise<LearningPathChallenge>;
  getActiveChallenges(): Promise<LearningPathChallenge[]>;
  getChallengeById(id: number): Promise<LearningPathChallenge | undefined>;
  joinChallenge(userId: number, challengeId: number): Promise<UserChallengeParticipation>;
  getUserChallenges(userId: number): Promise<UserChallengeParticipation[]>;
  getChallengeLeaderboard(challengeId: number, limit?: number): Promise<UserChallengeParticipation[]>;

  // Analytics and insights
  getUserLearningPath(userId: number): Promise<{
    stats: UserGamificationStats;
    milestones: (LearningPathMilestone & { progress: UserLearningProgress | null })[];
    badges: UserEarnedBadge[];
    activeChallenges: UserChallengeParticipation[];
  }>;
  getUserLeaderboard(limit?: number): Promise<{ user: any; stats: UserGamificationStats }[]>;
}

export class GamificationStorage implements IGamificationStorage {
  // Milestone management
  async createMilestone(data: InsertLearningPathMilestone): Promise<LearningPathMilestone> {
    const [milestone] = await db.insert(learningPathMilestones).values(data).returning();
    return milestone;
  }

  async getMilestones(filters?: { category?: string; isActive?: boolean }): Promise<LearningPathMilestone[]> {
    let query = db.select().from(learningPathMilestones);
    
    const conditions = [];
    if (filters?.category) conditions.push(eq(learningPathMilestones.category, filters.category));
    if (filters?.isActive !== undefined) conditions.push(eq(learningPathMilestones.isActive, filters.isActive));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(asc(learningPathMilestones.order));
  }

  async getMilestoneById(id: number): Promise<LearningPathMilestone | undefined> {
    const [milestone] = await db.select().from(learningPathMilestones).where(eq(learningPathMilestones.id, id));
    return milestone;
  }

  async updateMilestone(id: number, data: Partial<InsertLearningPathMilestone>): Promise<LearningPathMilestone> {
    const [milestone] = await db.update(learningPathMilestones)
      .set(data)
      .where(eq(learningPathMilestones.id, id))
      .returning();
    return milestone;
  }

  async deleteMilestone(id: number): Promise<boolean> {
    const result = await db.delete(learningPathMilestones).where(eq(learningPathMilestones.id, id));
    return (result as any).rowCount > 0;
  }

  // User progress tracking
  async getUserProgress(userId: number): Promise<UserLearningProgress[]> {
    return db.select().from(userLearningProgress)
      .where(eq(userLearningProgress.userId, userId))
      .orderBy(asc(userLearningProgress.milestoneId));
  }

  async getUserMilestoneProgress(userId: number, milestoneId: number): Promise<UserLearningProgress | undefined> {
    const [progress] = await db.select().from(userLearningProgress)
      .where(and(
        eq(userLearningProgress.userId, userId),
        eq(userLearningProgress.milestoneId, milestoneId)
      ));
    return progress;
  }

  async updateUserProgress(userId: number, milestoneId: number, data: Partial<InsertUserLearningProgress>): Promise<UserLearningProgress> {
    // Try to update existing record first
    const existing = await this.getUserMilestoneProgress(userId, milestoneId);
    
    if (existing) {
      const [updated] = await db.update(userLearningProgress)
        .set({ ...data, updatedAt: new Date() })
        .where(and(
          eq(userLearningProgress.userId, userId),
          eq(userLearningProgress.milestoneId, milestoneId)
        ))
        .returning();
      return updated;
    } else {
      // Create new record
      const [created] = await db.insert(userLearningProgress)
        .values({ userId, milestoneId, ...data })
        .returning();
      return created;
    }
  }

  async completeUserMilestone(userId: number, milestoneId: number, pointsEarned: number): Promise<UserLearningProgress> {
    const completionData = {
      status: "completed" as const,
      progress: 100,
      pointsEarned,
      completedAt: new Date()
    };
    
    const progress = await this.updateUserProgress(userId, milestoneId, completionData);
    
    // Update user stats
    await this.addUserPoints(userId, pointsEarned);
    await this.updateUserStreak(userId);
    
    return progress;
  }

  // User gamification stats
  async getUserStats(userId: number): Promise<UserGamificationStats | undefined> {
    const [stats] = await db.select().from(userGamificationStats)
      .where(eq(userGamificationStats.userId, userId));
    return stats;
  }

  async initializeUserStats(userId: number): Promise<UserGamificationStats> {
    const [stats] = await db.insert(userGamificationStats)
      .values({ userId })
      .returning();
    return stats;
  }

  async updateUserStats(userId: number, data: Partial<InsertUserGamificationStats>): Promise<UserGamificationStats> {
    let stats = await this.getUserStats(userId);
    
    if (!stats) {
      stats = await this.initializeUserStats(userId);
    }
    
    const [updated] = await db.update(userGamificationStats)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userGamificationStats.userId, userId))
      .returning();
    return updated;
  }

  async addUserPoints(userId: number, points: number): Promise<UserGamificationStats> {
    const stats = await this.getUserStats(userId) || await this.initializeUserStats(userId);
    
    const newTotalPoints = stats.totalPoints + points;
    const newLevel = Math.floor(newTotalPoints / 1000) + 1; // Level up every 1000 points
    
    return this.updateUserStats(userId, {
      totalPoints: newTotalPoints,
      currentLevel: newLevel
    });
  }

  async updateUserStreak(userId: number): Promise<UserGamificationStats> {
    const stats = await this.getUserStats(userId) || await this.initializeUserStats(userId);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newStreak = 1;
    let longestStreak = stats.longestStreak;
    
    if (stats.lastActivityDate) {
      const lastActivity = new Date(stats.lastActivityDate);
      const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        newStreak = stats.currentStreak + 1;
      } else if (daysDiff === 0) {
        // Same day
        newStreak = stats.currentStreak;
      } else {
        // Streak broken
        newStreak = 1;
      }
    }
    
    if (newStreak > longestStreak) {
      longestStreak = newStreak;
    }
    
    return this.updateUserStats(userId, {
      currentStreak: newStreak,
      longestStreak,
      lastActivityDate: today
    });
  }

  // Activity management
  async createActivity(data: InsertLearningPathActivity): Promise<LearningPathActivity> {
    const [activity] = await db.insert(learningPathActivities).values(data).returning();
    return activity;
  }

  async getActivitiesByMilestone(milestoneId: number): Promise<LearningPathActivity[]> {
    return db.select().from(learningPathActivities)
      .where(and(
        eq(learningPathActivities.milestoneId, milestoneId),
        eq(learningPathActivities.isActive, true)
      ))
      .orderBy(asc(learningPathActivities.order));
  }

  async getActivityById(id: number): Promise<LearningPathActivity | undefined> {
    const [activity] = await db.select().from(learningPathActivities)
      .where(eq(learningPathActivities.id, id));
    return activity;
  }

  async updateActivity(id: number, data: Partial<InsertLearningPathActivity>): Promise<LearningPathActivity> {
    const [activity] = await db.update(learningPathActivities)
      .set(data)
      .where(eq(learningPathActivities.id, id))
      .returning();
    return activity;
  }

  // User activity progress
  async getUserActivityProgress(userId: number, activityId: number): Promise<UserActivityProgress | undefined> {
    const [progress] = await db.select().from(userActivityProgress)
      .where(and(
        eq(userActivityProgress.userId, userId),
        eq(userActivityProgress.activityId, activityId)
      ));
    return progress;
  }

  async updateUserActivityProgress(userId: number, activityId: number, data: Partial<InsertUserActivityProgress>): Promise<UserActivityProgress> {
    const existing = await this.getUserActivityProgress(userId, activityId);
    
    if (existing) {
      const [updated] = await db.update(userActivityProgress)
        .set({ ...data, updatedAt: new Date() })
        .where(and(
          eq(userActivityProgress.userId, userId),
          eq(userActivityProgress.activityId, activityId)
        ))
        .returning();
      return updated;
    } else {
      // Get milestone ID for this activity
      const activity = await this.getActivityById(activityId);
      if (!activity) throw new Error('Activity not found');
      
      const [created] = await db.insert(userActivityProgress)
        .values({ 
          userId, 
          activityId, 
          milestoneId: activity.milestoneId,
          ...data 
        })
        .returning();
      return created;
    }
  }

  async completeUserActivity(userId: number, activityId: number, milestoneId: number, pointsEarned: number): Promise<UserActivityProgress> {
    const completionData = {
      status: "completed" as const,
      progress: 100,
      pointsEarned,
      completedAt: new Date()
    };
    
    const progress = await this.updateUserActivityProgress(userId, activityId, completionData);
    
    // Update user stats
    await this.addUserPoints(userId, pointsEarned);
    
    return progress;
  }

  // Badge system
  async createBadge(data: InsertAchievementBadge): Promise<AchievementBadge> {
    const [badge] = await db.insert(achievementBadges).values(data).returning();
    return badge;
  }

  async getBadges(filters?: { badgeType?: string; rarity?: string; isSecret?: boolean }): Promise<AchievementBadge[]> {
    let query = db.select().from(achievementBadges);
    
    const conditions = [];
    if (filters?.badgeType) conditions.push(eq(achievementBadges.badgeType, filters.badgeType));
    if (filters?.rarity) conditions.push(eq(achievementBadges.rarity, filters.rarity));
    if (filters?.isSecret !== undefined) conditions.push(eq(achievementBadges.isSecret, filters.isSecret));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.where(eq(achievementBadges.isActive, true));
  }

  async getBadgeById(id: number): Promise<AchievementBadge | undefined> {
    const [badge] = await db.select().from(achievementBadges)
      .where(eq(achievementBadges.id, id));
    return badge;
  }

  async getUserBadges(userId: number): Promise<UserEarnedBadge[]> {
    return db.select().from(userEarnedBadges)
      .where(eq(userEarnedBadges.userId, userId))
      .orderBy(desc(userEarnedBadges.earnedAt));
  }

  async awardBadge(userId: number, badgeId: number, contextType?: string, contextId?: number): Promise<UserEarnedBadge> {
    const [badge] = await db.insert(userEarnedBadges)
      .values({
        userId,
        badgeId,
        contextType,
        contextId
      })
      .returning();
    
    // Add badge points to user stats
    const badgeInfo = await this.getBadgeById(badgeId);
    if (badgeInfo) {
      await this.addUserPoints(userId, badgeInfo.points);
    }
    
    return badge;
  }

  async checkBadgeEligibility(userId: number, badgeId: number): Promise<boolean> {
    // Check if user already has this badge
    const existingBadge = await db.select().from(userEarnedBadges)
      .where(and(
        eq(userEarnedBadges.userId, userId),
        eq(userEarnedBadges.badgeId, badgeId)
      ));
    
    return existingBadge.length === 0;
  }

  // Challenge system
  async createChallenge(data: InsertLearningPathChallenge): Promise<LearningPathChallenge> {
    const [challenge] = await db.insert(learningPathChallenges).values(data).returning();
    return challenge;
  }

  async getActiveChallenges(): Promise<LearningPathChallenge[]> {
    const now = new Date();
    return db.select().from(learningPathChallenges)
      .where(and(
        eq(learningPathChallenges.isActive, true),
        sql`${learningPathChallenges.startDate} <= ${now}`,
        sql`${learningPathChallenges.endDate} >= ${now}`
      ))
      .orderBy(asc(learningPathChallenges.endDate));
  }

  async getChallengeById(id: number): Promise<LearningPathChallenge | undefined> {
    const [challenge] = await db.select().from(learningPathChallenges)
      .where(eq(learningPathChallenges.id, id));
    return challenge;
  }

  async joinChallenge(userId: number, challengeId: number): Promise<UserChallengeParticipation> {
    const [participation] = await db.insert(userChallengeParticipation)
      .values({ userId, challengeId })
      .returning();
    return participation;
  }

  async getUserChallenges(userId: number): Promise<UserChallengeParticipation[]> {
    return db.select().from(userChallengeParticipation)
      .where(eq(userChallengeParticipation.userId, userId))
      .orderBy(desc(userChallengeParticipation.joinedAt));
  }

  async getChallengeLeaderboard(challengeId: number, limit = 10): Promise<UserChallengeParticipation[]> {
    return db.select().from(userChallengeParticipation)
      .where(eq(userChallengeParticipation.challengeId, challengeId))
      .orderBy(desc(userChallengeParticipation.pointsEarned))
      .limit(limit);
  }

  // Analytics and insights
  async getUserLearningPath(userId: number): Promise<{
    stats: UserGamificationStats;
    milestones: (LearningPathMilestone & { progress: UserLearningProgress | null })[];
    badges: UserEarnedBadge[];
    activeChallenges: UserChallengeParticipation[];
  }> {
    // Get user stats (initialize if not exists)
    let stats = await this.getUserStats(userId);
    if (!stats) {
      stats = await this.initializeUserStats(userId);
    }

    // Get milestones with progress
    const milestones = await db.select({
      milestone: learningPathMilestones,
      progress: userLearningProgress
    })
    .from(learningPathMilestones)
    .leftJoin(
      userLearningProgress,
      and(
        eq(userLearningProgress.milestoneId, learningPathMilestones.id),
        eq(userLearningProgress.userId, userId)
      )
    )
    .where(eq(learningPathMilestones.isActive, true))
    .orderBy(asc(learningPathMilestones.order));

    const formattedMilestones = milestones.map(({ milestone, progress }) => ({
      ...milestone,
      progress
    }));

    // Get user badges
    const badges = await this.getUserBadges(userId);

    // Get active challenges user is participating in
    const activeChallenges = await db.select().from(userChallengeParticipation)
      .where(and(
        eq(userChallengeParticipation.userId, userId),
        eq(userChallengeParticipation.status, "active")
      ));

    return {
      stats,
      milestones: formattedMilestones,
      badges,
      activeChallenges
    };
  }

  async getUserLeaderboard(limit = 10): Promise<{ user: any; stats: UserGamificationStats }[]> {
    // This would need to join with users table - simplified for now
    const topUsers = await db.select().from(userGamificationStats)
      .orderBy(desc(userGamificationStats.totalPoints))
      .limit(limit);

    return topUsers.map(stats => ({
      user: { id: stats.userId }, // Would normally include user details
      stats
    }));
  }
}

export const gamificationStorage = new GamificationStorage();