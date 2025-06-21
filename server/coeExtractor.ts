import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractCoeInformation(documentText: string) {
  const prompt = `
You are a COE (Confirmation of Enrollment) information extraction specialist. Extract ALL information from this COE document in a structured format. Do not analyze or provide recommendations - only extract the information that is present in the document.

Please extract the following information categories from the COE document:

STUDENT INFORMATION:
- Student Name
- Student ID/Number
- Date of Birth
- Nationality
- Passport Number

INSTITUTION INFORMATION:
- Institution Name
- Institution Code
- CRICOS Code
- Institution Address
- Institution Phone
- Institution Email

COURSE INFORMATION:
- Course Name
- Course Code
- Course Level (Bachelor, Master, Diploma, etc.)
- Field of Study
- Course Duration
- Study Mode (Full-time, Part-time, Online, etc.)
- Campus Location

ENROLLMENT DETAILS:
- Commencement Date
- Completion Date
- Expected Graduation Date
- Enrollment Status
- Study Load (Full-time equivalent, credit points, etc.)

FINANCIAL INFORMATION:
- Tuition Fees
- Total Course Fee
- Fees Per Year
- Fees Per Semester
- OSHC Provider
- OSHC Cost
- OSHC Duration

VISA INFORMATION:
- Visa Subclass
- Visa Conditions
- Work Rights
- Study Requirements

ACADEMIC REQUIREMENTS:
- Academic Requirements
- English Requirements
- Attendance Requirements
- Progress Requirements

CONTACT INFORMATION:
- Contact Person
- Contact Email
- Contact Phone
- Student Support Contact

ADDITIONAL INFORMATION:
- Accommodation Information
- Orientation Information
- Additional Notes
- Terms and Conditions

Return the information in JSON format with the following structure:
{
  "studentName": "string or null",
  "studentId": "string or null",
  "dateOfBirth": "string or null",
  "nationality": "string or null",
  "passportNumber": "string or null",
  "institutionName": "string or null",
  "institutionCode": "string or null",
  "cricosCode": "string or null",
  "institutionAddress": "string or null",
  "institutionPhone": "string or null",
  "institutionEmail": "string or null",
  "courseName": "string or null",
  "courseCode": "string or null",
  "courseLevel": "string or null",
  "fieldOfStudy": "string or null",
  "courseDuration": "string or null",
  "studyMode": "string or null",
  "campusLocation": "string or null",
  "commencementDate": "string or null",
  "completionDate": "string or null",
  "expectedGraduation": "string or null",
  "enrollmentStatus": "string or null",
  "studyLoad": "string or null",
  "tuitionFees": "string or null",
  "totalCourseFee": "string or null",
  "feesPerYear": "string or null",
  "feesPerSemester": "string or null",
  "oshcProvider": "string or null",
  "oshcCost": "string or null",
  "oshcDuration": "string or null",
  "visaSubclass": "string or null",
  "visaConditions": "string or null",
  "workRights": "string or null",
  "studyRequirements": "string or null",
  "academicRequirements": "string or null",
  "englishRequirements": "string or null",
  "attendanceRequirements": "string or null",
  "progressRequirements": "string or null",
  "contactPerson": "string or null",
  "contactEmail": "string or null",
  "contactPhone": "string or null",
  "studentSupportContact": "string or null",
  "accommodationInfo": "string or null",
  "orientationInfo": "string or null",
  "additionalNotes": "string or null",
  "terms": "string or null"
}

Important guidelines:
- Extract ONLY information that is explicitly stated in the document
- Use null for any field where information is not available
- Preserve exact wording and formatting from the document
- Include all relevant details, dates, amounts, and contact information
- Do not interpret, analyze, or add any information not present in the document

COE Document Text:
${documentText}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a precise document information extraction specialist. Extract only the information present in the document without analysis or interpretation."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('COE extraction error:', error);
    throw error;
  }
}