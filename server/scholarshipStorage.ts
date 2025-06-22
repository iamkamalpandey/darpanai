import { db } from "./db";
import { scholarships } from "@shared/scholarshipSchema";
import { eq, ilike, or, and, desc, count, sql } from "drizzle-orm";
import type { ScholarshipSearch, Scholarship, ScholarshipSearchResponse, ScholarshipStatistics } from "@shared/scholarshipSchema";

export class ScholarshipStorage {
  
  // Search scholarships with comprehensive filtering
  async searchScholarships(searchParams: ScholarshipSearch): Promise<ScholarshipSearchResponse> {
    try {
      const { 
        search, 
        providerType,
        providerCountry,
        studyLevel,
        fieldCategory,
        fundingType,
        difficultyLevel,
        minAmount,
        maxAmount,
        deadlineFrom,
        deadlineTo,
        renewable,
        leadershipRequired,
        status,
        limit = 20, 
        offset = 0 
      } = searchParams;

      // Build where conditions
      const conditions = [];

      // Text search across multiple fields
      if (search) {
        conditions.push(
          or(
            ilike(scholarships.name, `%${search}%`),
            ilike(scholarships.providerName, `%${search}%`),
            ilike(scholarships.description, `%${search}%`)
          )
        );
      }

      // Filter by provider type (only if not 'all')
      if (providerType && providerType !== 'all') {
        conditions.push(eq(scholarships.providerType, providerType));
      }

      // Filter by provider country
      if (providerCountry) {
        conditions.push(eq(scholarships.providerCountry, providerCountry));
      }

      // Filter by study level (JSON array search)
      if (studyLevel) {
        conditions.push(
          sql`${scholarships.studyLevels} @> ${JSON.stringify([studyLevel])}`
        );
      }

      // Filter by field category (JSON array search)
      if (fieldCategory) {
        conditions.push(
          sql`${scholarships.fieldCategories} @> ${JSON.stringify([fieldCategory])}`
        );
      }

      // Filter by funding type
      if (fundingType) {
        conditions.push(eq(scholarships.fundingType, fundingType));
      }

      // Filter by difficulty level
      if (difficultyLevel) {
        conditions.push(eq(scholarships.difficultyLevel, difficultyLevel));
      }

      // Filter by amount range
      if (minAmount) {
        conditions.push(sql`${scholarships.totalValueMin} >= ${minAmount}`);
      }
      if (maxAmount) {
        conditions.push(sql`${scholarships.totalValueMax} <= ${maxAmount}`);
      }

      // Filter by deadline range
      if (deadlineFrom) {
        conditions.push(sql`${scholarships.applicationDeadline} >= ${deadlineFrom}`);
      }
      if (deadlineTo) {
        conditions.push(sql`${scholarships.applicationDeadline} <= ${deadlineTo}`);
      }

      // Filter by renewable status
      if (renewable !== undefined) {
        conditions.push(eq(scholarships.renewable, renewable));
      }

      // Filter by leadership requirement
      if (leadershipRequired !== undefined) {
        conditions.push(eq(scholarships.leadershipRequired, leadershipRequired));
      }

      // Filter by status (for admin operations, show all if no status filter)
      if (status && status !== 'all') {
        conditions.push(eq(scholarships.status, status));
      }
      // For admin endpoints, don't filter by status unless explicitly requested

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
        .orderBy(desc(scholarships.createdDate))
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

  // Get scholarship by ID (scholarshipId string)
  async getScholarshipById(scholarshipId: string): Promise<Scholarship | null> {
    try {
      const [scholarship] = await db
        .select()
        .from(scholarships)
        .where(eq(scholarships.scholarshipId, scholarshipId));

      return scholarship || null;

    } catch (error) {
      console.error('[ScholarshipStorage] Get by ID error:', error);
      throw new Error('Failed to get scholarship');
    }
  }

  // Get scholarship by numeric ID (for admin routes)
  async getScholarshipByNumericId(id: number): Promise<Scholarship | null> {
    try {
      const [scholarship] = await db
        .select()
        .from(scholarships)
        .where(eq(scholarships.id, id));

      return scholarship || null;

    } catch (error) {
      console.error('[ScholarshipStorage] Get by numeric ID error:', error);
      throw new Error('Failed to get scholarship');
    }
  }

  // Create new scholarship
  async createScholarship(scholarshipData: Partial<Scholarship>): Promise<Scholarship> {
    try {
      const [scholarship] = await db
        .insert(scholarships)
        .values([scholarshipData as any])
        .returning();

      return scholarship;

    } catch (error) {
      console.error('[ScholarshipStorage] Create error:', error);
      throw new Error('Failed to create scholarship');
    }
  }

  // Update scholarship
  async updateScholarship(scholarshipId: string, scholarshipData: Partial<Scholarship>): Promise<Scholarship | null> {
    try {
      const [scholarship] = await db
        .update(scholarships)
        .set({ 
          ...scholarshipData,
          updatedDate: new Date()
        })
        .where(eq(scholarships.scholarshipId, scholarshipId))
        .returning();

      return scholarship || null;

    } catch (error) {
      console.error('[ScholarshipStorage] Update error:', error);
      throw new Error('Failed to update scholarship');
    }
  }

  // Update scholarship by numeric ID (for admin CRUD)
  async updateScholarshipById(id: number, scholarshipData: Partial<Scholarship>): Promise<Scholarship | null> {
    try {
      const [scholarship] = await db
        .update(scholarships)
        .set({ 
          ...scholarshipData,
          updatedDate: new Date()
        })
        .where(eq(scholarships.id, id))
        .returning();

      return scholarship || null;

    } catch (error) {
      console.error('[ScholarshipStorage] Update by ID error:', error);
      throw new Error('Failed to update scholarship');
    }
  }

  // Delete scholarship
  async deleteScholarship(scholarshipId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(scholarships)
        .where(eq(scholarships.scholarshipId, scholarshipId));

      return (result.rowCount || 0) > 0;

    } catch (error) {
      console.error('[ScholarshipStorage] Delete error:', error);
      throw new Error('Failed to delete scholarship');
    }
  }

  // Delete scholarship by numeric ID (for admin CRUD)
  async deleteScholarshipById(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(scholarships)
        .where(eq(scholarships.id, id));

      return (result.rowCount || 0) > 0;

    } catch (error) {
      console.error('[ScholarshipStorage] Delete by ID error:', error);
      throw new Error('Failed to delete scholarship');
    }
  }

