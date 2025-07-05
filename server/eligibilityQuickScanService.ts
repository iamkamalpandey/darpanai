import { db } from "./db";
import { users, scholarshipPrograms } from "@shared/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

// DeepSeek AI configuration (primary)
const deepSeek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

// OpenAI fallback configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface EligibilityResult {
  scholarshipId: number;
  scholarshipName: string;
  eligibilityScore: number;
  eligibilityStatus: 'highly-eligible' | 'eligible' | 'partially-eligible' | 'not-eligible';
  matchedCriteria: string[];
  missingRequirements: string[];
  recommendations: string[];
  fundingAmount: string;
  deadline: string;
  applicationUrl: string;
}

export interface QuickScanResult {
  totalScholarships: number;
  eligibleScholarships: number;
  highlyEligibleScholarships: number;
  totalPotentialFunding: string;
  scanCompletedAt: string;
  profileCompleteness: number;
  results: EligibilityResult[];
  improvementSuggestions: string[];
}

export class EligibilityQuickScanService {
  
  async performQuickScan(userId: number): Promise<QuickScanResult> {
    console.log(`[Eligibility Quick Scan] Starting AI-enhanced scan for user ${userId}`);
    
    // Get user profile
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error('User not found');
    }

    // Get all active scholarships
    const scholarships = await db.select().from(scholarshipPrograms).where(eq(scholarshipPrograms.isActive, true));
    
    // Perform basic rule-based analysis first
    const basicResults: EligibilityResult[] = [];
    let totalPotentialFunding = 0;
    
    for (const scholarship of scholarships) {
      const eligibilityAnalysis = this.analyzeEligibility(user, scholarship);
      basicResults.push(eligibilityAnalysis);
      
      if (eligibilityAnalysis.eligibilityStatus !== 'not-eligible') {
        totalPotentialFunding += scholarship.amountMax || scholarship.amountMin || 0;
      }
    }

    // Enhanced AI analysis for top eligible scholarships (resource optimization)
    const topCandidates = basicResults
      .filter(r => r.eligibilityScore >= 40) // Only analyze promising candidates
      .slice(0, 5); // Limit to top 5 to conserve resources

    const enhancedResults = topCandidates.length > 0 
      ? await this.performAIEnhancedAnalysis(user, topCandidates, scholarships)
      : basicResults;

    // Merge enhanced results with basic results
    const finalResults = basicResults.map(basicResult => {
      const enhanced = enhancedResults.find(e => e.scholarshipId === basicResult.scholarshipId);
      return enhanced || basicResult;
    });

    // Calculate summary statistics
    const eligibleScholarships = finalResults.filter(r => r.eligibilityStatus !== 'not-eligible').length;
    const highlyEligibleScholarships = finalResults.filter(r => r.eligibilityStatus === 'highly-eligible').length;
    
    // Calculate profile completeness
    const profileCompleteness = this.calculateProfileCompleteness(user);
    
    // Generate AI-enhanced improvement suggestions
    const improvementSuggestions = await this.generateAIImprovementSuggestions(user, finalResults);
    
    // Sort results by eligibility score
    finalResults.sort((a, b) => b.eligibilityScore - a.eligibilityScore);

    console.log(`[Eligibility Quick Scan] Completed scan for user ${userId}: ${eligibleScholarships}/${finalResults.length} eligible scholarships`);

