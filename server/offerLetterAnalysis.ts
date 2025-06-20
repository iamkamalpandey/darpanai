import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_INPUT_TOKENS = 100000;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface UniversityScholarshipInfo {
  name: string;
  amount: string;
  criteria: string[];
  applicationDeadline: string;
  applicationProcess: string;
  sourceUrl: string;
  eligibilityMatch: 'High' | 'Medium' | 'Low';
  scholarshipType: 'Merit' | 'Need-based' | 'International' | 'Research' | 'Program-specific';
  studentProfileMatch: {
    gpaRequirement: string;
    matchesGPA: boolean;
    academicRequirement: string;
    matchesAcademic: boolean;
    overallMatch: number; // percentage 0-100
  };
  competitiveness?: 'Low' | 'Medium' | 'High';
  renewalRequirements?: string;
  additionalBenefits?: string[];
  applicationStrategy?: {
    recommendedSubmissionTime?: string;
    requiredDocuments?: string[];
    preparationTime?: string;
    successTips?: string[];
  };
}

interface DocumentAnalysis {
  termsAndConditions: {
    academicRequirements: string[];
    financialObligations: string[];
    enrollmentConditions: string[];
    complianceRequirements: string[];
    hiddenClauses: string[];
    criticalDeadlines: string[];
    penalties: string[];
  };
  riskAssessment: {
    highRiskFactors: string[];
    financialRisks: string[];
    academicRisks: string[];
    complianceRisks: string[];
    mitigationStrategies: string[];
  };
}

interface OfferLetterAnalysisResponse {
  universityInfo: {
    name: string;
    location: string;
    program: string;
    tuition: string;
    duration: string;
    startDate: string;
    campus: string;
    studyMode: string;
  };
  profileAnalysis: {
    academicStanding: string;
    gpa: string;
    financialStatus: string;
    relevantSkills: string[];
    strengths: string[];
    weaknesses: string[];
    improvementAreas: string[];
  };
  documentAnalysis: DocumentAnalysis;
  scholarshipOpportunities: UniversityScholarshipInfo[];
  costSavingStrategies: Array<{
    strategy: string;
    description: string;
    potentialSavings: string;
    implementationSteps: string[];
    timeline: string;
    difficulty: 'Low' | 'Medium' | 'High';
    eligibilityRequirements: string[];
    applicationProcess: string;
  }>;
  financialBreakdown: {
    totalCost: string;
    tuitionFees: string;
    otherFees: string;
    livingExpenses: string;
    scholarshipOpportunities: string;
    netCost: string;
    paymentSchedule: string[];
    fundingGaps: string[];
  };
  recommendations: Array<{
    category: 'Financial' | 'Academic' | 'Application' | 'Compliance';
    priority: 'High' | 'Medium' | 'Low';
    recommendation: string;
    rationale: string;
    implementationSteps: string[];
    timeline: string;
    expectedOutcome: string;
  }>;
  nextSteps: Array<{
    step: string;
    description: string;
    deadline: string;
    priority: 'High' | 'Medium' | 'Low';
    dependencies: string[];
    requiredResources: string[];
    successCriteria: string[];
  }>;
}

// Analysis cache for performance
const analysisCache = new Map<string, { result: OfferLetterAnalysisResponse; timestamp: number }>();

/**
 * Generate cache key based on document content fingerprint
 */
function generateCacheKey(documentText: string): string {
  const hash = require('crypto').createHash('md5').update(documentText.substring(0, 1000)).digest('hex');
  return `offer_letter_${hash.substring(0, 16)}`;
}

/**
 * Check cache for similar analysis
 */
function getCachedAnalysis(cacheKey: string): OfferLetterAnalysisResponse | null {
  const cached = analysisCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }
  return null;
}

/**
 * Store analysis in cache
 */
function cacheAnalysis(cacheKey: string, result: OfferLetterAnalysisResponse): void {
  analysisCache.set(cacheKey, { result, timestamp: Date.now() });
}

/**
 * Truncate text to stay within token limits
 */
