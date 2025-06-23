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

// Match scholarships based on user profile
router.post("/match", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { filters = {} } = req.body;
    
    console.log(`[Scholarship Matching] Processing request for user ${userId}`);
    
    // Get user profile data
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

    // Enhanced academic level progression logic
    const getEligibleAcademicLevels = (userLevel: string) => {
      const levelMap: { [key: string]: string[] } = {
        'High School': ["Bachelor's Degree", "Foundation Program", "Diploma"],
        "Bachelor's Degree": ["Master's Degree", "Bachelor's Degree", "Postgraduate Diploma", "MBA"],
        "Master's Degree": ["Master's Degree", "PhD", "Doctoral Program", "Postgraduate Research"],
        'PhD': ["PhD", "Postdoctoral Research", "Research Fellowship"]
      };
      return levelMap[userLevel] || [userLevel];
    };

    // Build enhanced matching criteria
    const userAcademicLevel = filters.levelFilter || user.highestQualification;
    const eligibleLevels = getEligibleAcademicLevels(userAcademicLevel);
    
    const matchingCriteria = {
      fieldOfStudy: filters.fieldFilter || user.fieldOfStudy || user.interestedCourse,
      academicLevels: eligibleLevels, // Multiple levels for progression
      preferredCountries: filters.countryFilter ? [filters.countryFilter] : user.preferredCountries || [],
      fundingType: filters.fundingTypeFilter,
      nationality: user.nationality,
      budgetRange: user.budgetRange,
      allowAllCountries: true // Allow scholarships from other countries too
    };

    console.log('[Scholarship Matching] Enhanced Criteria:', matchingCriteria);

    // Enhanced scholarship search with broader criteria
    const searchResults = await scholarshipStorage.searchScholarships({
      search: matchingCriteria.fieldOfStudy || '',
      providerCountry: '', // Allow all countries initially
      fundingType: filters.fundingTypeFilter || '',
      limit: 100, // Increased limit for better matching
      offset: 0
    });

    // Calculate match scores and reasons for each scholarship
    const matchedScholarships = searchResults.scholarships.map(scholarship => {
      const { score, reasons } = calculateMatchScore(scholarship, matchingCriteria);
      
      return {
        ...scholarship,
        matchScore: score,
        matchReasons: reasons
      };
    });

    // Sort by match score (highest first) and take top matches
    const topMatches = matchedScholarships
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);

    res.json({
      success: true,
      scholarships: topMatches,
      totalMatches: topMatches.length,
      userProfile: {
        fieldOfStudy: user.fieldOfStudy || user.interestedCourse,
        academicLevel: user.highestQualification,
        preferredCountries: user.preferredCountries,
        nationality: user.nationality
      }
    });

  } catch (error: any) {
    console.error('[Scholarship Matching] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to match scholarships"
    });
  }
});

// Enhanced match score calculation with academic progression logic
function calculateMatchScore(scholarship: any, criteria: any): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const maxScore = 100;

  // Field of study matching (25 points)
  if (criteria.fieldOfStudy && scholarship.fieldOfStudy) {
    const userField = criteria.fieldOfStudy.toLowerCase();
    const scholarshipFields = Array.isArray(scholarship.fieldOfStudy) 
      ? scholarship.fieldOfStudy 
      : [scholarship.fieldOfStudy];
    
    const hasFieldMatch = scholarshipFields.some((field: string) => 
      field.toLowerCase().includes(userField) || userField.includes(field.toLowerCase())
    );
    
    if (hasFieldMatch) {
      score += 30;
      reasons.push(`Matches your field: ${criteria.fieldOfStudy}`);
    }
  }

  // Enhanced academic level progression matching (30 points)
  if (criteria.academicLevels && scholarship.eligibilityLevel) {
    const eligibilityLevels = Array.isArray(scholarship.eligibilityLevel) 
      ? scholarship.eligibilityLevel 
      : [scholarship.eligibilityLevel];
    
    const hasLevelMatch = eligibilityLevels.some((level: string) => 
      criteria.academicLevels.some((eligibleLevel: string) =>
        level.toLowerCase().includes(eligibleLevel.toLowerCase()) ||
        eligibleLevel.toLowerCase().includes(level.toLowerCase())
      )
    );
    
    if (hasLevelMatch) {
      score += 30;
      const matchedLevel = eligibilityLevels.find((level: string) => 
        criteria.academicLevels.some((eligibleLevel: string) =>
          level.toLowerCase().includes(eligibleLevel.toLowerCase())
        )
      );
      reasons.push(`Academic progression match: ${matchedLevel}`);
    }
  }

  // Enhanced country preference matching (20 points)
  const scholarshipCountries = Array.isArray(scholarship.targetCountries) 
    ? scholarship.targetCountries 
    : [scholarship.providerCountry];
  
  if (criteria.preferredCountries && criteria.preferredCountries.length > 0) {
    const matchingCountries = criteria.preferredCountries.filter((country: string) =>
      scholarshipCountries.some((sCountry: string) => 
        sCountry.toLowerCase().includes(country.toLowerCase())
      )
    );
    
    if (matchingCountries.length > 0) {
      score += 20;
      reasons.push(`Available in ${matchingCountries.join(', ')}`);
    }
  }

  // Funding type preference (15 points)
  if (criteria.fundingType && scholarship.fundingType) {
    if (scholarship.fundingType.toLowerCase().includes(criteria.fundingType.toLowerCase())) {
      score += 15;
      reasons.push(`Matches funding preference: ${criteria.fundingType}`);
    }
  }

  // Base eligibility (10 points for any international program)
  if (scholarship.targetCountries || scholarship.providerCountry !== criteria.nationality) {
    score += 10;
    reasons.push('Open to international students');
  }

  // Ensure minimum score for any scholarship in database
  if (score === 0 && reasons.length === 0) {
    score = 65;
    reasons.push('General eligibility based on profile');
  }

  return { 
    score: Math.min(score, maxScore), 
    reasons: reasons.length > 0 ? reasons : ['Potential match for your profile'] 
  };
}

export { router as scholarshipMatchingRoutes };