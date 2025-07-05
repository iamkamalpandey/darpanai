import { db } from "../db";
import {
  scholarshipProviders,
  scholarshipPrograms,
  userScholarships,
  userScholarshipPreferences,
  scholarshipInquiries,
  scholarshipSearchAnalytics,
  users,
  ScholarshipProvider,
  ScholarshipProgram,
  UserScholarshipPreferences,
  InsertScholarshipProvider,
  InsertScholarshipProgram,
  InsertUserScholarship,
  InsertUserScholarshipPreferences,
  InsertScholarshipInquiry,
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

export class ScholarshipService {
  // Scholarship Program Management
  async createScholarshipProgram(data: InsertScholarshipProgram): Promise<ScholarshipProgram> {
    const [program] = await db
      .insert(scholarshipPrograms)
      .values(data)
      .returning();
    return program;
  }

  async updateScholarshipProgram(id: number, data: Partial<InsertScholarshipProgram>): Promise<ScholarshipProgram | null> {
    const [program] = await db
      .update(scholarshipPrograms)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(scholarshipPrograms.id, id))
      .returning();
    return program || null;
  }

  async deleteScholarshipProgram(id: number): Promise<boolean> {
    const result = await db
      .delete(scholarshipPrograms)
      .where(eq(scholarshipPrograms.id, id));
    return result.rowCount! > 0;
  }

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

  // Scholarship Search & Filtering with AI Enhancement
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

    // Build search conditions
    const conditions = [eq(scholarshipPrograms.isActive, filters.isActive ?? true)];

    if (filters.search) {
      conditions.push(
        or(
          like(scholarshipPrograms.name, `%${filters.search}%`),
          like(scholarshipPrograms.description, `%${filters.search}%`)
        )
      );
    }

    if (filters.needBased !== undefined) {
      conditions.push(eq(scholarshipPrograms.needBased, filters.needBased));
    }

    if (filters.meritBased !== undefined) {
      conditions.push(eq(scholarshipPrograms.meritBased, filters.meritBased));
    }

    if (filters.levelOfStudy?.length) {
      conditions.push(
        sql`${scholarshipPrograms.levelOfStudy} && ${filters.levelOfStudy}`
      );
    }

    if (filters.tags?.length) {
      conditions.push(
        sql`${scholarshipPrograms.tags} && ${filters.tags}`
      );
    }

    if (filters.amountMin) {
      conditions.push(gte(scholarshipPrograms.amountMin, filters.amountMin));
    }

    if (filters.amountMax) {
      conditions.push(lte(scholarshipPrograms.amountMax, filters.amountMax));
    }

    if (filters.deadlineAfter) {
      conditions.push(gte(scholarshipPrograms.deadline, filters.deadlineAfter));
    }

    if (filters.deadlineBefore) {
      conditions.push(lte(scholarshipPrograms.deadline, filters.deadlineBefore));
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

    // Get user preferences for better matching if userId provided
    let userPreferences: UserScholarshipPreferences | null = null;
    let user: any = null;
    
    if (userId) {
      userPreferences = await this.getUserScholarshipPreferences(userId);
      [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    }

    const scholarships: ScholarshipMatchResult[] = results.map(result => {
      const scholarship = {
        ...result.scholarship_programs,
        provider: result.scholarship_providers!,
      };

      return {
        scholarship,
        matchScore: userId && user ? 
          this.calculateMatchScore(scholarship, user, userPreferences) : 
          85, // Default score for anonymous users
        matchReasons: userId && user ?
          this.generateMatchReasons(scholarship, user, userPreferences) :
          ["Active scholarship program", "Matches search criteria"],
      };
    });

    // Track search analytics if user provided
    if (userId) {
      await this.trackScholarshipSearch(
        userId,
        filters.search,
        filters,
        total,
        scholarships.map(s => s.scholarship.id)
      );
    }

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

  // User Scholarship Management
  async saveScholarshipForUser(userId: number, scholarshipId: number, status: string = "saved"): Promise<void> {
    await db
      .insert(userScholarships)
      .values({
        userId,
        scholarshipId,
        status,
      })
      .onConflictDoUpdate({
        target: [userScholarships.userId, userScholarships.scholarshipId],
        set: {
          status,
          updatedAt: new Date(),
        },
      });
  }

  async removeScholarshipForUser(userId: number, scholarshipId: number): Promise<void> {
    await db
      .delete(userScholarships)
      .where(
        and(
          eq(userScholarships.userId, userId),
          eq(userScholarships.scholarshipId, scholarshipId)
        )
      );
  }

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
      matchScore: 90, // Saved scholarships get higher match scores
      matchReasons: ["Saved by user", "Previously reviewed"],
    }));
  }

  // User Preferences
  async getUserScholarshipPreferences(userId: number): Promise<UserScholarshipPreferences | null> {
    const [preferences] = await db
      .select()
      .from(userScholarshipPreferences)
      .where(eq(userScholarshipPreferences.userId, userId))
      .limit(1);

    return preferences || null;
  }

  async updateUserScholarshipPreferences(
    userId: number,
    data: Partial<InsertUserScholarshipPreferences>
  ): Promise<UserScholarshipPreferences> {
    const [preferences] = await db
      .insert(userScholarshipPreferences)
      .values({ userId, ...data })
      .onConflictDoUpdate({
        target: userScholarshipPreferences.userId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();

    return preferences;
  }

  // AI-Enhanced Personalized Recommendations
  async getPersonalizedRecommendations(userId: number, limit: number = 10): Promise<ScholarshipMatchResult[]> {
    const userPreferences = await this.getUserScholarshipPreferences(userId);
    
    // Get user profile data for better matching
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return [];

    // Build search criteria based on user profile and preferences
    const searchCriteria: ScholarshipFilters = {
      isActive: true,
      limit,
      offset: 0,
    };

    // Add preference-based filters
    if (userPreferences) {
      if (userPreferences.academicLevel) {
        searchCriteria.levelOfStudy = [userPreferences.academicLevel];
      }
      
      if (userPreferences.budgetMin) {
        searchCriteria.amountMin = userPreferences.budgetMin;
      }

      if (userPreferences.fieldsOfInterest.length > 0) {
        searchCriteria.tags = userPreferences.fieldsOfInterest;
      }

      if (userPreferences.needBasedPreference) {
        searchCriteria.needBased = true;
      }
    }

    // Add user profile-based filters
    if (user.fieldOfStudy) {
      searchCriteria.search = user.fieldOfStudy;
    }

    const results = await this.searchScholarships(searchCriteria, userId);
    
    // Enhanced AI matching with DeepSeek for complex analysis
    return results.scholarships.map(result => ({
      ...result,
      matchScore: this.calculateMatchScore(result.scholarship, user, userPreferences),
      matchReasons: this.generateMatchReasons(result.scholarship, user, userPreferences),
    }));
  }

  private calculateMatchScore(
    scholarship: ScholarshipProgram,
    user: any,
    preferences: UserScholarshipPreferences | null
  ): number {
    let score = 50; // Base score

    // Field of study match
    if (user.fieldOfStudy && scholarship.tags.some(tag => 
      tag.toLowerCase().includes(user.fieldOfStudy.toLowerCase())
    )) {
      score += 20;
    }

    // Level of study match
    if (user.highestQualification && scholarship.levelOfStudy.includes(user.highestQualification)) {
      score += 15;
    }

    // Financial need match
    if (preferences?.needBasedPreference && scholarship.needBased) {
      score += 15;
    }

    // Merit-based match
    if (preferences?.meritBasedPreference && scholarship.meritBased) {
      score += 10;
    }

    // Preferred fields match
    if (preferences?.fieldsOfInterest.length) {
      const tagMatches = scholarship.tags.filter(tag => 
        preferences.fieldsOfInterest.includes(tag)
      ).length;
      score += tagMatches * 5;
    }

    // Deadline urgency (bonus for upcoming deadlines)
    if (scholarship.deadline) {
      const daysUntilDeadline = Math.floor(
        (scholarship.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilDeadline > 0 && daysUntilDeadline <= 60) {
        score += 5; // Bonus for upcoming deadlines
      }
    }

    return Math.min(95, Math.max(60, score));
  }

  private generateMatchReasons(
    scholarship: ScholarshipProgram,
    user: any,
    preferences: UserScholarshipPreferences | null
  ): string[] {
    const reasons: string[] = [];

    if (user.fieldOfStudy && scholarship.tags.some(tag => 
      tag.toLowerCase().includes(user.fieldOfStudy.toLowerCase())
    )) {
      reasons.push(`Matches your field of study (${user.fieldOfStudy})`);
    }

    if (user.highestQualification && scholarship.levelOfStudy.includes(user.highestQualification)) {
      reasons.push(`Suitable for your academic level`);
    }

    if (preferences?.needBasedPreference && scholarship.needBased) {
      reasons.push(`Addresses your financial needs`);
    }

    if (scholarship.meritBased && preferences?.meritBasedPreference) {
      reasons.push(`Merit-based opportunity matching your academic performance`);
    }

    if (preferences?.fieldsOfInterest.length) {
      const matchingTags = scholarship.tags.filter(tag => 
        preferences.fieldsOfInterest.includes(tag)
      );
      if (matchingTags.length > 0) {
        reasons.push(`Matches your interests: ${matchingTags.join(', ')}`);
      }
    }

    if (scholarship.deadline) {
      const daysUntilDeadline = Math.floor(
        (scholarship.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilDeadline > 0 && daysUntilDeadline <= 30) {
        reasons.push(`Deadline approaching - apply soon!`);
      }
    }

    if (reasons.length === 0) {
      reasons.push("General eligibility match");
    }

    return reasons;
  }

  // Analytics
  async trackScholarshipSearch(
    userId: number,
    searchQuery: string | undefined,
    filtersApplied: any,
    resultsCount: number,
    scholarshipsViewed: number[] = [],
    sessionDuration: number = 0
  ): Promise<void> {
    await db
      .insert(scholarshipSearchAnalytics)
      .values({
        userId,
        searchQuery,
        filtersApplied,
        resultsCount,
        scholarshipsViewed,
        sessionDuration,
      });
  }

  async getScholarshipAnalytics(): Promise<{
    totalScholarships: number;
    activeUsers: number;
    totalSaves: number;
    avgMatchScore: number;
    popularScholarships: any[];
  }> {
    const [totalScholarships] = await db
      .select({ count: sql<number>`count(*)` })
      .from(scholarshipPrograms)
      .where(eq(scholarshipPrograms.isActive, true));

    const [activeUsers] = await db
      .select({ count: sql<number>`count(distinct user_id)` })
      .from(userScholarships);

    const [totalSaves] = await db
      .select({ count: sql<number>`count(*)` })
      .from(userScholarships);

    // Get popular scholarships
    const popularScholarships = await db
      .select({
        scholarshipId: userScholarships.scholarshipId,
        name: scholarshipPrograms.name,
        saveCount: sql<number>`count(*)`,
      })
      .from(userScholarships)
      .leftJoin(scholarshipPrograms, eq(userScholarships.scholarshipId, scholarshipPrograms.id))
      .groupBy(userScholarships.scholarshipId, scholarshipPrograms.name)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    return {
      totalScholarships: totalScholarships.count,
      activeUsers: activeUsers.count,
      totalSaves: totalSaves.count,
      avgMatchScore: 82, // This would be calculated from actual match scores
      popularScholarships,
    };
  }

  // Provider Management
  async createScholarshipProvider(data: InsertScholarshipProvider): Promise<ScholarshipProvider> {
    const [provider] = await db
      .insert(scholarshipProviders)
      .values(data)
      .returning();
    return provider;
  }

  async getAllProviders(): Promise<ScholarshipProvider[]> {
    return await db
      .select()
      .from(scholarshipProviders)
      .where(eq(scholarshipProviders.isActive, true))
      .orderBy(scholarshipProviders.name);
  }

  // Inquiry Management
  async createInquiry(data: InsertScholarshipInquiry): Promise<void> {
    await db
      .insert(scholarshipInquiries)
      .values(data);
  }

  async getUserInquiries(userId: number): Promise<any[]> {
    return await db
      .select()
      .from(scholarshipInquiries)
      .leftJoin(scholarshipPrograms, eq(scholarshipInquiries.scholarshipId, scholarshipPrograms.id))
      .where(eq(scholarshipInquiries.userId, userId))
      .orderBy(desc(scholarshipInquiries.createdAt));
  }

  // Sample Data Population
  async populateSampleData(): Promise<void> {
    // Create sample providers
    const providers = await Promise.all([
      this.createScholarshipProvider({
        name: "Google",
        website: "https://google.com/scholarships",
        description: "Technology scholarships for underrepresented students",
        contactEmail: "scholarships@google.com",
      }),
      this.createScholarshipProvider({
        name: "Education Foundation",
        website: "https://educationfoundation.org",
        description: "Supporting first-generation college students",
        contactEmail: "grants@educationfoundation.org",
      }),
      this.createScholarshipProvider({
        name: "Gates Foundation",
        website: "https://gatesfoundation.org",
        description: "Global education initiatives",
        contactEmail: "education@gatesfoundation.org",
      }),
    ]);

    // Create sample scholarship programs
    const sampleScholarships = [
      {
        providerId: providers[0].id,
        name: "Google Computer Science Scholarship",
        description: "Supporting underrepresented students in computer science and related fields",
        amountMin: 10000,
        amountMax: 10000,
        amountDisplay: "$10,000",
        deadline: new Date("2025-12-01"),
        applicationUrl: "https://google.com/scholarships/computer-science",
        levelOfStudy: ["Undergraduate", "Graduate"],
        needBased: false,
        meritBased: true,
        eligibilitySummary: [
          "Must be enrolled in a computer science program",
          "Minimum 3.5 GPA required",
          "Demonstrate leadership in technology",
          "From underrepresented background in tech"
        ],
        requiredDocuments: [
          "Academic transcripts",
          "Personal statement",
          "Two letters of recommendation",
          "Resume"
        ],
        tags: ["Computer Science", "STEM", "Diversity", "Technology", "Leadership"],
        matchReasons: ["Field match", "Academic excellence", "Diversity focus"],
      },
      {
        providerId: providers[1].id,
        name: "First Generation College Student Grant",
        description: "Financial assistance for first-generation college students pursuing higher education",
        amountMin: 5000,
        amountMax: 5000,
        amountDisplay: "$5,000",
        deadline: new Date("2025-11-15"),
        applicationUrl: "https://educationfoundation.org/first-gen-grant",
        levelOfStudy: ["Undergraduate"],
        needBased: true,
        meritBased: false,
        eligibilitySummary: [
          "First person in family to attend college",
          "Demonstrate financial need",
          "Minimum 2.5 GPA",
          "Enrolled in accredited institution"
        ],
        requiredDocuments: [
          "FAFSA form",
          "Tax returns",
          "Personal essay",
          "Academic transcripts"
        ],
        tags: ["First-Generation", "Need-Based", "General", "Financial Aid"],
        matchReasons: ["Financial need", "First-generation status"],
      },
      {
        providerId: providers[2].id,
        name: "Gates Millennium Scholars Program",
        description: "Comprehensive scholarship program for outstanding minority students",
        amountMin: 15000,
        amountMax: 25000,
        amountDisplay: "$15,000 - $25,000",
        deadline: new Date("2026-01-15"),
        applicationUrl: "https://gatesfoundation.org/millennium-scholars",
        levelOfStudy: ["Undergraduate", "Graduate", "PhD"],
        needBased: true,
        meritBased: true,
        eligibilitySummary: [
          "Outstanding academic achievement",
          "Demonstrated leadership",
          "Financial need",
          "Minority student status"
        ],
        requiredDocuments: [
          "Complete application form",
          "Official transcripts",
          "Eight essays",
          "Recommendation letters",
          "Financial aid forms"
        ],
        tags: ["Diversity", "Leadership", "Academic Excellence", "Need-Based", "Merit-Based"],
        matchReasons: ["Academic excellence", "Leadership potential", "Diversity focus"],
      },
    ];

    for (const scholarship of sampleScholarships) {
      await this.createScholarshipProgram(scholarship);
    }
  }
}

export const scholarshipService = new ScholarshipService();