    return {
      totalScholarships: scholarships.length,
      eligibleScholarships,
      highlyEligibleScholarships,
      totalPotentialFunding: this.formatCurrency(totalPotentialFunding),
      scanCompletedAt: new Date().toISOString(),
      profileCompleteness,
      results: finalResults,
      improvementSuggestions,
    };
  }

  private analyzeEligibility(user: any, scholarship: any): EligibilityResult {
    const matchedCriteria: string[] = [];
    const missingRequirements: string[] = [];
    const recommendations: string[] = [];
    let score = 0;

    // Study Level Match (30 points)
    if (scholarship.levelOfStudy && user.studyLevel) {
      const userLevel = user.studyLevel.toLowerCase();
      const scholarshipLevels = scholarship.levelOfStudy.map((level: string) => level.toLowerCase());
      
      if (scholarshipLevels.some((level: string) => 
        level.includes(userLevel) || userLevel.includes(level) || 
        (userLevel.includes('master') && level.includes('master')) ||
        (userLevel.includes('bachelor') && level.includes('bachelor')) ||
        (userLevel.includes('phd') && level.includes('phd'))
      )) {
        matchedCriteria.push('Study Level Match');
        score += 30;
      } else {
        missingRequirements.push('Study level requirement');
        recommendations.push(`This scholarship requires: ${scholarship.levelOfStudy.join(', ')}`);
      }
    }

    // Field of Study Match (25 points)
    if (scholarship.fieldsOfStudy && user.fieldOfStudy) {
      const userField = user.fieldOfStudy.toLowerCase();
      const scholarshipFields = scholarship.fieldsOfStudy.map((field: string) => field.toLowerCase());
      
      if (scholarshipFields.includes('all fields of study') || 
          scholarshipFields.some((field: string) => 
            field.includes(userField) || userField.includes(field)
          )) {
        matchedCriteria.push('Field of Study');
        score += 25;
      } else {
        missingRequirements.push('Field of study requirement');
        recommendations.push(`Consider programs in: ${scholarship.fieldsOfStudy.join(', ')}`);
      }
    }

    // Country Preference Match (20 points)
    if (scholarship.targetCountries && user.preferredCountries) {
      const userCountries = Array.isArray(user.preferredCountries) ? 
        user.preferredCountries.map((c: string) => c.toLowerCase()) : 
        [user.preferredCountries.toLowerCase()];
      const scholarshipCountries = scholarship.targetCountries.map((c: string) => c.toLowerCase());
      
      if (userCountries.some((country: string) => 
        scholarshipCountries.some((sCountry: string) => 
          sCountry.includes(country) || country.includes(sCountry)
        )
      )) {
        matchedCriteria.push('Target Country');
        score += 20;
      } else {
        missingRequirements.push('Country preference');
        recommendations.push(`Available in: ${scholarship.targetCountries.join(', ')}`);
      }
    }

    // GPA Requirements (15 points)
    if (scholarship.minGpa && user.gpa) {
      const userGpa = parseFloat(user.gpa);
      const requiredGpa = parseFloat(scholarship.minGpa);
      
      if (userGpa >= requiredGpa) {
        matchedCriteria.push('GPA Requirement');
        score += 15;
      } else {
        missingRequirements.push(`Minimum GPA: ${requiredGpa}`);
        recommendations.push(`Your GPA (${userGpa}) needs to be at least ${requiredGpa}`);
      }
    } else if (!user.gpa && scholarship.minGpa) {
      missingRequirements.push('GPA information needed');
      recommendations.push('Complete your GPA information in profile');
    }

    // English Proficiency (10 points)
    if (user.englishProficiency && user.englishProficiency !== 'Not tested') {
      matchedCriteria.push('English Proficiency');
      score += 10;
    } else if (scholarship.languageRequirements && 
               scholarship.languageRequirements.toLowerCase().includes('english')) {
      missingRequirements.push('English proficiency test');
      recommendations.push('Take IELTS or TOEFL test for English proficiency');
    }

    // Determine eligibility status
    let eligibilityStatus: EligibilityResult['eligibilityStatus'];
    if (score >= 80) {
      eligibilityStatus = 'highly-eligible';
    } else if (score >= 60) {
      eligibilityStatus = 'eligible';
    } else if (score >= 30) {
      eligibilityStatus = 'partially-eligible';
    } else {
      eligibilityStatus = 'not-eligible';
    }

    // Format funding amount
    const fundingAmount = scholarship.amountDisplay || 
      (scholarship.amountMin === scholarship.amountMax ? 
        `${scholarship.currency || 'AUD'} ${(scholarship.amountMin || 0).toLocaleString()}` :
        `${scholarship.currency || 'AUD'} ${(scholarship.amountMin || 0).toLocaleString()} - ${(scholarship.amountMax || 0).toLocaleString()}`
      );

    return {
      scholarshipId: scholarship.id,
      scholarshipName: scholarship.name,
      eligibilityScore: score,
      eligibilityStatus,
      matchedCriteria,
      missingRequirements,
      recommendations,
      fundingAmount,
      deadline: scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'Not specified',
      applicationUrl: scholarship.applicationUrl || '/apply',
    };
  }

  private calculateProfileCompleteness(user: any): number {
    const requiredFields = [
      'studyLevel', 'fieldOfStudy', 'preferredCountries', 'gpa', 
      'englishProficiency', 'estimatedBudget', 'dateOfBirth'
    ];
    
    const completedFields = requiredFields.filter(field => 
      user[field] && user[field] !== '' && user[field] !== null
    );
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  private generateImprovementSuggestions(user: any, results: EligibilityResult[]): string[] {
    const suggestions: string[] = [];
    
    // Profile completion suggestions
    if (!user.gpa) {
      suggestions.push('Add your GPA to unlock more accurate eligibility matching');
    }
    
    if (!user.englishProficiency || user.englishProficiency === 'Not tested') {
      suggestions.push('Take an English proficiency test (IELTS/TOEFL) to qualify for international scholarships');
    }
    
    if (!user.preferredCountries || (Array.isArray(user.preferredCountries) && user.preferredCountries.length === 0)) {
      suggestions.push('Specify your preferred study countries to find targeted opportunities');
    }
    
    if (!user.fieldOfStudy) {
      suggestions.push('Complete your field of study to get subject-specific scholarship recommendations');
    }

    // Analyze common missing requirements across scholarships
    const allMissing = results.flatMap(r => r.missingRequirements);
    const missingCounts = allMissing.reduce((acc, req) => {
      acc[req] = (acc[req] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Suggest improvements for most common missing requirements
    Object.entries(missingCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .forEach(([requirement, count]) => {
        if (count >= 2) {
          suggestions.push(`Focus on "${requirement}" - required by ${count} scholarships you're interested in`);
        }
      });

    return suggestions.slice(0, 6); // Limit to 6 suggestions
  }

  private formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `AUD ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `AUD ${(amount / 1000).toFixed(0)}K`;
    } else {
      return `AUD ${amount.toLocaleString()}`;
    }
  }
}

export const eligibilityQuickScanService = new EligibilityQuickScanService();