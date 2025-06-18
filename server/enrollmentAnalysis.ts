import OpenAI from "openai";
import { enrollmentAnalysisResponseSchema, type EnrollmentAnalysisResponse } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cost optimization constants
const MAX_INPUT_TOKENS = 8000; // Limit input to control costs
const MODEL_NAME = "gpt-4o-mini"; // Use mini version for cost efficiency
const CACHE_DURATION_MINUTES = 60; // Cache similar analyses

// In-memory cache for similar document patterns (production should use Redis)
const analysisCache = new Map<string, { result: EnrollmentAnalysisResponse; timestamp: number }>();

/**
 * Generate cache key based on document type and key content fingerprint
 */
function generateCacheKey(documentType: string, text: string | undefined): string {
  // Create a fingerprint of the document for caching similar analyses
  const fingerprint = (text || '')
    .replace(/\d{4}[-\/]\d{2}[-\/]\d{2}/g, 'DATE') // Replace dates
    .replace(/\$[\d,]+\.?\d*/g, 'AMOUNT') // Replace amounts
    .replace(/[A-Z]{2,}\d+/g, 'ID') // Replace IDs
    .toLowerCase()
    .slice(0, 200); // Take first 200 chars for fingerprint
  
  return `${documentType}:${Buffer.from(fingerprint).toString('base64').slice(0, 32)}`;
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
  // Keep cache size manageable
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
  // Rough estimation: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;
  
  // Prioritize keeping the beginning and end of the document
  const keepStart = Math.floor(maxChars * 0.7);
  const keepEnd = maxChars - keepStart - 100; // 100 chars for truncation notice
  
  return text.slice(0, keepStart) + "\n\n[... DOCUMENT TRUNCATED FOR ANALYSIS ...]\n\n" + text.slice(-keepEnd);
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
        tokensUsed: 0, // No tokens used for cached result
        processingTime: Date.now() - startTime
      };
    }

    // Truncate text to control costs
    const truncatedText = truncateText(documentText);
    
    // Create comprehensive prompt for enrollment document analysis
    const prompt = `You are an expert international education counselor and visa specialist. Analyze this ${documentType} enrollment document and extract ALL available information including financial details, scholarship terms, health cover arrangements, visa requirements, and compliance obligations.

Document Type: ${documentType.toUpperCase().replace('_', ' ')}
Filename: ${filename}

Document Content:
${truncatedText}

Extract every detail present in this document. For CoE documents, pay special attention to:
- All financial amounts (tuition fees, pre-paid amounts, total costs, scholarships)
- Student health cover (OSHC) details including provider, dates, and coverage type
- Scholarship terms, conditions, and percentage discounts
- Important deadlines and compliance requirements
- Visa-related information and obligations
- Institution contact details and course codes
- English language test requirements and scores

Please analyze this document thoroughly and provide a JSON response with the following structure:

{
  "institutionName": "string (full institution name with trading name if different)",
  "studentName": "string (student full name from given names and family name)",
  "studentId": "string (provider student ID/number)",
  "programName": "string (complete program/course name with course code)",
  "programLevel": "string (bachelor degree/masters/phd/certificate/diploma)",
  "startDate": "string (course start date - format as readable date)",
  "endDate": "string (program end date - format as readable date)",
  "institutionCountry": "string (country where institution is located)",
  "studentCountry": "string (student's country of origin if mentioned)",
  "visaType": "string (relevant visa type/category for this program)",
  "tuitionAmount": "string (tuition fees amount with currency)",
  "currency": "string (currency code - USD, GBP, AUD, CAD, etc)",
  "scholarshipAmount": "string (scholarship amount and percentage if any)",
  "totalCost": "string (total program cost including all fees)",
  "healthCover": "string (OSHC details including provider, dates, and coverage type)",
  "englishTestScore": "string (English test type, score, and date if mentioned)",
  "institutionContact": "string (phone, email, and other contact details)",
  "visaObligations": "string (important visa-related requirements and obligations)",
  "summary": "string (comprehensive summary including all financial details, scholarship terms, health cover arrangements, compliance requirements, deadlines, and key obligations from the document)",
  "keyFindings": [
    {
      "title": "string (e.g., 'VU Block Model International Scholarship Awarded', 'OSHC Coverage Arranged', 'English Requirements Met')",
      "description": "string (detailed explanation of the finding including specific amounts, dates, and conditions)",
      "importance": "high|medium|low"
    }
  ],
  "missingInformation": [
    {
      "field": "string",
      "description": "string",
      "impact": "string"
    }
  ],
  "recommendations": [
    {
      "title": "string (specific actionable recommendations)",
      "description": "string (detailed advice including deadlines, requirements, and compliance obligations)",
      "priority": "urgent|important|suggested",
      "category": "documentation|financial|academic|visa|preparation"
    }
  ],
  "nextSteps": [
    {
      "step": "string (specific action required)",
      "description": "string (detailed explanation including how to comply with ESOS Act, maintain enrollment, and meet visa obligations)",
      "deadline": "string (specific dates like course start date, OSHC coverage dates)",
      "category": "immediate|short_term|long_term"
    }
  ],
  "isValid": boolean,
  "expiryDate": "string (if document expires)",
  "complianceIssues": [
    {
      "issue": "string",
      "severity": "critical|moderate|minor",
      "resolution": "string"
    }
  ],
  "analysisScore": number (0-100 based on document completeness),
  "confidence": number (0-100 AI confidence in analysis)
}

Guidelines:
- Use simple, clear language that students and parents can understand
- Focus on actionable insights and practical advice
- Analyze country-specific visa requirements and regulations
- Identify the institution's country and relevant visa categories
- Highlight any red flags or compliance issues specific to the destination country
- Provide specific next steps with realistic timelines
- Rate document completeness and your confidence in the analysis
- If information is missing, explain why it's important for visa/enrollment processes
- Consider country-specific academic and immigration regulations
- Provide financial planning advice relevant to the destination country
- Include insights about study permit requirements, work authorization, and post-graduation options
- Analyze if the document meets visa application requirements for the identified countries

For CoE documents specifically, extract and highlight:
- All financial amounts (Initial Pre-Paid Tuition Fee, Other Pre-Paid Non-Tuition Fee, Total Tuition Fee)
- Scholarship details including percentage discount, terms, and conditions (e.g., "20% off first two semesters")
- OSHC coverage details including provider name, coverage type, start and end dates
- English test requirements including type, score, and test date
- Course codes, CRICOS registration, and provider details
- Important compliance requirements under ESOS Act 2000 and National Code 2018
- Student details including Provider Student ID, nationality, and country of birth
- Key dates including course start/end dates and OSHC coverage periods

Extract ALL available information from the document to provide complete analysis for international students. Include all numerical amounts, percentages, dates, contact information, and specific requirements found in the document.`;

    console.log(`Starting OpenAI analysis for ${documentType}: ${filename}`);
    
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content: "You are an expert education counselor specializing in international student documentation and visa processes. Provide thorough, accurate analysis in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 2000, // Limit output tokens for cost control
    });

    const analysisText = response.choices[0].message.content || "";
    if (!analysisText) {
      throw new Error("No analysis content received from OpenAI");
    }

    // Parse and validate the analysis
    let analysisData;
    try {
      analysisData = JSON.parse(analysisText);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      throw new Error("Invalid JSON response from AI analysis");
    }

    // Validate against schema
    const validatedAnalysis = enrollmentAnalysisResponseSchema.parse(analysisData);
    
    // Cache the result
    cacheAnalysis(cacheKey, validatedAnalysis);
    
    const processingTime = Date.now() - startTime;
    const tokensUsed = response.usage?.total_tokens || 0;
    
    console.log(`Enrollment analysis completed in ${processingTime}ms using ${tokensUsed} tokens`);
    
    return {
      analysis: validatedAnalysis,
      tokensUsed,
      processingTime
    };

  } catch (error) {
    console.error("Error in enrollment document analysis:", error);
    
    // Return a fallback analysis to maintain user experience
    const fallbackAnalysis: EnrollmentAnalysisResponse = {
      summary: `Unable to fully analyze this ${documentType || 'enrollment'} document due to processing limitations. Please verify all information manually.`,
      keyFindings: [
        {
          title: "Manual Review Required",
          description: "This document requires manual review by an education counselor.",
          importance: "high" as const
        }
      ],
      missingInformation: [],
      recommendations: [
        {
          title: "Consult Education Counselor",
          description: "Please schedule a consultation to review this document thoroughly.",
          priority: "important" as const,
          category: "preparation" as const
        }
      ],
      nextSteps: [
        {
          step: "Document Review",
          description: "Have an education counselor review this document for accuracy and completeness.",
          category: "immediate" as const
        }
      ],
      isValid: true,
      complianceIssues: [],
      analysisScore: 50,
      confidence: 30
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
    maxSize: 100,
    entries: Array.from(analysisCache.keys())
  };
}

/**
 * Clear cache (for admin use)
 */
export function clearAnalysisCache() {
  analysisCache.clear();
  console.log("Enrollment analysis cache cleared");
}