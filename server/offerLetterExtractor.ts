import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractOfferLetterInfo(documentText: string) {
  try {
    const prompt = `You are a comprehensive document information extraction specialist. Analyze this ENTIRE offer letter document and extract ALL available information with maximum accuracy. This is for pure information retrieval and categorization - NO recommendations or analysis needed.

Return a JSON object with the following complete structure. Extract ONLY information that is explicitly stated in the document. If any field is not found, return null for that field.

{
  "institutionName": "Full name of the educational institution",
  "tradingAs": "Trading name or alternative name",
  "institutionAddress": "Complete address of the institution",
  "institutionPhone": "Phone number",
  "institutionEmail": "Official email address",
  "institutionWebsite": "Website URL",
  "providerId": "Provider ID number",
  "cricosProviderCode": "CRICOS provider code",
  "abn": "ABN or business registration number",
  
  "studentName": "Full student name",
  "studentId": "Student ID number",
  "dateOfBirth": "Student date of birth",
  "gender": "Student gender",
  "citizenship": "Student citizenship/nationality",
  "maritalStatus": "Marital status",
  "homeAddress": "Home address",
  "contactNumber": "Student contact phone",
  "emailAddress": "Student email address",
  "correspondenceAddress": "Correspondence address",
  "passportNumber": "Passport number",
  "passportExpiryDate": "Passport expiry date",
  "agentDetails": "Education agent details",
  
  "courseName": "Full course/program name",
  "courseSpecialization": "Course specialization",
  "courseLevel": "Course level (Bachelor, Master, PhD, etc.)",
  "cricosCode": "Course CRICOS code",
  "courseDuration": "Course duration",
  "numberOfUnits": "Number of units/subjects",
  "creditPoints": "Total credit points",
  "orientationDate": "Orientation date",
  "courseStartDate": "Course start date",
  "courseEndDate": "Course end date",
  "studyMode": "Study mode (Full-time, Part-time, etc.)",
  "campusLocation": "Campus location",
  "intakeSchedule": "Intake schedule details",
  
  "totalTuitionFees": "Total tuition fees amount",
  "materialsFee": "Materials fee",
  "studentServicesFee": "Student services fee",
  "technologyFee": "Technology fee",
  "libraryFee": "Library fee",
  "laboratoryFee": "Laboratory fee",
  "applicationFee": "Application fee",
  "enrollmentFee": "Enrollment fee",
  "administrationFee": "Administration fee",
  "otherFees": "Other fees",
  "totalFeesAmount": "Total fees amount",
  "initialPrePaidAmount": "Initial pre-paid amount",
  "remainingBalance": "Remaining balance",
  "paymentSchedule": "Payment schedule details",
  "paymentMethods": "Accepted payment methods",
  "lateFeePolicy": "Late fee policy",
  "refundPolicy": "Refund policy",
  
  "scholarshipAmount": "Scholarship amount if applicable",
  "scholarshipPercentage": "Scholarship percentage",
  "scholarshipConditions": "Scholarship conditions",
  "scholarshipDuration": "Scholarship duration",
  "financialAidInfo": "Financial aid information",
  
  "acceptanceDeadline": "Acceptance deadline",
  "enrollmentDeadline": "Enrollment deadline",
  "feePaymentDeadline": "Fee payment deadline",
  "documentSubmissionDeadline": "Document submission deadline",
  "orientationDeadline": "Orientation deadline",
  
  "academicRequirements": "Academic entry requirements",
  "englishRequirements": "English language requirements",
  "ieltsRequirement": "IELTS requirement",
  "toeflRequirement": "TOEFL requirement",
  "pteRequirement": "PTE requirement",
  "documentRequirements": "Required documents list",
  "healthInsuranceRequirement": "Health insurance requirements",
  "visaRequirements": "Visa requirements",
  
  "accommodationInfo": "Accommodation information",
  "accommodationFees": "Accommodation fees",
  "mealPlanInfo": "Meal plan information",
  "transportInfo": "Transportation information",
  
  "contactPersonName": "Contact person name",
  "contactPersonTitle": "Contact person title/position",
  "contactPersonPhone": "Contact person phone",
  "contactPersonEmail": "Contact person email",
  "admissionsOfficeContact": "Admissions office contact",
  "internationalOfficeContact": "International office contact",
  
  "complianceInfo": "Compliance information",
  "accreditationInfo": "Accreditation details",
  "governmentRegistration": "Government registration details",
  "qualityAssurance": "Quality assurance information",
  
  "withdrawalPolicy": "Withdrawal policy",
  "transferPolicy": "Transfer policy",
  "attendancePolicy": "Attendance policy",
  "academicProgressPolicy": "Academic progress policy",
  "disciplinaryPolicy": "Disciplinary policy",
  
  "additionalServices": "Additional services offered",
  "studentSupportServices": "Student support services",
  "careerServices": "Career services",
  "libraryServices": "Library services",
  "itServices": "IT services",
  
  "termsAndConditions": "Terms and conditions",
  "importantNotes": "Important notes",
  "disclaimers": "Disclaimers",
  "additionalInformation": "Any other important information"
}

DOCUMENT TEXT TO ANALYZE:
${documentText}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Using ChatGPT API as requested
      messages: [
        {
          role: 'system',
          content: 'You are a comprehensive document information extraction specialist. Analyze ENTIRE offer letter documents for pure information retrieval and categorization. Extract ALL available information with maximum accuracy. Return only factual data found in the document - NO recommendations or analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 4000, // Sufficient tokens for comprehensive extraction
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