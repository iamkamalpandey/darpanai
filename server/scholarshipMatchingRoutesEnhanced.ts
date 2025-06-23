import { Router, Request, Response } from "express";
import { scholarshipStorage } from "./scholarshipStorage";

const router = Router();

// Auth middleware
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};

// Enhanced academic level progression with stricter filtering
const getEligibleAcademicLevels = (userLevel: string): string[] => {
  const levelHierarchy: { [key: string]: string[] } = {
    'High School': ["Diploma", "Bachelor's Degree"],
    'Diploma': ["Diploma", "Bachelor's Degree", "Master's Degree"], 
    "Bachelor's Degree": ["Bachelor's Degree", "Master's Degree", "PhD"],
    "Master's Degree": ["Master's Degree", "PhD", "Postdoctoral Research"],
    'PhD': ["PhD", "Postdoctoral Research"]
  };
  
  return levelHierarchy[userLevel] || [];
};

// Get available filter options based on user qualification
const getAvailableFilters = (userLevel: string, userProfile: any) => {
  const eligibleLevels = getEligibleAcademicLevels(userLevel);
  
  return {
    academicLevels: eligibleLevels,
    fieldsOfStudy: [
      userProfile.fieldOfStudy,
      userProfile.interestedCourse,
      ...(userProfile.preferredCourses || [])
    ].filter(Boolean),
    countries: userProfile.preferredCountries || [],
    canFilterByLevel: eligibleLevels.length > 1,
    canFilterByField: Boolean(userProfile.fieldOfStudy || userProfile.interestedCourse)
  };
};

// Stricter field relevance matching
const isFieldRelevant = (scholarshipFields: string[], userFields: string[]): boolean => {
  if (!userFields.length || !scholarshipFields.length) return false;
  
  const normalizeField = (field: string) => field.toLowerCase().trim();
  const userFieldsNormalized = userFields.map(normalizeField);
  const scholarshipFieldsNormalized = scholarshipFields.map(normalizeField);
  
  // Direct match or substantial overlap
  return scholarshipFieldsNormalized.some(sField => 
    userFieldsNormalized.some(uField => 
      sField.includes(uField) || uField.includes(sField) ||
      // Handle common field mappings
      (sField.includes('computer') && uField.includes('computer')) ||
      (sField.includes('engineering') && uField.includes('engineering')) ||
      (sField.includes('business') && uField.includes('management')) ||
      (sField.includes('medicine') && uField.includes('medical'))
    )
  );
};

// Stricter academic level matching
const isAcademicLevelEligible = (scholarshipLevels: string[], eligibleLevels: string[]): boolean => {
  if (!scholarshipLevels.length || !eligibleLevels.length) return false;
  
  const normalizeLevels = (levels: string[]) => 
    levels.map(level => level.toLowerCase().trim());
  
  const scholarshipLevelsNorm = normalizeLevels(scholarshipLevels);
  const eligibleLevelsNorm = normalizeLevels(eligibleLevels);
  
  return scholarshipLevelsNorm.some(sLevel => 
    eligibleLevelsNorm.some(eLevel => {
      // Direct matching
      if (sLevel.includes(eLevel.toLowerCase()) || eLevel.toLowerCase().includes(sLevel)) {
        return true;
      }
      
      // Specific mappings
      const levelMappings = [
        { scholarship: ['masters', 'master'], eligible: ['master\'s degree', 'master'] },
        { scholarship: ['bachelor', 'undergraduate'], eligible: ['bachelor\'s degree', 'bachelor'] },
        { scholarship: ['phd', 'doctorate', 'doctoral'], eligible: ['phd', 'doctorate'] },
        { scholarship: ['diploma', 'certificate'], eligible: ['diploma'] }
      ];
      
      return levelMappings.some(mapping => 
        mapping.scholarship.some(s => sLevel.includes(s)) &&
        mapping.eligible.some(e => eLevel.includes(e))
      );
    })
  );
};

// Enhanced deadline filtering
const isDeadlineValid = (deadline: string): boolean => {
  if (!deadline) return false;
  
  const deadlineDate = new Date(deadline);
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Start of today
  
  return deadlineDate >= currentDate;
};

