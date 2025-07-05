import { db } from "./db";
import { scholarshipRecommendations, scholarshipPrograms, scholarshipProviders } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export class ScholarshipRecommendationStorage {
  async getUserRecommendations(userId: number) {
    try {
      const recommendations = await db
        .select({
          id: scholarshipRecommendations.id,
          scholarshipId: scholarshipRecommendations.scholarshipId,
          matchScore: scholarshipRecommendations.matchScore,
          matchReasons: scholarshipRecommendations.matchReasons,
          rank: scholarshipRecommendations.rank,
          isActive: scholarshipRecommendations.isActive,
          createdAt: scholarshipRecommendations.createdAt,
          // Scholarship details
          scholarshipName: scholarshipPrograms.name,
          scholarshipDescription: scholarshipPrograms.description,
          targetCountries: scholarshipPrograms.tags, // Use tags as proxy for target countries
          eligibilityCriteria: scholarshipPrograms.eligibilitySummary,
          applicationDeadline: scholarshipPrograms.deadline,
          fundingType: sql`CASE WHEN ${scholarshipPrograms.needBased} = true THEN 'Need-based' ELSE 'Merit-based' END`,
          fundingAmount: scholarshipPrograms.amountDisplay,
          websiteUrl: scholarshipPrograms.applicationUrl,
          // Provider details
          providerName: scholarshipProviders.name,
          providerCountry: sql`'Various'`, // Placeholder as provider table doesn't have country
        })
        .from(scholarshipRecommendations)
        .innerJoin(
          scholarshipPrograms,
          eq(scholarshipRecommendations.scholarshipId, scholarshipPrograms.id)
        )
        .innerJoin(
          scholarshipProviders,
          eq(scholarshipPrograms.providerId, scholarshipProviders.id)
        )
        .where(
          and(
            eq(scholarshipRecommendations.userId, userId),
            eq(scholarshipRecommendations.isActive, true)
          )
        )
        .orderBy(scholarshipRecommendations.rank);

      return recommendations;
    } catch (error) {
      console.error("Error fetching user recommendations:", error);
      throw error;
    }
  }

  async getRecommendationStats(userId: number) {
    try {
      const stats = await db
        .select({
          totalRecommendations: scholarshipRecommendations.id,
          averageMatchScore: scholarshipRecommendations.matchScore,
        })
        .from(scholarshipRecommendations)
        .where(
          and(
            eq(scholarshipRecommendations.userId, userId),
            eq(scholarshipRecommendations.isActive, true)
          )
        );

      const totalCount = stats.length;
      const averageScore = totalCount > 0 
        ? Math.round(stats.reduce((sum, stat) => sum + stat.averageMatchScore, 0) / totalCount)
        : 0;

      return {
        totalRecommendations: totalCount,
        averageMatchScore: averageScore,
      };
    } catch (error) {
      console.error("Error fetching recommendation stats:", error);
      throw error;
    }
  }

  async createRecommendation(userId: number, scholarshipId: number, matchScore: number, matchReasons: string[], rank: number) {
    try {
      const [recommendation] = await db
        .insert(scholarshipRecommendations)
        .values({
          userId,
          scholarshipId,
          matchScore,
          matchReasons,
          rank,
          isActive: true,
        })
        .returning();

      return recommendation;
    } catch (error) {
      console.error("Error creating recommendation:", error);
      throw error;
    }
  }

  async updateRecommendation(recommendationId: number, updates: Partial<{
    matchScore: number;
    matchReasons: string[];
    rank: number;
    isActive: boolean;
  }>) {
    try {
      const [updatedRecommendation] = await db
        .update(scholarshipRecommendations)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(scholarshipRecommendations.id, recommendationId))
        .returning();

      return updatedRecommendation;
    } catch (error) {
      console.error("Error updating recommendation:", error);
      throw error;
    }
  }

  async deleteRecommendation(recommendationId: number) {
    try {
      await db
        .delete(scholarshipRecommendations)
        .where(eq(scholarshipRecommendations.id, recommendationId));

      return { success: true };
    } catch (error) {
      console.error("Error deleting recommendation:", error);
      throw error;
    }
  }

  // Admin function to regenerate recommendations for a user
  async regenerateUserRecommendations(userId: number) {
    try {
      // First, deactivate existing recommendations
      await db
        .update(scholarshipRecommendations)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(scholarshipRecommendations.userId, userId));

      // Get all available scholarships
      const scholarships = await db
        .select({
          id: scholarshipPrograms.id,
          name: scholarshipPrograms.name,
        })
        .from(scholarshipPrograms);

      // Generate new recommendations (simplified scoring for now)
      const newRecommendations = [];
      for (let i = 0; i < Math.min(5, scholarships.length); i++) {
        const scholarship = scholarships[i];
        const matchScore = 95 - (i * 5) + Math.floor(Math.random() * 8); // Random variation
        const matchReasons = [
          'Strong academic profile alignment',
          'Good fit for field of study',
          'Suitable funding level',
        ];

        newRecommendations.push({
          userId,
          scholarshipId: scholarship.id,
          matchScore,
          matchReasons,
          rank: i + 1,
          isActive: true,
        });
      }

      // Insert new recommendations
      if (newRecommendations.length > 0) {
        await db.insert(scholarshipRecommendations).values(newRecommendations);
      }

      return { success: true, generatedCount: newRecommendations.length };
    } catch (error) {
      console.error("Error regenerating recommendations:", error);
      throw error;
    }
  }
}

export const scholarshipRecommendationStorage = new ScholarshipRecommendationStorage();