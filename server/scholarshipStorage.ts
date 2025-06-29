import { db } from "./db";
import { scholarships } from "@shared/scholarshipSchema";
import { eq, ilike, or, and, desc, count, sql } from "drizzle-orm";
import type { ScholarshipSearch, Scholarship, ScholarshipSearchResponse, ScholarshipStatistics, ScholarshipFilterOptions } from "@shared/scholarshipSchema";

export class ScholarshipStorage {
  
  // Intelligent scholarship search with mandatory filtering system
  async searchScholarshipsWithIntelligentFilters(params: {
    search: string;
    eligibleLevels: string[];
    userBachelorField?: string;
    userPreferredCourses: string[];
    currentDate: string;
    fundingType?: string;
    nationality?: string;
    countryFilter?: string;
    limit: number;
    offset: number;
  }): Promise<ScholarshipSearchResponse> {
    try {
      const { 
        search, 
        eligibleLevels, 
        userBachelorField, 
        userPreferredCourses, 
        currentDate, 
        fundingType, 
        nationality,
        countryFilter,
        limit, 
        offset 
      } = params;

      // Mandatory filters - always applied
      const mandatoryConditions = [
        // Deadline filter: exclude scholarships with deadlines before current date
        sql`${scholarships.applicationDeadline} > ${currentDate}`
      ];
      
      // Academic level filter: strict progressive qualification matching
      if (eligibleLevels.length > 0) {
        // Create level mapping for proper filtering
        const levelMappings: { [key: string]: string[] } = {
          "Bachelor's Degree": ["bachelor", "undergraduate"],
          "Master's Degree": ["master", "masters", "postgraduate"],
          "PhD": ["phd", "doctorate", "doctoral"],
          "Diploma": ["diploma", "certificate"],
          "Postdoctoral Research": ["postdoc", "postdoctoral"]
        };
        
        const allowedScholarshipLevels: string[] = [];
        eligibleLevels.forEach(userLevel => {
          const mappedLevels = levelMappings[userLevel] || [userLevel.toLowerCase()];
          allowedScholarshipLevels.push(...mappedLevels);
        });
        
        // Only include scholarships that contain ONLY the user's eligible levels
        // This prevents PhD scholarships from appearing for Bachelor's degree holders
        if (allowedScholarshipLevels.length > 0) {
          const levelConditions = allowedScholarshipLevels.map(level => 
            sql`${scholarships.studyLevels}::text ILIKE ${'%' + level + '%'}`
          );
          
          // Additional check: exclude scholarships with levels above user's progression
          const excludeConditions: any[] = [];
          if (eligibleLevels.includes("Bachelor's Degree") && !eligibleLevels.includes("PhD")) {
            // Bachelor's degree holders should not see PhD scholarships
            excludeConditions.push(
              sql`NOT (${scholarships.studyLevels}::text ILIKE '%phd%' OR ${scholarships.studyLevels}::text ILIKE '%doctorate%')`
            );
          }
          
          const finalLevelCondition = excludeConditions.length > 0 
            ? and(or(...levelConditions)!, ...excludeConditions)
            : or(...levelConditions)!;
            
          mandatoryConditions.push(finalLevelCondition);
        }
      }

      // Course relevance filter
      const courseRelevanceConditions = [];
      if (userBachelorField) {
        courseRelevanceConditions.push(
          sql`${scholarships.fieldCategories}::text ILIKE ${'%' + userBachelorField + '%'}`
        );
      }
      if (userPreferredCourses.length > 0) {
        userPreferredCourses.forEach(course => {
          courseRelevanceConditions.push(
            or(
              sql`${scholarships.fieldCategories}::text ILIKE ${'%' + course + '%'}`,
              ilike(scholarships.description, `%${course}%`)
            )
          );
        });
      }

      // Optional filters
      const optionalConditions = [];
      if (fundingType && fundingType !== 'all') {
        optionalConditions.push(eq(scholarships.fundingType, fundingType));
      }

      // CRITICAL: Country filtering by hostCountries (where students actually study)
      // ALSO include scholarships with wildcard "*" eligibility (open to all countries)
      if (countryFilter && countryFilter !== 'all') {
        console.log('[ScholarshipStorage] Applying country filter:', countryFilter);
        
        // Enhanced country mapping for filter values - critical for Australia bug fix
        const countryMapping: { [key: string]: string[] } = {
          'Australia': ['AU', 'AUS', 'Australia'],
          'United States': ['US', 'USA', 'United States', 'America'], 
          'United Kingdom': ['GB', 'UK', 'United Kingdom', 'Britain'],
          'Canada': ['CA', 'CAN', 'Canada'],
          'Germany': ['DE', 'DEU', 'Germany'],
          'New Zealand': ['NZ', 'New Zealand'],
          'Netherlands': ['NL', 'Netherlands'],
          'Belgium': ['BE', 'Belgium'],
          'Denmark': ['DK', 'Denmark'],
          'Sweden': ['SE', 'Sweden'],
          'Finland': ['FI', 'Finland'],
          'Norway': ['NO', 'Norway'],
          'Switzerland': ['CH', 'Switzerland'],
          'France': ['FR', 'France'],
          'Italy': ['IT', 'Italy'],
          'Spain': ['ES', 'Spain'],
          'Japan': ['JP', 'Japan'],
          'Singapore': ['SG', 'Singapore'],
          'China': ['CN', 'China'],
          'India': ['IN', 'India'],
          'Brazil': ['BR', 'Brazil'],
          'Mexico': ['MX', 'Mexico']
        };
        
        const searchCountries = countryMapping[countryFilter] || [countryFilter];
        
        // CRITICAL FIX: Include both hostCountries AND scholarships with wildcard eligibility
        const countryConditions = [
          // Match by hostCountries (where students study)
          ...searchCountries.map(country => 
            sql`${scholarships.hostCountries}::text ILIKE ${'%' + country + '%'}`
          ),
          // ALSO include scholarships open to all countries (wildcard "*")
          sql`${scholarships.eligibleCountries}::text ILIKE '%*%'`
        ];
        
        if (countryConditions.length > 0) {
          mandatoryConditions.push(or(...countryConditions)!);
        }
      }

      // Build final conditions
      const allConditions = [
        ...mandatoryConditions,
        ...(courseRelevanceConditions.length > 0 ? [or(...courseRelevanceConditions)] : []),
        ...optionalConditions
      ];

      // Execute query with relevance scoring
      const whereClause = allConditions.length > 0 ? and(...allConditions) : undefined;
      
      const results = await db
        .select()
        .from(scholarships)
        .where(whereClause)
        .orderBy(
          desc(scholarships.applicationDeadline), // Closest deadlines first
          desc(scholarships.totalValueMax) // Higher value scholarships first
        )
        .limit(limit)
        .offset(offset);

      // Count total matching scholarships
      const totalCountQuery = await db
        .select({ count: count() })
        .from(scholarships)
        .where(whereClause);

      const totalScholarships = totalCountQuery[0]?.count || 0;

      // Calculate relevance scores
      const scholarshipsWithScore = results.map(scholarship => ({
        ...scholarship,
        matchScore: this.calculateRelevanceScore(scholarship, {
          userBachelorField,
          userPreferredCourses,
          eligibleLevels
        })
      }));

      return {
        scholarships: scholarshipsWithScore,
        total: totalScholarships,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalScholarships / limit),
        filters: {
          providerTypes: [],
          countries: [],
          studyLevels: eligibleLevels,
          fieldCategories: userBachelorField ? [userBachelorField] : [],
          fundingTypes: fundingType ? [fundingType] : [],
          difficultyLevels: []
        }
      };

    } catch (error) {
      console.error('[ScholarshipStorage] Error in intelligent search:', error);
      throw new Error(`Failed to search scholarships: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Calculate relevance score for scholarship matching
  private calculateRelevanceScore(
    scholarship: any, 
    userContext: {
      userBachelorField?: string;
      userPreferredCourses: string[];
      eligibleLevels: string[];
    }
  ): number {
    let score = 70; // Base score

    // Field relevance scoring (30 points max)
    if (userContext.userBachelorField) {
      const fieldMatch = scholarship.fieldCategory?.toLowerCase().includes(userContext.userBachelorField.toLowerCase());
      if (fieldMatch) score += 20;
    }

    // Preferred course matching (15 points max)
    userContext.userPreferredCourses.forEach(course => {
      const courseMatch = scholarship.fieldCategory?.toLowerCase().includes(course.toLowerCase()) ||
                         scholarship.description?.toLowerCase().includes(course.toLowerCase());
      if (courseMatch) score += 8;
    });

    // Academic level exact match (10 points max)
    if (userContext.eligibleLevels.includes(scholarship.studyLevel)) {
      score += 10;
    }

    // Funding value bonus (5 points max)
    if (scholarship.totalValueMax && parseInt(scholarship.totalValueMax) > 10000) {
      score += 5;
    }

    return Math.min(100, Math.max(70, score));
  }
  
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

      // Filter by provider country (only if not 'all')
      if (providerCountry && providerCountry !== 'all') {
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

  // Alias method for CSV import compatibility
  async getScholarshipByScholarshipId(scholarshipId: string): Promise<Scholarship | null> {
    return this.getScholarshipById(scholarshipId);
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

  // Get all scholarships with pagination (admin version - includes all statuses)
  async getAllScholarships(limit: number = 1000, offset: number = 0): Promise<{ scholarships: Scholarship[], total: number }> {
    try {
      const [totalResult] = await db
        .select({ count: count() })
        .from(scholarships);

      const total = totalResult.count;

      const scholarshipResults = await db
        .select()
        .from(scholarships)
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

  // Bulk create scholarships from import
  async bulkCreateScholarships(scholarshipData: Partial<Scholarship>[]): Promise<{ imported: number, errors: string[] }> {
    try {
      const imported = [];
      const errors = [];

      for (const data of scholarshipData) {
        try {
          // Validate required fields
          if (!data.scholarshipId || !data.name || !data.providerName) {
            errors.push(`Missing required fields for row: ${data.name || 'unknown'}`);
            continue;
          }

          // Check for duplicates by scholarshipId
          try {
            const existingScholarships = await db
              .select()
              .from(scholarships)
              .where(eq(scholarships.scholarshipId, data.scholarshipId))
              .limit(1);
            
            if (existingScholarships.length > 0) {
              errors.push(`Scholarship ID already exists: ${data.scholarshipId}`);
              continue;
            }
          } catch (checkError) {
            errors.push(`Error checking duplicate for ${data.scholarshipId}`);
            continue;
          }

          // Create scholarship
          const created = await this.createScholarship(data);
          if (created) {
            imported.push(created);
          }
        } catch (error: any) {
          errors.push(`Error importing ${data.scholarshipId}: ${error.message}`);
        }
      }

      return {
        imported: imported.length,
        errors
      };
    } catch (error) {
      console.error('[ScholarshipStorage] Bulk create error:', error);
      throw new Error('Failed to bulk import scholarships');
    }
  }

  // Get filter options for the frontend
  async getFilterOptions(): Promise<ScholarshipFilterOptions> {
    try {
      const providerTypes = await db
        .selectDistinct({ providerType: scholarships.providerType })
        .from(scholarships)
        .where(and(
          sql`${scholarships.providerType} IS NOT NULL`,
          eq(scholarships.status, 'active')
        ));

      // Get countries from standardized countries table with currency codes and ISO codes
      const countries = await db.execute(sql`
        SELECT DISTINCT 
          c.iso_alpha2 as code,
          c.country_name as name,
          c.currency_code,
          c.currency_name
        FROM countries c
        INNER JOIN scholarships s ON c.iso_alpha2 = s.provider_country
        WHERE c.is_active = 1 AND s.status = 'active'
        ORDER BY c.country_name
      `);

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

      // Country code to name mapping for better UX
      const countryNames: { [key: string]: string } = {
        'AU': 'Australia',
        'US': 'United States', 
        'GB': 'United Kingdom',
        'EU': 'European Union'
      };

      // Map countries from database result with proper typing and currency symbols
      const countryList = (countries.rows || []).map((row: any) => ({
        code: row.code as string,
        name: row.name as string,
        currencyCode: row.currency_code as string,
        currencyName: row.currency_name as string,
        currencySymbol: this.getCurrencySymbol(row.currency_code)
      }));

      return {
        providerTypes: providerTypes.map(p => p.providerType).filter((type): type is string => Boolean(type)),
        countries: countryList,
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
      } as ScholarshipFilterOptions;
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

  // Get currency symbol from currency code
  private getCurrencySymbol(currencyCode?: string | null): string {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$', 'AUD': '$', 'CAD': '$', 'NZD': '$',
      'GBP': '£', 'EUR': '€', 'JPY': '¥', 'CNY': '¥',
      'INR': '₹', 'KRW': '₩', 'SGD': 'S$', 'HKD': 'HK$',
      'CHF': 'Fr', 'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr'
    };
    
    return currencySymbols[currencyCode || ''] || '';
  }
}

export const scholarshipStorage = new ScholarshipStorage();