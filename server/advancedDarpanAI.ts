import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface University {
  id: number;
  name: string;
  country: string;
  city: string;
  ranking: number;
  tuitionFee: number;
  acceptanceRate: string;
  gpaRequirement: string;
  satRequirement: number;
  ieltsRequirement: number;
  toeflRequirement: number;
  programs: string[];
  scholarships: string[];
  researchOpportunities: boolean;
  campusSize: string;
  studentPopulation: number;
  internationalStudents: number;
  website: string;
  imageUrl?: string;
  description: string;
}

interface AdvancedAssessmentData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
    currentCountry: string;
    languagesProficient: string[];
  };
  academicBackground: {
    currentEducationLevel: string;
    fieldOfStudy: string;
    institutionName: string;
    graduationYear: string;
    gpa: string;
    gradingScale: string;
    academicAchievements?: string;
    researchExperience?: string;
  };
  studyPreferences: {
    intendedLevel: string;
    studyField: string;
    specificPrograms: string[];
    studyMode: string;
    startSemester: string;
    studyDuration: string;
    researchInterest?: string;
    careerGoals: string;
  };
  geographicPreferences: {
    preferredCountries: string[];
    preferredCities: string[];
    climatePreference: string;
    culturalPreferences: string[];
    languageRequirements: string[];
    proximityToHome: string;
  };
  financialPlanning: {
    annualBudget: string;
    tuitionBudget: string;
    livingExpensesBudget: string;
    fundingSources: string[];
    scholarshipInterest: string;
    workPermitInterest: string;
    financialSupport: string;
  };
  testScores: {
    englishTest?: string;
    englishScore?: string;
    englishTestDate?: string;
    standardizedTest?: string;
    standardizedScore?: string;
    standardizedTestDate?: string;
    gmatGre?: string;
    gmatGreScore?: string;
    otherTests?: string;
  };
  lifestyleFactors: {
    accommodationType: string;
    campusSize: string;
    socialEnvironment: string;
    extracurriculars: string[];
    dietaryRequirements?: string;
    healthConditions?: string;
    transportationNeeds?: string;
    technologyAccess: string;
  };
  additionalRequirements: {
    visaSupport: string;
    internshipOpportunities: string;
    industryConnections: string;
    alumniNetwork: string;
    postGraduation: string;
    specialNeeds?: string;
    additionalComments?: string;
  };
}

interface UniversityMatch {
  university: University;
  matchScore: number;
  matchReasons: string[];
  financialFit: string;
  academicFit: string;
  culturalFit: string;
  careerProspects: string;
  admissionProbability: string;
}

interface AnalysisResult {
  overallMatch: number;
  matches: UniversityMatch[];
  recommendations: string[];
  nextSteps: string[];
  analysisTime: number;
}

