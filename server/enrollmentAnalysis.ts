import OpenAI from 'openai';
import { EnrollmentAnalysisResponse } from '@shared/schema';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Constants
const CACHE_DURATION_MINUTES = 60;
const MAX_INPUT_TOKENS = 15000;

// In-memory cache for analysis results
const analysisCache = new Map<string, { result: EnrollmentAnalysisResponse; timestamp: number }>();

/**
 * Generate cache key based on document type and key content fingerprint
 */
function generateCacheKey(documentType: string, text: string | undefined): string {
  if (!text) return `${documentType}_empty`;
  
  // Create a simple fingerprint from key parts of the text
  const fingerprint = text
    .slice(0, 500) + text.slice(-500) // First and last 500 chars
    .replace(/\s+/g, ' ')
    .toLowerCase();
  
  return `${documentType}_${Buffer.from(fingerprint).toString('base64').slice(0, 16)}`;
}

/**
 * Check cache for similar analysis
 */
function getCachedAnalysis(cacheKey: string): EnrollmentAnalysisResponse | null {
  const cached = analysisCache.get(cacheKey);
  if (!cached) return null;
  
  const ageMinutes = (Date.now() - cached.timestamp) / (1000 * 60);
  if (ageMinutes > CACHE_DURATION_MINUTES) {
    analysisCache.delete(cacheKey);
    return null;
  }
  
  return cached.result;
}

/**
 * Store analysis in cache
 */
function cacheAnalysis(cacheKey: string, result: EnrollmentAnalysisResponse): void {
  if (analysisCache.size > 100) {
    const oldestKey = analysisCache.keys().next().value as string | undefined;
    if (oldestKey) {
      analysisCache.delete(oldestKey);
    }
  }
  
  analysisCache.set(cacheKey, { result, timestamp: Date.now() });
}

/**
 * Truncate text to stay within token limits
 */
function truncateText(text: string, maxTokens: number = MAX_INPUT_TOKENS): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;
  
  const keepStart = Math.floor(maxChars * 0.7);
  const keepEnd = maxChars - keepStart - 100;
  
  return text.slice(0, keepStart) + "\n\n[... DOCUMENT TRUNCATED FOR ANALYSIS ...]\n\n" + text.slice(-keepEnd);
}

/**
 * Enhanced CoE-specific analysis prompt for comprehensive strategic analysis
 */