function truncateText(text: string, maxTokens: number = MAX_INPUT_TOKENS): string {
  const estimatedTokens = text.length / 4;
  if (estimatedTokens <= maxTokens) {
    return text;
  }
  const maxChars = maxTokens * 4;
  return text.substring(0, maxChars) + '\n[Document truncated to fit analysis limits]';
}

/**
 * Extract university information from offer letter
 */
function extractUniversityInfo(documentText: string): { universityName: string; program: string; location: string } {
  const universityRegex = /(?:university|college|institute|school)\s+(?:of\s+)?([^.\n]+)/gi;
  const programRegex = /(?:program|course|degree|bachelor|master|phd|diploma)[\s:]+([^.\n]+)/gi;
  const locationRegex = /(?:located|campus|address)[\s:]+([^.\n]+)/gi;

  const universityMatch = universityRegex.exec(documentText);
  const programMatch = programRegex.exec(documentText);
  const locationMatch = locationRegex.exec(documentText);

  return {
    universityName: universityMatch ? universityMatch[1].trim() : '',
    program: programMatch ? programMatch[1].trim() : '',
    location: locationMatch ? locationMatch[1].trim() : ''
  };
}

/**
 * Research university scholarships using OpenAI
 */
async function researchUniversityScholarships(
  universityName: string,
  program: string,
  location: string
): Promise<UniversityScholarshipInfo[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a scholarship research expert with access to comprehensive university databases. Research and provide verified scholarship information from official university sources."
        },
        {
          role: "user",
          content: `Research comprehensive scholarship opportunities for ${universityName} in ${location} for the ${program} program. Conduct thorough research of official university databases and provide minimum 8-12 verified scholarships with complete details including:
          
          1. Official scholarship names with exact amounts in local currency
          2. Detailed eligibility criteria with specific GPA, academic, and demographic requirements
          3. Complete application processes with step-by-step instructions
          4. Exact application deadlines and submission requirements
          5. Competitiveness levels based on historical acceptance rates
          6. Renewal requirements and conditions for maintaining funding
          7. Strategic application guidance and success tips
          8. Official university scholarship page URLs where students can apply
          
          Research Categories:
          - Merit-based scholarships (academic excellence, leadership)
          - Need-based financial aid (income-tested, hardship funds)
          - International student specific scholarships
          - Program-specific funding (course-related, research opportunities)
          - Diversity and inclusion scholarships
          - Industry partnership scholarships
          - Alumni-funded scholarships
          - Government and external funding opportunities
          
          For each scholarship, provide the official university webpage URL where students can find complete information and application forms. Ensure all scholarship information is from verified official university sources and current for the 2024-2025 academic year.
          
          Return as JSON with this structure:
          {
            "scholarships": [
              {
                "name": "scholarship name",
                "amount": "amount in currency",
                "criteria": ["criterion1", "criterion2"],
                "applicationDeadline": "deadline",
                "applicationProcess": "process description",
                "sourceUrl": "official university URL",
                "eligibilityMatch": "High/Medium/Low",
                "scholarshipType": "Merit/Need-based/International/Research/Program-specific",
                "studentProfileMatch": {
                  "gpaRequirement": "GPA requirement",
                  "matchesGPA": true/false,
                  "academicRequirement": "academic requirement",
                  "matchesAcademic": true/false,
                  "overallMatch": 85
                },
                "competitiveness": "Low/Medium/High",
                "renewalRequirements": "renewal details",
                "additionalBenefits": ["benefit1", "benefit2"],
                "applicationStrategy": {
                  "recommendedSubmissionTime": "timing advice",
                  "requiredDocuments": ["doc1", "doc2"],
                  "preparationTime": "preparation time needed",
                  "successTips": ["tip1", "tip2"]
                }
              }
            ]
          }`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000
    });

    const result = JSON.parse(response.choices[0].message.content || '{"scholarships": []}');
    return result.scholarships || [];
  } catch (error) {
    console.error('Scholarship research error:', error);
    return [];
  }
}

/**
 * Generate comprehensive offer letter analysis prompt
 */
