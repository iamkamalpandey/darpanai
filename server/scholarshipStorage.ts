import { db } from "./db";
import { scholarships, type Scholarship, type InsertScholarship, type ScholarshipSearch, type ScholarshipSearchResponse } from "@shared/scholarshipSchema";
import { eq, and, or, ilike, desc, asc, sql, count } from "drizzle-orm";

export class ScholarshipStorage {
  // Search scholarships with filtering and pagination
  async searchScholarships(searchParams: ScholarshipSearch): Promise<ScholarshipSearchResponse> {
    try {
      const { 
        search, 
        programLevel, 
        institutionName, 
        fundingType,
        limit = 20, 
        offset = 0 
      } = searchParams;

      // Build where conditions
      const conditions = [];

      // Text search across multiple fields
      if (search) {
        conditions.push(
          or(
            ilike(scholarships.scholarshipName, `%${search}%`),
            ilike(scholarships.institutionName, `%${search}%`),
            ilike(scholarships.programName, `%${search}%`),
            ilike(scholarships.description, `%${search}%`)
          )
        );
      }

      // Filter by program level
      if (programLevel) {
        conditions.push(ilike(scholarships.programLevel, `%${programLevel}%`));
      }

      // Filter by institution
      if (institutionName) {
        conditions.push(ilike(scholarships.institutionName, `%${institutionName}%`));
      }

      // Filter by funding type
      if (fundingType) {
        conditions.push(ilike(scholarships.fundingType, `%${fundingType}%`));
      }

      // Get total count
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      const [totalResult] = await db
        .select({ count: count() })
        .from(scholarships)
        .where(whereClause);

      const total = totalResult.count;

      // Get scholarships
      const scholarshipResults = await db
        .select()
        .from(scholarships)
        .where(whereClause)
        .orderBy(desc(scholarships.createdAt))
        .limit(limit)
        .offset(offset);

      // Get filter options for frontend
      const filterOptions = await this.getFilterOptions();

      return {
        scholarships: scholarshipResults,
        total,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
        filters: filterOptions
      };

    } catch (error) {
      console.error('[ScholarshipStorage] Search error:', error);
      throw new Error('Failed to search scholarships');
    }
  }

  // Get scholarship by ID
  async getScholarshipById(scholarshipId: string): Promise<Scholarship | null> {
    try {
      const [scholarship] = await db
        .select()
        .from(scholarships)
        .where(eq(scholarships.id, parseInt(scholarshipId)));

      return scholarship || null;

    } catch (error) {
      console.error('[ScholarshipStorage] Get by ID error:', error);
      throw new Error('Failed to get scholarship');
    }
  }

  // Create new scholarship
  async createScholarship(scholarshipData: InsertScholarship): Promise<Scholarship> {
    try {
      const [scholarship] = await db
        .insert(scholarships)
        .values(scholarshipData)
        .returning();

      return scholarship;

    } catch (error) {
      console.error('[ScholarshipStorage] Create error:', error);
      throw new Error('Failed to create scholarship');
    }
  }