  // Get all scholarships with pagination
  async getAllScholarships(limit: number = 50, offset: number = 0): Promise<{ scholarships: Scholarship[], total: number }> {
    try {
      const [totalResult] = await db
        .select({ count: count() })
        .from(scholarships)
        .where(eq(scholarships.status, 'active'));

      const total = totalResult.count;

      const scholarshipResults = await db
        .select()
        .from(scholarships)
        .where(eq(scholarships.status, 'active'))
        .orderBy(desc(scholarships.createdDate))
        .limit(limit)
        .offset(offset);

      return {
        scholarships: scholarshipResults,
        total
      };

    } catch (error) {
      console.error('[ScholarshipStorage] Get all error:', error);
      throw new Error('Failed to get scholarships');
    }
  }

  // Get filter options for the frontend
  async getFilterOptions() {
    try {
      const providerTypes = await db
        .selectDistinct({ providerType: scholarships.providerType })
        .from(scholarships)
        .where(and(
          sql`${scholarships.providerType} IS NOT NULL`,
          eq(scholarships.status, 'active')
        ));

      const countries = await db
        .selectDistinct({ providerCountry: scholarships.providerCountry })
        .from(scholarships)
        .where(and(
          sql`${scholarships.providerCountry} IS NOT NULL`,
          eq(scholarships.status, 'active')
        ));

      const fundingTypes = await db
        .selectDistinct({ fundingType: scholarships.fundingType })
        .from(scholarships)
        .where(and(
          sql`${scholarships.fundingType} IS NOT NULL`,
          eq(scholarships.status, 'active')
        ));

      const difficultyLevels = await db
        .selectDistinct({ difficultyLevel: scholarships.difficultyLevel })
        .from(scholarships)
        .where(and(
          sql`${scholarships.difficultyLevel} IS NOT NULL`,
          eq(scholarships.status, 'active')
        ));

      // Extract unique study levels and field categories from JSON arrays
      const studyLevelsQuery = await db
        .select({ studyLevels: scholarships.studyLevels })
        .from(scholarships)
        .where(and(
          sql`${scholarships.studyLevels} IS NOT NULL`,
          eq(scholarships.status, 'active')
        ));

      const fieldCategoriesQuery = await db
        .select({ fieldCategories: scholarships.fieldCategories })
        .from(scholarships)
        .where(and(
          sql`${scholarships.fieldCategories} IS NOT NULL`,
          eq(scholarships.status, 'active')
        ));

      // Extract unique values from JSON arrays
      const studyLevels = Array.from(new Set(
        studyLevelsQuery
          .flatMap(row => Array.isArray(row.studyLevels) ? row.studyLevels : [])
          .filter(Boolean)
      ));

      const fieldCategories = Array.from(new Set(
        fieldCategoriesQuery
          .flatMap(row => Array.isArray(row.fieldCategories) ? row.fieldCategories : [])
          .filter(Boolean)
      ));

      return {
        providerTypes: providerTypes.map(p => p.providerType).filter((type): type is string => Boolean(type)),
        countries: countries.map(c => c.providerCountry).filter((country): country is string => Boolean(country)),
        studyLevels: studyLevels as string[],
        fieldCategories: fieldCategories as string[],
        fundingTypes: fundingTypes.map(f => f.fundingType).filter((type): type is string => Boolean(type)),
        difficultyLevels: difficultyLevels.map(d => d.difficultyLevel).filter((level): level is string => Boolean(level))
      };

    } catch (error) {
      console.error('[ScholarshipStorage] Filter options error:', error);
      return {
        providerTypes: [],
        countries: [],
        studyLevels: [],
        fieldCategories: [],
        fundingTypes: [],
        difficultyLevels: []
      };
    }
  }

