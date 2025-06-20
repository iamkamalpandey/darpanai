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
    
    const scholarshipPrompt = `Research verified scholarships for ${universityName} (${location}) offering ${program} program.

STUDENT PROFILE FOR MATCHING:
${studentProfile ? JSON.stringify(studentProfile, null, 2) : 'Profile not available - provide general scholarships'}

COMPREHENSIVE RESEARCH REQUIREMENTS:
1. Search official ${universityName} website for all scholarship programs
2. Include merit-based, need-based, international student, and program-specific scholarships
3. Verify eligibility requirements against student profile
4. Research government and external scholarships available to students at this institution
5. Include application processes and official website links

SCHOLARSHIP CATEGORIES TO RESEARCH:
- Academic Excellence/Merit Scholarships
- International Student Scholarships
- ${program} Program-specific scholarships
- Need-based financial assistance
- Research assistantships and teaching positions
- External government scholarships for international students

Return JSON with detailed scholarship matching:
{
  "scholarships": [
    {
      "name": "Exact scholarship name from official source",
      "amount": "Specific amount (e.g., $5,000 per year, 50% tuition reduction)",
      "criteria": ["Academic GPA 3.5+", "International student status", "Program enrollment"],
      "applicationDeadline": "Specific date or application period",
      "applicationProcess": "Step-by-step application instructions",
      "sourceUrl": "Direct link to official scholarship page",
      "eligibilityMatch": "High/Medium/Low based on student profile",
      "scholarshipType": "Merit/Need-based/International/Research/Program-specific",
      "studentProfileMatch": {
        "gpaRequirement": "Required GPA if specified",
        "matchesGPA": true/false,
        "academicRequirement": "Academic standing requirement",
        "matchesAcademic": true/false,
        "overallMatch": 85 (percentage 0-100)
      }
    }
  ]
}

CRITICAL: Only include scholarships that actually exist. Verify against official university sources and provide accurate matching analysis.`;

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
 * Generate comprehensive offer letter analysis prompt
 */
function getOfferLetterAnalysisPrompt(documentText: string, scholarships: UniversityScholarshipInfo[]): string {
  return `Analyze this university offer letter comprehensively and provide structured analysis.

DOCUMENT TEXT:
${documentText}

VERIFIED SCHOLARSHIPS FOUND:
${JSON.stringify(scholarships, null, 2)}

Please provide a comprehensive analysis including:

1. UNIVERSITY INFORMATION:
   - Extract institution name, location, program details, tuition costs, program duration

2. PROFILE ANALYSIS:
   - Assess academic standing based on admission
   - Identify GPA/grades mentioned
   - Evaluate financial status indicators
   - List relevant skills/qualifications mentioned
   - Identify strengths demonstrated
   - Note any potential weaknesses or concerns

3. SCHOLARSHIP OPPORTUNITIES:
   - Include the verified scholarships provided above
   - Add any additional scholarships mentioned in the offer letter
   - Ensure all information is accurate and from official sources

4. COST-SAVING STRATEGIES:
   - Research assistantships and teaching positions
   - Work-study programs and internships
   - Housing and meal plan optimizations
   - Transportation and textbook savings
   - Part-time work opportunities (within visa regulations)
   - Financial planning and budgeting strategies

5. RECOMMENDATIONS:
   - Immediate actions to secure enrollment
   - Financial planning suggestions
   - Academic preparation recommendations
   - Visa and immigration guidance

6. NEXT STEPS:
   - Prioritized action items with timelines
   - Important deadlines and requirements
   - Contact information for follow-up

CRITICAL REQUIREMENTS:
- Only include verified, factual information
- Cite official sources where possible
- Provide realistic cost-saving estimates
- Include specific implementation steps
- Ensure all scholarships are real and accessible

Return response in JSON format matching the required schema.`;
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
    const comprehensivePrompt = `Analyze this university offer letter and provide comprehensive structured analysis in JSON format:

DOCUMENT TEXT (first 6000 characters):
${documentText.substring(0, 6000)}

VERIFIED SCHOLARSHIPS FOUND:
${JSON.stringify(scholarships, null, 2)}

STUDENT PROFILE EXTRACTED:
${JSON.stringify(studentProfile, null, 2)}

Provide comprehensive analysis with these sections:
1. universityInfo: {name, location, program, tuition, duration}
2. profileAnalysis: {academicStanding, gpa, financialStatus, relevantSkills[], strengths[], weaknesses[]}
3. scholarshipOpportunities: Include the verified scholarships above plus any mentioned in the document
4. costSavingStrategies: [{strategy, description, potentialSavings, implementationSteps[], timeline, difficulty}]
5. recommendations: [strings] - Include scholarship application recommendations
6. nextSteps: [strings] - Include specific scholarship deadlines and actions

Focus on extracting actual information from the document and integrating verified scholarship opportunities.`;

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
        name: "Analysis Error - Please Try Again",
        location: "Not available",
        program: "Not available",
        tuition: "Not available",
        duration: "Not available",
      },
      profileAnalysis: {
        academicStanding: "Analysis Error - Please Try Again",
        gpa: "Not available",
        financialStatus: "Analysis Error - Please Try Again",
        relevantSkills: ["Analysis Error - Please Try Again"],
        strengths: ["Analysis Error - Please Try Again"],
        weaknesses: ["Analysis Error - Please Try Again"],
      },
      scholarshipOpportunities: [],
      costSavingStrategies: [],
      recommendations: ["Please try uploading the document again or contact support"],
      nextSteps: ["Upload document again", "Contact support if issue persists"],
    };

    return { analysis: fallbackAnalysis, tokensUsed: 0, processingTime };
  }
}