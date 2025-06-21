import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractOfferLetterInfo(documentText: string) {
  try {
    const prompt = `
Extract all information from this offer letter document. Return ONLY a JSON object with the following structure. If any information is not found, use null:

{
  "institutionName": "Full institution name",
  "institutionAddress": "Complete address",
  "institutionPhone": "Phone number",
  "institutionEmail": "Email address",
  "institutionWebsite": "Website URL",
  "cricosCode": "CRICOS code if available",
  "providerCode": "Provider registration code",
  
  "studentName": "Full student name",
  "studentId": "Student ID number",
  "studentEmail": "Student email",
  "studentPhone": "Student phone",
  "studentAddress": "Student address",
  "dateOfBirth": "Student date of birth",
  "nationality": "Student nationality",
  "passportNumber": "Passport number",
  
  "programName": "Full program name",
  "programCode": "Program code",
  "programLevel": "Degree level (Bachelor/Master/PhD/Diploma/Certificate)",
  "fieldOfStudy": "Field of study",
  "specialization": "Specialization if any",
  "programDuration": "Duration (e.g., 3 years, 18 months)",
  "totalUnits": "Total units/credits",
  "studyMode": "Full-time/Part-time",
  "deliveryMode": "On-campus/Online/Blended",
  "campus": "Campus location",
  
  "startDate": "Program start date",
  "endDate": "Program end date",
  "orientationDate": "Orientation date",
  "enrolmentDate": "Enrollment deadline",
  "censusDate": "Census date",
  "applicationDeadline": "Application deadline",
  "acceptanceDeadline": "Acceptance deadline",
  
  "tuitionFee": "Tuition fee amount",
  "currency": "Currency (AUD/USD/CAD etc)",
  "paymentFrequency": "Payment frequency",
  "applicationFee": "Application fee",
  "enrollmentFee": "Enrollment fee",
  "materialsFee": "Materials fee",
  "technologyFee": "Technology fee",
  "studentServicesFee": "Student services fee",
  "totalFirstYearFee": "Total first year fee",
  "totalProgramFee": "Total program fee",
  
  "paymentDueDate": "Payment due date",
  "paymentMethods": "Payment methods accepted",
  "refundPolicy": "Refund policy details",
  "scholarshipInfo": "Scholarship information",
  "discountsAvailable": "Available discounts",
  
  "academicRequirements": "Academic entry requirements",
  "englishRequirements": "English language requirements",
  "minimumGpa": "Minimum GPA required",
  "prerequisiteSubjects": "Prerequisite subjects",
  "workExperienceRequired": "Work experience requirements",
  "portfolioRequired": "Portfolio requirements",
  "interviewRequired": "Interview requirements",
  
  "visaType": "Visa type required",
  "visaSubclass": "Visa subclass",
  "coe": "COE information",
  "oshc": "Health cover requirements",
  "workRights": "Work rights information",
  
  "admissionsContact": "Admissions contact details",
  "internationalOfficeContact": "International office contact",
  "studentServicesContact": "Student services contact",
  "financialAidContact": "Financial aid contact",
  
  "terms": "Terms and conditions",
  "conditions": "Special conditions",
  "policiesUrl": "Policies URL",
  "handbookUrl": "Student handbook URL",
  
  "accreditation": "Accreditation information",
  "professionalRecognition": "Professional recognition",
  "pathwayOptions": "Pathway options",
  "transferCredit": "Transfer credit policy",
  "graduationRequirements": "Graduation requirements",
  "facilities": "Available facilities",
  "supportServices": "Support services"
}

Document text:
${documentText}

Return only the JSON object, no other text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert document processor. Extract information accurately and return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0,
    });

    const responseText = response.choices[0].message.content || '{}';
    
    try {
      const extractedInfo = JSON.parse(responseText);
      return {
        extractedInfo,
        tokensUsed: response.usage?.total_tokens || 0
      };
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return {
        extractedInfo: { error: 'Failed to parse extracted information' },
        tokensUsed: response.usage?.total_tokens || 0
      };
    }

  } catch (error) {
    console.error('OpenAI extraction error:', error);
    return {
      extractedInfo: { error: 'Failed to extract information' },
      tokensUsed: 0
    };
  }
}