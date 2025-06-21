import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractOfferLetterInfo(documentText: string) {
  try {
    const prompt = `Extract all information from this offer letter document. Return a JSON object with the following structure. If any information is not found, return null for that field.

{
  "institutionName": "Name of the educational institution",
  "institutionAddress": "Full address of the institution",
  "institutionPhone": "Phone number",
  "institutionEmail": "Email address",
  "institutionWebsite": "Website URL",
  "programName": "Name of the program/course",
  "programLevel": "Level (Bachelor, Master, PhD, etc.)",
  "programDuration": "Duration of the program",
  "studyMode": "Full-time, Part-time, Online, etc.",
  "campusLocation": "Campus or location",
  "startDate": "Program start date",
  "endDate": "Program end date",
  "applicationDeadline": "Application deadline",
  "acceptanceDeadline": "Acceptance deadline",
  "tuitionFee": "Tuition fee amount",
  "applicationFee": "Application fee",
  "depositRequired": "Deposit amount required",
  "totalCost": "Total cost",
  "paymentSchedule": "Payment schedule details",
  "academicRequirements": "Academic requirements",
  "englishRequirements": "English language requirements",
  "documentRequirements": "Required documents",
  "studentName": "Student name from the letter",
  "studentId": "Student ID if mentioned",
  "applicationNumber": "Application reference number",
  "scholarshipInfo": "Scholarship information",
  "accommodationInfo": "Accommodation details",
  "visaInfo": "Visa information",
  "contactPerson": "Contact person details",
  "additionalNotes": "Any other important information"
}

Document text:
${documentText}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a document information extraction specialist. Extract all information from offer letters accurately and return it in JSON format. Only extract information that is explicitly stated in the document.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const extractedInfo = JSON.parse(content);
    
    return {
      extractedInfo,
      tokensUsed: response.usage?.total_tokens || 0
    };

  } catch (error) {
    console.error('Error extracting offer letter info:', error);
    return {
      extractedInfo: { error: error instanceof Error ? error.message : 'Unknown error' },
      tokensUsed: 0
    };
  }
}