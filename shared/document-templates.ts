// Document Templates and Checklists System

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  category: 'financial' | 'academic' | 'personal' | 'employment' | 'travel' | 'legal';
  visaTypes: string[];
  countries: string[];
  template: string;
  fields: TemplateField[];
  instructions: string[];
  tips: string[];
  requiredDocuments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: string;
}

export interface DocumentChecklist {
  id: string;
  country: string;
  visaType: string;
  userType: 'student' | 'tourist' | 'work' | 'family' | 'business';
  categories: ChecklistCategory[];
  estimatedProcessingTime: string;
  fees: ChecklistFee[];
  importantNotes: string[];
  lastUpdated: Date;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  documents: ChecklistDocument[];
}

export interface ChecklistDocument {
  id: string;
  name: string;
  description: string;
  required: boolean;
  alternatives: string[];
  format: string;
  validity: string;
  tips: string[];
  templateId?: string;
}

export interface ChecklistFee {
  name: string;
  amount: string;
  currency: string;
  description: string;
  required: boolean;
}

// Document Templates Data
export const documentTemplates: DocumentTemplate[] = [
  {
    id: 'statement-of-purpose',
    title: 'Statement of Purpose',
    description: 'Comprehensive statement outlining your academic and career goals',
    category: 'academic',
    visaTypes: ['Student Visa (F-1)', 'Student Visa (UK)', 'Study Permit (Canada)', 'Student Visa (Australia)'],
    countries: ['USA', 'UK', 'Canada', 'Australia'],
    template: `Dear Admissions Committee,

I am writing to express my strong interest in pursuing [DEGREE_PROGRAM] at [UNIVERSITY_NAME]. With my background in [ACADEMIC_BACKGROUND] and professional experience in [WORK_EXPERIENCE], I am confident that this program aligns perfectly with my career aspirations.

Academic Background:
[ACADEMIC_DETAILS]

Professional Experience:
[WORK_DETAILS]

Why This Program:
[PROGRAM_REASONS]

Career Goals:
[CAREER_GOALS]

Why This University:
[UNIVERSITY_REASONS]

Financial Planning:
[FINANCIAL_DETAILS]

Conclusion:
[CONCLUSION]

Sincerely,
[FULL_NAME]`,
    fields: [
      { id: 'degree_program', label: 'Degree Program', type: 'text', required: true, placeholder: 'Master of Science in Computer Science' },
      { id: 'university_name', label: 'University Name', type: 'text', required: true, placeholder: 'Stanford University' },
      { id: 'academic_background', label: 'Academic Background', type: 'text', required: true, placeholder: 'Bachelor of Technology in Computer Science' },
      { id: 'work_experience', label: 'Work Experience', type: 'textarea', required: false, placeholder: 'Software Engineer at Google for 3 years' },
      { id: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' }
    ],
    instructions: [
      'Keep the statement between 800-1200 words',
      'Be specific about your academic and career goals',
      'Explain why you chose this particular program and university',
      'Demonstrate knowledge about the program curriculum',
      'Show how your background prepares you for this program'
    ],
    tips: [
      'Start with a compelling opening that grabs attention',
      'Use specific examples to support your claims',
      'Avoid generic statements that could apply to any program',
      'Proofread multiple times for grammar and clarity',
      'Get feedback from professors or professionals in your field'
    ],
    requiredDocuments: ['Academic transcripts', 'CV/Resume', 'Letters of recommendation'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'financial-statement',
    title: 'Financial Support Statement',
    description: 'Declaration of financial resources for visa application',
    category: 'financial',
    visaTypes: ['Student Visa (F-1)', 'Tourist Visa (B-2)', 'Student Visa (UK)', 'Study Permit (Canada)'],
    countries: ['USA', 'UK', 'Canada', 'Australia'],
    template: `AFFIDAVIT OF FINANCIAL SUPPORT

I, [SPONSOR_NAME], [RELATIONSHIP] of [STUDENT_NAME], hereby declare that I will provide financial support for [HIS_HER] studies at [UNIVERSITY_NAME] in [COUNTRY].

Sponsor Details:
Name: [SPONSOR_NAME]
Occupation: [OCCUPATION]
Annual Income: [ANNUAL_INCOME]
Relationship to Student: [RELATIONSHIP]

Financial Commitment:
I commit to providing USD [AMOUNT] per year for:
- Tuition fees: USD [TUITION_AMOUNT]
- Living expenses: USD [LIVING_AMOUNT]
- Other expenses: USD [OTHER_AMOUNT]

Source of Funds:
[FUND_SOURCE]

I understand that this financial commitment is binding and I have the necessary resources to fulfill this obligation.

Signed: [SPONSOR_NAME]
Date: [DATE]
Place: [PLACE]`,
    fields: [
      { id: 'sponsor_name', label: 'Sponsor Name', type: 'text', required: true, placeholder: 'John Doe' },
      { id: 'student_name', label: 'Student Name', type: 'text', required: true, placeholder: 'Jane Doe' },
      { id: 'relationship', label: 'Relationship', type: 'select', required: true, options: ['Father', 'Mother', 'Guardian', 'Self', 'Spouse'] },
      { id: 'university_name', label: 'University Name', type: 'text', required: true, placeholder: 'Harvard University' },
      { id: 'country', label: 'Country', type: 'select', required: true, options: ['USA', 'UK', 'Canada', 'Australia'] },
      { id: 'occupation', label: 'Occupation', type: 'text', required: true, placeholder: 'Business Owner' },
      { id: 'annual_income', label: 'Annual Income', type: 'text', required: true, placeholder: '$100,000' }
    ],
    instructions: [
      'Provide accurate financial information',
      'Include supporting bank statements',
      'Get the statement notarized if required',
      'Ensure all amounts are in the correct currency',
      'Include proof of relationship if sponsor is not the applicant'
    ],
    tips: [
      'Be conservative with expense estimates',
      'Include a buffer amount for unexpected costs',
      'Provide multiple funding sources if available',
      'Ensure bank statements show sufficient funds',
      'Consider currency exchange rate fluctuations'
    ],
    requiredDocuments: ['Bank statements', 'Income tax returns', 'Employment certificate', 'Property documents'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cover-letter',
    title: 'Visa Application Cover Letter',
    description: 'Professional cover letter explaining your visa application purpose',
    category: 'personal',
    visaTypes: ['Tourist Visa (B-2)', 'Business Visa (B-1)', 'Work Visa (H-1B)', 'Family Visa'],
    countries: ['USA', 'UK', 'Canada', 'Australia', 'Schengen'],
    template: `Date: [DATE]

To: Visa Officer
[EMBASSY_NAME]
[EMBASSY_ADDRESS]

Subject: Visa Application - [VISA_TYPE] for [FULL_NAME]

Dear Visa Officer,

I am writing to support my application for a [VISA_TYPE] to [COUNTRY]. I am [OCCUPATION] from [HOME_COUNTRY] and wish to visit [COUNTRY] for [PURPOSE].

Purpose of Visit:
[DETAILED_PURPOSE]

Travel Itinerary:
- Departure Date: [DEPARTURE_DATE]
- Return Date: [RETURN_DATE]
- Duration: [DURATION]

Accommodation:
[ACCOMMODATION_DETAILS]

Financial Arrangements:
[FINANCIAL_DETAILS]

Ties to Home Country:
[HOME_TIES]

I assure you of my intention to return to [HOME_COUNTRY] after my visit and comply with all visa conditions.

Thank you for considering my application.

Sincerely,
[FULL_NAME]
[CONTACT_INFORMATION]`,
    fields: [
      { id: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' },
      { id: 'visa_type', label: 'Visa Type', type: 'select', required: true, options: ['Tourist Visa', 'Business Visa', 'Student Visa', 'Work Visa'] },
      { id: 'country', label: 'Destination Country', type: 'select', required: true, options: ['USA', 'UK', 'Canada', 'Australia'] },
      { id: 'occupation', label: 'Occupation', type: 'text', required: true, placeholder: 'Software Engineer' },
      { id: 'home_country', label: 'Home Country', type: 'text', required: true, placeholder: 'Nepal' },
      { id: 'purpose', label: 'Purpose of Visit', type: 'textarea', required: true, placeholder: 'Tourism and cultural exploration' }
    ],
    instructions: [
      'Be clear and concise about your purpose',
      'Provide specific dates and itinerary',
      'Demonstrate strong ties to your home country',
      'Show sufficient financial resources',
      'Maintain a professional and respectful tone'
    ],
    tips: [
      'Keep the letter to one page',
      'Use formal business letter format',
      'Be honest and consistent with other documents',
      'Avoid overly emotional language',
      'Include specific details that support your case'
    ],
    requiredDocuments: ['Passport', 'Travel itinerary', 'Hotel bookings', 'Bank statements'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Document Checklists Data
export const documentChecklists: DocumentChecklist[] = [
  {
    id: 'usa-student-f1',
    country: 'USA',
    visaType: 'Student Visa (F-1)',
    userType: 'student',
    categories: [
      {
        id: 'basic-documents',
        name: 'Basic Documents',
        description: 'Essential documents required for all F-1 visa applications',
        required: true,
        documents: [
          {
            id: 'passport',
            name: 'Valid Passport',
            description: 'Passport valid for at least 6 months beyond intended stay',
            required: true,
            alternatives: [],
            format: 'Original passport',
            validity: 'At least 6 months',
            tips: ['Ensure passport has blank pages for visa stamp', 'Check expiration date carefully'],
            templateId: undefined
          },
          {
            id: 'i20-form',
            name: 'Form I-20',
            description: 'Certificate of Eligibility issued by US school',
            required: true,
            alternatives: [],
            format: 'Original signed form',
            validity: 'Current academic year',
            tips: ['Must be signed by school official', 'Check all information is correct'],
            templateId: undefined
          },
          {
            id: 'sevis-receipt',
            name: 'SEVIS Fee Receipt',
            description: 'Proof of SEVIS I-901 fee payment',
            required: true,
            alternatives: [],
            format: 'Printed receipt',
            validity: 'Valid payment confirmation',
            tips: ['Pay fee before visa interview', 'Bring printed receipt'],
            templateId: undefined
          }
        ]
      },
      {
        id: 'financial-documents',
        name: 'Financial Documents',
        description: 'Proof of financial ability to cover education and living costs',
        required: true,
        documents: [
          {
            id: 'bank-statements',
            name: 'Bank Statements',
            description: 'Recent bank statements showing sufficient funds',
            required: true,
            alternatives: ['Fixed deposit certificates', 'Investment statements'],
            format: 'Original bank statements',
            validity: 'Last 3-6 months',
            tips: ['Show consistent balance', 'Include all funding sources'],
            templateId: undefined
          },
          {
            id: 'financial-affidavit',
            name: 'Affidavit of Financial Support',
            description: 'Sworn statement of financial support from sponsor',
            required: true,
            alternatives: [],
            format: 'Notarized document',
            validity: 'Recent document',
            tips: ['Must be notarized', 'Include sponsor relationship proof'],
            templateId: 'financial-statement'
          },
          {
            id: 'sponsor-documents',
            name: 'Sponsor Documents',
            description: 'Income proof and tax documents of financial sponsor',
            required: true,
            alternatives: ['Employment letter', 'Business registration'],
            format: 'Certified copies',
            validity: 'Recent documents',
            tips: ['Include tax returns', 'Provide employment verification'],
            templateId: undefined
          }
        ]
      },
      {
        id: 'academic-documents',
        name: 'Academic Documents',
        description: 'Educational qualifications and academic records',
        required: true,
        documents: [
          {
            id: 'transcripts',
            name: 'Academic Transcripts',
            description: 'Official transcripts from all attended institutions',
            required: true,
            alternatives: [],
            format: 'Sealed official transcripts',
            validity: 'Original or certified copies',
            tips: ['Request multiple copies', 'Ensure they are sealed'],
            templateId: undefined
          },
          {
            id: 'diplomas',
            name: 'Diplomas/Certificates',
            description: 'Degree certificates and graduation documents',
            required: true,
            alternatives: ['Provisional certificates'],
            format: 'Original or certified copies',
            validity: 'Valid certificates',
            tips: ['Get notarized copies', 'Include all degrees earned'],
            templateId: undefined
          },
          {
            id: 'test-scores',
            name: 'Standardized Test Scores',
            description: 'TOEFL, IELTS, GRE, GMAT, SAT scores as required',
            required: true,
            alternatives: [],
            format: 'Official score reports',
            validity: 'Valid test scores',
            tips: ['Check score validity period', 'Send official scores to school'],
            templateId: undefined
          }
        ]
      }
    ],
    estimatedProcessingTime: '3-5 weeks',
    fees: [
      { name: 'Visa Application Fee (MRV)', amount: '185', currency: 'USD', description: 'Non-refundable visa application fee', required: true },
      { name: 'SEVIS I-901 Fee', amount: '350', currency: 'USD', description: 'Student and Exchange Visitor Program fee', required: true }
    ],
    importantNotes: [
      'Schedule visa interview as early as possible',
      'Prepare for English language interview',
      'Demonstrate strong ties to home country',
      'Show intent to return after studies',
      'Be honest and consistent in all responses'
    ],
    lastUpdated: new Date()
  },
  {
    id: 'uk-student-tier4',
    country: 'UK',
    visaType: 'Student Visa (Tier 4)',
    userType: 'student',
    categories: [
      {
        id: 'basic-documents',
        name: 'Basic Documents',
        description: 'Essential documents for UK student visa application',
        required: true,
        documents: [
          {
            id: 'passport',
            name: 'Valid Passport',
            description: 'Current passport with blank pages',
            required: true,
            alternatives: [],
            format: 'Original passport',
            validity: 'Valid throughout stay',
            tips: ['Ensure passport has blank pages', 'Check expiration date'],
            templateId: undefined
          },
          {
            id: 'cas',
            name: 'Confirmation of Acceptance for Studies (CAS)',
            description: 'CAS number from UK educational institution',
            required: true,
            alternatives: [],
            format: 'CAS reference number',
            validity: '6 months from issue date',
            tips: ['CAS must be from licensed sponsor', 'Check all details are correct'],
            templateId: undefined
          },
          {
            id: 'tuberculosis-test',
            name: 'Tuberculosis Test',
            description: 'TB test results from approved clinic',
            required: true,
            alternatives: [],
            format: 'Medical certificate',
            validity: '6 months',
            tips: ['Test must be from approved clinic', 'Required for most countries'],
            templateId: undefined
          }
        ]
      },
      {
        id: 'financial-documents',
        name: 'Financial Documents',
        description: 'Proof of financial ability for UK studies',
        required: true,
        documents: [
          {
            id: 'bank-statements',
            name: 'Bank Statements',
            description: '28 days of bank statements showing required funds',
            required: true,
            alternatives: ['Official bank letter'],
            format: 'Original statements',
            validity: '31 days from application',
            tips: ['Must show 28 consecutive days', 'Include all pages'],
            templateId: undefined
          },
          {
            id: 'maintenance-funds',
            name: 'Maintenance Funds Proof',
            description: 'Evidence of funds for living costs and tuition',
            required: true,
            alternatives: ['Loan approval letter'],
            format: 'Bank statements or loan documents',
            validity: 'Recent documents',
            tips: ['Calculate exact amount required', 'Show funds available for 28 days'],
            templateId: undefined
          }
        ]
      }
    ],
    estimatedProcessingTime: '3 weeks',
    fees: [
      { name: 'Visa Application Fee', amount: '363', currency: 'GBP', description: 'Student visa application fee outside UK', required: true },
      { name: 'Immigration Health Surcharge', amount: '470', currency: 'GBP', description: 'Annual healthcare surcharge', required: true }
    ],
    importantNotes: [
      'Apply no more than 3 months before course start',
      'Provide evidence of English language ability',
      'Show genuine intention to study',
      'Maintain required funds for 28 consecutive days',
      'Use only approved English language tests'
    ],
    lastUpdated: new Date()
  }
];

// Helper functions
export const getTemplatesByCategory = (category: string): DocumentTemplate[] => {
  return documentTemplates.filter(template => template.category === category);
};

export const getTemplatesByVisaType = (visaType: string): DocumentTemplate[] => {
  return documentTemplates.filter(template => template.visaTypes.includes(visaType));
};

export const getChecklistByCountryAndVisa = (country: string, visaType: string): DocumentChecklist | undefined => {
  return documentChecklists.find(checklist => 
    checklist.country === country && checklist.visaType === visaType
  );
};

export const getTemplateById = (id: string): DocumentTemplate | undefined => {
  return documentTemplates.find(template => template.id === id);
};