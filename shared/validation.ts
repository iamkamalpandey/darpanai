import { z } from 'zod';

// Comprehensive validation schemas based on Global Student Lead Profile

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be 50 characters or less"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be 50 characters or less"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  gender: z.enum(["Male", "Female", "Non-binary", "Prefer not to say", "Other"], {
    required_error: "Gender is required"
  }),
  email: z.string().email("Invalid email format"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  secondaryNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional(),
  nationality: z.string().min(1, "Nationality is required"),
  passportNumber: z.string().optional(),
  city: z.string().min(1, "City is required").max(50, "City must be 50 characters or less"),
  country: z.string().min(1, "Country is required"),
  address: z.string().max(150, "Address must be 150 characters or less").optional(),
});

export const academicInfoSchema = z.object({
  highestQualification: z.enum(["High School", "Bachelor", "Master", "PhD"], {
    required_error: "Highest qualification is required"
  }),
  highestInstitution: z.string().min(1, "Institution name is required"),
  highestCountry: z.string().min(1, "Country is required"),
  highestGpa: z.string().min(1, "GPA is required"),
  graduationYear: z.union([
    z.string().regex(/^\d{4}$/, "Graduation year must be a 4-digit year"),
    z.number().int().min(1950).max(new Date().getFullYear() + 10)
  ]).transform((val) => typeof val === 'string' ? parseInt(val) : val),
  currentAcademicGap: z.union([
    z.string().optional(),
    z.number().int().min(0).max(20).optional()
  ]).transform((val) => {
    if (typeof val === 'string' && val.trim() === '') return undefined;
    return typeof val === 'string' ? parseInt(val) || undefined : val;
  }).optional(),
  educationHistory: z.array(z.object({
    level: z.string().min(1, "Education level is required"),
    institution: z.string().min(1, "Institution name is required"),
    country: z.string().min(1, "Country is required"),
    grade: z.string().min(1, "Grade is required"),
    yearOfCompletion: z.number().int().min(1950).max(new Date().getFullYear() + 10)
  })).optional(),
});

export const studyPreferencesSchema = z.object({
  interestedCourse: z.string().min(1, "Interested course is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  preferredIntake: z.string().min(1, "Preferred intake is required"),
  budgetRange: z.enum(["<10K", "10-20K", "20-30K", "30K+"], {
    required_error: "Budget range is required"
  }),
  preferredCountries: z.array(z.string()).min(1, "At least one preferred country is required"),
  interestedServices: z.array(z.string()).optional(),
  partTimeInterest: z.boolean().default(false),
  accommodationRequired: z.boolean().default(false),
  hasDependents: z.boolean().default(false),
});

export const employmentInfoSchema = z.object({
  currentEmploymentStatus: z.enum(["Employed", "Self-employed", "Studying", "Unemployed"], {
    required_error: "Employment status is required"
  }),
  workExperienceYears: z.number().int().min(0).max(50, "Work experience cannot exceed 50 years").optional(),
  jobTitle: z.string().optional(),
  organizationName: z.string().optional(),
  fieldOfWork: z.string().optional(),
  gapReasonIfAny: z.string().optional(),
});

export const englishTestSchema = z.object({
  testType: z.enum(["IELTS", "TOEFL", "PTE", "Duolingo", "Cambridge"], {
    required_error: "Test type is required"
  }),
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  overallScore: z.number().min(0, "Score must be positive"),
  subscores: z.object({
    listening: z.number().min(0).optional(),
    reading: z.number().min(0).optional(),
    writing: z.number().min(0).optional(),
    speaking: z.number().min(0).optional(),
  }).optional(),
});

export const standardizedTestSchema = z.object({
  testType: z.enum(["GRE", "GMAT", "SAT", "ACT"], {
    required_error: "Test type is required"
  }),
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  overallScore: z.number().int().min(0, "Score must be positive"),
  subscores: z.object({
    math: z.number().int().min(0).optional(),
    verbal: z.number().int().min(0).optional(),
    writing: z.number().int().min(0).optional(),
  }).optional(),
});

export const languageProficiencySchema = z.object({
  englishProficiencyTests: z.array(englishTestSchema).optional(),
  standardizedTests: z.array(standardizedTestSchema).optional(),
});

export const applicationStatusSchema = z.object({
  leadType: z.enum(["Prospect", "Applicant", "Enrolled"]).default("Prospect"),
  applicationStatus: z.enum([
    "New", "Contacted", "In Progress", "Applied", 
    "Offer Received", "Rejected", "Enrolled"
  ]).default("New"),
  source: z.string().optional(),
  campaignId: z.string().optional(),
  isArchived: z.boolean().default(false),
  dropout: z.boolean().default(false),
});

// Comprehensive profile validation schema
export const completeProfileSchema = personalInfoSchema
  .merge(academicInfoSchema)
  .merge(studyPreferencesSchema)
  .merge(employmentInfoSchema)
  .merge(languageProficiencySchema)
  .merge(applicationStatusSchema);

// Profile update schema (all fields optional for partial updates)
export const profileUpdateSchema = completeProfileSchema.partial();

// Required fields for profile completion
export const requiredProfileFields = [
  'firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phoneNumber',
  'nationality', 'city', 'country', 'highestQualification', 'highestInstitution',
  'highestCountry', 'highestGpa', 'graduationYear', 'interestedCourse',
  'fieldOfStudy', 'preferredIntake', 'budgetRange', 'preferredCountries',
  'currentEmploymentStatus'
];

// Validation functions
export function validateProfileCompleteness(profile: any): {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
} {
  const missingFields = requiredProfileFields.filter(field => {
    const value = profile[field];
    if (Array.isArray(value)) {
      return !value || value.length === 0;
    }
    return !value || value === '' || value === null || value === undefined;
  });

  const completionPercentage = Math.round(
    ((requiredProfileFields.length - missingFields.length) / requiredProfileFields.length) * 100
  );

  return {
    isComplete: missingFields.length === 0,
    completionPercentage,
    missingFields: missingFields.map(field => field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
  };
}

// Score validation functions for different test types
export function validateTestScore(testType: string, score: number): boolean {
  const scoreRanges: Record<string, { min: number; max: number }> = {
    'IELTS': { min: 0, max: 9 },
    'TOEFL': { min: 0, max: 120 },
    'PTE': { min: 10, max: 90 },
    'Duolingo': { min: 10, max: 160 },
    'Cambridge': { min: 80, max: 230 },
    'GRE': { min: 260, max: 340 },
    'GMAT': { min: 200, max: 800 },
    'SAT': { min: 400, max: 1600 },
    'ACT': { min: 1, max: 36 }
  };

  const range = scoreRanges[testType];
  return range ? score >= range.min && score <= range.max : false;
}

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type AcademicInfo = z.infer<typeof academicInfoSchema>;
export type StudyPreferences = z.infer<typeof studyPreferencesSchema>;
export type EmploymentInfo = z.infer<typeof employmentInfoSchema>;
export type LanguageProficiency = z.infer<typeof languageProficiencySchema>;
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;
export type CompleteProfile = z.infer<typeof completeProfileSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;