export async function generateAdvancedRecommendations(
  assessmentData: AdvancedAssessmentData,
  universities: University[]
): Promise<AnalysisResult> {
  const startTime = Date.now();

  try {
    // Create comprehensive analysis prompt
    const analysisPrompt = createAnalysisPrompt(assessmentData, universities);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert international education consultant and university matching AI. Your task is to analyze student profiles and provide comprehensive university recommendations based on multiple factors including academic fit, financial alignment, cultural compatibility, career prospects, and admission probability.

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text outside the JSON structure.

The response must include:
1. An overall match percentage (0-100)
2. Detailed analysis for each university
3. Personalized recommendations
4. Clear next steps for the student

Focus on providing actionable, data-driven insights that help students make informed decisions about their education journey.`
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const analysisContent = response.choices[0].message.content;
    if (!analysisContent) {
      throw new Error("No analysis content received from AI");
    }

    // Parse the AI response
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(analysisContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Invalid AI response format");
    }

    // Process and structure the results
    const processedMatches = processUniversityMatches(aiAnalysis.matches, universities);
    
    const analysisTime = Date.now() - startTime;

    return {
      overallMatch: aiAnalysis.overallMatch || 85,
      matches: processedMatches,
      recommendations: aiAnalysis.recommendations || [],
      nextSteps: aiAnalysis.nextSteps || [],
      analysisTime
    };

  } catch (error) {
    console.error("Error generating advanced recommendations:", error);
    
    // Fallback analysis if AI fails
    const fallbackAnalysis = generateFallbackAnalysis(assessmentData, universities);
    const analysisTime = Date.now() - startTime;
    
    return {
      ...fallbackAnalysis,
      analysisTime
    };
  }
}

function createAnalysisPrompt(assessmentData: AdvancedAssessmentData, universities: University[]): string {
  return `
Please analyze this student profile and provide comprehensive university recommendations:

STUDENT PROFILE:
Personal Information:
- Name: ${assessmentData.personalInfo.fullName}
- Nationality: ${assessmentData.personalInfo.nationality}
- Current Country: ${assessmentData.personalInfo.currentCountry}
- Languages: ${assessmentData.personalInfo.languagesProficient.join(", ")}

Academic Background:
- Current Level: ${assessmentData.academicBackground.currentEducationLevel}
- Field of Study: ${assessmentData.academicBackground.fieldOfStudy}
- Institution: ${assessmentData.academicBackground.institutionName}
- GPA: ${assessmentData.academicBackground.gpa} (${assessmentData.academicBackground.gradingScale})
- Graduation Year: ${assessmentData.academicBackground.graduationYear}
- Achievements: ${assessmentData.academicBackground.academicAchievements || "None specified"}
- Research Experience: ${assessmentData.academicBackground.researchExperience || "None specified"}

Study Preferences:
- Intended Level: ${assessmentData.studyPreferences.intendedLevel}
- Study Field: ${assessmentData.studyPreferences.studyField}
- Study Mode: ${assessmentData.studyPreferences.studyMode}
- Start Semester: ${assessmentData.studyPreferences.startSemester}
- Duration: ${assessmentData.studyPreferences.studyDuration}
- Career Goals: ${assessmentData.studyPreferences.careerGoals}
- Research Interests: ${assessmentData.studyPreferences.researchInterest || "None specified"}

Geographic Preferences:
- Preferred Countries: ${assessmentData.geographicPreferences.preferredCountries.join(", ")}
- Climate Preference: ${assessmentData.geographicPreferences.climatePreference}
- Cultural Preferences: ${assessmentData.geographicPreferences.culturalPreferences.join(", ")}
- Language Requirements: ${assessmentData.geographicPreferences.languageRequirements.join(", ")}

Financial Planning:
- Annual Budget: ${assessmentData.financialPlanning.annualBudget}
- Tuition Budget: ${assessmentData.financialPlanning.tuitionBudget}
- Living Expenses Budget: ${assessmentData.financialPlanning.livingExpensesBudget}
- Funding Sources: ${assessmentData.financialPlanning.fundingSources.join(", ")}
- Scholarship Interest: ${assessmentData.financialPlanning.scholarshipInterest}
- Financial Support: ${assessmentData.financialPlanning.financialSupport}

Test Scores:
- English Test: ${assessmentData.testScores.englishTest || "Not taken"} ${assessmentData.testScores.englishScore || ""}
- Standardized Test: ${assessmentData.testScores.standardizedTest || "Not taken"} ${assessmentData.testScores.standardizedScore || ""}
- GMAT/GRE: ${assessmentData.testScores.gmatGre || "Not taken"} ${assessmentData.testScores.gmatGreScore || ""}

Lifestyle Factors:
- Accommodation: ${assessmentData.lifestyleFactors.accommodationType}
- Campus Size: ${assessmentData.lifestyleFactors.campusSize}
- Social Environment: ${assessmentData.lifestyleFactors.socialEnvironment}
- Extracurriculars: ${assessmentData.lifestyleFactors.extracurriculars.join(", ")}

Additional Requirements:
- Visa Support: ${assessmentData.additionalRequirements.visaSupport}
- Internship Interest: ${assessmentData.additionalRequirements.internshipOpportunities}
- Industry Connections: ${assessmentData.additionalRequirements.industryConnections}
- Post-Graduation Plans: ${assessmentData.additionalRequirements.postGraduation}

AVAILABLE UNIVERSITIES:
${universities.map(uni => `
- ${uni.name} (${uni.city}, ${uni.country})
  Ranking: #${uni.ranking} | Tuition: $${uni.tuitionFee.toLocaleString()}
  Acceptance Rate: ${uni.acceptanceRate} | GPA Requirement: ${uni.gpaRequirement}
  IELTS: ${uni.ieltsRequirement} | TOEFL: ${uni.toeflRequirement}
  Programs: ${uni.programs.join(", ")}
  Campus: ${uni.campusSize} | Students: ${uni.studentPopulation.toLocaleString()}
  Research: ${uni.researchOpportunities ? "Yes" : "No"}
  Description: ${uni.description}
`).join("\n")}

Please provide a comprehensive analysis in the following JSON format:
{
  "overallMatch": <number 0-100>,
  "matches": [
    {
      "universityId": <university id>,
      "matchScore": <number 0-100>,
      "matchReasons": [
        "<specific reason 1>",
        "<specific reason 2>",
        "<specific reason 3>"
      ],
      "financialFit": "<Excellent|Good|Fair|Poor>",
      "academicFit": "<Excellent|Good|Fair|Poor>",
      "culturalFit": "<Excellent|Good|Fair|Poor>",
      "careerProspects": "<Excellent|Good|Fair|Poor>",
      "admissionProbability": "<High|Medium|Low>"
    }
  ],
  "recommendations": [
    "<personalized recommendation 1>",
    "<personalized recommendation 2>",
    "<personalized recommendation 3>",
    "<personalized recommendation 4>",
    "<personalized recommendation 5>"
  ],
  "nextSteps": [
    "<specific next step 1>",
    "<specific next step 2>",
    "<specific next step 3>",
    "<specific next step 4>",
    "<specific next step 5>"
  ]
}

Analyze each university carefully considering:
1. Academic program alignment with student's field and goals
2. Financial accessibility based on budget and funding sources
3. Admission requirements vs student's academic profile
4. Geographic and cultural preferences
5. Career prospects and industry connections
6. Research opportunities if relevant
7. Campus life and lifestyle fit

Provide specific, actionable insights for each match and overall recommendations.
`;
}

function processUniversityMatches(aiMatches: any[], universities: University[]): UniversityMatch[] {
  if (!Array.isArray(aiMatches)) {
    return [];
  }

  return aiMatches
    .map(match => {
      const university = universities.find(uni => uni.id === match.universityId);
      if (!university) return null;

      return {
        university,
        matchScore: match.matchScore || 75,
        matchReasons: Array.isArray(match.matchReasons) ? match.matchReasons : [
          "Strong academic program alignment",
          "Good financial fit within budget range",
          "Suitable campus environment"
        ],
        financialFit: match.financialFit || "Good",
        academicFit: match.academicFit || "Good",
        culturalFit: match.culturalFit || "Good",
        careerProspects: match.careerProspects || "Good",
        admissionProbability: match.admissionProbability || "Medium"
      };
    })
    .filter(Boolean) as UniversityMatch[];
}

function generateFallbackAnalysis(assessmentData: AdvancedAssessmentData, universities: University[]): Omit<AnalysisResult, 'analysisTime'> {
  // Simple rule-based matching as fallback
  const matches: UniversityMatch[] = universities
    .filter(uni => {
      // Filter by preferred countries
      if (assessmentData.geographicPreferences.preferredCountries.length > 0) {
        return assessmentData.geographicPreferences.preferredCountries.includes(uni.country);
      }
      return true;
    })
    .map(uni => {
      let matchScore = 60; // Base score

      // Academic field matching
      if (uni.programs.some(program => 
        program.toLowerCase().includes(assessmentData.studyPreferences.studyField.toLowerCase()) ||
        assessmentData.studyPreferences.studyField.toLowerCase().includes(program.toLowerCase())
      )) {
        matchScore += 20;
      }

      // Budget matching
      const budgetMap: { [key: string]: number } = {
        "under-20k": 20000,
        "20k-40k": 40000,
        "40k-60k": 60000,
        "60k-80k": 80000,
        "80k-100k": 100000,
        "over-100k": 150000
      };
      
      const maxBudget = budgetMap[assessmentData.financialPlanning.annualBudget] || 50000;
      if (uni.tuitionFee <= maxBudget * 0.8) {
        matchScore += 15;
      }

      // Campus size preference
      const preferredSize = assessmentData.lifestyleFactors.campusSize.toLowerCase();
      const actualSize = uni.campusSize.toLowerCase();
      if (preferredSize.includes(actualSize) || actualSize.includes(preferredSize)) {
        matchScore += 10;
      }

      matchScore = Math.min(100, Math.max(0, matchScore));

      return {
        university: uni,
        matchScore,
        matchReasons: [
          "Academic program alignment with your field of study",
          "Financial compatibility with your budget range",
          "Campus environment matches your preferences"
        ],
        financialFit: uni.tuitionFee <= maxBudget ? "Good" : "Fair",
        academicFit: "Good",
        culturalFit: "Good",
        careerProspects: "Good",
        admissionProbability: "Medium"
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6); // Top 6 matches

  const overallMatch = matches.length > 0 
    ? Math.round(matches.reduce((sum, match) => sum + match.matchScore, 0) / matches.length)
    : 75;

  return {
    overallMatch,
    matches,
    recommendations: [
      "Focus on universities with strong programs in your field of study",
      "Consider applying to a mix of reach, target, and safety schools",
      "Start preparing application materials early including personal statements",
      "Research scholarship opportunities at your target universities",
      "Consider improving test scores if needed for better admission chances"
    ],
    nextSteps: [
      "Research detailed admission requirements for each recommended university",
      "Prepare and take required standardized tests if not already completed",
      "Start drafting personal statements and essays",
      "Gather letters of recommendation from professors or employers",
      "Calculate total costs including living expenses for each location",
      "Apply for scholarships and financial aid opportunities"
    ]
  };
}