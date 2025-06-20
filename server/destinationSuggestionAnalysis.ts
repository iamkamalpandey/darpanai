import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  studyLevel?: string;
  preferredStudyFields?: string[];
  budgetRange?: string;
  languagePreferences?: string[];
  climatePreference?: string;
  universityRankingImportance?: string;
  workPermitImportance?: string;
  culturalPreferences?: string[];
  careerGoals?: string;
}

interface DestinationSuggestionRequest {
  userPreferences: any;
  currentEducation?: string;
  academicPerformance?: string;
  workExperience?: string;
  additionalContext?: string;
}

interface CountryRecommendation {
  country: string;
  countryCode: string;
  matchScore: number;
  ranking: number;
  reasons: string[];
  advantages: string[];
  challenges: string[];
  estimatedCosts: {
    tuitionRange: string;
    livingCosts: string;
    totalAnnualCost: string;
  };
  topUniversities: string[];
  visaRequirements: {
    difficulty: string;
    processingTime: string;
    workPermit: string;
  };
  careerProspects: {
    jobMarket: string;
    averageSalary: string;
    growthOpportunities: string;
  };
  culturalFit: {
    languageBarrier: string;
    culturalAdaptation: string;
    internationalStudentSupport: string;
  };
}

interface DestinationSuggestionResponse {
  executiveSummary: string;
  overallMatchScore: number;
  topRecommendations: CountryRecommendation[];
  keyFactors: string[];
  personalizedInsights: {
    strengthsAnalysis: string[];
    improvementAreas: string[];
    strategicRecommendations: string[];
  };
  nextSteps: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  budgetOptimization: {
    costSavingStrategies: string[];
    scholarshipOpportunities: string[];
    financialPlanningTips: string[];
  };
  timeline: {
    preparation: string;
    application: string;
    decisionMaking: string;
  };
}

/**
 * Generate comprehensive AI-powered study destination suggestions
 */