  // Update scholarship
  async updateScholarship(scholarshipId: string, updateData: Partial<InsertScholarship>): Promise<Scholarship | null> {
    try {
      const [scholarship] = await db
        .update(scholarships)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(scholarships.id, parseInt(scholarshipId)))
        .returning();

      return scholarship || null;

    } catch (error) {
      console.error('[ScholarshipStorage] Update error:', error);
      throw new Error('Failed to update scholarship');
    }
  }

  // Delete scholarship
  async deleteScholarship(scholarshipId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(scholarships)
        .where(eq(scholarships.id, parseInt(scholarshipId)));

      return result.rowCount > 0;

    } catch (error) {
      console.error('[ScholarshipStorage] Delete error:', error);
      throw new Error('Failed to delete scholarship');
    }
  }

  // Get featured scholarships
  async getFeaturedScholarships(limit: number = 5): Promise<Scholarship[]> {
    try {
      return await db
        .select()
        .from(scholarships)
        .orderBy(desc(scholarships.createdAt))
        .limit(limit);

    } catch (error) {
      console.error('[ScholarshipStorage] Featured scholarships error:', error);
      throw new Error('Failed to get featured scholarships');
    }
  }

  // Get scholarships by provider
  async getScholarshipsByProvider(providerName: string): Promise<Scholarship[]> {
    try {
      return await db
        .select()
        .from(scholarships)
        .where(ilike(scholarships.institutionName, `%${providerName}%`))
        .orderBy(desc(scholarships.createdAt));

    } catch (error) {
      console.error('[ScholarshipStorage] Provider scholarships error:', error);
      throw new Error('Failed to get scholarships by provider');
    }
  }

  // Get upcoming deadlines
  async getUpcomingDeadlines(days: number = 30): Promise<Scholarship[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      
      return await db
        .select()
        .from(scholarships)
        .where(
          and(
            sql`${scholarships.applicationDeadline} IS NOT NULL`,
            sql`${scholarships.applicationDeadline} != ''`
          )
        )
        .orderBy(asc(scholarships.applicationDeadline));

    } catch (error) {
      console.error('[ScholarshipStorage] Upcoming deadlines error:', error);
      throw new Error('Failed to get upcoming deadlines');
    }
  }

  // Get filter options
  private async getFilterOptions() {
    try {
      // Get distinct program levels
      const programLevels = await db
        .selectDistinct({ programLevel: scholarships.programLevel })
        .from(scholarships)
        .where(sql`${scholarships.programLevel} IS NOT NULL`);

      // Get distinct institutions
      const institutions = await db
        .selectDistinct({ institutionName: scholarships.institutionName })
        .from(scholarships)
        .where(sql`${scholarships.institutionName} IS NOT NULL`);

      // Get distinct funding types
      const fundingTypes = await db
        .selectDistinct({ fundingType: scholarships.fundingType })
        .from(scholarships)
        .where(sql`${scholarships.fundingType} IS NOT NULL`);

      return {
        programLevels: programLevels.map(p => p.programLevel).filter(Boolean),
        institutions: institutions.map(i => i.institutionName).filter(Boolean),
        fundingTypes: fundingTypes.map(f => f.fundingType).filter(Boolean)
      };

    } catch (error) {
      console.error('[ScholarshipStorage] Filter options error:', error);
      return {
        programLevels: [],
        institutions: [],
        fundingTypes: []
      };
    }
  }

  // Get statistics
  async getStatistics() {
    try {
      const [stats] = await db
        .select({
          totalScholarships: count(),
          totalAmount: sql<number>`SUM(CASE WHEN ${scholarships.availableFunds} ~ '^[0-9]+' THEN CAST(regexp_replace(${scholarships.availableFunds}, '[^0-9]', '', 'g') AS INTEGER) ELSE 0 END)`,
          avgAmount: sql<number>`AVG(CASE WHEN ${scholarships.availableFunds} ~ '^[0-9]+' THEN CAST(regexp_replace(${scholarships.availableFunds}, '[^0-9]', '', 'g') AS INTEGER) ELSE NULL END)`
        })
        .from(scholarships);

      const distinctInstitutions = await db
        .selectDistinct({ institutionName: scholarships.institutionName })
        .from(scholarships);

      const distinctProgramLevels = await db
        .selectDistinct({ programLevel: scholarships.programLevel })
        .from(scholarships);

      return {
        totalScholarships: stats.totalScholarships,
        totalInstitutions: distinctInstitutions.length,
        totalProgramLevels: distinctProgramLevels.length,
        estimatedTotalValue: stats.totalAmount || 0,
        averageAmount: stats.avgAmount || 0
      };

    } catch (error) {
      console.error('[ScholarshipStorage] Statistics error:', error);
      return {
        totalScholarships: 0,
        totalInstitutions: 0,
        totalProgramLevels: 0,
        estimatedTotalValue: 0,
        averageAmount: 0
      };
    }
  }
}

export const scholarshipStorage = new ScholarshipStorage();