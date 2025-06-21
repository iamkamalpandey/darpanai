import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractOfferLetterInformation(documentText: string, fileName: string): Promise<{
  extractedInfo: any;
  tokensUsed: number;
  processingTime: number;
}> {
  const startTime = Date.now();

  try {
    const prompt = `
You are a comprehensive offer letter information extraction specialist. Extract ALL available information from this offer letter document with maximum depth and accuracy. Return the data in JSON format with the following structure:

{
  "institutionInformation": {
    "institutionName": "Full legal name of the institution",
    "tradingAs": "Trading name if different",
    "institutionAddress": "Complete address including street, city, state, postal code, country",
    "institutionPhone": "Phone number with country code",
    "institutionEmail": "Primary email address",
    "institutionWebsite": "Website URL",
    "providerId": "Provider ID or registration number",
    "cricosProviderCode": "CRICOS provider code",
    "abn": "Australian Business Number"
  },
  "studentPersonalInformation": {
    "studentName": "Full name of the student",
    "studentId": "Student identification number",
    "dateOfBirth": "Date of birth in DD/MM/YYYY format",
    "gender": "Gender",
    "citizenship": "Country of citizenship or nationality",
    "maritalStatus": "Marital status",
    "homeAddress": "Complete home address",
    "contactNumber": "Phone number with country code",
    "emailAddress": "Student email address",
    "correspondenceAddress": "Correspondence address if different",
    "passportNumber": "Passport number",
    "passportExpiryDate": "Passport expiry date",
    "agentDetails": "Education agent information"
  },
  "courseProgramInformation": {
    "courseName": "Full course name",
    "courseSpecialization": "Course specialization or major",
    "courseLevel": "Academic level (Bachelor, Master, etc.)",
    "cricosCode": "CRICOS course code",
    "courseDuration": "Total duration in weeks/months/years",
    "numberOfUnits": "Total number of units/subjects",
    "creditPoints": "Total credit points",
    "orientationDate": "Orientation date and time",
    "courseStartDate": "Course commencement date",
    "courseEndDate": "Course completion date",
    "studyMode": "Mode of study (full-time, part-time, online, face-to-face)",
    "campusLocation": "Campus location or address"
  },
  "financialInformation": {
    "tuitionFeePerUnit": "Fee per unit/subject",
    "upfrontFeeForCoe": "Upfront fee required for CoE",
    "totalTuitionFees": "Total tuition fees for entire course",
    "enrollmentFee": "Enrollment/admission fee",
    "materialFee": "Material or resource fee",
    "totalFeeDue": "Total amount due initially",
    "scholarshipAmount": "Scholarship amount if any",
    "scholarshipDetails": "Scholarship terms and conditions",
    "paymentSchedule": [
      {
        "studyPeriod": "Study period number",
        "fee": "Fee amount for this period",
        "scholarship": "Scholarship amount",
        "balance": "Balance due",
        "dueDate": "Payment due date"
      }
    ]
  },
  "paymentInformation": {
    "paymentMethods": [
      {
        "method": "Payment method name",
        "details": "Specific payment details"
      }
    ],
    "bankDetails": {
      "accountName": "Account name",
      "bsb": "BSB or routing number",
      "accountNumber": "Account number",
      "bankName": "Bank name",
      "bankAddress": "Bank address",
      "swiftCode": "SWIFT code for international transfers"
    },
    "creditCardPaymentLink": "Online payment link",
    "paymentReference": "Reference number for payments"
  },
  "conditionsOfOffer": [
    {
      "condition": "Condition description",
      "type": "Type of condition (academic, visa, health, etc.)",
      "requirements": "Specific requirements"
    }
  ],
  "courseStructureRequirements": {
    "unitsPerYear": "Number of units per year",
    "yearlyBreakdown": "Breakdown of units by year",
    "fullTimeStudyRequirement": "Full-time study requirements",
    "attendanceRequirements": "Attendance requirements",
    "academicProgressRequirements": "Academic progress requirements"
  },
  "additionalFeesAndCosts": [
    {
      "feeItem": "Fee or charge item",
      "amount": "Fee amount",
      "description": "Description of the fee"
    }
  ],
  "studentSupportServices": [
    {
      "service": "Support service name",
      "description": "Service description",
      "availability": "Availability or cost"
    }
  ],
  "termsAndConditions": {
    "refundPolicy": "Refund policy details",
    "refundConditions": [
      {
        "reason": "Reason for refund",
        "refundAmount": "Refund percentage or amount",
        "conditions": "Specific conditions"
      }
    ],
    "withdrawalPolicy": "Course withdrawal policy",
    "transferPolicy": "Course transfer policy",
    "appealProcedures": "Appeal and grievance procedures",
    "studentCodeOfConduct": "Code of conduct information"
  },
  "legalAndCompliance": {
    "esosLegislation": "ESOS framework information",
    "privacyPolicy": "Privacy policy details",
    "studentRights": "Student rights under Australian law",
    "tuitionProtectionScheme": "TPS information"
  },
  "healthAndInsurance": {
    "oshcRequirement": "Overseas Student Health Cover requirements",
    "healthInsuranceDetails": "Health insurance details",
    "medicalRequirements": "Medical requirements"
  },
  "visaAndImmigration": {
    "visaRequirements": "Visa requirements",
    "studentVisaConditions": "Student visa conditions",
    "workRights": "Work rights information",
    "dependentsInformation": "Information about dependents",
    "schoolAgedDependents": "School-aged dependents information"
  },
  "studyMaterialsResources": {
    "laptopRequirement": "Laptop or technology requirements",
    "textbookCosts": "Textbook and material costs",
    "libraryAccess": "Library access information",
    "technologyRequirements": "Technology requirements"
  },
  "contactInformation": {
    "admissionsOfficer": "Admissions officer name",
    "admissionsEmail": "Admissions email",
    "studentServicesContact": "Student services contact",
    "emergencyContacts": "Emergency contact information",
    "qualitySystemsManager": "Quality systems manager contact"
  },
  "acceptanceAndDeclaration": {
    "acceptanceDeadline": "Deadline to accept offer",
    "studentDeclaration": "Student declaration text",
    "declarationRequirements": [
      "List of declaration requirements"
    ],
    "signatureRequirements": "Signature requirements",
    "returnInstructions": "Instructions for returning documents"
  },
  "administrativeInformation": {
    "applicationId": "Application ID or reference",
    "offerDate": "Date of offer",
    "offerVersion": "Version number",
    "pageCount": "Number of pages",
    "documentStatus": "Document status"
  }
}

IMPORTANT INSTRUCTIONS:
1. Extract ONLY information that is explicitly stated in the document
2. Use "Not specified in document" for any field where information is not available
3. Preserve exact text, amounts, dates, and numbers as they appear
4. For dates, maintain the original format from the document
5. For financial amounts, include currency and exact amounts
6. Extract ALL fee schedules, payment terms, and conditions completely
7. Capture ALL terms and conditions, policies, and legal information
8. Include ALL contact information and administrative details
9. Be comprehensive - this is for detailed document analysis

Document Text:
${documentText}

File Name: ${fileName}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: 'system',
          content: 'You are a comprehensive document information extraction specialist. Extract all information from offer letters with maximum accuracy and depth. Return structured JSON data only.'
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
    const processingTime = Date.now() - startTime;
    
    console.log(`Offer letter information extraction completed in ${processingTime}ms`);
    console.log(`Tokens used: ${response.usage?.total_tokens || 0}`);
    
    return {
      extractedInfo,
      tokensUsed: response.usage?.total_tokens || 0,
      processingTime
    };

  } catch (error) {
    console.error('Error extracting offer letter information:', error);
    const processingTime = Date.now() - startTime;
    
    return {
      extractedInfo: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        administrativeInformation: {
          offerDate: "Not specified in document",
          documentStatus: "Extraction failed"
        }
      },
      tokensUsed: 0,
      processingTime
    };
  }
}