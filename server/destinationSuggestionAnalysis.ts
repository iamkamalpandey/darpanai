import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  country: string | null;
  dateOfBirth?: string | undefined;
  gender?: string | undefined;
  nationality?: string | undefined;
  highestQualification?: string | undefined;
  highestInstitution?: string | undefined;
  highestGpa?: string | undefined;
  graduationYear?: number | undefined;
  interestedCourse?: string | undefined;
  fieldOfStudy?: string | undefined;
  preferredIntake?: string | undefined;
  budgetRange?: string | undefined;
  preferredCountries?: string[] | undefined;
  currentEmploymentStatus?: string | undefined;
  englishProficiencyTests?: any[] | undefined;
  standardizedTests?: any[] | undefined;
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
  // Get user's English proficiency details
  const englishTest = userProfile.englishProficiencyTests?.[0];
  const englishScore = englishTest ? `${englishTest.testType}: ${englishTest.overallScore}` : 'Not provided';
  
  return `
# 🧠 AI Study Destination Recommendation System (Global Edition)

## 🎓 System Role
You are an expert AI-powered study-abroad advisor with access to updated insights on:
- Global education systems and pathway programs
- Regional cost variations and scholarship opportunities
- Visa, PR, and post-study migration policies
- IELTS and English entry alternatives
- Career market alignment by country and field

## 🌍 Supported Study Destinations
🇦🇺 Australia | 🇺🇸 USA | 🇨🇦 Canada | 🇬🇧 UK | 🇩🇰 Denmark | 🇳🇿 New Zealand | 🇳🇱 Netherlands | 🇦🇪 UAE | 🇩🇪 Germany | 🇫🇮 Finland | 🇮🇪 Ireland | 🇸🇬 Singapore | 🇸🇪 Sweden | 🇫🇷 France

## 🔍 AI Recommendation Framework

### Score Destinations (1-10 scale):
| Metric | Weight | Description |
|--------|--------|-------------|
| Academic Compatibility | 25% | Degree recognition, entry route (foundation/TAFE), gap tolerance |
| Financial Feasibility | 30% | Tuition + living, funding vs budget, scholarships, ROI |
| Language Alignment | 15% | IELTS requirement vs score, English pathways |
| Career Prospects & PR | 20% | Work rights, industry match, migration pathways |
| Visa Probability | 10% | Approval trends, processing time, risk for user profile |

## 👤 Student Profile Analysis:

**Personal Information:**
- Name: ${userProfile.firstName} ${userProfile.lastName}
- Date of Birth: ${userProfile.dateOfBirth || 'Not provided'}
- Gender: ${userProfile.gender || 'Not specified'}
- Nationality: ${userProfile.nationality || 'Not specified'}
- Current Country: ${userProfile.country || 'Not specified'}

**Academic Background:**
- Highest Qualification: ${userProfile.highestQualification || 'Not specified'}
- Institution: ${userProfile.highestInstitution || 'Not specified'}
- Graduation Year: ${userProfile.graduationYear || 'Not specified'}
- GPA/Grade: ${userProfile.highestGpa || 'Not specified'}
- Academic Gap: ${userProfile.graduationYear ? new Date().getFullYear() - userProfile.graduationYear : 'Not calculated'} years

**Study Preferences:**
- Interested Course: ${userProfile.interestedCourse || 'Not specified'}
- Field of Study: ${userProfile.fieldOfStudy || 'Not specified'}
- Preferred Intake: ${userProfile.preferredIntake || 'Not specified'}
- Budget Range: ${userProfile.budgetRange || 'Not specified'}
- Preferred Countries: ${userProfile.preferredCountries?.join(', ') || 'Not specified'}

**Financial Profile:**
- Funding Source: ${requestData.userPreferences?.fundingSource || 'Not specified'}
- Estimated Budget: ${requestData.userPreferences?.estimatedBudget || 'Not specified'}
- Savings Amount: ${requestData.userPreferences?.savingsAmount || 'Not specified'}

**Employment Status:**
- Current Status: ${userProfile.currentEmploymentStatus || 'Not specified'}
- Work Experience: ${requestData.workExperience || 'Not provided'}

**Language Proficiency:**
- English Test: ${englishScore}
- Test Date: ${englishTest?.testDate || 'Not provided'}

**Additional Context:**
- Current Education: ${requestData.currentEducation || 'Not provided'}
- Academic Performance: ${requestData.academicPerformance || 'Not provided'}
- Additional Notes: ${requestData.additionalContext || 'Not provided'}

## 📘 Analysis Requirements:
1. Provide personalized, well-scored, data-driven study destination suggestions
2. Consider pathway programs, foundation courses, and TAFE options
3. Analyze financial feasibility including scholarships and ROI
4. Evaluate IELTS requirements and alternative English pathways
5. Assess career prospects and post-study migration opportunities
6. Include intelligent alternatives beyond user's preferred countries
7. Provide actionable recommendations with specific timelines

## 📘 Response Format (JSON):

### 🔹 Executive Summary
Provide top 3 destinations with score, key fit reason, and confidence level.

### 🔹 Detailed Country Analysis
For each destination, include:
- **Score**: X/10 (using weighted scoring matrix)
- **Entry Options**: Direct, Foundation, TAFE, 2+2, Pathway programs
- **Academic Fit**: Entry requirements, program alignment, intake deadlines
- **Financial Breakdown**: Tuition, living cost, scholarships, total vs budget
- **Language Fit**: IELTS needed? Waivers? Bridging accepted?
- **Visa Landscape**: Success rates for user nationality, documentation complexity
- **Career Intelligence**: Post-study work, job market in user field, PR potential
- **Unique Advantages**: Diaspora, safety, cost of living, climate, culture
- **Risks & Recommendations**: Specific advice for improvement

### 🔹 AI Intelligent Alternatives
Show 2-3 countries user didn't select but are better matches based on:
- Current profile compatibility
- Cost-effectiveness or lower IELTS requirements
- Easier visa and PR potential

REQUIRED JSON STRUCTURE:
{
  "executiveSummary": "Comprehensive analysis of top 3 destinations with scores and key fit reasons",
  "overallMatchScore": 85,
  "topRecommendations": [
    {
      "country": "Country Name",
      "countryCode": "CC",
      "matchScore": 8.5,
      "ranking": 1,
      "entryOptions": ["Direct Entry", "Foundation Program", "Pathway"],
      "academicFit": {
        "entryRequirements": "Specific requirements",
        "programAlignment": "How well programs match",
        "intakeDeadlines": "Key dates"
      },
      "financialBreakdown": {
        "tuitionRange": "$20,000 - $40,000 per year",
        "livingCosts": "$15,000 - $25,000 per year",
        "totalAnnualCost": "$35,000 - $65,000",
        "scholarships": "Available opportunities",
        "budgetFit": "How it matches user budget"
      },
      "languageFit": {
        "ieltsRequired": "6.5 overall",
        "waivers": "Available pathway options",
        "bridgingPrograms": "English support available"
      },
      "visaLandscape": {
        "successRate": "85% for this nationality",
        "processingTime": "4-8 weeks",
        "documentationComplexity": "Moderate",
        "workPermit": "20 hours/week during studies"
      },
      "careerIntelligence": {
        "jobMarket": "Industry-specific demand",
        "averageSalary": "$60,000 - $80,000",
        "prPotential": "Pathway opportunities",
        "postStudyWork": "Work rights details"
      },
      "uniqueAdvantages": ["Advantage 1", "Advantage 2", "Advantage 3"],
      "risksAndRecommendations": ["Risk/Recommendation 1", "Risk/Recommendation 2"]
    }
  ],
  "intelligentAlternatives": [
    {
      "country": "Alternative Country",
      "whyBetter": "Specific reasons why this is a better match",
      "keyBenefits": ["Benefit 1", "Benefit 2", "Benefit 3"]
    }
  ],
  "keyFactors": ["Critical factor 1", "Critical factor 2", "Critical factor 3"],
  "personalizedInsights": {
    "strengthsAnalysis": ["Current strength 1", "Current strength 2"],
    "improvementAreas": ["Area to improve 1", "Area to improve 2"],
    "strategicRecommendations": ["Strategic advice 1", "Strategic advice 2"]
  },
  "actionPlan": {
    "applyTo": ["Recommended universities/colleges"],
    "required": ["IELTS prep", "Documents needed", "Budget planning"],
    "timeline": ["Intake deadlines", "Application windows"],
    "optional": ["Additional recommendations"]
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
  },
  "disclaimer": "⚠️ This recommendation is AI-generated and intended for informational purposes only. It is not a substitute for professional advice. We strongly recommend consulting a licensed education counsellor or migration agent before making any final decisions related to study abroad, visa applications, or financial planning. Darpan Intelligence and its developers are not liable for decisions made solely based on this AI analysis."
}

**CRITICAL REQUIREMENTS:**
- Provide detailed, actionable analysis with specific scores (1-10 scale) and recommendations
- Consider pathway programs, foundation courses, and alternative entry routes for students with lower IELTS scores
- Include country-specific insights for visa success rates based on user's nationality
- Focus on ROI and career prospects in the recommended destinations with salary ranges
- Suggest intelligent alternatives that user may not have considered but are better matches
- Be specific with financial figures, university names, timelines, and requirements
- Use the weighted scoring matrix for objective destination ranking
- Provide comprehensive analysis covering all aspects: academic, financial, language, career, visa

Analyze thoroughly and provide comprehensive, personalized recommendations based on current global education trends, visa policies, and market conditions.
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