// Enhanced scoring algorithm
function calculateEnhancedMatchScore(
  scholarship: any, 
  criteria: {
    userFields: string[];
    eligibleLevels: string[];
    userCountries: string[];
    userNationality: string;
    fundingPreference?: string;
  }
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Perfect field match (40 points)
  const scholarshipFields = [
    ...(Array.isArray(scholarship.fieldCategories) ? scholarship.fieldCategories : [scholarship.fieldCategories]),
    ...(Array.isArray(scholarship.specificFields) ? scholarship.specificFields : [scholarship.specificFields])
  ].filter(Boolean);
  
  if (criteria.userFields.length > 0 && scholarshipFields.length > 0) {
    const exactMatch = scholarshipFields.some((sField: string) => 
      criteria.userFields.some(uField => 
        sField.toLowerCase() === uField.toLowerCase()
      )
    );
    
    const partialMatch = isFieldRelevant(scholarshipFields, criteria.userFields);
    
    if (exactMatch) {
      score += 40;
      reasons.push('Perfect field match');
    } else if (partialMatch) {
      score += 25;
      reasons.push('Related field match');
    }
  }

  // Academic level appropriateness (30 points)
  const scholarshipLevels = Array.isArray(scholarship.studyLevels) 
    ? scholarship.studyLevels 
    : [scholarship.studyLevels].filter(Boolean);
  
  if (isAcademicLevelEligible(scholarshipLevels, criteria.eligibleLevels)) {
    score += 30;
    reasons.push(`Matches your academic progression`);
  }

  // Country preference (20 points)
  const scholarshipCountries = [
    ...(Array.isArray(scholarship.hostCountries) ? scholarship.hostCountries : [scholarship.hostCountries]),
    ...(Array.isArray(scholarship.eligibleCountries) ? scholarship.eligibleCountries : [scholarship.eligibleCountries])
  ].filter(Boolean);
  
  if (criteria.userCountries.length > 0) {
    const countryMatch = scholarshipCountries.some((sCountry: string) =>
      criteria.userCountries.some(uCountry => 
        sCountry && sCountry.toLowerCase().includes(uCountry.toLowerCase())
      )
    );
    
    if (countryMatch) {
      score += 20;
      reasons.push('Preferred country match');
    }
  }

  // Funding type preference (10 points)
  if (criteria.fundingPreference) {
    const fundingType = scholarship.fundingType;
    if (fundingType && fundingType.toLowerCase().includes(criteria.fundingPreference.toLowerCase())) {
      score += 10;
      reasons.push(`${criteria.fundingPreference} funding`);
    }
  }

  // Deadline urgency bonus (bonus points for deadlines within 3 months)
  const deadline = new Date(scholarship.applicationDeadline);
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  
  if (deadline <= threeMonthsFromNow) {
    score += 5;
    reasons.push('Deadline approaching soon');
  }

  return { score, reasons };
}

