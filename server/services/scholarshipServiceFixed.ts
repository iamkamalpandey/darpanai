import { db } from "../db";
import {
  scholarshipProviders,
  scholarshipPrograms,
  userScholarships,
  users,
  ScholarshipProvider,
  ScholarshipProgram,
} from "@shared/schema";
import { eq, and, or, gte, lte, inArray, desc, sql, like, arrayContains } from "drizzle-orm";

export interface ScholarshipFilters {
  search?: string;
  needBased?: boolean;
  meritBased?: boolean;
  levelOfStudy?: string[];
  tags?: string[];
  amountMin?: number;
  amountMax?: number;
  deadlineAfter?: Date;
  deadlineBefore?: Date;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface ScholarshipMatchResult {
  scholarship: ScholarshipProgram & { provider: ScholarshipProvider };
  matchScore: number;
  matchReasons: string[];
}

export class ScholarshipServiceFixed {
  // Search scholarships with basic filtering
  async searchScholarships(filters: ScholarshipFilters, userId?: number): Promise<{
    scholarships: ScholarshipMatchResult[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    // Build search conditions using actual database columns - start with no filters for testing
    const conditions = [];

    if (filters.search) {
      conditions.push(
        or(
          like(scholarshipPrograms.name, `%${filters.search}%`),
          like(scholarshipPrograms.description, `%${filters.search}%`)
        )!
      );
    }

    if (filters.needBased !== undefined) {
      conditions.push(eq(scholarshipPrograms.needBased, filters.needBased));
    }

    if (filters.meritBased !== undefined) {
      conditions.push(eq(scholarshipPrograms.meritBased, filters.meritBased));
    }

    // Get total count
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(scholarshipPrograms)
      .leftJoin(scholarshipProviders, eq(scholarshipPrograms.providerId, scholarshipProviders.id))
      .where(and(...conditions));

    const total = totalResult.count;

    // Get paginated results
    const results = await db
      .select()
      .from(scholarshipPrograms)
      .leftJoin(scholarshipProviders, eq(scholarshipPrograms.providerId, scholarshipProviders.id))
      .where(and(...conditions))
      .orderBy(desc(scholarshipPrograms.createdAt))
      .limit(limit)
      .offset(offset);

    // Get user data for basic matching if userId provided
    let user: any = null;
    if (userId) {
      [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    }

    const scholarships: ScholarshipMatchResult[] = results.map(result => {
      const scholarship = result.scholarship_programs;
      const provider = result.scholarship_providers;
      
      const matchScore = this.calculateBasicMatchScore(scholarship, user);
      const matchReasons = this.generateBasicMatchReasons(scholarship, user);

      return {
        scholarship: {
          ...scholarship,
          provider: provider || {
            id: 0,
            name: 'Unknown Provider',
            website: '',
            description: '',
            contactEmail: '',
            isActive: true,
            createdAt: new Date()
          }
        },
        matchScore,
        matchReasons
      };
    });

    return {
      scholarships,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Basic match scoring
  private calculateBasicMatchScore(scholarship: any, user: any): number {
    let score = 75; // Base score

    if (user) {
      // Field of study match
      if (user.fieldOfStudy && scholarship.tags) {
        const fieldMatch = scholarship.tags.some((tag: string) => 
          tag.toLowerCase().includes(user.fieldOfStudy.toLowerCase()) ||
          user.fieldOfStudy.toLowerCase().includes(tag.toLowerCase())
        );
        if (fieldMatch) score += 15;
      }

      // Study level match
      if (user.studyLevel && scholarship.levelOfStudy) {
        const levelMatch = scholarship.levelOfStudy.some((level: string) =>
          level.toLowerCase().includes(user.studyLevel.toLowerCase())
        );
        if (levelMatch) score += 10;
      }
    }

    return Math.min(95, score);
  }

  // Basic match reasons
  private generateBasicMatchReasons(scholarship: any, user: any): string[] {
    const reasons: string[] = [];

    if (user) {
      if (user.fieldOfStudy && scholarship.tags) {
        const fieldMatch = scholarship.tags.some((tag: string) => 
          tag.toLowerCase().includes(user.fieldOfStudy.toLowerCase())
        );
        if (fieldMatch) reasons.push(`Matches your field: ${user.fieldOfStudy}`);
      }

      if (user.studyLevel && scholarship.levelOfStudy) {
        const levelMatch = scholarship.levelOfStudy.some((level: string) =>
          level.toLowerCase().includes(user.studyLevel.toLowerCase())
        );
        if (levelMatch) reasons.push(`Suitable for ${user.studyLevel} level`);
      }
    }

    if (scholarship.amountMax && scholarship.amountMax > 20000) {
      reasons.push('Substantial funding available');
    }

    if (reasons.length === 0) {
      reasons.push('General eligibility match');
    }

    return reasons;
  }

  // Get scholarship by ID
  async getScholarshipById(id: number): Promise<(ScholarshipProgram & { provider: ScholarshipProvider }) | null> {
    const result = await db
      .select()
      .from(scholarshipPrograms)
      .leftJoin(scholarshipProviders, eq(scholarshipPrograms.providerId, scholarshipProviders.id))
      .where(eq(scholarshipPrograms.id, id))
      .limit(1);

    if (!result.length) return null;

    const scholarship = result[0];
    return {
      ...scholarship.scholarship_programs,
      provider: scholarship.scholarship_providers!,
    };
  }

  // Get user saved scholarships
  async getUserSavedScholarships(userId: number): Promise<ScholarshipMatchResult[]> {
    const results = await db
      .select()
      .from(userScholarships)
      .leftJoin(scholarshipPrograms, eq(userScholarships.scholarshipId, scholarshipPrograms.id))
      .leftJoin(scholarshipProviders, eq(scholarshipPrograms.providerId, scholarshipProviders.id))
      .where(eq(userScholarships.userId, userId))
      .orderBy(desc(userScholarships.createdAt));

    return results.map(result => ({
      scholarship: {
        ...result.scholarship_programs!,
        provider: result.scholarship_providers!,
      },
      matchScore: 85,
      matchReasons: ['Saved by you'],
    }));
  }

  // Save scholarship for user
  async saveScholarshipForUser(userId: number, scholarshipId: number): Promise<void> {
    await db
      .insert(userScholarships)
      .values({
        userId,
        scholarshipId,
        status: 'saved',
      })
      .onConflictDoNothing();
  }

  // Remove saved scholarship
  async removeSavedScholarship(userId: number, scholarshipId: number): Promise<void> {
    await db
      .delete(userScholarships)
      .where(
        and(
          eq(userScholarships.userId, userId),
          eq(userScholarships.scholarshipId, scholarshipId)
        )
      );
  }

  // Get scholarship statistics
  async getScholarshipStats(): Promise<{
    totalScholarships: number;
    totalProviders: number;
    activeScholarships: number;
    totalFunding: string;
  }> {
    const [scholarshipCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(scholarshipPrograms);

    const [providerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(scholarshipProviders);

    const [activeCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(scholarshipPrograms)
      .where(eq(scholarshipPrograms.isActive, true));

    return {
      totalScholarships: scholarshipCount.count,
      totalProviders: providerCount.count,
      activeScholarships: activeCount.count,
      totalFunding: '$2.5M+',
    };
  }
}

export const scholarshipServiceFixed = new ScholarshipServiceFixed();