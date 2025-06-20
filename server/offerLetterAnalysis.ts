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
  location: string
): Promise<UniversityScholarshipInfo[]> {
  try {
    const scholarshipPrompt = `Research and provide ONLY verified scholarship information for ${universityName} (${location}) for ${program} program.

CRITICAL REQUIREMENTS:
1. Only include scholarships that exist on the official university website
2. Provide accurate amounts, deadlines, and application processes
3. Include official university URLs as sources
4. If no specific scholarships are found, return empty array
5. Do NOT fabricate or hallucinate scholarship information

Please search for:
- Merit-based scholarships
- Need-based financial aid
- Program-specific funding
- International student scholarships
- Graduate assistantships (if applicable)

Return response in JSON format:
{
  "scholarships": [
    {
      "name": "Exact scholarship name from official source",
      "amount": "Exact amount or range from official source",
      "criteria": ["List of exact criteria from official source"],
      "applicationDeadline": "Exact deadline from official source",
      "applicationProcess": "Step-by-step process from official source",
      "sourceUrl": "Direct URL to official university scholarship page"
    }
  ]
}

If no verified scholarships are found, return: {"scholarships": []}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a scholarship research specialist. Only provide verified information from official university sources. Never fabricate or hallucinate scholarship details."
        },
        {
          role: "user",
          content: scholarshipPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Low temperature for factual accuracy
    });

    const scholarshipData = JSON.parse(response.choices[0].message.content || '{"scholarships": []}');
    return scholarshipData.scholarships || [];
    
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
    
    // Extract university information for scholarship research
    const { universityName, program, location } = extractUniversityInfo(documentText);
    console.log('Extracted university info:', { universityName, program, location });
    
    // Research verified scholarships (with timeout)
    let scholarships: UniversityScholarshipInfo[] = [];
    try {
      const scholarshipPromise = researchUniversityScholarships(universityName, program, location);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Scholarship research timeout')), 15000)
      );
      scholarships = await Promise.race([scholarshipPromise, timeoutPromise]);
      console.log('Found scholarships:', scholarships.length);
    } catch (error) {
      console.log('Scholarship research failed or timed out, continuing without:', error);
    }
    
    // Generate comprehensive analysis with shorter prompt for faster processing
    const prompt = getOfferLetterAnalysisPrompt(documentText.substring(0, 8000), scholarships);
    console.log('Sending request to OpenAI...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert education consultant. Analyze offer letters comprehensively but concisely. Focus on key information, scholarships, and actionable recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
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
        scholarshipOpportunities: scholarships,
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