function getCoEAnalysisPrompt(documentText: string): string {
  return `You are an expert education consultant specializing in Confirmation of Enrollment (COE) document analysis and international student guidance. Perform comprehensive analysis of this entire COE document with strategic insights, compliance assessment, and actionable recommendations.

COMPLETE DOCUMENT TEXT FOR FULL ANALYSIS:
${documentText}

COMPREHENSIVE ANALYSIS REQUIREMENTS:
Analyze the ENTIRE DOCUMENT including all sections, terms, conditions, compliance requirements, and fine print. Provide strategic insights, risk assessment, and actionable guidance rather than basic data extraction.

KEY ANALYSIS FOCUS AREAS:
1. COMPLETE DOCUMENT EXAMINATION: Analyze every section, compliance requirements, and institutional obligations
2. COMPLIANCE & RISK ASSESSMENT: Identify visa risks, academic compliance issues, and institutional requirements  
3. STRATEGIC ENROLLMENT GUIDANCE: Provide specific action plans for successful enrollment and visa application
4. FINANCIAL OPTIMIZATION: Analyze all costs, payment requirements, and potential savings opportunities
5. TIMELINE OPTIMIZATION: Create detailed timeline with all critical deadlines and milestones
6. INSTITUTIONAL VERIFICATION: Assess institution credibility, accreditation, and program quality
7. ACTIONABLE RECOMMENDATIONS: Provide prioritized, specific actions with clear timelines

Return comprehensive analysis in JSON format with detailed strategic insights:

{
  "documentAnalysis": {
    "totalPages": "Number of pages analyzed",
    "documentSections": ["List all major sections found in document"],
    "documentType": "COE/Enrollment Confirmation type",
    "issuingAuthority": "Institution or government body that issued document",
    "documentValidity": "Valid/Invalid/Requires verification",
    "termsAndConditions": {
      "enrollmentRequirements": ["Specific enrollment conditions and requirements"],
      "academicObligations": ["GPA requirements, attendance, academic progress requirements"],
      "financialObligations": ["Payment schedules, fees, deposit requirements"],
      "complianceRequirements": ["Visa, immigration, health, insurance requirements"],
      "institutionalPolicies": ["Academic policies, conduct requirements, disciplinary procedures"],
      "withdrawalPolicies": ["Refund policies, withdrawal procedures, penalties"],
      "criticalDeadlines": ["All time-sensitive requirements with exact dates"],
      "penalties": ["Financial and academic penalties for non-compliance"]
    },
    "riskAssessment": {
      "visaRisks": ["Potential visa application and compliance risks"],
      "academicRisks": ["Academic performance and progression risks"],
      "financialRisks": ["Cost overruns, hidden fees, financial compliance risks"],
      "institutionalRisks": ["Institution credibility, accreditation, quality risks"],
      "complianceRisks": ["Regulatory, legal, immigration compliance risks"],
      "mitigationStrategies": ["Specific actions to reduce identified risks"]
    }
  },
  "institutionDetails": {
    "institutionName": "Official institution name",
    "tradingName": "Trading name if different",
    "registrationCode": "CRICOS/registration number with verification status",
    "accreditation": "Accreditation status and recognized qualifications",
    "institutionRanking": "Rankings, reputation, and quality indicators",
    "country": "Country and specific location",
    "contactInfo": {
      "phone": "Official contact phone number",
      "email": "Official email address",
      "website": "Official website URL",
      "address": "Complete institutional address"
    },
    "credibilityAssessment": "Assessment of institution legitimacy and quality"
  },
  "courseDetails": {
    "courseTitle": "Complete official course name",
    "courseCode": "Course registration number with verification",
    "level": "Bachelor/Master/Diploma/Certificate/PhD",
    "fieldOfStudy": "Specific field and specialization",
    "accreditation": "Professional accreditation and recognition status",
    "qualityAssessment": "Course quality, industry recognition, employment outcomes",
    "duration": {
      "startDate": "DD/MM/YYYY",
      "endDate": "DD/MM/YYYY",
      "totalDuration": "X years Y months"
    },
    "studyMode": "Full-time/Part-time/Online"
  },
  "financialDetails": {
    "totalTuitionFee": "currency and amount",
    "initialPrepaid": "currency and amount",
    "otherFees": "currency and amount",
    "costBreakdown": {
      "perYear": "calculated amount",
      "perSemester": "calculated amount"
    },
    "scholarships": {
      "details": "scholarship information if any",
      "value": "amount or percentage"
    }
  },
  "studentDetails": {
    "studentId": "provider student ID",
    "fullName": "student full name",
    "dateOfBirth": "DD/MM/YYYY",
    "age": "calculated age",
    "gender": "gender",
    "nationality": "country",
    "countryOfBirth": "country"
  },
  "languageRequirements": {
    "testType": "IELTS/TOEFL/PTE/Other",
    "scoreAchieved": "score",
    "testDate": "DD/MM/YYYY",
    "scoreValidity": "days remaining/expired",
    "requirementStatus": "Met/Not Met"
  },
  "healthInsurance": {
    "oshcRequired": "Yes/No",
    "provider": "insurance company",
    "coverageType": "Single/Family/Couple",
    "coveragePeriod": {
      "startDate": "DD/MM/YYYY",
      "endDate": "DD/MM/YYYY",
      "duration": "X months"
    },
    "estimatedCost": "currency and amount"
  },
  "keyDatesDeadlines": {
    "courseCommencement": "DD/MM/YYYY",
    "oshcStart": "DD/MM/YYYY",
    "visaApplicationDeadline": "estimated date",
    "enrollmentConfirmation": "DD/MM/YYYY",
    "urgentActions": ["list of immediate actions needed"]
  },
  "complianceInfo": {
    "cricosRegistration": "Valid/Check Required",
    "esosCompliance": "Compliant",
    "governmentRegistration": "Verified",
    "importantNotes": ["key compliance requirements"]
  },
  "strategicAnalysis": {
    "enrollmentViability": "Assessment of enrollment feasibility and success probability",
    "visaApplicationStrength": "Analysis of visa application prospects based on COE",
    "academicProgression": "Academic requirements and progression pathway analysis",
    "financialFeasibility": "Complete financial assessment and sustainability analysis",
    "complianceStatus": "Overall compliance assessment with recommendations",
    "institutionalQuality": "Institution quality and program value assessment"
  },
  "actionPlan": {
    "immediateActions": [
      {
        "action": "Specific immediate action required",
        "deadline": "Exact deadline with date",
        "priority": "Critical/High/Medium/Low",
        "description": "Detailed action description",
        "consequences": "What happens if not completed"
      }
    ],
    "shortTermActions": [
      {
        "action": "Short-term strategic action",
        "timeline": "1-4 weeks timeline",
        "priority": "Critical/High/Medium/Low",
        "description": "Detailed implementation plan",
        "requirements": ["Prerequisites and requirements"]
      }
    ],
    "longTermPlanning": [
      {
        "action": "Long-term strategic planning",
        "timeline": "1-6 months timeline",
        "priority": "High/Medium/Low",
        "description": "Strategic planning and preparation",
        "benefits": ["Expected benefits and outcomes"]
      }
    ]
  },
  "financialOptimization": {
    "totalProgramCost": "Complete cost breakdown including all fees",
    "paymentSchedule": "Detailed payment timeline and requirements",
    "potentialSavings": [
      {
        "strategy": "Cost-saving strategy",
        "amount": "Potential savings amount",
        "implementation": "How to implement this strategy",
        "feasibility": "High/Medium/Low feasibility"
      }
    ],
    "fundingOpportunities": [
      {
        "type": "Scholarship/Grant/Financial Aid type",
        "description": "Detailed funding opportunity description",
        "eligibility": "Eligibility requirements",
        "applicationProcess": "How to apply",
        "deadline": "Application deadline"
      }
    ]
  },
  "complianceGuidance": {
    "visaRequirements": [
      {
        "requirement": "Specific visa requirement",
        "status": "Met/Requires Action/Unknown",
        "action": "Required action to meet requirement",
        "deadline": "Compliance deadline"
      }
    ],
    "academicCompliance": [
      {
        "requirement": "Academic compliance requirement",
        "status": "Met/Requires Action/Unknown",
        "action": "Required action for compliance",
        "monitoring": "How to maintain compliance"
      }
    ],
    "institutionalCompliance": [
      {
        "requirement": "Institutional requirement",
        "status": "Met/Requires Action/Unknown",
        "action": "Required action",
        "verification": "How to verify compliance"
      }
    ]
  },
  "summary": "Comprehensive strategic summary with key insights and recommendations",
  "keyFindings": [
    {
      "category": "academic/financial/visa/compliance/institutional",
      "finding": "Specific strategic finding with implications",
      "importance": "Critical/High/Medium/Low",
      "impact": "Impact on enrollment success and student outcomes",
      "actionRequired": "Specific action needed",
      "deadline": "Deadline if applicable",
      "consequences": "Consequences of inaction"
    }
  ],
  "recommendations": [
    {
      "category": "visa/academic/financial/compliance/strategic",
      "recommendation": "Detailed strategic recommendation",
      "priority": "Critical/High/Medium/Low",
      "rationale": "Why this recommendation is important",
      "implementation": "How to implement this recommendation",
      "timeline": "When to implement",
      "successMetrics": "How to measure success"
    }
  ],
  "nextSteps": [
    {
      "step": "Specific next step",
      "description": "Detailed description and implementation guidance",
      "timeline": "When to complete with specific dates",
      "priority": "Critical/High/Medium/Low",
      "dependencies": ["Prerequisites or dependencies"],
      "resources": ["Required resources or support"],
      "successCriteria": "How to know when completed successfully"
    }
  ]
}

ANALYSIS DEPTH REQUIREMENTS:
- Analyze complete document including all sections, terms, and compliance requirements
- Provide strategic insights and actionable recommendations rather than basic data extraction
- Include detailed risk assessment and mitigation strategies
- Offer comprehensive compliance guidance and timeline optimization
- Focus on enrollment success, visa application strength, and academic progression
- Ensure all recommendations are specific, measurable, and achievable

RESPONSE FORMAT: Provide complete strategic analysis in JSON format with all required sections and detailed insights.

Extract all available information from the complete document. If information is not found, use "Not specified in document" for that field.`;
}

