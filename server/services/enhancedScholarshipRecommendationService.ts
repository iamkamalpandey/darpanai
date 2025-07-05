import { db } from "../db";
import {
  userScholarships,
  users,
  User,
} from "@shared/schema";
import { scholarships } from "@shared/scholarshipSchema";
import { eq, and, or, gte, lte, inArray, desc, sql, like, arrayContains, isNull } from "drizzle-orm";

export interface EnhancedScholarshipMatch {
  scholarship: any;
  matchScore: number;
  matchReasons: string[];
  strengthAreas: string[];
  improvementAreas: string[];
  personalizedMessage: string;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  applicationDifficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Very Challenging';
  isSaved?: boolean;
}

export class EnhancedScholarshipRecommendationService {
  /**
   * Get enhanced personalized scholarship recommendations with AI-like matching
   */
  async getEnhancedRecommendations(userId: number): Promise<EnhancedScholarshipMatch[]> {
    try {
      // Get comprehensive user profile
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) {
        throw new Error('User not found');
      }

      console.log(`[Enhanced Recommendations] User profile:`, {
        id: user.id,
        field: user.fieldOfStudy,
        countries: user.preferredCountries,
        qualification: user.highestQualification,
        budget: user.estimatedBudget,
        englishTests: user.englishProficiencyTests
      });

      // Get all active scholarships
      const scholarshipList = await db
        .select()
        .from(scholarships)
        .where(eq(scholarships.status, 'active'));

      console.log(`[Enhanced Recommendations] Found ${scholarshipList.length} active scholarships`);

      if (scholarshipList.length === 0) {
        return [];
      }

      // Calculate enhanced match scores
      const matches: EnhancedScholarshipMatch[] = [];
      
      for (const scholarship of scholarshipList) {
        const matchResult = this.calculateEnhancedMatchScore(user, scholarship);
        
        matches.push({
          scholarship,
          matchScore: matchResult.matchScore,
          matchReasons: matchResult.matchReasons,
          strengthAreas: matchResult.strengthAreas,
          improvementAreas: matchResult.improvementAreas,
          personalizedMessage: matchResult.personalizedMessage,
          confidenceLevel: matchResult.confidenceLevel,
          applicationDifficulty: matchResult.applicationDifficulty,
          isSaved: false
        });
      }

      // Sort by match score and filter for meaningful recommendations
      matches.sort((a, b) => b.matchScore - a.matchScore);
      const topMatches = matches.filter(match => match.matchScore >= 30).slice(0, 15);

      // Check saved status
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

      console.log(`[Enhanced Recommendations] Returning ${topMatches.length} enhanced recommendations`);
      return topMatches;
    } catch (error) {
      console.error('Error getting enhanced scholarship recommendations:', error);
      throw error;
    }
  }

  /**
   * Calculate enhanced match score with detailed analysis
   */
  private calculateEnhancedMatchScore(
    user: User,
    scholarship: any
  ): {
    matchScore: number;
    matchReasons: string[];
    strengthAreas: string[];
    improvementAreas: string[];
    personalizedMessage: string;
    confidenceLevel: 'High' | 'Medium' | 'Low';
    applicationDifficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Very Challenging';
  } {
    let score = 0;
    const reasons: string[] = [];
    const strengthAreas: string[] = [];
    const improvementAreas: string[] = [];

    // 1. Field of Study Match (35 points)
    if (user.fieldOfStudy && scholarship.field_categories) {
      const userField = user.fieldOfStudy.toLowerCase();
      const fieldCategories = Array.isArray(scholarship.field_categories) 
        ? scholarship.field_categories 
        : [];
      
      const fieldMatch = fieldCategories.some((category: string) => 
        category.toLowerCase().includes(userField) || 
        userField.includes(category.toLowerCase()) ||
        this.getFieldSynonyms(userField).some(synonym => 
          category.toLowerCase().includes(synonym)
        )
      );

      if (fieldMatch) {
        score += 35;
        reasons.push(`Perfect field alignment with ${user.fieldOfStudy}`);
        strengthAreas.push("Academic Background Match");
      } else if (scholarship.field_categories?.includes('*') || scholarship.field_categories?.includes('All Fields')) {
        score += 20;
        reasons.push("Open to all academic fields");
      } else {
        score += 5;
        improvementAreas.push("Consider related field opportunities");
      }
    }

    // 2. Country Preference Match (25 points)
    if (user.preferredCountries && scholarship.host_countries) {
      const userCountries = Array.isArray(user.preferredCountries) 
        ? user.preferredCountries 
        : [user.preferredCountries];
      const hostCountries = Array.isArray(scholarship.host_countries) 
        ? scholarship.host_countries 
        : [scholarship.host_countries];

      const countryMatch = userCountries.some(country => 
        hostCountries.some(host => 
          host.toLowerCase().includes(country.toLowerCase()) ||
          country.toLowerCase().includes(host.toLowerCase())
        )
      );

      if (countryMatch) {
        score += 25;
        reasons.push(`Available in your preferred country`);
        strengthAreas.push("Geographic Preference");
      } else if (hostCountries.includes('*') || hostCountries.includes('Global')) {
        score += 15;
        reasons.push("Global opportunity");
      } else {
        score += 5;
        improvementAreas.push("Explore new study destinations");
      }
    }

    // 3. Academic Level Match (20 points)
    if (user.highestQualification && scholarship.study_levels) {
      const userLevel = user.highestQualification.toLowerCase();
      const studyLevels = Array.isArray(scholarship.study_levels) 
        ? scholarship.study_levels 
        : [scholarship.study_levels];

      const levelMatch = this.checkLevelCompatibility(userLevel, studyLevels);
      
      if (levelMatch.perfect) {
        score += 20;
        reasons.push(`Ideal for ${user.highestQualification} graduates`);
        strengthAreas.push("Education Level Match");
      } else if (levelMatch.compatible) {
        score += 12;
        reasons.push(`Compatible with your education level`);
      } else {
        improvementAreas.push("Consider qualification requirements");
      }
    }

    // 4. Budget Compatibility (15 points)
    if (scholarship.fundingType) {
      const fundingType = scholarship.fundingType.toLowerCase();
      if (fundingType.includes('full') || fundingType.includes('100%')) {
        score += 15;
        reasons.push("Full funding coverage");
        strengthAreas.push("Financial Support");
      } else if (fundingType.includes('partial')) {
        score += 10;
        reasons.push("Partial funding available");
      } else {
        score += 5;
      }
    }

    // 5. Academic Background (10 points)
    if (user.academicBackground && scholarship.minimumGpa) {
      // Estimate GPA based on academic background description
      score += 6;
      reasons.push("Strong academic background");
      strengthAreas.push("Academic Achievement");
    }

    // 6. English Proficiency (5 points)
    if (user.englishProficiencyTests && scholarship.languageRequirements) {
      const tests = user.englishProficiencyTests;
      if (tests && tests.length > 0) {
        score += 5;
        strengthAreas.push("Language Proficiency");
        reasons.push("Has English proficiency test scores");
      }
    }

    // Generate personalized message
    const personalizedMessage = this.generatePersonalizedMessage(user, scholarship, score, strengthAreas);
    
    // Determine confidence level
    const confidenceLevel = score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low';
    
    // Determine application difficulty
    const applicationDifficulty = this.determineApplicationDifficulty(scholarship, score);

    return {
      matchScore: Math.min(score, 100),
      matchReasons: reasons,
      strengthAreas,
      improvementAreas,
      personalizedMessage,
      confidenceLevel,
      applicationDifficulty
    };
  }

  private getFieldSynonyms(field: string): string[] {
    const synonyms: { [key: string]: string[] } = {
      'computer science': ['information technology', 'software engineering', 'programming', 'computing'],
      'business': ['management', 'administration', 'commerce', 'entrepreneurship'],
      'engineering': ['technology', 'technical', 'applied sciences'],
      'medicine': ['health', 'medical', 'healthcare', 'biomedical'],
      'education': ['teaching', 'pedagogy', 'learning sciences'],
      'arts': ['humanities', 'liberal arts', 'creative', 'fine arts']
    };
    
    return synonyms[field.toLowerCase()] || [];
  }

  private checkLevelCompatibility(userLevel: string, scholarshipLevels: string[]): {
    perfect: boolean;
    compatible: boolean;
  } {
    const level = userLevel.toLowerCase();
    const levels = scholarshipLevels.map(l => l.toLowerCase());
    
    // Perfect matches
    if (level.includes('bachelor') && levels.some(l => l.includes('master') || l.includes('graduate'))) {
      return { perfect: true, compatible: true };
    }
    if (level.includes('master') && levels.some(l => l.includes('phd') || l.includes('doctoral'))) {
      return { perfect: true, compatible: true };
    }
    
    // Compatible matches
    if (levels.some(l => l.includes('any') || l.includes('all'))) {
      return { perfect: false, compatible: true };
    }
    
    return { perfect: false, compatible: false };
  }

  private generatePersonalizedMessage(user: User, scholarship: any, score: number, strengthAreas: string[]): string {
    const userName = user.firstName || user.username || 'Student';
    const field = user.fieldOfStudy || 'your field';
    
    if (score >= 90) {
      return `Excellent match, ${userName}! This ${scholarship.name} scholarship is perfectly aligned with your ${field} background and career goals.`;
    } else if (score >= 70) {
      return `Great opportunity, ${userName}! Your ${field} experience makes you a strong candidate for this ${scholarship.name} program.`;
    } else if (score >= 50) {
      return `Promising match, ${userName}. Consider this ${scholarship.name} opportunity as it offers good potential for your ${field} studies.`;
    } else {
      return `Worth exploring, ${userName}. While this ${scholarship.name} may require additional preparation, it could open new opportunities in ${field}.`;
    }
  }

  private determineApplicationDifficulty(scholarship: any, score: number): 'Easy' | 'Moderate' | 'Challenging' | 'Very Challenging' {
    // Base difficulty on scholarship competitiveness indicators
    const competitivenessFactors = [
      scholarship.fundingType?.toLowerCase().includes('full'),
      scholarship.providerType?.toLowerCase().includes('government'),
      scholarship.minimumGpa && parseFloat(scholarship.minimumGpa) > 3.5,
      scholarship.name?.toLowerCase().includes('prestigious') || scholarship.name?.toLowerCase().includes('excellence')
    ].filter(Boolean).length;

    if (score >= 80 && competitivenessFactors <= 1) return 'Easy';
    if (score >= 60 && competitivenessFactors <= 2) return 'Moderate';
    if (score >= 40 || competitivenessFactors <= 3) return 'Challenging';
    return 'Very Challenging';
  }

  /**
   * Get user's saved scholarships
   */
  async getSavedScholarships(userId: number): Promise<any[]> {
    try {
      const savedScholarships = await db
        .select({
          id: scholarships.id,
          name: scholarships.name,
          providerName: scholarships.providerName,
          fundingType: scholarships.fundingType,
          fundingAmount: scholarships.fundingAmount,
          deadline: scholarships.applicationDeadline,
          status: scholarships.status
        })
        .from(userScholarships)
        .innerJoin(scholarships, eq(userScholarships.scholarshipId, scholarships.id))
        .where(eq(userScholarships.userId, userId));

      return savedScholarships;
    } catch (error) {
      console.error('Error getting saved scholarships:', error);
      return [];
    }
  }
}

export const enhancedScholarshipRecommendationService = new EnhancedScholarshipRecommendationService();