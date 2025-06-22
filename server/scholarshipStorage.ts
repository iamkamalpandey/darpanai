import { db } from "./db";
import { scholarships, type Scholarship, type InsertScholarship, type ScholarshipSearch, type ScholarshipSearchResponse } from "@shared/scholarshipSchema";
import { eq, and, or, like, gte, lte, sql, desc, asc } from "drizzle-orm";

export class ScholarshipStorage {
  // Get all scholarships with filtering and pagination
  async searchScholarships(searchParams: ScholarshipSearch): Promise<ScholarshipSearchResponse> {
    const {
      search,
      country,
      studyLevel,
      fieldOfStudy,
      fundingType,
      providerType,
      minAmount,
      maxAmount,
      deadlineFrom,
      deadlineTo,
      limit = 20,
      offset = 0
    } = searchParams;

    // Build where conditions
    const conditions = [];
    
    // Active scholarships only
    conditions.push(eq(scholarships.isActive, true));

    // Text search across name, description, and provider
    if (search) {
      conditions.push(
        or(
          like(scholarships.name, `%${search}%`),
          like(scholarships.description, `%${search}%`),
          like(scholarships.providerName, `%${search}%`),
          like(scholarships.shortDescription, `%${search}%`)
        )
      );
    }

    // Country filter (host countries or eligibility countries)
    if (country) {
      conditions.push(
        or(
          like(scholarships.hostCountries, `%"${country}"%`),
          like(scholarships.eligibilityCountries, `%"${country}"%`),
          eq(scholarships.providerCountry, country)
        )
      );
    }

    // Study level filter
    if (studyLevel && studyLevel !== 'any') {
      conditions.push(
        or(
          eq(scholarships.studyLevel, studyLevel),
          eq(scholarships.studyLevel, 'any')
        )
      );
    }

    // Field of study filter
    if (fieldOfStudy) {
      conditions.push(like(scholarships.fieldOfStudy, `%"${fieldOfStudy}"%`));
    }

    // Funding type filter
    if (fundingType) {
      conditions.push(eq(scholarships.fundingType, fundingType));
    }

    // Provider type filter
    if (providerType) {
      conditions.push(eq(scholarships.providerType, providerType));
    }

    // Amount range filters
    if (minAmount !== undefined) {
      conditions.push(gte(scholarships.amount, minAmount.toString()));
    }
    if (maxAmount !== undefined) {
      conditions.push(lte(scholarships.amount, maxAmount.toString()));
    }

    // Deadline range filters
    if (deadlineFrom) {
      conditions.push(gte(scholarships.applicationDeadline, deadlineFrom));
    }
    if (deadlineTo) {
      conditions.push(lte(scholarships.applicationDeadline, deadlineTo));
    }

    // Execute query with conditions
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(scholarships)
      .where(whereClause);
    
    const total = totalResult[0]?.count || 0;

    // Get scholarships with pagination
    const results = await db
      .select()
      .from(scholarships)
      .where(whereClause)
      .orderBy(desc(scholarships.featuredPriority), asc(scholarships.applicationDeadline))
      .limit(limit)
      .offset(offset);

    // Get filter options for frontend
    const filters = await this.getFilterOptions();

    return {
      scholarships: results,
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
      filters
    };
  }

  // Get scholarship by ID
  async getScholarshipById(scholarshipId: string): Promise<Scholarship | null> {
    const results = await db
      .select()
      .from(scholarships)
      .where(and(
        eq(scholarships.scholarshipId, scholarshipId),
        eq(scholarships.isActive, true)
      ))
      .limit(1);

    return results[0] || null;
  }