  // Get scholarship statistics
  async getStatistics(): Promise<ScholarshipStatistics> {
    try {
      const [stats] = await db
        .select({
          totalScholarships: count(),
          totalProviders: sql<number>`COUNT(DISTINCT ${scholarships.providerName})`,
          totalCountries: sql<number>`COUNT(DISTINCT ${scholarships.providerCountry})`,
          avgMinValue: sql<number>`AVG(CASE WHEN ${scholarships.totalValueMin} IS NOT NULL THEN ${scholarships.totalValueMin} END)`,
          avgMaxValue: sql<number>`AVG(CASE WHEN ${scholarships.totalValueMax} IS NOT NULL THEN ${scholarships.totalValueMax} END)`,
          totalMinValue: sql<number>`SUM(CASE WHEN ${scholarships.totalValueMin} IS NOT NULL THEN ${scholarships.totalValueMin} END)`,
          totalMaxValue: sql<number>`SUM(CASE WHEN ${scholarships.totalValueMax} IS NOT NULL THEN ${scholarships.totalValueMax} END)`
        })
        .from(scholarships)
        .where(eq(scholarships.status, 'active'));

      const averageAmount = (stats.avgMinValue + stats.avgMaxValue) / 2 || 0;
      const totalFunding = (stats.totalMinValue + stats.totalMaxValue) / 2 || 0;

      return {
        totalScholarships: stats.totalScholarships,
        totalProviders: stats.totalProviders,
        totalCountries: stats.totalCountries,
        averageAmount: Math.round(averageAmount),
        totalFunding: `$${(totalFunding / 1000000).toFixed(1)}M`
      };

    } catch (error) {
      console.error('[ScholarshipStorage] Statistics error:', error);
      throw new Error('Failed to get statistics');
    }
  }
}

export const scholarshipStorage = new ScholarshipStorage();