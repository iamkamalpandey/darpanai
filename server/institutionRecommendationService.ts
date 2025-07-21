import { db } from './db';
import { institutions } from '../shared/institutionSchema';
import { eq, and, like, desc, asc, inArray } from 'drizzle-orm';

export interface InstitutionRecommendation {
  institutionId: number;
  institutionName: string;
  country: string;
  city: string;
  ranking: any;
  isPartner: boolean;
  matchingPrograms: ProgramRecommendation[];
  averageFees: {
    tuitionFee: number;
    totalEstimated: number;
    currency: string;
  };
  reasonForRecommendation: string;
  matchScore: number;
}

export interface ProgramRecommendation {
  programId: number;
  programName: string;
  degree: string;
  field: string;
  specialization?: string;
  duration: string;
  studyMode: string;
  fees: {
    tuitionFee: number;
    applicationFee: number;
    totalEstimated: number;
    currency: string;
  };
  prerequisites: any;
  careerOutcomes: any;
}

export class InstitutionRecommendationService {
  
  async getRecommendationsForUser(userProfile: {
    preferredCountries?: string[];
    fieldOfStudy?: string;
    studyLevel?: string;
    budgetRange?: string;
    workExperienceYears?: number;
    englishProficiency?: any[];
  }): Promise<InstitutionRecommendation[]> {
    
    // Get all institutions with their programs and fees
    const institutionsWithPrograms = await db
      .select({
        institutionId: institutions.id,
        institutionName: institutions.name,
        institutionCountry: institutions.country,
        institutionCity: institutions.city,
        institutionRanking: institutions.ranking,
        institutionIsPartner: institutions.isPartner,
        institutionFeatures: institutions.features,
        programId: programs.id,
        programName: programs.name,
        programDegree: programs.degree,
        programField: programs.field,
        programSpecialization: programs.specialization,
        programDuration: programs.duration,
        programStudyMode: programs.studyMode,
        programPrerequisites: programs.prerequisites,
        programCareerOutcomes: programs.careerOutcomes,
        feeTuition: programFees.tuitionFee,
        feeApplication: programFees.applicationFee,
        feeTotal: programFees.totalEstimated,
        feeCurrency: programFees.currency
      })
      .from(institutions)
      .innerJoin(programs, eq(institutions.id, programs.institutionId))
      .leftJoin(programFees, and(
        eq(programs.id, programFees.programId),
        eq(programFees.studentType, 'international')
      ))
      .where(and(
        eq(institutions.isActive, true),
        eq(programs.isActive, true)
      ))
      .orderBy(asc(institutions.name));

    // Group by institution
    const institutionMap = new Map<number, any>();
    
    for (const row of institutionsWithPrograms) {
      if (!institutionMap.has(row.institutionId)) {
        institutionMap.set(row.institutionId, {
          institutionId: row.institutionId,
          institutionName: row.institutionName,
          country: row.institutionCountry,
          city: row.institutionCity,
          ranking: row.institutionRanking,
          isPartner: row.institutionIsPartner,
          features: row.institutionFeatures,
          programs: []
        });
      }
      
      if (row.programId) {
        institutionMap.get(row.institutionId).programs.push({
          programId: row.programId,
          programName: row.programName,
          degree: row.programDegree,
          field: row.programField,
          specialization: row.programSpecialization,
          duration: row.programDuration,
          studyMode: row.programStudyMode,
          prerequisites: row.programPrerequisites,
          careerOutcomes: row.programCareerOutcomes,
          fees: {
            tuitionFee: parseFloat(row.feeTuition || '0'),
            applicationFee: parseFloat(row.feeApplication || '0'),
            totalEstimated: parseFloat(row.feeTotal || '0'),
            currency: row.feeCurrency || 'USD'
          }
        });
      }
    }

    // Filter and score institutions based on user profile
    const recommendations: InstitutionRecommendation[] = [];
    
    for (const [_, institutionData] of institutionMap) {
      const matchScore = this.calculateMatchScore(institutionData, userProfile);
      
      if (matchScore > 0) {
        const matchingPrograms = this.filterMatchingPrograms(institutionData.programs, userProfile);
        
        if (matchingPrograms.length > 0) {
          const averageFees = this.calculateAverageFees(matchingPrograms);
          const reasonForRecommendation = this.generateRecommendationReason(institutionData, userProfile, matchScore);
          
          recommendations.push({
            institutionId: institutionData.institutionId,
            institutionName: institutionData.institutionName,
            country: institutionData.country,
            city: institutionData.city,
            ranking: institutionData.ranking,
            isPartner: institutionData.isPartner,
            matchingPrograms,
            averageFees,
            reasonForRecommendation,
            matchScore
          });
        }
      }
    }

    // Sort by match score and return top recommendations
    return recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }

  private calculateMatchScore(institutionData: any, userProfile: any): number {
    let score = 0;
    
    // Country preference (30 points)
    if (userProfile.preferredCountries?.includes(institutionData.country)) {
      score += 30;
    }
    
    // Partner institution bonus (15 points)
    if (institutionData.isPartner) {
      score += 15;
    }
    
    // Field of study match (25 points)
    if (userProfile.fieldOfStudy) {
      const hasMatchingField = institutionData.programs.some((program: any) => 
        program.field.toLowerCase().includes(userProfile.fieldOfStudy.toLowerCase()) ||
        userProfile.fieldOfStudy.toLowerCase().includes(program.field.toLowerCase())
      );
      if (hasMatchingField) {
        score += 25;
      }
    }
    
    // Study level match (20 points)
    if (userProfile.studyLevel) {
      const hasMatchingLevel = institutionData.programs.some((program: any) => {
        const userLevel = userProfile.studyLevel.toLowerCase();
        const programLevel = program.degree.toLowerCase();
        
        if (userLevel.includes('master') && programLevel.includes('master')) return true;
        if (userLevel.includes('bachelor') && programLevel.includes('bachelor')) return true;
        if (userLevel.includes('phd') && programLevel.includes('phd')) return true;
        return false;
      });
      if (hasMatchingLevel) {
        score += 20;
      }
    }
    
    // Budget compatibility (10 points)
    if (userProfile.budgetRange) {
      const hasBudgetCompatiblePrograms = this.checkBudgetCompatibility(
        institutionData.programs, 
        userProfile.budgetRange
      );
      if (hasBudgetCompatiblePrograms) {
        score += 10;
      }
    }
    
    return score;
  }

  private filterMatchingPrograms(programs: any[], userProfile: any): ProgramRecommendation[] {
    return programs.filter(program => {
      // Field match
      if (userProfile.fieldOfStudy) {
        const fieldMatch = program.field.toLowerCase().includes(userProfile.fieldOfStudy.toLowerCase()) ||
                          userProfile.fieldOfStudy.toLowerCase().includes(program.field.toLowerCase());
        if (!fieldMatch) return false;
      }
      
      // Study level match
      if (userProfile.studyLevel) {
        const userLevel = userProfile.studyLevel.toLowerCase();
        const programLevel = program.degree.toLowerCase();
        
        const levelMatch = (userLevel.includes('master') && programLevel.includes('master')) ||
                          (userLevel.includes('bachelor') && programLevel.includes('bachelor')) ||
                          (userLevel.includes('phd') && programLevel.includes('phd'));
        if (!levelMatch) return false;
      }
      
      // Budget compatibility
      if (userProfile.budgetRange && program.fees.totalEstimated > 0) {
        const budgetCompatible = this.checkProgramBudgetCompatibility(program.fees, userProfile.budgetRange);
        if (!budgetCompatible) return false;
      }
      
      return true;
    });
  }

  private checkBudgetCompatibility(programs: any[], budgetRange: string): boolean {
    // Simple budget check - in a real system, this would be more sophisticated
    const budgetLimits = {
      'low': 30000,      // Under $30K
      'medium': 60000,   // $30K - $60K
      'high': 100000,    // $60K - $100K
      'premium': Infinity // Above $100K
    };
    
    const maxBudget = budgetLimits[budgetRange.toLowerCase()] || Infinity;
    
    return programs.some(program => 
      program.fees?.totalEstimated <= maxBudget || program.fees?.totalEstimated === 0
    );
  }

  private checkProgramBudgetCompatibility(fees: any, budgetRange: string): boolean {
    const budgetLimits = {
      'low': 30000,
      'medium': 60000,
      'high': 100000,
      'premium': Infinity
    };
    
    const maxBudget = budgetLimits[budgetRange.toLowerCase()] || Infinity;
    return fees.totalEstimated <= maxBudget || fees.totalEstimated === 0;
  }

  private calculateAverageFees(programs: ProgramRecommendation[]): any {
    const programsWithFees = programs.filter(p => p.fees.totalEstimated > 0);
    
    if (programsWithFees.length === 0) {
      return { tuitionFee: 0, totalEstimated: 0, currency: 'USD' };
    }
    
    const avgTuition = programsWithFees.reduce((sum, p) => sum + p.fees.tuitionFee, 0) / programsWithFees.length;
    const avgTotal = programsWithFees.reduce((sum, p) => sum + p.fees.totalEstimated, 0) / programsWithFees.length;
    const currency = programsWithFees[0].fees.currency;
    
    return {
      tuitionFee: Math.round(avgTuition),
      totalEstimated: Math.round(avgTotal),
      currency
    };
  }

  private generateRecommendationReason(institutionData: any, userProfile: any, matchScore: number): string {
    const reasons = [];
    
    if (userProfile.preferredCountries?.includes(institutionData.country)) {
      reasons.push(`Located in your preferred country (${institutionData.country})`);
    }
    
    if (institutionData.isPartner) {
      reasons.push('Partner institution with dedicated support');
    }
    
    if (institutionData.ranking?.world && institutionData.ranking.world <= 100) {
      reasons.push(`Top-ranked university (World Rank: ${institutionData.ranking.world})`);
    }
    
    const matchingPrograms = this.filterMatchingPrograms(institutionData.programs, userProfile);
    if (matchingPrograms.length > 0) {
      reasons.push(`${matchingPrograms.length} program(s) match your field of study`);
    }
    
    if (reasons.length === 0) {
      reasons.push('Good academic reputation and program offerings');
    }
    
    return reasons.join(', ');
  }
}

export const institutionRecommendationService = new InstitutionRecommendationService();