  // Create new scholarship
  async createScholarship(scholarshipData: InsertScholarship): Promise<Scholarship> {
    const results = await db
      .insert(scholarships)
      .values({
        ...scholarshipData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return results[0];
  }

  // Update scholarship
  async updateScholarship(scholarshipId: string, updateData: Partial<InsertScholarship>): Promise<Scholarship | null> {
    const results = await db
      .update(scholarships)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(scholarships.scholarshipId, scholarshipId))
      .returning();

    return results[0] || null;
  }

  // Delete scholarship (soft delete)
  async deleteScholarship(scholarshipId: string): Promise<boolean> {
    const results = await db
      .update(scholarships)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(scholarships.scholarshipId, scholarshipId))
      .returning();

    return results.length > 0;
  }

  // Get featured scholarships
  async getFeaturedScholarships(limit: number = 5): Promise<Scholarship[]> {
    return await db
      .select()
      .from(scholarships)
      .where(and(
        eq(scholarships.isActive, true),
        gte(scholarships.featuredPriority, 1)
      ))
      .orderBy(desc(scholarships.featuredPriority))
      .limit(limit);
  }

  // Get scholarships by provider
  async getScholarshipsByProvider(providerName: string): Promise<Scholarship[]> {
    return await db
      .select()
      .from(scholarships)
      .where(and(
        eq(scholarships.isActive, true),
        eq(scholarships.providerName, providerName)
      ))
      .orderBy(desc(scholarships.featuredPriority), asc(scholarships.applicationDeadline));
  }

  // Get scholarships with upcoming deadlines
  async getUpcomingDeadlines(days: number = 30): Promise<Scholarship[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await db
      .select()
      .from(scholarships)
      .where(and(
        eq(scholarships.isActive, true),
        gte(scholarships.applicationDeadline, new Date().toISOString().split('T')[0]),
        lte(scholarships.applicationDeadline, futureDate.toISOString().split('T')[0])
      ))
      .orderBy(asc(scholarships.applicationDeadline));
  }

  // Get filter options for frontend
  private async getFilterOptions() {
    const countries = await db
      .selectDistinct({ country: scholarships.providerCountry })
      .from(scholarships)
      .where(eq(scholarships.isActive, true));

    const studyLevels = await db
      .selectDistinct({ level: scholarships.studyLevel })
      .from(scholarships)
      .where(eq(scholarships.isActive, true));

    const fundingTypes = await db
      .selectDistinct({ type: scholarships.fundingType })
      .from(scholarships)
      .where(eq(scholarships.isActive, true));

    const providerTypes = await db
      .selectDistinct({ type: scholarships.providerType })
      .from(scholarships)
      .where(eq(scholarships.isActive, true));

    return {
      countries: countries.map(c => c.country).filter(Boolean),
      studyLevels: studyLevels.map(s => s.level).filter(Boolean),
      fieldsOfStudy: [], // Would need separate parsing of JSON fields
      fundingTypes: fundingTypes.map(f => f.type).filter(Boolean),
      providerTypes: providerTypes.map(p => p.type).filter(Boolean)
    };
  }

  // Get scholarship statistics
  async getStatistics() {
    const totalActive = await db
      .select({ count: sql<number>`count(*)` })
      .from(scholarships)
      .where(eq(scholarships.isActive, true));

    const byProvider = await db
      .select({
        providerType: scholarships.providerType,
        count: sql<number>`count(*)`
      })
      .from(scholarships)
      .where(eq(scholarships.isActive, true))
      .groupBy(scholarships.providerType);

    const byStudyLevel = await db
      .select({
        studyLevel: scholarships.studyLevel,
        count: sql<number>`count(*)`
      })
      .from(scholarships)
      .where(eq(scholarships.isActive, true))
      .groupBy(scholarships.studyLevel);

    return {
      total: totalActive[0]?.count || 0,
      byProvider: byProvider.reduce((acc, item) => {
        acc[item.providerType] = item.count;
        return acc;
      }, {} as Record<string, number>),
      byStudyLevel: byStudyLevel.reduce((acc, item) => {
        acc[item.studyLevel] = item.count;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

export const scholarshipStorage = new ScholarshipStorage();