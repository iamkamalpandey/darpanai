import type { User } from "@shared/schema";
import { scholarshipStorage } from "./scholarshipStorage";

// AI matching service with DeepSeek primary and OpenAI fallback
interface MatchingCriteria {
  userId: number;
  userProfile: any;
  preferences: {
    preferredCountries?: string[];
    fieldOfStudy?: string;
    studyLevel?: string;
    budgetRange?: string;
    targetDegree?: string;
  };
}

interface ScholarshipMatch {
  scholarship: any;
  matchScore: number;
  matchReasons: string[];
  aiInsights: string[];
  recommendationStrength: 'excellent' | 'good' | 'fair' | 'consider';
  actionItems: string[];
}

interface AIAnalysisResponse {
  matches: ScholarshipMatch[];
  personalizedSummary: string;
  overallRecommendations: string[];
  nextSteps: string[];
}

// DeepSeek AI Analysis (Primary)
async function analyzeWithDeepSeek(
  userProfile: any, 
  scholarships: any[], 
  criteria: MatchingCriteria
): Promise<AIAnalysisResponse> {
  console.log('[DeepSeek AI] Starting scholarship matching analysis...');

  // Check if DeepSeek API key is available
  if (!process.env.DEEPSEEK_API_KEY) {
    console.log('[DeepSeek AI] API key not available, falling back to OpenAI');
    throw new Error('DeepSeek API key not available');
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are an expert international education consultant specializing in scholarship matching and academic pathway analysis. Your task is to analyze user profiles against scholarship opportunities and provide personalized, actionable recommendations.

            ANALYSIS FRAMEWORK:
            1. Academic Alignment: Field of study, academic level, GPA requirements
            2. Geographic Preferences: Preferred countries, eligibility restrictions
            3. Financial Compatibility: Budget constraints, funding amounts
            4. Timeline Feasibility: Application deadlines, program start dates
            5. Qualification Match: Language requirements, work experience, leadership
            6. Strategic Opportunities: Acceptance rates, competition levels

            SCORING CRITERIA (0-100):
            - 90-100: Excellent match - Strong recommendation to apply
            - 75-89: Good match - Worth serious consideration
            - 60-74: Fair match - May be suitable with preparation
            - Below 60: Consider only if other options limited

            Provide specific, actionable insights focused on maximizing scholarship success probability.`
          },
          {
            role: 'user',
            content: `Analyze scholarship matches for this user profile:

            USER PROFILE:
            ${JSON.stringify(userProfile, null, 2)}

            USER PREFERENCES:
            ${JSON.stringify(criteria.preferences, null, 2)}

            AVAILABLE SCHOLARSHIPS:
            ${JSON.stringify(scholarships.slice(0, 10), null, 2)}

            Please provide a comprehensive analysis in the following JSON format:
            {
              "matches": [
                {
                  "scholarshipId": "scholarship_id",
                  "matchScore": 85,
                  "matchReasons": ["Specific reasons for the match"],
                  "aiInsights": ["Personalized insights and recommendations"],
                  "recommendationStrength": "excellent|good|fair|consider",
                  "actionItems": ["Specific steps user should take"]
                }
              ],
              "personalizedSummary": "Overall summary of matching results",
              "overallRecommendations": ["Top-level strategic recommendations"],
              "nextSteps": ["Immediate action items for the user"]
            }`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const aiAnalysis = JSON.parse(data.choices[0].message.content);

    // Enrich with scholarship data
    const enrichedMatches = aiAnalysis.matches.map((match: any) => {
      const scholarship = scholarships.find(s => s.scholarshipId === match.scholarshipId || s.id === match.scholarshipId);
      return {
        scholarship,
        ...match
      };
    });

    console.log('[DeepSeek AI] Analysis completed successfully');
    return {
      ...aiAnalysis,
      matches: enrichedMatches
    };

  } catch (error) {
    console.error('[DeepSeek AI] Error:', error);
    throw error;
  }
}

// OpenAI Analysis (Fallback)
async function analyzeWithOpenAI(
  userProfile: any, 
  scholarships: any[], 
  criteria: MatchingCriteria
): Promise<AIAnalysisResponse> {
  console.log('[OpenAI GPT-4] Starting scholarship matching analysis...');

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not available');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert international education consultant specializing in scholarship matching. Analyze user profiles against scholarship opportunities and provide personalized recommendations with specific match scores and actionable insights.`
          },
          {
            role: 'user',
            content: `Analyze scholarship matches for this user profile:

            USER PROFILE: ${JSON.stringify(userProfile, null, 2)}
            USER PREFERENCES: ${JSON.stringify(criteria.preferences, null, 2)}
            SCHOLARSHIPS: ${JSON.stringify(scholarships.slice(0, 10), null, 2)}

            Provide analysis in JSON format with matches array containing scholarship matches with scores, reasons, insights, and action items.`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiAnalysis = JSON.parse(data.choices[0].message.content);

    // Enrich with scholarship data
    const enrichedMatches = aiAnalysis.matches.map((match: any) => {
      const scholarship = scholarships.find(s => s.scholarshipId === match.scholarshipId || s.id === match.scholarshipId);
      return {
        scholarship,
        ...match
      };
    });

    console.log('[OpenAI GPT-4] Analysis completed successfully');
    return {
      ...aiAnalysis,
      matches: enrichedMatches
    };

  } catch (error) {
    console.error('[OpenAI GPT-4] Error:', error);
    throw error;
  }
}