/**
 * Analyze enrollment confirmation documents using OpenAI
 */
export async function analyzeEnrollmentDocument(
  documentText: string,
  documentType: string,
  filename: string
): Promise<{ analysis: EnrollmentAnalysisResponse; tokensUsed: number; processingTime: number }> {
  const startTime = Date.now();
  
  try {
    // Check cache first
    const cacheKey = generateCacheKey(documentType, documentText || '');
    const cachedResult = getCachedAnalysis(cacheKey);
    
    if (cachedResult) {
      console.log(`Cache hit for enrollment analysis: ${cacheKey}`);
      return {
        analysis: cachedResult,
        tokensUsed: 0,
        processingTime: Date.now() - startTime
      };
    }

    // For non-COE documents, return template not available message
    if (documentType !== 'coe') {
      const fallbackAnalysis: EnrollmentAnalysisResponse = {
        summary: `Analysis for ${documentType} documents is not yet available. Currently, only Confirmation of Enrollment (COE) documents are supported with our specialized template. Please select COE as the document type if you have uploaded a COE document, or wait for additional templates to become available.`,
        institutionName: 'Template not available',
        studentName: 'Template not available',
        programName: 'Template not available',
        programLevel: 'Template not available',
        startDate: 'Template not available',
        endDate: 'Template not available',
        tuitionAmount: 'Template not available',
        scholarshipDetails: 'Template not available',
        keyFindings: [{
          title: 'Template Not Available',
          description: `${documentType} analysis template is not yet available`,
          importance: 'high' as const,
          category: 'other',
          actionRequired: 'Please use CoE document type for now',
          deadline: 'N/A'
        }],
        recommendations: [{
          title: 'Use CoE Template',
          description: 'Please upload a CoE document or wait for additional templates',
          category: 'documentation',
          priority: 'urgent' as const
        }],
        nextSteps: [{
          category: 'immediate',
          step: 'Upload CoE document',
          description: 'Currently only CoE (Confirmation of Enrollment) documents are supported with specialized templates'
        }],
        missingInformation: [],
        isValid: false,
        complianceIssues: [],
        analysisScore: 0,
        confidence: 0
      };
      
      return {
        analysis: fallbackAnalysis,
        tokensUsed: 0,
        processingTime: Date.now() - startTime
      };
    }

    // Truncate text if needed
    const truncatedText = truncateText(documentText || '');
    
    // Use CoE-specific prompt
    const prompt = getCoEAnalysisPrompt(truncatedText);
    
    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing Australian Confirmation of Enrollment (CoE) documents. Extract information accurately and return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 4000,
    });

    const analysisText = response.choices[0].message.content;
    if (!analysisText) {
      throw new Error('No analysis content received from OpenAI');
    }

    // Parse the JSON response
    let analysis: EnrollmentAnalysisResponse;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', analysisText);
      throw new Error('Invalid JSON response from analysis');
    }

    const tokensUsed = response.usage?.total_tokens || 0;
    
    // Cache the result
    cacheAnalysis(cacheKey, analysis);
    
    console.log(`Enrollment analysis completed in ${Date.now() - startTime}ms using ${tokensUsed} tokens`);
    
    return {
      analysis,
      tokensUsed,
      processingTime: Date.now() - startTime
    };

  } catch (error: any) {
    console.error('Enrollment analysis error:', error);
    
    // Return fallback analysis
    const fallbackAnalysis: EnrollmentAnalysisResponse = {
      summary: `Unable to fully analyze this ${documentType} due to processing limitations. Please verify all information manually and consult with qualified education counselors for accurate guidance.`,
      institutionName: 'Analysis failed',
      studentName: 'Analysis failed', 
      programName: 'Analysis failed',
      programLevel: 'Analysis failed',
      startDate: 'Analysis failed',
      endDate: 'Analysis failed',
      tuitionAmount: 'Analysis failed',
      scholarshipDetails: 'Analysis failed',
      keyFindings: [{
        title: 'Analysis Failed',
        description: 'Analysis processing failed',
        importance: 'high' as const,
        category: 'other'
      }],
      recommendations: [{
        title: 'Try Again',
        description: 'Please try again or contact support',
        category: 'documentation',
        priority: 'urgent' as const
      }],
      nextSteps: [{
        category: 'immediate',
        step: 'Retry analysis',
        description: 'Please try uploading the document again'
      }],
      missingInformation: [],
      isValid: false,
      complianceIssues: [],
      analysisScore: 0,
      confidence: 0
    };
    
    return {
      analysis: fallbackAnalysis,
      tokensUsed: 0,
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats() {
  return {
    size: analysisCache.size,
    entries: Array.from(analysisCache.keys())
  };
}

/**
 * Clear cache (for admin use)
 */
export function clearAnalysisCache() {
  analysisCache.clear();
}