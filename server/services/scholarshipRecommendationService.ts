import { db } from "../db";
import {
  scholarshipProviders,
  scholarshipPrograms,
  userScholarships,
  users,
  ScholarshipProvider,
  ScholarshipProgram,
  User,
} from "@shared/schema";
import { eq, and, or, gte, lte, inArray, desc, sql, like, arrayContains, isNull } from "drizzle-orm";

export interface ScholarshipMatch {
  scholarship: ScholarshipProgram & { provider: ScholarshipProvider };
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

      // Get all active scholarships with providers
      const scholarships = await db
        .select({
          scholarship: scholarshipPrograms,
          provider: scholarshipProviders,
        })
        .from(scholarshipPrograms)
        .innerJoin(
          scholarshipProviders,
          eq(scholarshipPrograms.providerId, scholarshipProviders.id)
        )
        .where(
          and(
            eq(scholarshipPrograms.isActive, true),
            or(
              isNull(scholarshipPrograms.deadline),
              gte(scholarshipPrograms.deadline, new Date())
            )
          )
        );

      // Get user's saved scholarships
      const savedScholarshipIds = await db
        .select({ scholarshipId: userScholarships.scholarshipId })
        .from(userScholarships)
        .where(eq(userScholarships.userId, userId));
      
      const savedIds = new Set(savedScholarshipIds.map(s => s.scholarshipId));

      // Calculate match scores for each scholarship
      const matches: ScholarshipMatch[] = [];
      
      for (const { scholarship, provider } of scholarships) {
        const { score, reasons } = this.calculateMatchScore(scholarship, user);
        
        if (score > 0) {
          matches.push({
            scholarship: { ...scholarship, provider },
            matchScore: score,
            matchReasons: reasons,
            isSaved: savedIds.has(scholarship.id),
          });
        }
      }

      // Sort by match score (highest first)
      matches.sort((a, b) => b.matchScore - a.matchScore);

      // Return top 20 matches
      return matches.slice(0, 20);

    } catch (error) {
      console.error('Error getting scholarship recommendations:', error);
      throw error;
    }
  }

  /**
   * Calculate match score between scholarship and user profile
   */
  private calculateMatchScore(
    scholarship: ScholarshipProgram,
    user: User
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // 1. Study Level Match (30 points)
    if (scholarship.levelOfStudy && user.highestQualification) {
      const userLevel = user.highestQualification.toLowerCase();
      const eligibleLevels = scholarship.levelOfStudy.map(l => l.toLowerCase());
      
      // Check if user's level matches or progresses to scholarship level
      if (this.isLevelEligible(userLevel, eligibleLevels)) {
        score += 30;
        reasons.push('Matches your study level');
      }
    }

    // 2. Field of Study Match (25 points)
    if (scholarship.tags && user.fields_of_interest) {
      const userFields = user.fields_of_interest.map((f: string) => f.toLowerCase());
      const scholarshipTags = scholarship.tags.map((t: string) => t.toLowerCase());
      
      const fieldMatch = userFields.some((field: string) => 
        scholarshipTags.some((tag: string) => 
          tag.includes(field) || field.includes(tag)
        )
      );
      
      if (fieldMatch) {
        score += 25;
        reasons.push('Matches your field of study');
      }
    }

    // 3. Financial Need Match (20 points)
    if (scholarship.needBased && user.budget_min !== null && user.budget_max !== null) {
      // If user has budget constraints and scholarship is need-based
      if (user.budget_max < 50000) { // Assuming this indicates financial need
        score += 20;
        reasons.push('Need-based funding available');
      }
    }

    // 4. Merit-Based Match (15 points)
    if (scholarship.meritBased) {
      // Merit-based scholarships are relevant to all users
      score += 15;
      reasons.push('Merit-based opportunity');
    }

    // 5. Country/Location Match (10 points)
    if (user.preferredCountries && scholarship.tags) {
      const userCountries = user.preferredCountries.map((c: string) => c.toLowerCase());
      const hasCountryMatch = scholarship.tags.some((tag: string) => 
        userCountries.some((country: string) => 
          tag.toLowerCase().includes(country) || country.includes(tag.toLowerCase())
        )
      );
      
      if (hasCountryMatch) {
        score += 10;
        reasons.push('Available in your preferred country');
      }
    }

    // Ensure score doesn't exceed 100
    score = Math.min(score, 100);

    return { score, reasons };
  }

  /**
   * Check if user's academic level makes them eligible
   */
  private isLevelEligible(userLevel: string, eligibleLevels: string[]): boolean {
    const levelProgression: { [key: string]: string[] } = {
      'high school': ['undergraduate', 'bachelor', 'diploma'],
      'diploma': ['undergraduate', 'bachelor', 'graduate', 'master'],
      'undergraduate': ['graduate', 'master', 'phd', 'doctoral'],
      'bachelor': ['graduate', 'master', 'phd', 'doctoral'],
      'graduate': ['phd', 'doctoral', 'postdoctoral'],
      'master': ['phd', 'doctoral', 'postdoctoral'],
    };

    // Direct match
    if (eligibleLevels.includes(userLevel)) {
      return true;
    }

    // Check progression match
    const nextLevels = levelProgression[userLevel] || [];
    return eligibleLevels.some(level => nextLevels.includes(level));
  }

  /**
   * Get user's saved scholarships
   */
  async getSavedScholarships(userId: number): Promise<ScholarshipMatch[]> {
    try {
      const saved = await db
        .select({
          scholarship: scholarshipPrograms,
          provider: scholarshipProviders,
          savedStatus: userScholarships,
        })
        .from(userScholarships)
        .innerJoin(
          scholarshipPrograms,
          eq(userScholarships.scholarshipId, scholarshipPrograms.id)
        )
        .innerJoin(
          scholarshipProviders,
          eq(scholarshipPrograms.providerId, scholarshipProviders.id)
        )
        .where(eq(userScholarships.userId, userId))
        .orderBy(desc(userScholarships.createdAt));

      // Get user for match score calculation
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      return saved.map(({ scholarship, provider, savedStatus }) => {
        const { score, reasons } = this.calculateMatchScore(scholarship, user);
        
        return {
          scholarship: { ...scholarship, provider },
          matchScore: score,
          matchReasons: reasons,
          isSaved: true,
        };
      });

    } catch (error) {
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
        // Save scholarship
        await db
          .insert(userScholarships)
          .values({
            userId,
            scholarshipId,
            status: 'saved',
            applicationStatus: 'not_started',
          })
          .onConflictDoUpdate({
            target: [userScholarships.userId, userScholarships.scholarshipId],
            set: {
              status: 'saved',
              updatedAt: new Date(),
            },
          });
      } else {
        // Remove saved scholarship
        await db
          .delete(userScholarships)
          .where(
            and(
              eq(userScholarships.userId, userId),
              eq(userScholarships.scholarshipId, scholarshipId)
            )
          );
      }
    } catch (error) {
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
      // For now, we'll just log the inquiry
      // In a full implementation, this would save to a scholarship_inquiries table
      console.log('Scholarship inquiry created:', {
        userId,
        scholarshipId,
        inquiryType,
        message,
        createdAt: new Date(),
      });
      
      // You could also send an email notification to admins here
    } catch (error) {
      console.error('Error creating scholarship inquiry:', error);
      throw error;
    }
  }
}

export const scholarshipRecommendationService = new ScholarshipRecommendationService();