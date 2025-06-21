import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to extract basic document data using regex patterns
export function extractDocumentData(documentText: string) {
  const institutionName = extractInstitutionName(documentText) || 'Institution not detected';
  const programName = extractProgramName(documentText) || 'Program not detected';
  const studentName = extractStudentName(documentText) || 'Student name not detected';
  const tuitionAmount = extractTuitionAmount(documentText) || 'Tuition not detected';
  const startDate = extractStartDate(documentText) || 'Start date not detected';

  return {
    institutionName,
    programName,
    studentName,
    tuitionAmount,
    startDate
  };
}

// Function to perform comprehensive AI analysis of offer letter
export async function performOfferLetterAnalysis(documentText: string, extractedData: any) {
  try {
    const prompt = `
Analyze this offer letter document and provide a comprehensive analysis in JSON format:

Document Text:
${documentText}

Basic Information Extracted:
- Institution: ${extractedData.institutionName}
- Program: ${extractedData.programName}
- Student: ${extractedData.studentName}
- Tuition: ${extractedData.tuitionAmount}
- Start Date: ${extractedData.startDate}

Please provide a detailed analysis in this JSON structure:
{
  "institution": "Full institution name",
  "program": "Complete program name",
  "level": "Program level (Bachelor, Master, PhD, etc.)",
  "duration": "Program duration",
  "tuitionFee": "Annual tuition fee with currency",
  "totalCost": "Total program cost if available",
  "startDate": "Program start date",
  "applicationDeadline": "Application deadline if mentioned",
  "executiveSummary": "Comprehensive 3-4 sentence summary of the offer including key highlights, financial obligations, and next steps",
  "keyHighlights": [
    "Most important aspects of this offer",
    "Financial details and payment structure",
    "Academic requirements and conditions",
    "Unique benefits or opportunities"
  ],
  "academicRequirements": "Any academic conditions or requirements",
  "financialDetails": {
    "tuitionFee": "Detailed tuition breakdown",
    "additionalFees": "Other required fees",
    "paymentSchedule": "Payment timeline",
    "scholarshipOpportunities": "Available scholarships if mentioned"
  },
  "nextSteps": [
    "Actions required to accept the offer",
    "Important deadlines to remember",
    "Documents needed for enrollment"
  ],
  "importantDeadlines": "All critical dates and deadlines",
  "contactInformation": "Relevant contact details for questions"
}

Focus on extracting real information from the document. If specific information is not available, indicate "Not specified in document" rather than making assumptions.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert education consultant analyzing offer letters. Provide accurate, detailed analysis based only on the document content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const analysisText = response.choices[0].message.content || '';
    let analysis;
    
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      analysis = {
        institution: extractedData.institutionName,
        program: extractedData.programName,
        executiveSummary: "Analysis completed successfully. Please review the detailed information below.",
        keyHighlights: [
          `Institution: ${extractedData.institutionName}`,
          `Program: ${extractedData.programName}`,
          `Tuition: ${extractedData.tuitionAmount}`,
          `Start Date: ${extractedData.startDate}`
        ],
        financialDetails: {
          tuitionFee: extractedData.tuitionAmount,
          additionalFees: "See document for details",
          paymentSchedule: "Contact institution for payment schedule",
          scholarshipOpportunities: "Contact institution for scholarship information"
        },
        nextSteps: [
          "Review all terms and conditions carefully",
          "Contact the institution if you have questions",
          "Submit required documents by the deadline"
        ]
      };
    }

    return {
      analysis,
      tokensUsed: response.usage?.total_tokens || 0
    };

  } catch (error) {
    console.error('Error in AI analysis:', error);
    
    // Fallback analysis using extracted data
    return {
      analysis: {
        institution: extractedData.institutionName,
        program: extractedData.programName,
        executiveSummary: `Offer letter analysis for ${extractedData.programName} at ${extractedData.institutionName}. Please review the document for complete details.`,
        keyHighlights: [
          `Institution: ${extractedData.institutionName}`,
          `Program: ${extractedData.programName}`,
          `Tuition: ${extractedData.tuitionAmount}`,
          `Start Date: ${extractedData.startDate}`
        ],
        financialDetails: {
          tuitionFee: extractedData.tuitionAmount,
          additionalFees: "Please check document for additional fees",
          paymentSchedule: "Contact institution for payment details",
          scholarshipOpportunities: "Contact institution for scholarship opportunities"
        }
      },
      tokensUsed: 0
    };
  }
}

// Helper functions to extract specific data from document text
function extractInstitutionName(text: string): string | undefined {
  const patterns = [
    /(?:University|College|Institute|School|Academy)\s+of\s+[\w\s]+/gi,
    /([\w\s]+(?:University|College|Institute|School|Academy))/gi,
    /Dear\s+(?:Mr\.|Ms\.|Mrs\.)?\s*[\w\s]+,?\s*(?:We|I)\s+are\s+pleased\s+to\s+(?:inform|offer)\s+you\s+(?:that\s+)?(?:of\s+)?(?:your\s+)?(?:acceptance|admission)\s+(?:to|at)\s+([\w\s]+(?:University|College|Institute))/gi,
    /(?:from|at)\s+([\w\s]+(?:University|College|Institute|School))/gi
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches[0]) {
      return matches[0].trim().replace(/^(from|at)\s+/i, '');
    }
  }
  
  return undefined;
}

function extractStudentName(text: string): string | undefined {
  const patterns = [
    /Dear\s+(?:Mr\.|Ms\.|Mrs\.)?\s*([\w\s]+),/gi,
    /(?:Student|Applicant)\s+Name:?\s*([\w\s]+)/gi,
    /Name:?\s*([\w\s]+)/gi,
    /(?:We|I)\s+are\s+pleased\s+to\s+(?:inform|offer)\s+([\w\s]+)\s+(?:that|of)/gi
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches[1]) {
      const name = matches[1].trim();
      if (name.length > 2 && name.length < 50 && /^[a-zA-Z\s]+$/.test(name)) {
        return name;
      }
    }
  }
  
  return undefined;
}

function extractProgramName(text: string): string | undefined {
  const patterns = [
    /(?:Program|Course|Degree):?\s*([\w\s,.-]+)(?:\n|\.|\s{2,})/gi,
    /(?:Bachelor|Master|PhD|Doctorate)\s+(?:of|in)\s+([\w\s]+)/gi,
    /(?:admission|accepted)\s+(?:to|into|for)\s+(?:the\s+)?([\w\s]+(?:program|course|degree))/gi,
    /([\w\s]+(?:Engineering|Science|Arts|Business|Management|Studies|Technology))/gi,
    /(?:pursuing|studying)\s+([\w\s]+)(?:\s+program|\s+course)?/gi
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches[1]) {
      const program = matches[1].trim();
      if (program.length > 3 && program.length < 100) {
        return program;
      }
    }
  }
  
  return undefined;
}

function extractTuitionAmount(text: string): string | undefined {
  const patterns = [
    /(?:Tuition|Fee|Cost):?\s*([A-Z]{2,3}?\$?[\d,]+(?:\.\d{2})?(?:\s*(?:AUD|USD|CAD|GBP|EUR))?)/gi,
    /(?:\$|AUD|USD|CAD|GBP|EUR)\s*[\d,]+(?:\.\d{2})?(?:\s*(?:per|\/)\s*(?:year|semester|term))?/gi,
    /(?:Annual|Yearly|Total)\s+(?:tuition|fee|cost):?\s*([A-Z]{2,3}?\$?[\d,]+(?:\.\d{2})?)/gi,
    /([\d,]+(?:\.\d{2})?\s*(?:AUD|USD|CAD|GBP|EUR))\s+(?:per|\/)\s*(?:year|semester)/gi
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches[0]) {
      return matches[0].trim();
    }
  }
  
  return undefined;
}

function extractStartDate(text: string): string | undefined {
  const patterns = [
    /(?:Start|Commencement|Begin)\s+(?:Date|On):?\s*([\w\s,]+\d{4})/gi,
    /(?:Session|Semester|Term)\s+(?:starts|begins|commences):?\s*([\w\s,]+\d{4})/gi,
    /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi,
    /\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/gi,
    /(?:Intake|Entry):?\s*([\w\s,]+\d{4})/gi
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches[1]) {
      return matches[1].trim();
    } else if (matches && matches[0]) {
      return matches[0].trim();
    }
  }
  
  return undefined;
}