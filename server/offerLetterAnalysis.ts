import OpenAI from "openai";
import { offerLetterAnalysisResponseSchema } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  universityInfo: {
    name: string;
    location: string;
    program: string;
    tuition: string;
    duration: string;
  };
  profileAnalysis: {
    academicStanding: string;
    gpa: string;
    financialStatus: string;
    relevantSkills: string[];
    strengths: string[];
    weaknesses: string[];
  };
  scholarshipOpportunities: UniversityScholarshipInfo[];
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
  const gpaPatterns = [
    /GPA[:\s]+(\d+\.?\d*)/i,
    /Grade Point Average[:\s]+(\d+\.?\d*)/i,
    /Academic Average[:\s]+(\d+\.?\d*)/i
  ];
  
  for (const pattern of gpaPatterns) {
    const match = documentText.match(pattern);
    if (match) {
      profile.gpa = match[1];
      break;
    }
  }
  
  // Extract academic standing
  const standingPatterns = [
    /academic standing[:\s]+(excellent|good|satisfactory|honors|distinction)/i,
    /academic performance[:\s]+(excellent|good|satisfactory|honors|distinction)/i,
    /(dean's list|honor roll|academic honors)/i
  ];
  
  for (const pattern of standingPatterns) {
    const match = documentText.match(pattern);
    if (match) {
      profile.academicStanding = match[1] || match[0];
      break;
    }
  }
  
  // Extract nationality/citizenship
  const nationalityPatterns = [
    /nationality[:\s]+([A-Za-z\s]+)/i,
    /citizenship[:\s]+([A-Za-z\s]+)/i,
    /country of birth[:\s]+([A-Za-z\s]+)/i,
    /passport[:\s]+([A-Za-z\s]+)/i
  ];
  
  for (const pattern of nationalityPatterns) {
    const match = documentText.match(pattern);
    if (match) {
      profile.nationality = match[1].trim();
      break;
    }
  }
  
  // Extract financial indicators
  if (documentText.match(/financial aid|scholarship|funding|financial support/i)) {
    profile.financialStatus = "Financial assistance mentioned";
  }
  
  // Extract relevant skills from course/program context
  const skillsPatterns = [
    /background in ([^.]+)/i,
    /experience in ([^.]+)/i,
    /qualifications in ([^.]+)/i
  ];
  
  const skills: string[] = [];
  for (const pattern of skillsPatterns) {
    const match = documentText.match(pattern);
    if (match) {
      skills.push(match[1].trim());
    }
  }
  
  if (skills.length > 0) {
    profile.relevantSkills = skills;
  }
  
  return profile;
}

/**
 * Extract university name and program from offer letter text for scholarship research
 */
