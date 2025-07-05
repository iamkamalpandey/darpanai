import { db } from "../db";
import {
  userScholarships,
  users,
  User,
} from "@shared/schema";
import { scholarships } from "@shared/scholarshipSchema";
import { eq, and, or, gte, lte, inArray, desc, sql, like, arrayContains, isNull } from "drizzle-orm";

export interface ScholarshipMatch {
  scholarship: any;
  matchScore: number;
  matchReasons: string[];
  isSaved?: boolean;
}

export class ScholarshipRecommendationService {
  /**
   * Get personalized scholarship recommendations based on user profile
   */
  async getRecommendations(userId: number): Promise<ScholarshipMatch[]> {
    try {
      // Get user profile
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) {
        throw new Error('User not found');
      }

      console.log(`[Scholarship Recommendations] User profile:`, {
        id: user.id,
        field: user.field_of_study,
        countries: user.preferred_countries,
        qualification: user.highest_qualification
      });

      // Get all active scholarships
      const scholarshipList = await db
        .select()
        .from(scholarships)
        .where(eq(scholarships.status, 'active'));

      console.log(`[Scholarship Recommendations] Found ${scholarshipList.length} active scholarships`);

      // Calculate match scores for each scholarship
      const matches: ScholarshipMatch[] = [];
      
      for (const scholarship of scholarshipList) {
        const matchResult = this.calculateMatchScore(user, scholarship);
        if (matchResult.matchScore > 0) {
          matches.push({
            scholarship,
            matchScore: matchResult.matchScore,
            matchReasons: matchResult.matchReasons,
            isSaved: false // Will be updated later
          });
        }
      }

      // Sort by match score (highest first) and limit to top 10
      matches.sort((a, b) => b.matchScore - a.matchScore);
      const topMatches = matches.slice(0, 10);

      console.log(`[Scholarship Recommendations] Generated ${topMatches.length} matches for user ${userId}`);

      // Check which scholarships are saved by the user
      if (topMatches.length > 0) {
        const scholarshipIds = topMatches.map(match => match.scholarship.id);
        const savedScholarships = await db
          .select({ scholarshipId: userScholarships.scholarshipId })
          .from(userScholarships)
          .where(
            and(
              eq(userScholarships.userId, userId),
              inArray(userScholarships.scholarshipId, scholarshipIds)
            )
          );

        const savedIds = new Set(savedScholarships.map(s => s.scholarshipId));
        topMatches.forEach(match => {
          match.isSaved = savedIds.has(match.scholarship.id);
        });
      }

      return topMatches;
    } catch (error) {
      console.error('Error getting scholarship recommendations:', error);
      throw error;
    }
  }

  /**
   * Calculate match score between scholarship and user profile
   */
  private calculateMatchScore(
    user: User,
    scholarship: any
  ): { matchScore: number; matchReasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    console.log(`[Match Scoring] Evaluating scholarship: ${scholarship.name} for user fields:`, {
      userField: user.field_of_study,
      userCountries: user.preferred_countries,
      userLevel: user.highest_qualification,
      scholarshipFields: scholarship.specificFields,
      scholarshipCountries: scholarship.hostCountries,
      scholarshipLevels: scholarship.studyLevels
    });

    // 1. Field of Study Match (40 points)
    if (user.field_of_study && scholarship.specificFields) {
      const userField = user.field_of_study.toLowerCase();
      const scholarshipFields = Array.isArray(scholarship.specificFields) 
        ? scholarship.specificFields 
        : [];
      
      const fieldMatch = scholarshipFields.some((field: string) => 
        field.toLowerCase().includes(userField) || 
        userField.includes(field.toLowerCase())
      );
      
      if (fieldMatch) {
        score += 40;
        reasons.push(`Matches your field: ${user.field_of_study}`);
      }
    }

    // 2. Country Match (30 points) 
    if (user.preferred_countries && scholarship.hostCountries) {
      const userCountries = Array.isArray(user.preferred_countries) 
        ? user.preferred_countries 
        : [];
      const scholarshipCountries = Array.isArray(scholarship.hostCountries) 
        ? scholarship.hostCountries 
        : [];
      
      const countryMatch = userCountries.some((country: string) => 
        scholarshipCountries.some((sCountry: string) => 
          sCountry.toLowerCase().includes(country.toLowerCase()) ||
          country.toLowerCase().includes(sCountry.toLowerCase())
        )
      );
      
      if (countryMatch) {
        score += 30;
        reasons.push('Available in your preferred countries');
      }
    }

    // 3. Study Level Match (20 points)
    if (user.highest_qualification && scholarship.studyLevels) {
      const userLevel = user.highest_qualification.toLowerCase();
      const scholarshipLevels = Array.isArray(scholarship.studyLevels) 
        ? scholarship.studyLevels 
        : [];
      
      const levelMatch = scholarshipLevels.some((level: string) => 
        level.toLowerCase().includes(userLevel) || 
        userLevel.includes(level.toLowerCase()) ||
        (userLevel.includes('bachelor') && level.toLowerCase().includes('master')) ||
        (userLevel.includes('master') && level.toLowerCase().includes('phd'))
      );
      
      if (levelMatch) {
        score += 20;
        reasons.push('Matches your study level');
      }
    }

    // 4. Base eligibility (10 points if any match found)
    if (score > 0) {
      score += 10;
      reasons.push('Eligible based on profile');
    }

    console.log(`[Match Scoring] Final score: ${score} for scholarship: ${scholarship.name}`);
    
    return { matchScore: score, matchReasons: reasons };
  }

  /**
   * Check if user's academic level makes them eligible
   */
  private isLevelEligible(userLevel: string, eligibleLevels: string[]): boolean {
    const progressionMap: { [key: string]: string[] } = {
      'high school': ['bachelor', 'undergraduate', 'diploma'],
      'diploma': ['bachelor', 'undergraduate', 'master', 'graduate'],
      'bachelor': ['master', 'graduate', 'phd', 'doctorate'],
      'master': ['phd', 'doctorate'],
      'phd': ['postdoc', 'research'],
    };

    // Direct match
    if (eligibleLevels.some(level => level.toLowerCase() === userLevel)) {
      return true;
    }

    // Check progression
    const nextLevels = progressionMap[userLevel] || [];
    return eligibleLevels.some(level => nextLevels.includes(level.toLowerCase()));
  }

  /**
   * Get user's saved scholarships
   */
  async getSavedScholarships(userId: number): Promise<ScholarshipMatch[]> {
    try {
      const saved = await db
        .select({
          scholarship: scholarships,
          savedAt: userScholarships.createdAt,
        })
        .from(userScholarships)
        .innerJoin(
          scholarships,
          eq(userScholarships.scholarshipId, scholarships.id)
        )
        .where(eq(userScholarships.userId, userId))
        .orderBy(desc(userScholarships.createdAt));

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      return saved.map(({ scholarship }) => {
        const matchResult = user ? this.calculateMatchScore(user, scholarship) : { matchScore: 0, matchReasons: [] };
        return {
          scholarship,
          matchScore: matchResult.matchScore,
          matchReasons: matchResult.matchReasons,
          isSaved: true,
        };
      });
    } catch (error: any) {
      console.error('Error getting saved scholarships:', error);
      throw error;
    }
  }

  /**
   * Save or unsave a scholarship for a user
   */
  async toggleSaveScholarship(userId: number, scholarshipId: number, save: boolean): Promise<void> {
    try {
      if (save) {
        await db.insert(userScholarships).values({
          userId,
          scholarshipId,
        });
      } else {
        await db
          .delete(userScholarships)
          .where(
            and(
              eq(userScholarships.userId, userId),
              eq(userScholarships.scholarshipId, scholarshipId)
            )
          );
      }
    } catch (error: any) {
      console.error('Error toggling scholarship save:', error);
      throw error;
    }
  }

  /**
   * Create a scholarship inquiry
   */
  async createInquiry(
    userId: number,
    scholarshipId: number,
    inquiryType: string,
    message: string
  ): Promise<void> {
    try {
      console.log(`Creating scholarship inquiry for user ${userId}, scholarship ${scholarshipId}`);
      // This would save to a scholarship_inquiries table if it existed
      // For now, just log the inquiry
    } catch (error: any) {
      console.error('Error creating scholarship inquiry:', error);
      throw error;
    }
  }
}

export const scholarshipRecommendationService = new ScholarshipRecommendationService();