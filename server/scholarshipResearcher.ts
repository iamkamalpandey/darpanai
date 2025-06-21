import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ScholarshipResearchResult {
  scholarships: ScholarshipData[];
  researchMetadata: {
    tokensUsed: number;
    researchQuality: 'High' | 'Medium' | 'Low';
    sourceUrls: string[];
    researchDate: Date;
  };
}

export interface ScholarshipData {
  scholarshipName: string;
  description: string;
  availableFunds: string;
  fundingType: string;
  eligibilityCriteria: string;
  applicationDeadline: string;
  applicationProcess: string;
  requiredDocuments: string;
  scholarshipUrl: string;
  contactEmail: string;
  contactPhone: string;
  numberOfAwards: string;
  renewalCriteria: string;
  additionalBenefits: string;
}

export async function researchInstitutionScholarships(
  institutionName: string,
  programName: string,
  programLevel: string
): Promise<ScholarshipResearchResult> {
  const startTime = Date.now();
  
  try {
    const prompt = `You are a comprehensive scholarship research specialist. I need you to research and provide detailed scholarship information for the following:

Institution: ${institutionName}
Program: ${programName}
Level: ${programLevel}

RESEARCH TASK:
Conduct thorough research about available scholarships at ${institutionName} specifically for ${programLevel} students in ${programName} or related fields. 

IMPORTANT GUIDELINES:
1. Focus on scholarships offered directly by ${institutionName}
2. Include merit-based, need-based, international student, and program-specific scholarships
3. Look for both internal institutional scholarships and external scholarships that students at this institution commonly apply for
4. Provide authentic, current information only
5. If specific details are not available, indicate "Not specified" rather than making assumptions

Please provide a comprehensive response in the following JSON format:

{
  "scholarships": [
    {
      "scholarshipName": "Exact name of the scholarship",
      "description": "Detailed description of the scholarship purpose and scope",
      "availableFunds": "Specific amount or coverage (e.g., '$5,000 annually', 'Full tuition', '50% tuition coverage')",
      "fundingType": "Merit-based/Need-based/Athletic/International/Research/Other",
      "eligibilityCriteria": "Detailed eligibility requirements including GPA, citizenship, field of study, etc.",
      "applicationDeadline": "Specific deadline dates or application periods",
      "applicationProcess": "Step-by-step application process",
      "requiredDocuments": "List of required documents for application",
      "scholarshipUrl": "Direct URL to scholarship information page",
      "contactEmail": "Contact email for scholarship inquiries",
      "contactPhone": "Contact phone number if available",
      "numberOfAwards": "Number of awards given annually or per cycle",
      "renewalCriteria": "Criteria for scholarship renewal if applicable",
      "additionalBenefits": "Additional benefits beyond tuition (housing, books, internships, etc.)"
    }
  ],
  "researchMetadata": {
    "sourceUrls": ["List of main URLs researched"],
    "researchQuality": "High/Medium/Low based on data completeness and accuracy",
    "totalScholarshipsFound": "Number of scholarships identified"
  }
}

RESEARCH SOURCES TO CONSIDER:
- Official ${institutionName} website
- Financial aid and scholarships pages
- Department-specific scholarship pages for ${programName}
- International student services (if applicable)
- Graduate/undergraduate office pages
- Foundation and alumni scholarship programs

Ensure all information is current, accurate, and directly sourced from official institutional resources.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional scholarship research specialist with expertise in higher education funding opportunities. Provide accurate, comprehensive scholarship information based on official institutional sources."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.3,
    });

    const processingTime = Date.now() - startTime;
    const tokensUsed = response.usage?.total_tokens || 0;

    let parsedResponse;
    try {
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }
      
      // Clean the content to remove code blocks
      const cleanedContent = content.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
      parsedResponse = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      // Fallback to structured response
      parsedResponse = {
        scholarships: [],
        researchMetadata: {
          sourceUrls: [],
          researchQuality: 'Low',
          totalScholarshipsFound: '0'
        }
      };
    }

    // Validate and structure the response
    const scholarships: ScholarshipData[] = parsedResponse.scholarships?.map((scholarship: any) => ({
      scholarshipName: scholarship.scholarshipName || 'Unknown Scholarship',
      description: scholarship.description || 'Description not available',
      availableFunds: scholarship.availableFunds || 'Amount not specified',
      fundingType: scholarship.fundingType || 'Type not specified',
      eligibilityCriteria: scholarship.eligibilityCriteria || 'Criteria not specified',
      applicationDeadline: scholarship.applicationDeadline || 'Deadline not specified',
      applicationProcess: scholarship.applicationProcess || 'Process not specified',
      requiredDocuments: scholarship.requiredDocuments || 'Documents not specified',
      scholarshipUrl: scholarship.scholarshipUrl || '',
      contactEmail: scholarship.contactEmail || '',
      contactPhone: scholarship.contactPhone || '',
      numberOfAwards: scholarship.numberOfAwards || 'Number not specified',
      renewalCriteria: scholarship.renewalCriteria || 'Renewal criteria not specified',
      additionalBenefits: scholarship.additionalBenefits || 'Additional benefits not specified',
    })) || [];

    const researchQuality = determineResearchQuality(scholarships);

    return {
      scholarships,
      researchMetadata: {
        tokensUsed,
        researchQuality,
        sourceUrls: parsedResponse.researchMetadata?.sourceUrls || [],
        researchDate: new Date(),
      },
    };

  } catch (error) {
    console.error('Error in scholarship research:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to research scholarships: ${errorMessage}`);
  }
}

function determineResearchQuality(scholarships: ScholarshipData[]): 'High' | 'Medium' | 'Low' {
  if (scholarships.length === 0) return 'Low';
  
  const qualityScore = scholarships.reduce((score, scholarship) => {
    let itemScore = 0;
    if (scholarship.scholarshipName && scholarship.scholarshipName !== 'Unknown Scholarship') itemScore += 1;
    if (scholarship.description && scholarship.description !== 'Description not available') itemScore += 1;
    if (scholarship.availableFunds && scholarship.availableFunds !== 'Amount not specified') itemScore += 1;
    if (scholarship.applicationDeadline && scholarship.applicationDeadline !== 'Deadline not specified') itemScore += 1;
    if (scholarship.scholarshipUrl) itemScore += 1;
    if (scholarship.eligibilityCriteria && scholarship.eligibilityCriteria !== 'Criteria not specified') itemScore += 1;
    
    return score + itemScore;
  }, 0);
  
  const maxPossibleScore = scholarships.length * 6;
  const qualityPercentage = (qualityScore / maxPossibleScore) * 100;
  
  if (qualityPercentage >= 70) return 'High';
  if (qualityPercentage >= 40) return 'Medium';
  return 'Low';
}