export async function generateDestinationSuggestions(
  userProfile: UserProfile,
  requestData: DestinationSuggestionRequest
): Promise<{ analysis: DestinationSuggestionResponse; tokensUsed: number; processingTime: number }> {
  const startTime = Date.now();
  
  try {
    const prompt = buildDestinationAnalysisPrompt(userProfile, requestData);
    
    console.log(`Starting AI destination analysis for user: ${userProfile.firstName} ${userProfile.lastName}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert international education consultant and study abroad advisor with deep knowledge of global education systems, visa requirements, cost structures, and career outcomes. Provide comprehensive, personalized study destination recommendations based on detailed analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const tokensUsed = response.usage?.total_tokens || 0;
    const processingTime = Date.now() - startTime;
    
    console.log(`Destination analysis completed: ${tokensUsed} tokens used, ${processingTime}ms processing time`);
    
    const analysisContent = response.choices[0].message.content;
    if (!analysisContent) {
      throw new Error('No analysis content received from OpenAI');
    }

    let analysis: DestinationSuggestionResponse;
    try {
      analysis = JSON.parse(analysisContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Invalid response format from AI analysis');
    }

    // Validate and enhance analysis structure
    const validatedAnalysis = validateAndEnhanceAnalysis(analysis, userProfile);
    
    return {
      analysis: validatedAnalysis,
      tokensUsed,
      processingTime
    };
    
  } catch (error) {
    console.error('Error in destination suggestion analysis:', error);
    
    // Provide comprehensive fallback analysis
    const fallbackAnalysis = generateFallbackAnalysis(userProfile, requestData);
    
    return {
      analysis: fallbackAnalysis,
      tokensUsed: 0,
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * Build comprehensive prompt for destination analysis
 */
function buildDestinationAnalysisPrompt(
  userProfile: UserProfile,
  requestData: DestinationSuggestionRequest
): string {
  return `
Analyze the following student profile and provide comprehensive personalized study destination recommendations in JSON format.

STUDENT PROFILE:
- Name: ${userProfile.firstName} ${userProfile.lastName}
- Current Country: ${userProfile.country}
- Study Level: ${userProfile.studyLevel || 'Not specified'}
- Preferred Fields: ${userProfile.preferredStudyFields?.join(', ') || 'Not specified'}
- Budget Range: ${userProfile.budgetRange || 'Not specified'}
- Language Preferences: ${userProfile.languagePreferences?.join(', ') || 'Not specified'}
- Climate Preference: ${userProfile.climatePreference || 'Not specified'}
- University Ranking Importance: ${userProfile.universityRankingImportance || 'Not specified'}
- Work Permit Importance: ${userProfile.workPermitImportance || 'Not specified'}
- Cultural Preferences: ${userProfile.culturalPreferences?.join(', ') || 'Not specified'}
- Career Goals: ${userProfile.careerGoals || 'Not specified'}

ADDITIONAL CONTEXT:
- Current Education: ${requestData.currentEducation || 'Not provided'}
- Academic Performance: ${requestData.academicPerformance || 'Not provided'}
- Work Experience: ${requestData.workExperience || 'Not provided'}
- Additional Context: ${requestData.additionalContext || 'Not provided'}

ANALYSIS REQUIREMENTS:
1. Analyze student profile comprehensively considering all factors
2. Recommend TOP 5 study destinations with detailed analysis
3. Provide match scores (0-100) for each destination
4. Include cost analysis, visa requirements, career prospects
5. Consider cultural fit and practical considerations
6. Provide personalized insights and strategic recommendations
7. Include timeline and budget optimization strategies

RESPONSE FORMAT (JSON):
{
  "executiveSummary": "Comprehensive 2-3 sentence summary of key recommendations",
  "overallMatchScore": 85,
  "topRecommendations": [
    {
      "country": "Country Name",
      "countryCode": "CC",
      "matchScore": 92,
      "ranking": 1,
      "reasons": ["Primary reason 1", "Primary reason 2", "Primary reason 3"],
      "advantages": ["Advantage 1", "Advantage 2", "Advantage 3"],
      "challenges": ["Challenge 1", "Challenge 2"],
      "estimatedCosts": {
        "tuitionRange": "$20,000 - $40,000 per year",
        "livingCosts": "$15,000 - $25,000 per year",
        "totalAnnualCost": "$35,000 - $65,000"
      },
      "topUniversities": ["University 1", "University 2", "University 3"],
      "visaRequirements": {
        "difficulty": "Moderate",
        "processingTime": "4-8 weeks",
        "workPermit": "20 hours/week during studies, full-time during breaks"
      },
      "careerProspects": {
        "jobMarket": "Strong demand in tech and healthcare",
        "averageSalary": "$60,000 - $80,000",
        "growthOpportunities": "Excellent with multinational companies"
      },
      "culturalFit": {
        "languageBarrier": "Low - English speaking",
        "culturalAdaptation": "Moderate - multicultural society",
        "internationalStudentSupport": "Excellent support services"
      }
    }
  ],
  "keyFactors": ["Factor 1", "Factor 2", "Factor 3", "Factor 4", "Factor 5"],
  "personalizedInsights": {
    "strengthsAnalysis": ["Strength 1", "Strength 2", "Strength 3"],
    "improvementAreas": ["Area 1", "Area 2"],
    "strategicRecommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
  },
  "nextSteps": {
    "immediate": ["Step 1", "Step 2", "Step 3"],
    "shortTerm": ["Step 1", "Step 2", "Step 3"],
    "longTerm": ["Step 1", "Step 2"]
  },
  "budgetOptimization": {
    "costSavingStrategies": ["Strategy 1", "Strategy 2", "Strategy 3"],
    "scholarshipOpportunities": ["Scholarship type 1", "Scholarship type 2"],
    "financialPlanningTips": ["Tip 1", "Tip 2", "Tip 3"]
  },
  "timeline": {
    "preparation": "6-12 months for research and preparation",
    "application": "3-6 months for applications and documentation",
    "decisionMaking": "2-3 months for decision and enrollment"
  }
}

Provide detailed, accurate, and actionable recommendations based on current global education trends, visa policies, and market conditions.
`;
}

/**
 * Validate and enhance analysis structure
 */
function validateAndEnhanceAnalysis(
  analysis: DestinationSuggestionResponse,
  userProfile: UserProfile
): DestinationSuggestionResponse {
  // Ensure all required fields are present with fallbacks
  return {
    executiveSummary: analysis.executiveSummary || "Comprehensive study destination analysis completed with personalized recommendations.",
    overallMatchScore: Math.min(100, Math.max(0, analysis.overallMatchScore || 75)),
    topRecommendations: (analysis.topRecommendations || []).slice(0, 5).map((rec, index) => ({
      ...rec,
      ranking: index + 1,
      matchScore: Math.min(100, Math.max(0, rec.matchScore || 70))
    })),
    keyFactors: analysis.keyFactors || ["Academic quality", "Cost effectiveness", "Career opportunities", "Cultural fit", "Visa accessibility"],
    personalizedInsights: {
      strengthsAnalysis: analysis.personalizedInsights?.strengthsAnalysis || ["Strong academic background", "Clear career goals"],
      improvementAreas: analysis.personalizedInsights?.improvementAreas || ["Language preparation", "Financial planning"],
      strategicRecommendations: analysis.personalizedInsights?.strategicRecommendations || ["Focus on top-ranked programs", "Apply for scholarships early"]
    },
    nextSteps: {
      immediate: analysis.nextSteps?.immediate || ["Research university programs", "Prepare required documents"],
      shortTerm: analysis.nextSteps?.shortTerm || ["Submit applications", "Apply for scholarships"],
      longTerm: analysis.nextSteps?.longTerm || ["Prepare for departure", "Plan career development"]
    },
    budgetOptimization: {
      costSavingStrategies: analysis.budgetOptimization?.costSavingStrategies || ["Apply for merit scholarships", "Consider public universities"],
      scholarshipOpportunities: analysis.budgetOptimization?.scholarshipOpportunities || ["Merit-based scholarships", "Need-based financial aid"],
      financialPlanningTips: analysis.budgetOptimization?.financialPlanningTips || ["Create detailed budget plan", "Explore education loans"]
    },
    timeline: {
      preparation: analysis.timeline?.preparation || "6-12 months for comprehensive preparation",
      application: analysis.timeline?.application || "3-6 months for applications",
      decisionMaking: analysis.timeline?.decisionMaking || "2-3 months for final decisions"
    }
  };
}

/**
 * Generate fallback analysis if AI fails
 */
function generateFallbackAnalysis(
  userProfile: UserProfile,
  requestData: DestinationSuggestionRequest
): DestinationSuggestionResponse {
  const commonDestinations: CountryRecommendation[] = [
    {
      country: "United States",
      countryCode: "US",
      matchScore: 85,
      ranking: 1,
      reasons: ["World-renowned universities", "Diverse academic programs", "Strong research opportunities"],
      advantages: ["Extensive scholarship options", "Post-study work opportunities", "Global recognition"],
      challenges: ["High costs", "Complex visa process"],
      estimatedCosts: {
        tuitionRange: "$25,000 - $60,000 per year",
        livingCosts: "$15,000 - $30,000 per year",
        totalAnnualCost: "$40,000 - $90,000"
      },
      topUniversities: ["Harvard University", "MIT", "Stanford University"],
      visaRequirements: {
        difficulty: "Moderate to High",
        processingTime: "6-12 weeks",
        workPermit: "On-campus work allowed, OPT available"
      },
      careerProspects: {
        jobMarket: "Excellent in tech, finance, healthcare",
        averageSalary: "$50,000 - $120,000",
        growthOpportunities: "Outstanding with top global companies"
      },
      culturalFit: {
        languageBarrier: "Low for English speakers",
        culturalAdaptation: "Diverse and welcoming environment",
        internationalStudentSupport: "Excellent support services"
      }
    },
    {
      country: "Canada",
      countryCode: "CA", 
      matchScore: 82,
      ranking: 2,
      reasons: ["Affordable quality education", "Welcoming immigration policies", "Safe environment"],
      advantages: ["Post-graduation work permit", "Pathway to permanent residence", "Lower costs than US"],
      challenges: ["Cold climate in most regions", "Competitive admissions"],
      estimatedCosts: {
        tuitionRange: "$15,000 - $35,000 per year",
        livingCosts: "$12,000 - $20,000 per year",
        totalAnnualCost: "$27,000 - $55,000"
      },
      topUniversities: ["University of Toronto", "McGill University", "UBC"],
      visaRequirements: {
        difficulty: "Moderate",
        processingTime: "4-8 weeks",
        workPermit: "20 hours/week during studies"
      },
      careerProspects: {
        jobMarket: "Strong in natural resources, tech, healthcare",
        averageSalary: "$45,000 - $75,000 CAD",
        growthOpportunities: "Good with immigration opportunities"
      },
      culturalFit: {
        languageBarrier: "Low - English and French",
        culturalAdaptation: "Very welcoming to international students",
        internationalStudentSupport: "Excellent government and university support"
      }
    }
  ];

  return {
    executiveSummary: `Based on your profile from ${userProfile.country}, we recommend exploring primarily English-speaking destinations with strong academic reputations and career opportunities.`,
    overallMatchScore: 78,
    topRecommendations: commonDestinations,
    keyFactors: ["Academic reputation", "Cost of education", "Post-study work opportunities", "Cultural compatibility", "Immigration policies"],
    personalizedInsights: {
      strengthsAnalysis: ["Strong motivation for international education", "Clear academic goals"],
      improvementAreas: ["Financial planning", "Language preparation if needed"],
      strategicRecommendations: ["Focus on countries with favorable immigration policies", "Research scholarship opportunities early", "Consider cost of living alongside tuition"]
    },
    nextSteps: {
      immediate: ["Research specific programs in recommended countries", "Assess financial requirements", "Check language proficiency requirements"],
      shortTerm: ["Prepare standardized test scores", "Gather required documents", "Apply for scholarships"],
      longTerm: ["Submit university applications", "Prepare visa applications", "Plan for departure"]
    },
    budgetOptimization: {
      costSavingStrategies: ["Apply to public universities", "Look for merit-based scholarships", "Consider smaller cities for lower living costs"],
      scholarshipOpportunities: ["Government scholarships", "University merit awards", "Field-specific scholarships"],
      financialPlanningTips: ["Create comprehensive budget including hidden costs", "Explore education loan options", "Plan for currency fluctuations"]
    },
    timeline: {
      preparation: "6-12 months for comprehensive research and preparation",
      application: "4-6 months for applications and documentation",
      decisionMaking: "2-4 months for university selection and visa processing"
    }
  };
}