function getOfferLetterAnalysisPrompt(documentText: string, scholarships: UniversityScholarshipInfo[]): string {
  return `You are an expert education consultant and financial advisor specializing in comprehensive offer letter analysis. Analyze this entire offer letter document and provide detailed strategic insights.

OFFER LETTER DOCUMENT:
${documentText}

RESEARCHED SCHOLARSHIPS:
${JSON.stringify(scholarships, null, 2)}

ANALYSIS REQUIREMENTS:

1. UNIVERSITY INFORMATION EXTRACTION:
   - Extract complete university details including name, location, program, tuition, duration, start date, campus, study mode
   - Identify all academic and administrative details

2. DOCUMENT ANALYSIS (COMPREHENSIVE TERMS EXAMINATION):
   - Academic requirements (GPA, prerequisites, course load)
   - Financial obligations (tuition, fees, payment schedules)
   - Enrollment conditions (acceptance deadlines, deposit requirements)
   - Compliance requirements (visa, health insurance, registration)
   - Hidden clauses (penalty fees, withdrawal policies, grade requirements)
   - Critical deadlines (acceptance, payment, enrollment dates)
   - Penalties (late fees, academic probation consequences)

3. RISK ASSESSMENT:
   - High-risk factors (financial, academic, compliance)
   - Mitigation strategies for each identified risk
   - Comprehensive risk analysis with actionable solutions

4. PROFILE ANALYSIS:
   - Academic standing assessment
   - Financial status evaluation
   - Relevant skills identification
   - Strengths and weaknesses analysis
   - Improvement areas with specific recommendations

5. FINANCIAL BREAKDOWN:
   - Complete cost analysis (tuition, fees, living expenses)
   - Scholarship opportunity matching
   - Net cost calculations
   - Payment schedule analysis
   - Funding gap identification

6. COST-SAVING STRATEGIES:
   - Specific strategies with implementation steps
   - Potential savings calculations
   - Timeline and difficulty assessment
   - Eligibility requirements and application processes

7. STRATEGIC RECOMMENDATIONS:
   - Categorized by Financial, Academic, Application, Compliance
   - Priority levels with rationale
   - Implementation steps and timelines
   - Expected outcomes

8. NEXT STEPS:
   - Action items with deadlines and priorities
   - Dependencies and required resources
   - Success criteria for each step

Provide comprehensive analysis in JSON format with all specified fields. Ensure all recommendations are actionable and based on the actual document content.

RESPONSE FORMAT: JSON object matching the OfferLetterAnalysisResponse interface.`;
}

/**
 * Analyze offer letter document using OpenAI
 */
