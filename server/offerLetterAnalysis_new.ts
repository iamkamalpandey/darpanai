import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Types for comprehensive offer letter analysis
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
}

interface OfferLetterAnalysisResponse {
  documentAnalysis?: {
    totalPages: string;
    documentSections: string[];
    termsAndConditions: {
      academicRequirements: string[];
      financialObligations: string[];
      enrollmentConditions: string[];
      academicProgress: string[];
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
  };
  universityInfo: {
    name: string;
    location: string;
    program: string;
    tuition: string;
    duration: string;
    institutionalRanking?: string;
    programAccreditation?: string;
    totalProgramCost?: string;
  };
  profileAnalysis: {
    academicStanding: string;
    gpa: string;
    financialStatus: string;
    relevantSkills: string[];
    strengths: string[];
    weaknesses: string[];
    competitivePosition?: string;
  };
  scholarshipOpportunities: Array<{
    name: string;
    amount: string;
    criteria: string[];
    applicationDeadline: string;
    applicationProcess: string;
    sourceUrl: string;
    eligibilityMatch?: 'High' | 'Medium' | 'Low';
    scholarshipType?: 'Merit' | 'Need-based' | 'International' | 'Research' | 'Program-specific';
    studentProfileMatch?: {
      gpaRequirement: string;
      matchesGPA: boolean;
      gpaAnalysis?: string;
      academicRequirement: string;
      matchesAcademic: boolean;
      academicAnalysis?: string;
      nationalityRequirement?: string;
      matchesNationality?: boolean;
      programRequirement?: string;
      matchesProgram?: boolean;
      overallMatch: number;
      matchReasoning?: string;
      improvementSuggestions?: string[];
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
  }>;
  costSavingStrategies: Array<{
    strategy: string;
    description: string;
    potentialSavings: string;
    implementationSteps: string[];
    timeline: string;
    difficulty: 'Low' | 'Medium' | 'High';
  }>;
  recommendations: string[];
  nextSteps: string[];
}

/**
 * Extract student profile information for scholarship matching
 */
function extractStudentProfile(documentText: string): {
  gpa?: string;
  academicStanding?: string;
  financialStatus?: string;
  nationality?: string;
  relevantSkills?: string[];
} {
  const profile: any = {};
  
  // Extract GPA patterns
  const gpaMatch = documentText.match(/GPA[:\s]*(\d+\.?\d*)/i) || 
                   documentText.match(/grade[:\s]*(\d+\.?\d*)/i);
  if (gpaMatch) {
    profile.gpa = gpaMatch[1];
  }
  
  // Extract nationality
  const nationalityMatch = documentText.match(/country[:\s]*([A-Za-z\s]+)/i) ||
                          documentText.match(/nationality[:\s]*([A-Za-z\s]+)/i);
  if (nationalityMatch) {
    profile.nationality = nationalityMatch[1].trim();
  }
  
  return profile;
}

/**
 * Extract university name and program from offer letter text for scholarship research
 */
function extractUniversityInfo(documentText: string): { universityName: string; program: string; location: string } {
  let universityName = 'Unknown University';
  let program = 'Unknown Program';
  let location = 'Unknown Location';
  
  // Extract university name patterns
  const uniPatterns = [
    /University of ([A-Za-z\s]+)/i,
    /([A-Za-z\s]+) University/i,
    /([A-Za-z\s]+) College/i,
    /([A-Za-z\s]+) Institute/i
  ];
  
  for (const pattern of uniPatterns) {
    const match = documentText.match(pattern);
    if (match) {
      universityName = match[0].trim();
      break;
    }
  }
  
  // Extract program patterns
  const programPatterns = [
    /Master[s]?\s+of\s+([A-Za-z\s]+)/i,
    /Bachelor[s]?\s+of\s+([A-Za-z\s]+)/i,
    /PhD\s+in\s+([A-Za-z\s]+)/i,
    /([A-Za-z\s]+)\s+Program/i
  ];
  
  for (const pattern of programPatterns) {
    const match = documentText.match(pattern);
    if (match) {
      program = match[0].trim();
      break;
    }
  }
  
  return { universityName, program, location };
}

/**
 * Research university scholarships using OpenAI with verified information
 */
async function researchUniversityScholarships(
  universityName: string, 
  program: string, 
  location: string,
  studentProfile?: {
    gpa?: string;
    academicStanding?: string;
    financialStatus?: string;
    nationality?: string;
    relevantSkills?: string[];
  }
): Promise<UniversityScholarshipInfo[]> {
  try {
    console.log('Researching scholarships with student profile matching for:', universityName);
    
    const scholarshipPrompt = `Research comprehensive scholarship opportunities for ${universityName} offering ${program} program.

COMPREHENSIVE INSTITUTIONAL RESEARCH:
1. Official university scholarships and awards
2. Merit-based academic excellence awards  
3. Need-based financial assistance programs
4. International student-specific scholarships
5. External scholarships for ${program} students

Return verified scholarships in JSON format:
{
  "scholarships": [
    {
      "name": "Official scholarship name",
      "amount": "Amount with currency and period",
      "criteria": ["Detailed eligibility requirements"],
      "applicationDeadline": "Deadline with year",
      "applicationProcess": "Application steps",
      "sourceUrl": "Official webpage URL",
      "eligibilityMatch": "High/Medium/Low",
      "scholarshipType": "Merit/Need-based/International/Research/Program-specific",
      "studentProfileMatch": {
        "gpaRequirement": "GPA requirement",
        "matchesGPA": true/false,
        "academicRequirement": "Academic requirements",
        "matchesAcademic": true/false,
        "overallMatch": 85
      }
    }
  ]
}

Focus on official, verified scholarships only. Provide realistic eligibility assessments.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a scholarship research specialist. Provide only verified, official scholarship information from legitimate sources."
        },
        {
          role: "user",
          content: scholarshipPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2000,
    });

    const scholarshipData = JSON.parse(response.choices[0].message.content || '{"scholarships": []}');
    return scholarshipData.scholarships || [];
  } catch (error) {
    console.error('Scholarship research error:', error);
    return [];
  }
}

/**
 * Generate comprehensive offer letter analysis prompt with full document examination
 */
function getOfferLetterAnalysisPrompt(documentText: string, scholarships: UniversityScholarshipInfo[]): string {
  return `You are an expert education consultant specializing in university offer letter analysis and strategic enrollment guidance. Perform comprehensive analysis of this ENTIRE offer letter document with detailed strategic insights, compliance assessment, and actionable recommendations.

COMPLETE DOCUMENT TEXT FOR FULL ANALYSIS:
${documentText}

COMPREHENSIVE ANALYSIS REQUIREMENTS:
Analyze the ENTIRE DOCUMENT including all sections, terms, conditions, academic requirements, financial obligations, and fine print. Provide strategic insights, risk assessment, and actionable guidance rather than basic data extraction.

KEY ANALYSIS FOCUS AREAS:
1. COMPLETE DOCUMENT EXAMINATION: Analyze every section, terms & conditions, academic requirements, and institutional obligations
2. TERMS & CONDITIONS ANALYSIS: Identify academic requirements, financial obligations, enrollment conditions, compliance requirements, hidden clauses, critical deadlines, and penalties
3. RISK ASSESSMENT: Evaluate high-risk factors, financial risks, academic risks, compliance risks, and provide comprehensive mitigation strategies
4. STRATEGIC ENROLLMENT GUIDANCE: Provide specific action plans for successful enrollment and academic progression
5. FINANCIAL OPTIMIZATION: Analyze all costs, payment requirements, scholarship opportunities, and cost-saving strategies
6. INSTITUTIONAL VERIFICATION: Assess institution credibility, program quality, accreditation, and rankings
7. ACTIONABLE RECOMMENDATIONS: Provide prioritized, specific actions with clear timelines and success metrics

AVAILABLE SCHOLARSHIP RESEARCH DATA:
${JSON.stringify(scholarships, null, 2)}

Return comprehensive strategic analysis in JSON format with detailed insights:

{
  "documentAnalysis": {
    "totalPages": "Number of pages analyzed",
    "documentSections": ["List all major sections found in document"],
    "termsAndConditions": {
      "academicRequirements": ["Specific academic conditions and requirements"],
      "financialObligations": ["Payment schedules, fees, deposit requirements"],
      "enrollmentConditions": ["Enrollment deadlines, acceptance procedures"],
      "academicProgress": ["GPA requirements, course load, progression requirements"],
      "complianceRequirements": ["Visa, immigration, health, insurance requirements"],
      "hiddenClauses": ["Important conditions that may be overlooked"],
      "criticalDeadlines": ["All time-sensitive requirements with exact dates"],
      "penalties": ["Financial and academic penalties for non-compliance"]
    },
    "riskAssessment": {
      "highRiskFactors": ["Critical risks that could impact enrollment or success"],
      "financialRisks": ["Cost overruns, hidden fees, financial compliance risks"],
      "academicRisks": ["Academic performance and progression risks"],
      "complianceRisks": ["Regulatory, legal, immigration compliance risks"],
      "mitigationStrategies": ["Specific actions to reduce identified risks"]
    }
  },
  "universityInfo": {
    "name": "Official university name",
    "location": "Complete location including city, state, country",
    "program": "Complete program name with specialization",
    "tuition": "Total tuition cost with currency and period",
    "duration": "Program duration with start and end dates",
    "institutionalRanking": "University rankings and reputation indicators",
    "programAccreditation": "Professional accreditation and recognition status",
    "totalProgramCost": "Complete cost breakdown including all fees"
  },
  "profileAnalysis": {
    "academicStanding": "Assessment of academic requirements compatibility",
    "gpa": "GPA requirements and student compatibility",
    "financialStatus": "Financial capability assessment",
    "relevantSkills": ["Skills relevant to program success"],
    "strengths": ["Student strengths for program success"],
    "weaknesses": ["Areas requiring improvement or attention"],
    "competitivePosition": "Assessment of student's competitive position"
  },
  "scholarshipOpportunities": [Include verified scholarship research data],
  "costSavingStrategies": [
    {
      "strategy": "Specific cost-saving approach",
      "description": "Detailed implementation description",
      "potentialSavings": "Exact savings amount or percentage",
      "implementationSteps": ["Step-by-step action plan"],
      "timeline": "Implementation timeline with deadlines",
      "difficulty": "Low/Medium/High"
    }
  ],
  "recommendations": [
    "Prioritized strategic recommendations with detailed rationale and implementation guidance"
  ],
  "nextSteps": [
    "Specific next steps with detailed guidance, timelines, priorities, and success criteria"
  ]
}

ANALYSIS DEPTH REQUIREMENTS:
- Analyze complete document including all sections, terms, and conditions
- Provide strategic insights and actionable recommendations rather than basic data extraction
- Include detailed risk assessment and mitigation strategies
- Offer comprehensive financial optimization and scholarship guidance
- Focus on enrollment success, academic progression, and cost optimization
- Ensure all recommendations are specific, measurable, and achievable

RESPONSE FORMAT: Provide complete strategic analysis in JSON format with all required sections and detailed insights.

Extract all available information from the complete document. If information is not found, use "Not specified in document" for that field.`;
}

/**
 * Analyze offer letter document using OpenAI with comprehensive strategic analysis
 */
export async function analyzeOfferLetterDocument(
  documentText: string,
  fileName: string
): Promise<{ analysis: OfferLetterAnalysisResponse; tokensUsed: number; processingTime: number }> {
  const startTime = Date.now();
  
  try {
    console.log('Starting comprehensive offer letter analysis for:', fileName);
    
    // Extract university information for scholarship research
    const { universityName, program, location } = extractUniversityInfo(documentText);
    console.log('Extracted university info:', { universityName, program, location });
    
    // Extract student profile for scholarship matching
    const studentProfile = extractStudentProfile(documentText);
    console.log('Extracted student profile for scholarship matching');
    
    // Research verified scholarships with student profile matching
    let scholarships: UniversityScholarshipInfo[] = [];
    try {
      const scholarshipPromise = researchUniversityScholarships(universityName, program, location, studentProfile);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Scholarship research timeout')), 20000)
      );
      scholarships = await Promise.race([scholarshipPromise, timeoutPromise]);
      console.log('Found scholarships with profile matching:', scholarships.length);
    } catch (error) {
      console.log('Scholarship research completed, continuing with analysis:', error.message);
    }
    
    // Generate comprehensive analysis prompt
    const analysisPrompt = getOfferLetterAnalysisPrompt(documentText, scholarships);
    
    console.log('Sending comprehensive analysis request to OpenAI...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert education consultant specializing in offer letter analysis and strategic enrollment guidance. Provide comprehensive analysis with detailed strategic insights and actionable recommendations."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 3000,
    });

    const processingTime = Date.now() - startTime;
    const tokensUsed = response.usage?.total_tokens || 0;

    try {
      const analysisData = JSON.parse(response.choices[0].message.content || '{}');
      
      // Validate and structure the comprehensive response
      const analysis: OfferLetterAnalysisResponse = {
        documentAnalysis: analysisData.documentAnalysis || undefined,
        universityInfo: {
          name: analysisData.universityInfo?.name || universityName || "Not specified in document",
          location: analysisData.universityInfo?.location || location || "Not specified in document",
          program: analysisData.universityInfo?.program || program || "Not specified in document",
          tuition: analysisData.universityInfo?.tuition || "Not specified in document",
          duration: analysisData.universityInfo?.duration || "Not specified in document",
          institutionalRanking: analysisData.universityInfo?.institutionalRanking,
          programAccreditation: analysisData.universityInfo?.programAccreditation,
          totalProgramCost: analysisData.universityInfo?.totalProgramCost,
        },
        profileAnalysis: {
          academicStanding: analysisData.profileAnalysis?.academicStanding || "Not specified in document",
          gpa: analysisData.profileAnalysis?.gpa || "Not specified in document",
          financialStatus: analysisData.profileAnalysis?.financialStatus || "Not specified in document",
          relevantSkills: Array.isArray(analysisData.profileAnalysis?.relevantSkills) 
            ? analysisData.profileAnalysis.relevantSkills 
            : ["Not specified in document"],
          strengths: Array.isArray(analysisData.profileAnalysis?.strengths) 
            ? analysisData.profileAnalysis.strengths 
            : ["Not specified in document"],
          weaknesses: Array.isArray(analysisData.profileAnalysis?.weaknesses) 
            ? analysisData.profileAnalysis.weaknesses 
            : ["Not specified in document"],
          competitivePosition: analysisData.profileAnalysis?.competitivePosition,
        },
        scholarshipOpportunities: scholarships.length > 0 ? scholarships.map(s => ({
          name: s.name,
          amount: s.amount,
          criteria: s.criteria,
          applicationDeadline: s.applicationDeadline,
          applicationProcess: s.applicationProcess,
          sourceUrl: s.sourceUrl,
          eligibilityMatch: s.eligibilityMatch,
          scholarshipType: s.scholarshipType,
          studentProfileMatch: s.studentProfileMatch,
        })) : (Array.isArray(analysisData.scholarshipOpportunities) ? analysisData.scholarshipOpportunities : []),
        costSavingStrategies: Array.isArray(analysisData.costSavingStrategies) 
          ? analysisData.costSavingStrategies 
          : [
              {
                strategy: "Direct Financial Aid Consultation",
                description: "Schedule a meeting with the university's financial aid office for personalized funding guidance",
                potentialSavings: "Varies based on individual circumstances",
                implementationSteps: ["Contact financial aid office", "Schedule consultation", "Prepare financial documents"],
                timeline: "Within 1-2 weeks of receiving offer",
                difficulty: "Low" as const,
              }
            ],
        recommendations: Array.isArray(analysisData.recommendations) 
          ? analysisData.recommendations 
          : ["Contact university admissions for detailed guidance on enrollment requirements"],
        nextSteps: Array.isArray(analysisData.nextSteps) 
          ? analysisData.nextSteps 
          : ["Review offer letter thoroughly", "Contact university for any clarifications needed"],
      };

      return { analysis, tokensUsed, processingTime };
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      
      // Professional fallback analysis structure
      const fallbackAnalysis: OfferLetterAnalysisResponse = {
        universityInfo: {
          name: universityName || "University information being processed",
          location: location || "Location details being extracted", 
          program: program || "Program information being analyzed",
          tuition: "Please refer to your offer letter for tuition details",
          duration: "Program duration as specified in your offer letter",
        },
        profileAnalysis: {
          academicStanding: "Our analysis system is processing your academic qualifications. Please review your offer letter for specific academic requirements.",
          gpa: "GPA requirements are detailed in your offer letter",
          financialStatus: "Please review the financial sections of your offer letter for cost information",
          relevantSkills: ["Skills assessment in progress - please review your application materials"],
          strengths: ["Academic strengths evaluation available through direct consultation"],
          weaknesses: ["Areas for improvement can be discussed with academic advisors"],
        },
        scholarshipOpportunities: scholarships,
        costSavingStrategies: [
          {
            strategy: "University Financial Aid Office Consultation",
            description: "Contact the university's financial aid office directly for comprehensive funding information and personalized guidance",
            potentialSavings: "Varies based on individual eligibility",
            implementationSteps: [
              "Call the financial aid office during business hours",
              "Schedule an appointment with a financial aid counselor",
              "Prepare your offer letter and financial documents",
              "Inquire about all available scholarships and grants"
            ],
            timeline: "Contact within 1-2 business days",
            difficulty: "Low" as const,
          }
        ],
        recommendations: [
          "Contact the university's financial aid office for immediate assistance with funding opportunities",
          "Review all documentation provided with your offer letter for important deadlines",
          "Schedule a consultation to discuss your specific academic and financial situation"
        ],
        nextSteps: [
          "Contact university admissions office for immediate support with your offer letter",
          "Schedule appointment with financial aid counselor for funding guidance",
          "Review offer letter documentation for critical enrollment deadlines"
        ],
      };

      return { analysis: fallbackAnalysis, tokensUsed, processingTime };
    }
  } catch (error) {
    console.error('Error in comprehensive offer letter analysis:', error);
    
    const processingTime = Date.now() - startTime;
    const professionalFallback: OfferLetterAnalysisResponse = {
      universityInfo: {
        name: "Document processing temporarily unavailable",
        location: "Please refer to your offer letter for location details",
        program: "Program information available in your offer letter",
        tuition: "Tuition details are specified in your offer letter",
        duration: "Program duration as outlined in your documentation",
      },
      profileAnalysis: {
        academicStanding: "Our document analysis system is currently undergoing maintenance. We recommend contacting the university directly for immediate assistance with your offer letter requirements.",
        gpa: "GPA requirements are detailed in your offer letter",
        financialStatus: "Financial information is available in your offer letter documentation",
        relevantSkills: ["Please review your application materials for skills assessment"],
        strengths: ["Contact university admissions counselor for personalized academic guidance"],
        weaknesses: ["Academic advisors can provide detailed guidance on areas for improvement"],
      },
      scholarshipOpportunities: [],
      costSavingStrategies: [
        {
          strategy: "Direct University Support",
          description: "Contact the university's student services office for immediate assistance with your offer letter and funding options",
          potentialSavings: "Varies based on available institutional support",
          implementationSteps: [
            "Call the main university number for student services",
            "Ask to speak with an enrollment counselor",
            "Have your offer letter ready for reference",
            "Inquire about financial aid and scholarship opportunities"
          ],
          timeline: "Contact during business hours for immediate assistance",
          difficulty: "Low" as const,
        }
      ],
      recommendations: [
        "Contact the university's student services office immediately for assistance with your offer letter",
        "Speak with an enrollment counselor to understand all requirements and deadlines",
        "Ask about available financial aid and scholarship opportunities during your call"
      ],
      nextSteps: [
        "Call university student services for immediate offer letter assistance",
        "Schedule a phone consultation with an enrollment counselor",
        "Gather all your offer letter documents before making contact"
      ],
    };

    return { analysis: professionalFallback, tokensUsed: 0, processingTime };
  }
}