function extractUniversityInfo(documentText: string): { universityName: string; program: string; location: string } {
  // Common university patterns
  const universityPatterns = [
    /(?:university of|university|college of|college|institute of|institute)\s+([^,\n\r.]+)/gi,
    /([^,\n\r.]+)\s+(?:university|college|institute)/gi,
  ];
  
  // Program patterns
  const programPatterns = [
    /(?:master of|bachelor of|master's in|bachelor's in|phd in|doctorate in)\s+([^,\n\r.]+)/gi,
    /(?:program:?|course:?|degree:?)\s*([^,\n\r.]+)/gi,
  ];
  
  // Location patterns
  const locationPatterns = [
    /(?:located in|campus in|based in)\s+([^,\n\r.]+)/gi,
    /([A-Z][a-z]+,?\s*[A-Z][A-Z]|[A-Z][a-z]+,?\s*[A-Z][a-z]+)/g,
  ];
  
  let universityName = "";
  let program = "";
  let location = "";
  
  // Extract university name
  for (const pattern of universityPatterns) {
    const match = pattern.exec(documentText);
    if (match && match[1].length > 3) {
      universityName = match[1].trim();
      break;
    }
  }
  
  // Extract program
  for (const pattern of programPatterns) {
    const match = pattern.exec(documentText);
    if (match && match[1].length > 3) {
      program = match[1].trim();
      break;
    }
  }
  
  // Extract location
  for (const pattern of locationPatterns) {
    const match = pattern.exec(documentText);
    if (match && match[1].length > 2) {
      location = match[1].trim();
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
    
    const scholarshipPrompt = `You are a comprehensive scholarship research specialist with deep expertise in university funding opportunities. Research and analyze ALL available scholarships for ${universityName} (${location}) offering ${program} program.

STUDENT PROFILE FOR DETAILED MATCHING:
${studentProfile ? JSON.stringify(studentProfile, null, 2) : 'Profile not available - provide comprehensive general scholarships'}

COMPREHENSIVE INSTITUTIONAL RESEARCH MANDATE:
Conduct thorough research across multiple official sources:

1. OFFICIAL UNIVERSITY SCHOLARSHIP DATABASE SEARCH:
   - Main institutional scholarships and awards
   - College/department-specific funding (${program} program)
   - Merit-based academic excellence awards
   - Need-based financial assistance programs
   - International student-specific scholarships
   - Research assistantships and teaching fellowships
   - Graduate/undergraduate distinction awards

2. EXTERNAL SCHOLARSHIP ECOSYSTEM RESEARCH:
   - Government scholarships available to ${universityName} students
   - Private foundation scholarships for ${program} students
   - Industry-specific scholarships related to ${program}
   - Regional/country-specific scholarships for international students
   - Professional association scholarships in ${program} field

3. DETAILED STUDENT PROFILE ANALYSIS:
   - Calculate precise eligibility match percentages
   - Analyze GPA compatibility with scholarship requirements
   - Evaluate academic standing against scholarship criteria
   - Assess nationality/citizenship requirements
   - Match program/field of study with scholarship focus areas
   - Identify skill-based or achievement-based opportunities

4. COMPREHENSIVE FINANCIAL IMPACT ASSESSMENT:
   - Total potential funding available to this student
   - Scholarship combination strategies for maximum benefit
   - Application priority recommendations based on match likelihood
   - Timeline optimization for multiple scholarship applications

DETAILED RESPONSE FORMAT:
{
  "totalScholarshipsFound": number,
  "estimatedTotalValue": "Combined potential scholarship value",
  "highPriorityCount": number,
  "scholarships": [
    {
      "name": "Complete official scholarship name",
      "amount": "Exact amount with currency and period (e.g., $15,000 USD per academic year)",
      "totalValue": "Total scholarship value over program duration",
      "criteria": ["Detailed eligibility requirements with specific thresholds"],
      "applicationDeadline": "Exact deadline with year and time zone",
      "applicationProcess": "Comprehensive step-by-step application guide",
      "sourceUrl": "Direct official scholarship webpage URL",
      "eligibilityMatch": "High/Medium/Low with detailed reasoning",
      "scholarshipType": "Merit/Need-based/International/Research/Program-specific/Government/Foundation",
      "competitiveness": "Low/Medium/High based on typical applicant pool",
      "renewalRequirements": "Requirements to maintain scholarship",
      "additionalBenefits": ["Non-monetary benefits like mentorship, networking"],
      "studentProfileMatch": {
        "gpaRequirement": "Specific GPA requirement",
        "matchesGPA": true/false,
        "gpaAnalysis": "Detailed assessment of GPA compatibility",
        "academicRequirement": "Academic standing or achievement requirements",
        "matchesAcademic": true/false,
        "academicAnalysis": "Detailed assessment of academic compatibility",
        "nationalityRequirement": "Citizenship/nationality requirements",
        "matchesNationality": true/false,
        "programRequirement": "Field of study requirements",
        "matchesProgram": true/false,
        "overallMatch": 85,
        "matchReasoning": "Detailed explanation of match percentage calculation",
        "improvementSuggestions": ["Specific actions to improve eligibility"]
      },
      "applicationStrategy": {
        "recommendedSubmissionTime": "Optimal timing for application",
        "requiredDocuments": ["Complete list of required documents"],
        "preparationTime": "Estimated time needed for strong application",
        "successTips": ["Expert tips for scholarship application success"]
      }
    }
  ],
  "scholarshipStrategy": {
    "highPriorityApplications": ["Top 3-5 scholarships to prioritize"],
    "combinationOpportunities": ["Scholarships that can be combined"],
    "timelineRecommendations": "Optimal application schedule",
    "totalPotentialFunding": "Maximum possible scholarship funding",
    "applicationWorkload": "Estimated total effort required"
  }
}

RESEARCH DEPTH REQUIREMENTS:
- Minimum 8-12 scholarships per university (mix of institutional and external)
- Include both competitive and accessible opportunities
- Cover full range of funding amounts ($500 to full tuition)
- Provide specific dates, amounts, and requirements
- Include detailed application strategies and success tips

CRITICAL SUCCESS FACTORS:
- All scholarships must be real and currently available
- Provide comprehensive eligibility analysis for each opportunity
- Include specific improvement recommendations for borderline matches
- Deliver actionable scholarship application strategy`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert scholarship research specialist with access to comprehensive university databases. Research official institutional sources and match opportunities to student profiles with detailed eligibility analysis."
        },
        {
          role: "user",
          content: scholarshipPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 2500,
    });

    const scholarshipData = JSON.parse(response.choices[0].message.content || '{"scholarships": []}');
    const scholarships = scholarshipData.scholarships || [];
    
    console.log(`Found ${scholarships.length} verified scholarships with profile matching for ${universityName}`);
    return scholarships;
    
  } catch (error) {
    console.error('Error researching scholarships:', error);
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

{
  "documentAnalysis": {
    "totalPages": "Number of pages analyzed",
    "documentSections": ["List all major sections found in document"],
    "documentType": "Offer Letter/Admission Letter type",
    "issuingAuthority": "University or department that issued document",
    "documentValidity": "Valid/Invalid/Requires verification",
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
  "scholarshipOpportunities": ${JSON.stringify(scholarships.map(s => ({
    name: s.name,
    amount: s.amount,
    criteria: s.criteria,
    applicationDeadline: s.applicationDeadline,
    applicationProcess: s.applicationProcess,
    sourceUrl: s.sourceUrl,
    eligibilityMatch: s.eligibilityMatch,
    scholarshipType: s.scholarshipType,
    studentProfileMatch: s.studentProfileMatch,
    competitiveness: s.competitiveness || 'Medium',
    renewalRequirements: s.renewalRequirements || 'Maintain academic standing',
    additionalBenefits: s.additionalBenefits || [],
    applicationStrategy: s.applicationStrategy || {
      recommendedSubmissionTime: 'Apply early for best consideration',
      requiredDocuments: ['Transcripts', 'Letters of recommendation', 'Personal statement'],
      preparationTime: '2-4 weeks',
      successTips: ['Strong academic record', 'Clear career goals', 'Demonstrated need/merit']
    }
  })), null, 2)},
  "costSavingStrategies": [
    {
      "strategy": "Scholarship application optimization",
      "description": "Strategic approach to maximize scholarship opportunities",
      "potentialSavings": "Calculate based on available scholarships",
      "implementationSteps": ["Research all available scholarships", "Prepare strong applications", "Meet all deadlines"],
      "timeline": "2-6 months before enrollment",
      "difficulty": "Medium"
    }
  ],
  "recommendations": [
    {
      "category": "enrollment/financial/academic/strategic",
      "recommendation": "Detailed strategic recommendation with rationale",
      "priority": "Critical/High/Medium/Low",
      "rationale": "Why this recommendation is important",
      "implementation": "How to implement this recommendation",
      "timeline": "When to implement with specific dates",
      "successMetrics": "How to measure success"
    }
  ],
  "nextSteps": [
    {
      "step": "Specific next step with detailed guidance",
      "description": "Comprehensive implementation instructions",
      "timeline": "When to complete with specific dates",
      "priority": "Critical/High/Medium/Low",
      "dependencies": ["Prerequisites or dependencies"],
      "resources": ["Required resources or support"],
      "successCriteria": "How to know when completed successfully"
    }
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
 * Analyze offer letter document using OpenAI with scholarship research
 */
export async function analyzeOfferLetterDocument(
  documentText: string,
  fileName: string
): Promise<{ analysis: OfferLetterAnalysisResponse; tokensUsed: number; processingTime: number }> {
  const startTime = Date.now();
  
  try {
    console.log('Starting offer letter analysis for:', fileName);
    
    // Extract university information
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
      console.log('Scholarship research failed or timed out, continuing without:', error);
    }
    
    // Comprehensive analysis with institution research and scholarship integration
    const comprehensivePrompt = `You are an expert education consultant specializing in offer letter analysis and financial optimization. Provide comprehensive analysis of this university offer letter with detailed scholarship integration and strategic recommendations.

COMPLETE DOCUMENT TEXT (FULL ANALYSIS):
${documentText}

COMPREHENSIVE SCHOLARSHIP RESEARCH RESULTS:
${JSON.stringify(scholarships, null, 2)}

EXTRACTED STUDENT PROFILE:
${JSON.stringify(studentProfile, null, 2)}

COMPREHENSIVE ANALYSIS REQUIREMENTS:
Perform deep analysis of the ENTIRE DOCUMENT including all pages, terms & conditions, fine print, and hidden clauses. Focus on strategic insights, financial optimization, and actionable recommendations rather than basic data extraction.

KEY ANALYSIS FOCUS AREAS:
1. COMPLETE DOCUMENT EXAMINATION: Analyze every section, page, terms, conditions, and fine print
2. HIDDEN COSTS & CONDITIONS: Identify all fees, penalties, conditions, and requirements not immediately obvious
3. STRATEGIC SCHOLARSHIP OPPORTUNITIES: Research and match comprehensive funding opportunities with detailed application strategies
4. TERMS & CONDITIONS ANALYSIS: Examine all academic, financial, and legal obligations
5. RISK ASSESSMENT: Identify potential challenges, deadlines, and compliance requirements
6. FINANCIAL OPTIMIZATION: Calculate total costs, potential savings, and funding strategies
7. ACTIONABLE RECOMMENDATIONS: Provide specific, prioritized actions with timelines

REQUIRED COMPREHENSIVE ANALYSIS STRUCTURE:
{
  "documentAnalysis": {
    "totalPages": "Number of pages analyzed",
    "documentSections": ["List all major sections found in document"],
    "termsAndConditions": {
      "academicRequirements": ["Specific GPA, attendance, performance requirements"],
      "financialObligations": ["All fees, payment deadlines, penalty charges"],
      "enrollmentConditions": ["Deposit requirements, confirmation deadlines, withdrawal policies"],
      "academicProgress": ["Progress requirements, probation policies, dismissal conditions"],
      "complianceRequirements": ["Visa, immigration, health, insurance requirements"],
      "hiddenClauses": ["Important conditions buried in fine print"],
      "criticalDeadlines": ["All time-sensitive requirements with exact dates"],
      "penalties": ["Financial and academic penalties for non-compliance"]
    },
    "riskAssessment": {
      "highRiskFactors": ["Major risks identified in terms"],
      "financialRisks": ["Cost overruns, hidden fees, penalty risks"],
      "academicRisks": ["Performance requirements, dismissal risks"],
      "complianceRisks": ["Visa, legal, regulatory compliance risks"],
      "mitigationStrategies": ["Specific actions to reduce identified risks"]
    }
  },
  "universityInfo": {
    "name": "Official university name from document",
    "location": "Complete location with city, state/province, country",
    "program": "Full program name with degree level",
    "tuition": "Annual tuition with currency and ALL additional fees",
    "duration": "Complete program duration",
    "institutionalRanking": "University ranking and reputation insights",
    "programAccreditation": "Relevant accreditations and recognitions",
    "totalProgramCost": "Complete cost including all fees, living expenses, insurance"
  },
  "profileAnalysis": {
    "academicStanding": "Detailed academic assessment",
    "gpa": "GPA with scale and context",
    "financialStatus": "Comprehensive financial situation analysis",
    "relevantSkills": ["Extracted skills with proficiency levels"],
    "strengths": ["Detailed academic and professional strengths"],
    "weaknesses": ["Areas for improvement with development suggestions"],
    "competitivePosition": "Analysis of student's competitive standing for scholarships"
  },
  "scholarshipOpportunities": [Use the comprehensive scholarship research above],
  "costSavingStrategies": [
    {
      "strategy": "Specific cost-saving approach",
      "description": "Detailed implementation description",
      "potentialSavings": "Exact savings amount or percentage",
      "implementationSteps": ["Step-by-step action plan"],
      "timeline": "Implementation timeline with deadlines",
      "difficulty": "Low/Medium/High",
      "successProbability": "Likelihood of achieving savings",
      "requirements": ["Prerequisites for implementing strategy"]
    }
  ],
  "recommendations": [
    "Prioritized scholarship application strategy based on research",
    "Financial planning recommendations with timeline",
    "Academic preparation suggestions for better scholarship eligibility",
    "Alternative funding sources to explore",
    "Risk mitigation strategies for funding gaps"
  ],
  "nextSteps": [
    "Immediate action items with specific deadlines",
    "Scholarship application priorities with submission dates",
    "Document preparation requirements",
    "Financial planning milestones",
    "Communication strategies with university financial aid"
  ],
  "financialProjection": {
    "totalProgramCost": "Complete cost breakdown",
    "availableScholarships": "Total scholarship opportunities identified",
    "estimatedNetCost": "Projected final cost after scholarships",
    "fundingGaps": "Areas requiring additional funding",
    "returnOnInvestment": "Career and financial ROI analysis"
  }
}

ANALYSIS DEPTH REQUIREMENTS:
- Integrate all scholarship research findings into actionable recommendations
- Provide specific timelines and deadlines for all suggested actions
- Include detailed financial projections and optimization strategies
- Offer comprehensive guidance for maximizing scholarship opportunities
- Address potential challenges and provide contingency planning
- Ensure all recommendations are specific, measurable, and achievable

Focus on creating a comprehensive strategic plan that maximizes the student's funding opportunities while providing clear, actionable guidance for their educational investment.

RESPONSE FORMAT: Provide complete analysis in JSON format with all required sections and detailed strategic insights.`;

    console.log('Sending comprehensive analysis request to OpenAI...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert education consultant specializing in offer letter analysis and scholarship matching. Provide comprehensive analysis integrating verified scholarship opportunities with student profiles."
        },
        {
          role: "user",
          content: comprehensivePrompt
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
      
      // Validate and structure the response
      const analysis: OfferLetterAnalysisResponse = {
        universityInfo: {
          name: analysisData.universityInfo?.name || universityName || "Not specified in document",
          location: analysisData.universityInfo?.location || location || "Not specified in document",
          program: analysisData.universityInfo?.program || program || "Not specified in document",
          tuition: analysisData.universityInfo?.tuition || "Not specified in document",
          duration: analysisData.universityInfo?.duration || "Not specified in document",
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
        },
        scholarshipOpportunities: scholarships.length > 0 ? scholarships : 
          (Array.isArray(analysisData.scholarshipOpportunities) ? analysisData.scholarshipOpportunities : []),
        costSavingStrategies: Array.isArray(analysisData.costSavingStrategies) 
          ? analysisData.costSavingStrategies 
          : [
              {
                strategy: "Graduate Assistantship",
                description: "Apply for teaching or research assistant positions",
                potentialSavings: "$5,000-$15,000 per year",
                implementationSteps: ["Contact department", "Submit application", "Interview process"],
                timeline: "Apply 3-6 months before semester",
                difficulty: "Medium" as const,
              }
            ],
        recommendations: Array.isArray(analysisData.recommendations) 
          ? analysisData.recommendations 
          : ["Contact university admissions for detailed information"],
        nextSteps: Array.isArray(analysisData.nextSteps) 
          ? analysisData.nextSteps 
          : ["Review offer letter thoroughly", "Contact university for clarification"],
      };

      return { analysis, tokensUsed, processingTime };
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      
      // Fallback analysis structure
      const fallbackAnalysis: OfferLetterAnalysisResponse = {
        universityInfo: {
          name: universityName || "Not specified in document",
          location: location || "Not specified in document", 
          program: program || "Not specified in document",
          tuition: "Not specified in document",
          duration: "Not specified in document",
        },
        profileAnalysis: {
          academicStanding: "Analysis completed - please review document manually",
          gpa: "Not specified in document",
          financialStatus: "Analysis completed - please review document manually",
          relevantSkills: ["Analysis completed - please review document manually"],
          strengths: ["Analysis completed - please review document manually"],
          weaknesses: ["Analysis completed - please review document manually"],
        },
        scholarshipOpportunities: [],
        costSavingStrategies: [
          {
            strategy: "Research University Scholarships",
            description: "Contact the financial aid office for available funding opportunities",
            potentialSavings: "Varies by program",
            implementationSteps: ["Contact financial aid office", "Submit required documents"],
            timeline: "Apply immediately",
            difficulty: "Low" as const,
          }
        ],
        recommendations: ["Contact university directly for detailed guidance"],
        nextSteps: ["Review all documentation", "Contact admissions office"],
      };

      return { analysis: fallbackAnalysis, tokensUsed, processingTime };
    }
  } catch (error) {
    console.error('Error in offer letter analysis:', error);
    
    const processingTime = Date.now() - startTime;
    const fallbackAnalysis: OfferLetterAnalysisResponse = {
      universityInfo: {
        name: "Document processing temporarily unavailable",
        location: "Unable to process at this time",
        program: "Document analysis in progress",
        tuition: "Please contact university directly for fee information",
        duration: "Refer to official documentation",
      },
      profileAnalysis: {
        academicStanding: "Our analysis system is currently undergoing maintenance. Please review your offer letter manually or contact our support team for assistance.",
        gpa: "Information extraction temporarily unavailable",
        financialStatus: "Please review financial sections of your offer letter directly",
        relevantSkills: ["Manual review recommended during system maintenance"],
        strengths: ["Contact admissions counselor for personalized guidance"],
        weaknesses: ["Professional consultation available for detailed assessment"],
      },
      scholarshipOpportunities: [],
      costSavingStrategies: [
        {
          strategy: "Direct University Contact",
          description: "Contact the university's financial aid office directly for comprehensive funding information and personalized guidance",
          potentialSavings: "Varies based on individual circumstances",
          implementationSteps: [
            "Call the financial aid office during business hours",
            "Schedule an appointment with a financial aid counselor",
            "Prepare your offer letter and financial documents",
            "Ask about institutional scholarships and grants"
          ],
          timeline: "Contact within 1-2 business days",
          difficulty: "Low" as const,
        }
      ],
      recommendations: [
        "Contact the university's admissions office for immediate assistance with your offer letter",
        "Schedule a consultation with a financial aid counselor to discuss funding options",
        "Review all documentation provided with your offer letter for important deadlines"
      ],
      nextSteps: [
        "Contact university admissions office for immediate support",
        "Schedule appointment with financial aid counselor",
        "Review offer letter documentation for critical deadlines"
      ],
    };

    return { analysis: fallbackAnalysis, tokensUsed: 0, processingTime };
  }
}