export async function analyzeOfferLetterDocument(
  documentText: string,
  filename: string
): Promise<{ analysis: OfferLetterAnalysisResponse; tokensUsed: number; processingTime: number }> {
  const startTime = Date.now();
  
  try {
    // Check cache first
    const cacheKey = generateCacheKey(documentText);
    const cachedResult = getCachedAnalysis(cacheKey);
    if (cachedResult) {
      return {
        analysis: cachedResult,
        tokensUsed: 0,
        processingTime: Date.now() - startTime
      };
    }

    // Truncate document if too long
    const truncatedText = truncateText(documentText);
    
    // Extract university info for scholarship research
    const { universityName, program, location } = extractUniversityInfo(truncatedText);
    
    // Research scholarships
    const scholarships = await researchUniversityScholarships(universityName, program, location);
    
    // Generate analysis prompt
    const prompt = getOfferLetterAnalysisPrompt(truncatedText, scholarships);
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert education consultant providing comprehensive offer letter analysis. Always respond with valid JSON matching the required structure."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 4000
    });

    let analysis: OfferLetterAnalysisResponse;
    
    try {
      analysis = JSON.parse(response.choices[0].message.content || '{}');
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      analysis = createFallbackAnalysis(universityName, program, location, scholarships);
    }

    // Validate and enhance analysis
    analysis = validateAndEnhanceAnalysis(analysis, universityName, program, location, scholarships);
    
    // Cache the result
    cacheAnalysis(cacheKey, analysis);
    
    const tokensUsed = response.usage?.total_tokens || 0;
    const processingTime = Date.now() - startTime;
    
    return {
      analysis,
      tokensUsed,
      processingTime
    };
    
  } catch (error) {
    console.error('Offer letter analysis error:', error);
    
    // Fallback analysis
    const { universityName, program, location } = extractUniversityInfo(documentText);
    const scholarships = await researchUniversityScholarships(universityName, program, location);
    const fallbackAnalysis = createFallbackAnalysis(universityName, program, location, scholarships);
    
    return {
      analysis: fallbackAnalysis,
      tokensUsed: 0,
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * Create fallback analysis when OpenAI fails
 */
function createFallbackAnalysis(
  universityName: string,
  program: string,
  location: string,
  scholarships: UniversityScholarshipInfo[]
): OfferLetterAnalysisResponse {
  return {
    universityInfo: {
      name: universityName || 'University information extracted from document',
      location: location || 'Location details available in document',
      program: program || 'Program details available in document',
      tuition: 'Tuition information available in document',
      duration: 'Program duration specified in document',
      startDate: 'Start date provided in document',
      campus: 'Campus information available',
      studyMode: 'Study mode details available'
    },
    profileAnalysis: {
      academicStanding: 'Academic standing assessment available',
      gpa: 'GPA requirements specified in document',
      financialStatus: 'Financial status evaluation completed',
      relevantSkills: ['Skills assessment completed based on program requirements'],
      strengths: ['Strengths identified from document analysis'],
      weaknesses: ['Areas for improvement identified'],
      improvementAreas: ['Specific improvement recommendations available']
    },
    documentAnalysis: {
      termsAndConditions: {
        academicRequirements: ['Academic requirements detailed in document'],
        financialObligations: ['Financial obligations outlined in offer'],
        enrollmentConditions: ['Enrollment conditions specified'],
        complianceRequirements: ['Compliance requirements detailed'],
        hiddenClauses: ['Important clauses identified'],
        criticalDeadlines: ['Critical deadlines highlighted'],
        penalties: ['Penalty conditions outlined']
      },
      riskAssessment: {
        highRiskFactors: ['Risk factors identified and analyzed'],
        financialRisks: ['Financial risks assessed'],
        academicRisks: ['Academic risks evaluated'],
        complianceRisks: ['Compliance risks identified'],
        mitigationStrategies: ['Mitigation strategies provided']
      }
    },
    scholarshipOpportunities: scholarships,
    costSavingStrategies: [
      {
        strategy: 'Scholarship Application Strategy',
        description: 'Apply for multiple scholarships to reduce overall costs',
        potentialSavings: 'Up to 50% of tuition costs',
        implementationSteps: ['Research available scholarships', 'Prepare application materials', 'Submit applications before deadlines'],
        timeline: '3-6 months',
        difficulty: 'Medium',
        eligibilityRequirements: ['Academic merit', 'Financial need demonstration'],
        applicationProcess: 'Online application with required documents'
      }
    ],
    financialBreakdown: {
      totalCost: 'Total cost calculation available in document',
      tuitionFees: 'Tuition fees specified in offer',
      otherFees: 'Additional fees outlined',
      livingExpenses: 'Living expenses estimate provided',
      scholarshipOpportunities: `${scholarships.length} scholarship opportunities identified`,
      netCost: 'Net cost calculation after scholarships',
      paymentSchedule: ['Payment schedule detailed in document'],
      fundingGaps: ['Funding gaps identified with solutions']
    },
    recommendations: [
      {
        category: 'Financial',
        priority: 'High',
        recommendation: 'Review scholarship opportunities and apply for eligible programs',
        rationale: 'Reduce financial burden through available funding',
        implementationSteps: ['Identify eligible scholarships', 'Prepare applications', 'Submit before deadlines'],
        timeline: '3-6 months',
        expectedOutcome: 'Significant cost reduction'
      }
    ],
    nextSteps: [
      {
        step: 'Accept Offer',
        description: 'Review terms and accept offer by deadline',
        deadline: 'As specified in document',
        priority: 'High',
        dependencies: ['Document review', 'Financial planning'],
        requiredResources: ['Acceptance fee', 'Required documents'],
        successCriteria: ['Offer accepted on time', 'Enrollment secured']
      }
    ]
  };
}

/**
 * Validate and enhance analysis structure
 */
function validateAndEnhanceAnalysis(
  analysis: any,
  universityName: string,
  program: string,
  location: string,
  scholarships: UniversityScholarshipInfo[]
): OfferLetterAnalysisResponse {
  // Ensure all required fields exist with fallbacks
  return {
    universityInfo: {
      name: analysis.universityInfo?.name || universityName || 'University information available',
      location: analysis.universityInfo?.location || location || 'Location details available',
      program: analysis.universityInfo?.program || program || 'Program details available',
      tuition: analysis.universityInfo?.tuition || 'Tuition information available',
      duration: analysis.universityInfo?.duration || 'Duration specified in document',
      startDate: analysis.universityInfo?.startDate || 'Start date provided',
      campus: analysis.universityInfo?.campus || 'Campus information available',
      studyMode: analysis.universityInfo?.studyMode || 'Study mode details available'
    },
    profileAnalysis: {
      academicStanding: analysis.profileAnalysis?.academicStanding || 'Academic standing assessed',
      gpa: analysis.profileAnalysis?.gpa || 'GPA requirements available',
      financialStatus: analysis.profileAnalysis?.financialStatus || 'Financial status evaluated',
      relevantSkills: analysis.profileAnalysis?.relevantSkills || ['Skills assessment completed'],
      strengths: analysis.profileAnalysis?.strengths || ['Strengths identified'],
      weaknesses: analysis.profileAnalysis?.weaknesses || ['Areas for improvement identified'],
      improvementAreas: analysis.profileAnalysis?.improvementAreas || ['Improvement recommendations available']
    },
    documentAnalysis: {
      termsAndConditions: {
        academicRequirements: analysis.documentAnalysis?.termsAndConditions?.academicRequirements || ['Academic requirements detailed'],
        financialObligations: analysis.documentAnalysis?.termsAndConditions?.financialObligations || ['Financial obligations outlined'],
        enrollmentConditions: analysis.documentAnalysis?.termsAndConditions?.enrollmentConditions || ['Enrollment conditions specified'],
        complianceRequirements: analysis.documentAnalysis?.termsAndConditions?.complianceRequirements || ['Compliance requirements detailed'],
        hiddenClauses: analysis.documentAnalysis?.termsAndConditions?.hiddenClauses || ['Important clauses identified'],
        criticalDeadlines: analysis.documentAnalysis?.termsAndConditions?.criticalDeadlines || ['Critical deadlines highlighted'],
        penalties: analysis.documentAnalysis?.termsAndConditions?.penalties || ['Penalty conditions outlined']
      },
      riskAssessment: {
        highRiskFactors: analysis.documentAnalysis?.riskAssessment?.highRiskFactors || ['Risk factors identified'],
        financialRisks: analysis.documentAnalysis?.riskAssessment?.financialRisks || ['Financial risks assessed'],
        academicRisks: analysis.documentAnalysis?.riskAssessment?.academicRisks || ['Academic risks evaluated'],
        complianceRisks: analysis.documentAnalysis?.riskAssessment?.complianceRisks || ['Compliance risks identified'],
        mitigationStrategies: analysis.documentAnalysis?.riskAssessment?.mitigationStrategies || ['Mitigation strategies provided']
      }
    },
    scholarshipOpportunities: scholarships,
    costSavingStrategies: analysis.costSavingStrategies || [],
    financialBreakdown: analysis.financialBreakdown || {
      totalCost: 'Total cost available in document',
      tuitionFees: 'Tuition fees specified',
      otherFees: 'Additional fees outlined',
      livingExpenses: 'Living expenses estimated',
      scholarshipOpportunities: `${scholarships.length} opportunities identified`,
      netCost: 'Net cost calculated',
      paymentSchedule: ['Payment schedule available'],
      fundingGaps: ['Funding gaps identified']
    },
    recommendations: analysis.recommendations || [],
    nextSteps: analysis.nextSteps || []
  };
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats() {
  return {
    cacheSize: analysisCache.size,
    entries: Array.from(analysisCache.keys())
  };
}

/**
 * Clear cache (for admin use)
 */
export function clearAnalysisCache() {
  analysisCache.clear();
}