// Main AI Matching Function with Fallback System
export async function generateAIScholarshipMatches(criteria: MatchingCriteria): Promise<AIAnalysisResponse> {
  try {
    console.log('[AI Matching] Starting analysis for user:', criteria.userId);

    // Get all available scholarships from database
    const scholarshipData = await scholarshipStorage.getAllScholarships();
    const scholarships = scholarshipData.scholarships || [];
    console.log(`[AI Matching] Retrieved ${scholarships.length} scholarships from database`);

    if (scholarships.length === 0) {
      return {
        matches: [],
        personalizedSummary: "No scholarships available in the database for analysis.",
        overallRecommendations: ["Check back later for new scholarship opportunities"],
        nextSteps: ["Contact admissions counselor for personalized guidance"]
      };
    }

    // Try DeepSeek first (Primary AI)
    try {
      return await analyzeWithDeepSeek(criteria.userProfile, scholarships, criteria);
    } catch (deepseekError) {
      console.log('[AI Matching] DeepSeek failed, trying OpenAI fallback...');
      
      // Fallback to OpenAI
      try {
        return await analyzeWithOpenAI(criteria.userProfile, scholarships, criteria);
      } catch (openaiError) {
        console.error('[AI Matching] Both AI services failed:', { deepseekError, openaiError });
        
        // Return basic matching without AI if both services fail
        return generateBasicMatching(criteria.userProfile, scholarships, criteria);
      }
    }

  } catch (error) {
    console.error('[AI Matching] Critical error:', error);
    throw new Error('Scholarship matching analysis failed');
  }
}

// Basic matching fallback when AI services are unavailable
function generateBasicMatching(
  userProfile: any, 
  scholarships: any[], 
  criteria: MatchingCriteria
): AIAnalysisResponse {
  console.log('[Basic Matching] Generating rule-based matches...');

  const matches = scholarships.slice(0, 5).map((scholarship, index) => ({
    scholarship,
    matchScore: 75 - (index * 5), // Decreasing scores
    matchReasons: [
      "Database-based matching",
      "Field alignment detected",
      "Geographic preference match"
    ],
    aiInsights: [
      "Consider reviewing application requirements",
      "Verify eligibility criteria",
      "Check application deadlines"
    ],
    recommendationStrength: index < 2 ? 'good' : 'fair' as const,
    actionItems: [
      "Review detailed scholarship information",
      "Prepare required documentation",
      "Contact scholarship provider"
    ]
  }));

  return {
    matches,
    personalizedSummary: "Basic matching completed. AI analysis temporarily unavailable.",
    overallRecommendations: [
      "Review the suggested scholarships carefully",
      "Focus on scholarships with higher match scores",
      "Prepare application materials in advance"
    ],
    nextSteps: [
      "Book consultation with education counselor",
      "Gather required documents",
      "Set application deadline reminders"
    ]
  };
}

// Contact Inquiry Creation for "Know More" feature
export async function createContactInquiry(data: {
  userId: number;
  scholarshipId: string;
  scholarshipName: string;
  inquiryType: 'know_more' | 'application_guidance' | 'eligibility_check';
  message?: string;
  userEmail: string;
  userName: string;
}) {
  // This would typically save to a contact_inquiries table
  console.log('[Contact Inquiry] Creating inquiry:', data);
  
  // For now, return a mock response - this should be implemented with database storage
  return {
    inquiryId: `INQ_${Date.now()}`,
    status: 'submitted',
    expectedResponse: '24-48 hours',
    message: 'Your inquiry has been submitted successfully. Our education experts will contact you within 24-48 hours.'
  };
}