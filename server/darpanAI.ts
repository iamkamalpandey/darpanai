import OpenAI from "openai";
import { University, Assessment } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AssessmentData {
  academicLevel: string;
  fieldOfStudy: string;
  gpa: string;
  testScores: Record<string, number>;
  preferredCountries: string[];
  budgetRange: string;
  lifestyle: string;
  specialRequirements?: string;
}

interface MatchResult {
  universityId: number;
  matchScore: number;
  matchReasons: string[];
}

export async function generateUniversityMatches(
  assessment: AssessmentData,
  universities: University[]
): Promise<MatchResult[]> {
  const prompt = `
  Analyze this student profile and match them with suitable universities from the provided list. Consider academic fit, financial compatibility, location preferences, and overall suitability.
  
  Student Profile:
  - Academic Level: ${assessment.academicLevel}
  - Field of Study: ${assessment.fieldOfStudy}
  - GPA: ${assessment.gpa}
  - Test Scores: ${JSON.stringify(assessment.testScores)}
  - Preferred Countries: ${assessment.preferredCountries.join(', ')}
  - Budget Range: ${assessment.budgetRange}
  - Lifestyle: ${assessment.lifestyle}
  - Special Requirements: ${assessment.specialRequirements || 'None'}

  Available Universities:
  ${universities.map(u => `
  ID: ${u.id}
  Name: ${u.name}
  Country: ${u.country}
  City: ${u.city}
  Ranking: ${u.ranking || 'N/A'}
  Acceptance Rate: ${u.acceptanceRate || 'N/A'}%
  Tuition: $${u.tuitionFee || 'N/A'}
  GPA Requirement: ${u.gpaRequirement || 'N/A'}
  SAT Range: ${u.satRange || 'N/A'}
  Programs: ${u.programs ? u.programs.join(', ') : 'N/A'}
  Description: ${u.description || 'N/A'}
  `).join('\n---\n')}

  Provide university matches in JSON format. For each match, calculate a score (0-100) based on:
  - Academic compatibility (GPA, test scores, program availability)
  - Financial fit (tuition vs budget)
  - Location preference match
  - Lifestyle compatibility
  - Special requirements fulfillment

  Provide at least 3-5 matches if available, sorted by match score (highest first).

  Response format:
  {
    "matches": [
      {
        "universityId": number,
        "matchScore": number (0-100),
        "matchReasons": ["specific reason 1", "specific reason 2", "specific reason 3"]
      }
    ]
  }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"matches": []}');
    
    // Validate and sanitize the results
    const validMatches = result.matches
      .filter((match: any) => 
        match.universityId && 
        typeof match.matchScore === 'number' && 
        match.matchScore >= 0 && 
        match.matchScore <= 100 &&
        Array.isArray(match.matchReasons)
      )
      .map((match: any) => ({
        universityId: parseInt(match.universityId),
        matchScore: Math.round(match.matchScore),
        matchReasons: match.matchReasons.slice(0, 5) // Limit to 5 reasons max
      }))
      .sort((a: any, b: any) => b.matchScore - a.matchScore); // Sort by score descending

    return validMatches;
  } catch (error) {
    console.error('Error generating university matches:', error);
    throw new Error('Failed to generate university recommendations');
  }
}

export async function generateUniversityInsights(
  university: University,
  assessment: AssessmentData
): Promise<{
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  applicationTips: string[];
}> {
  const prompt = `
  Provide detailed insights for this student considering applying to this university:

  Student Profile:
  - Academic Level: ${assessment.academicLevel}
  - Field of Study: ${assessment.fieldOfStudy}
  - GPA: ${assessment.gpa}
  - Test Scores: ${JSON.stringify(assessment.testScores)}
  - Budget Range: ${assessment.budgetRange}
  - Lifestyle: ${assessment.lifestyle}

  University:
  - Name: ${university.name}
  - Country: ${university.country}
  - City: ${university.city}
  - Ranking: ${university.ranking || 'N/A'}
  - Acceptance Rate: ${university.acceptanceRate || 'N/A'}%
  - Tuition: $${university.tuitionFee || 'N/A'}
  - GPA Requirement: ${university.gpaRequirement || 'N/A'}
  - SAT Range: ${university.satRange || 'N/A'}
  - Programs: ${university.programs ? university.programs.join(', ') : 'N/A'}
  - Description: ${university.description || 'N/A'}

  Provide specific insights in JSON format:
  {
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "concerns": ["concern 1", "concern 2"],
    "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
    "applicationTips": ["tip 1", "tip 2", "tip 3"]
  }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      strengths: result.strengths || [],
      concerns: result.concerns || [],
      recommendations: result.recommendations || [],
      applicationTips: result.applicationTips || []
    };
  } catch (error) {
    console.error('Error generating university insights:', error);
    throw new Error('Failed to generate university insights');
  }
}

export async function generateCareerPathAnalysis(
  assessment: AssessmentData,
  matches: MatchResult[],
  universities: University[]
): Promise<{
  careerOutlook: string;
  industryTrends: string[];
  skillRecommendations: string[];
  networkingOpportunities: string[];
}> {
  const matchedUniversities = universities.filter(u => 
    matches.some(m => m.universityId === u.id)
  );

  const prompt = `
  Analyze career prospects for this student based on their profile and university matches:

  Student Profile:
  - Academic Level: ${assessment.academicLevel}
  - Field of Study: ${assessment.fieldOfStudy}
  - Preferred Countries: ${assessment.preferredCountries.join(', ')}

  Matched Universities:
  ${matchedUniversities.map(u => `- ${u.name} (${u.country})`).join('\n')}

  Provide career analysis in JSON format:
  {
    "careerOutlook": "comprehensive career outlook description",
    "industryTrends": ["trend 1", "trend 2", "trend 3"],
    "skillRecommendations": ["skill 1", "skill 2", "skill 3"],
    "networkingOpportunities": ["opportunity 1", "opportunity 2", "opportunity 3"]
  }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1200,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      careerOutlook: result.careerOutlook || 'Career analysis not available',
      industryTrends: result.industryTrends || [],
      skillRecommendations: result.skillRecommendations || [],
      networkingOpportunities: result.networkingOpportunities || []
    };
  } catch (error) {
    console.error('Error generating career path analysis:', error);
    throw new Error('Failed to generate career analysis');
  }
}