// Enhanced match endpoint with intelligent filtering
router.post("/match-enhanced", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { filters = {} } = req.body;
    
    console.log(`[Enhanced Scholarship Matching] Processing for user ${userId}`);
    
    // Get user profile
    const { db } = await import('./db');
    const { users } = await import('../shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User profile not found"
      });
    }

    const userAcademicLevel = user.highestQualification || "Bachelor's Degree";
    const eligibleLevels = getEligibleAcademicLevels(userAcademicLevel);
    const availableFilters = getAvailableFilters(userAcademicLevel, user);
    
    // Validate that user can't access filters below their level
    if (filters.levelFilter && !eligibleLevels.includes(filters.levelFilter)) {
      return res.status(400).json({
        success: false,
        error: "Invalid academic level filter for your qualification"
      });
    }

    // Build user field preferences with null safety
    const userFields = [
      user.fieldOfStudy,
      user.interestedCourse
    ].filter((field): field is string => Boolean(field));

    // Enhanced search with stricter criteria and proper country mapping
    const countryFilter = filters.countryFilter || (user.preferredCountries && user.preferredCountries.length > 0 ? user.preferredCountries[0] : undefined);
    
    const searchResults = await scholarshipStorage.searchScholarshipsWithIntelligentFilters({
      search: filters.searchQuery || '',
      eligibleLevels: eligibleLevels,
      userBachelorField: user.fieldOfStudy || '',
      userPreferredCourses: userFields,
      currentDate: new Date().toISOString().split('T')[0],
      fundingType: filters.fundingTypeFilter || undefined,
      nationality: user.nationality || '',
      countryFilter: countryFilter,
      limit: 50, // Get more for better filtering
      offset: 0
    });

    console.log(`[Enhanced Matching] Raw results: ${searchResults.scholarships?.length || 0}`);

    // Apply strict filtering logic
    const strictlyFilteredScholarships = searchResults.scholarships.filter((scholarship: any) => {
      // 1. Mandatory deadline check
      if (!isDeadlineValid(scholarship.applicationDeadline)) {
        return false;
      }

      // 2. Strict academic level progression
      const scholarshipLevels = Array.isArray(scholarship.studyLevels) 
        ? scholarship.studyLevels 
        : [scholarship.studyLevels].filter(Boolean);
      
      if (!isAcademicLevelEligible(scholarshipLevels, eligibleLevels)) {
        return false;
      }

      // 3. Field relevance check (if user has specified field preferences)
      if (userFields.length > 0) {
        const scholarshipFields = [
          ...(Array.isArray(scholarship.fieldCategories) ? scholarship.fieldCategories : [scholarship.fieldCategories]),
          ...(Array.isArray(scholarship.specificFields) ? scholarship.specificFields : [scholarship.specificFields])
        ].filter(Boolean);
        
        if (scholarshipFields.length > 0 && !isFieldRelevant(scholarshipFields, userFields)) {
          return false;
        }
      }

      // 4. Apply additional filters if specified
      if (filters.countryFilter) {
        const scholarshipCountries = [
          ...(Array.isArray(scholarship.hostCountries) ? scholarship.hostCountries : [scholarship.hostCountries]),
          ...(Array.isArray(scholarship.eligibleCountries) ? scholarship.eligibleCountries : [scholarship.eligibleCountries]),
          scholarship.providerCountry
        ].filter(Boolean);
        
        const hasCountryMatch = scholarshipCountries.some((country: string) => 
          country && country.toLowerCase().includes(filters.countryFilter.toLowerCase())
        );
        
        if (!hasCountryMatch) return false;
      }

      if (filters.fundingTypeFilter) {
        const fundingType = scholarship.fundingType;
        if (!fundingType || !fundingType.toLowerCase().includes(filters.fundingTypeFilter.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    // Enhanced scoring with stricter criteria
    const scoredScholarships = strictlyFilteredScholarships.map((scholarship: any) => {
      const { score, reasons } = calculateEnhancedMatchScore(scholarship, {
        userFields,
        eligibleLevels,
        userCountries: user.preferredCountries || [],
        userNationality: user.nationality,
        fundingPreference: filters.fundingTypeFilter
      });
      
      return {
        ...scholarship,
        matchScore: score,
        matchReasons: reasons,
        eligibilityReason: `Suitable for ${userAcademicLevel} graduates`
      };
    });

    // Sort by relevance and limit results
    const finalResults = scoredScholarships
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, 20);

    console.log(`[Enhanced Matching] Final results: ${finalResults.length} scholarships`);

    const response = {
      success: true,
      scholarships: finalResults,
      totalMatches: finalResults.length,
      availableFilters,
      userProfile: {
        academicLevel: user.highestQualification,
        eligibleLevels,
        fieldOfStudy: user.fieldOfStudy,
        interestedFields: userFields,
        preferredCountries: user.preferredCountries,
        nationality: user.nationality
      },
      appliedFilters: {
        academicLevels: eligibleLevels,
        deadline: `After ${new Date().toISOString().split('T')[0]}`,
        fieldRelevance: userFields.length > 0 ? 'Applied' : 'Not applied',
        additionalFilters: Object.keys(filters).length
      }
    };

    res.json(response);

  } catch (error: any) {
    console.error('[Enhanced Scholarship Matching] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to match scholarships"
    });
  }
});

export default router;