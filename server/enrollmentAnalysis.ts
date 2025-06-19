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
 * CoE-specific analysis prompt for detailed extraction
 */
function getCoEAnalysisPrompt(documentText: string): string {
  return `You are analyzing a Confirmation of Enrollment (COE) document from any country. Extract the following specific information and return it in JSON format. If any information is not available in the document, use "Not specified in document" as the value:

{
  "documentStatus": {
    "processed": true,
    "coeNumber": "extracted COE/registration number",
    "processedDate": "${new Date().toLocaleDateString()}"
  },
  "institutionDetails": {
    "institutionName": "provider name",
    "tradingName": "trading name if different",
    "registrationCode": "CRICOS/registration number",
    "country": "country",
    "contactInfo": {
      "phone": "phone number",
      "email": "email address",
      "fax": "fax number"
    }
  },
  "courseDetails": {
    "courseTitle": "full course name",
    "courseCode": "course registration number",
    "level": "Bachelor/Master/Diploma/Certificate",
    "fieldOfStudy": "subject area",
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
  "summary": "comprehensive summary of the COE document",
  "keyFindings": [
    {
      "category": "academic",
      "finding": "specific finding",
      "importance": "high",
      "actionRequired": "specific action if needed",
      "deadline": "deadline if applicable"
    }
  ],
  "recommendations": [
    {
      "category": "visa",
      "recommendation": "specific recommendation",
      "priority": "high"
    }
  ],
  "nextSteps": [
    {
      "step": "specific action",
      "description": "detailed description",
      "timeline": "when to complete",
      "priority": "high"
    }
  ]
}

Document text to analyze:
${documentText}

Extract all available information. If information is not found in the document, use "Not specified in document" for that field.`;
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

    // For non-CoE documents, return template not available message
    if (documentType !== 'coe') {
      const fallbackAnalysis: EnrollmentAnalysisResponse = {
        summary: `Analysis for ${documentType} documents is not yet available. Currently, only Confirmation of Enrollment (CoE) documents are supported with our specialized template. Please select CoE as the document type if you have uploaded a CoE document, or wait for additional templates to become available.`,
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