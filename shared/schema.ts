import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced User Model with User Types
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  emailVerificationToken: text("email_verification_token"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  role: text("role").default("user").notNull(),
  status: text("status").default("pending").notNull(), // pending until email verified
  analysisCount: integer("analysis_count").default(0).notNull(),
  maxAnalyses: integer("max_analyses").default(3).notNull(),
  city: text("city"), // Allow null for optional field
  country: text("country"), // Allow null for optional field
  agreeToTerms: boolean("agree_to_terms").default(false).notNull(),
  allowContact: boolean("allow_contact").default(false).notNull(),
  receiveUpdates: boolean("receive_updates").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // User type for regular users (admin users don't have subtypes)
  userType: text("user_type"), // student, agent, other (null for admin)
  // Student fields (conditional)
  studyDestination: text("study_destination"), // Country preference
  startDate: text("start_date"), // When they want to start
  counsellingMode: text("counselling_mode"), // online, in-person, phone
  fundingSource: text("funding_source"), // self-funded, scholarship, loan, family
  studyLevel: text("study_level"), // bachelor, master, phd, diploma, certificate
  // Agent fields (conditional)
  businessName: text("business_name"),
  businessAddress: text("business_address"),
  businessLicense: text("business_license"),
  yearsOfExperience: text("years_of_experience"),
  specialization: text("specialization"),
  // Other visa category fields (conditional)
  visaCategory: text("visa_category"),
  purposeOfTravel: text("purpose_of_travel"),
  // Personal Information (Enhanced)
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"), // Male, Female, Non-binary, Prefer not to say, Other
  nationality: text("nationality"),
  passportNumber: text("passport_number"),
  secondaryNumber: text("secondary_number"),
  address: text("address"),
  
  // Academic Information (Enhanced)
  highestQualification: text("highest_qualification"), // High School, Bachelor, Master, PhD
  highestInstitution: text("highest_institution"),
  highestCountry: text("highest_country"),
  highestGpa: text("highest_gpa"),
  graduationYear: integer("graduation_year"),
  currentAcademicGap: integer("current_academic_gap"),
  educationHistory: jsonb("education_history"), // Array of education records
  
  // Study Preferences (Enhanced)
  interestedCourse: text("interested_course"), // Required field - notNull will be handled in validation
  fieldOfStudy: text("field_of_study"), // Required field
  preferredIntake: text("preferred_intake"), // Required field
  budgetRange: text("budget_range"), // Required field
  preferredCountries: text("preferred_countries").array(), // Required field
  interestedServices: text("interested_services").array(), // Optional - can be null
  partTimeInterest: boolean("part_time_interest"), // Optional - can be null
  accommodationRequired: boolean("accommodation_required"), // Optional - can be null
  hasDependents: boolean("has_dependents"), // Optional - can be null
  
  // Enhanced Financial Information
  estimatedBudget: text("estimated_budget"), // Total budget range
  savingsAmount: text("savings_amount"), // Current savings range
  loanApproval: boolean("loan_approval"), // Whether loan is approved
  loanAmount: integer("loan_amount"), // Approved loan amount
  sponsorDetails: text("sponsor_details"), // Sponsor information
  financialDocuments: boolean("financial_documents"), // Whether financial docs are ready
  
  // Employment Information
  currentEmploymentStatus: text("current_employment_status"), // Employed, Self-employed, Studying, Unemployed
  workExperienceYears: integer("work_experience_years"),
  jobTitle: text("job_title"),
  organizationName: text("organization_name"),
  fieldOfWork: text("field_of_work"),
  gapReasonIfAny: text("gap_reason_if_any"),
  
  // English Language Proficiency Tests (Enhanced)
  englishProficiencyTests: jsonb("english_proficiency_tests"), // Array of test records with subscores
  standardizedTests: jsonb("standardized_tests"), // Array of standardized test records (GRE, GMAT, SAT)
  
  // Application Status
  leadType: text("lead_type").default("Prospect"), // Prospect, Applicant, Enrolled
  applicationStatus: text("application_status").default("New"), // New, Contacted, In Progress, Applied, Offer Received, Rejected, Enrolled
  source: text("source"),
  campaignId: text("campaign_id"),
  isArchived: boolean("is_archived").default(false),
  dropout: boolean("dropout").default(false),
});

// Enhanced Study Destination Suggestions with comprehensive analysis
export const studyDestinationSuggestions = pgTable("study_destination_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Executive Summary & Overall Analysis
  executiveSummary: text("executive_summary").notNull(),
  overallMatchScore: integer("overall_match_score").notNull(), // 0-100 percentage match
  keyFactors: text("key_factors").array().notNull(),
  
  // Top Country Recommendations (structured JSONB)
  topRecommendations: jsonb("top_recommendations").notNull(), // Array of CountryRecommendation objects
  
  // Intelligent Alternatives Analysis
  intelligentAlternatives: jsonb("intelligent_alternatives"), // Smart alternatives beyond user preferences
  
  // Personalized Insights
  personalizedInsights: jsonb("personalized_insights").notNull(), // strengths, improvements, strategic recommendations
  
  // Action Plans & Next Steps
  nextSteps: jsonb("next_steps").notNull(), // immediate, short-term, long-term actions
  
  // Budget Optimization & Financial Planning
  budgetOptimization: jsonb("budget_optimization").notNull(), // cost-saving, scholarships, financial tips
  
  // Timeline & Planning
  timeline: jsonb("timeline").notNull(), // preparation, application, decision phases
  
  // Analysis Metadata
  tokensUsed: integer("tokens_used").default(0),
  processingTime: integer("processing_time").default(0), // milliseconds
  analysisVersion: text("analysis_version").default("claude-sonnet-4").notNull(),
  
  // Pathway Programs Analysis
  pathwayPrograms: jsonb("pathway_programs"), // Foundation courses, TAFE, 2+2 programs
  
  // Professional Disclaimer & Compliance
  disclaimer: text("disclaimer"),
  
  // Status & Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Country Database for Suggestions
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(), // ISO country code
  region: text("region").notNull(),
  continent: text("continent").notNull(),
  primaryLanguage: text("primary_language").notNull(),
  officialLanguages: text("official_languages").array().notNull(),
  currency: text("currency").notNull(),
  averageTuitionFee: integer("average_tuition_fee"), // in USD
  averageLivingCost: integer("average_living_cost"), // in USD per year
  climate: text("climate").notNull(), // tropical, temperate, cold, arid
  safetyRating: integer("safety_rating"), // 1-10 scale
  educationRanking: integer("education_ranking"), // Global ranking
  workPermitPolicy: text("work_permit_policy").notNull(), // generous, moderate, restrictive
  visaProcessingTime: text("visa_processing_time").notNull(),
  scholarshipAvailability: text("scholarship_availability").notNull(), // high, medium, low
  topUniversities: text("top_universities").array().notNull(),
  popularFields: text("popular_fields").array().notNull(),
  culturalFactors: text("cultural_factors").array().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Analysis schema
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  filename: text("filename").notNull(),
  originalText: text("original_text").notNull(),
  summary: text("summary").notNull(),
  createdAt: text("created_at").notNull(),
  rejectionReasons: jsonb("rejection_reasons").notNull(),
  recommendations: jsonb("recommendations").notNull(),
  nextSteps: jsonb("next_steps").notNull(),
  isPublic: boolean("is_public").default(false),
});

// Enrollment Confirmation Analysis
export const enrollmentAnalyses = pgTable("enrollment_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  filename: text("filename").notNull(),
  documentType: text("document_type").notNull(), // "i20", "cas", "admission_letter", "offer_letter", "confirmation_enrollment", "enrollment_letter", "coe", "visa_letter", "sponsor_letter", "financial_guarantee", "other"
  originalText: text("original_text").notNull(),
  
  // Core document details
  institutionName: text("institution_name"),
  studentName: text("student_name"),
  studentId: text("student_id"),
  programName: text("program_name"),
  programLevel: text("program_level"), // undergraduate, graduate, certificate, etc.
  startDate: text("start_date"),
  endDate: text("end_date"),
  
  // Geographic information
  institutionCountry: text("institution_country"),
  studentCountry: text("student_country"),
  visaType: text("visa_type"),
  
  // Financial information
  tuitionAmount: text("tuition_amount"),
  currency: text("currency"),
  scholarshipAmount: text("scholarship_amount"),
  totalCost: text("total_cost"),
  
  // Additional comprehensive document details
  healthCover: text("health_cover"), // OSHC details including provider, dates, coverage type
  englishTestScore: text("english_test_score"), // English test type, score, and date
  institutionContact: text("institution_contact"), // Phone, email, and other contact details
  visaObligations: text("visa_obligations"), // Important visa-related requirements and obligations
  
  // Offer letter specific fields
  paymentSchedule: text("payment_schedule"), // Complete payment schedule with study periods and due dates
  bankDetails: text("bank_details"), // Payment methods including BSB, account numbers, and reference codes
  conditionsOfOffer: text("conditions_of_offer"), // Academic prerequisites and specific requirements
  orientationDate: text("orientation_date"), // Orientation date and time
  passportDetails: text("passport_details"), // Passport number and expiry date
  supportServices: text("support_services"), // Available student support services
  
  // Complete OpenAI analysis response (structured JSON)
  analysis: text("analysis"), // Complete OpenAI response as JSON string
  
  // Enhanced enrollment fields for comprehensive analysis
  scholarshipDetails: text("scholarship_details"),
  scholarshipPercentage: text("scholarship_percentage"),
  scholarshipDuration: text("scholarship_duration"),
  scholarshipConditions: text("scholarship_conditions"),
  internshipRequired: text("internship_required"),
  internshipDuration: text("internship_duration"),
  workAuthorization: text("work_authorization"),
  workHoursLimit: text("work_hours_limit"),
  academicRequirements: text("academic_requirements"),
  gpaRequirement: text("gpa_requirement"),
  attendanceRequirement: text("attendance_requirement"),
  languageRequirements: text("language_requirements"),
  insuranceRequirements: text("insurance_requirements"),
  accommodationInfo: text("accommodation_info"),
  transportationInfo: text("transportation_info"),
  libraryAccess: text("library_access"),
  technologyRequirements: text("technology_requirements"),
  courseMaterials: text("course_materials"),
  examRequirements: text("exam_requirements"),
  graduationRequirements: text("graduation_requirements"),
  transferCredits: text("transfer_credits"),
  additionalFees: text("additional_fees"),
  refundPolicy: text("refund_policy"),
  withdrawalPolicy: text("withdrawal_policy"),
  disciplinaryPolicies: text("disciplinary_policies"),
  codeOfConduct: text("code_of_conduct"),
  emergencyContacts: text("emergency_contacts"),
  campusServices: text("campus_services"),
  studentRights: text("student_rights"),
  termsToFulfil: text("terms_to_fulfil"),
  
  // Key findings and analysis
  summary: text("summary").notNull(),
  keyFindings: jsonb("key_findings").notNull().default([]),
  missingInformation: jsonb("missing_information").notNull().default([]),
  recommendations: jsonb("recommendations").notNull().default([]),
  nextSteps: jsonb("next_steps").notNull().default([]),
  
  // Document validity and compliance
  isValid: boolean("is_valid").default(true),
  expiryDate: text("expiry_date"),
  complianceIssues: jsonb("compliance_issues").notNull().default([]),
  
  // Metadata
  analysisScore: integer("analysis_score"), // 1-100 score based on completeness
  confidence: integer("confidence"), // 1-100 AI confidence level
  processingTime: integer("processing_time"), // milliseconds
  tokensUsed: integer("tokens_used"), // for cost tracking
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isPublic: boolean("is_public").default(false),
});

// Analysis Feedback and Rating System
export const analysisFeedback = pgTable("analysis_feedback", {
  id: serial("id").primaryKey(),
  analysisId: integer("analysis_id").references(() => analyses.id),
  userId: integer("user_id").references(() => users.id),
  analysisType: text("analysis_type").notNull(), // 'visa' or 'enrollment'
  
  // Rating system (1-5 stars)
  accuracyRating: integer("accuracy_rating"), // How accurate was the analysis?
  helpfulnessRating: integer("helpfulness_rating"), // How helpful were the recommendations?
  clarityRating: integer("clarity_rating"), // How clear was the analysis?
  overallRating: integer("overall_rating"), // Overall satisfaction
  
  // Quick feedback options
  isAccurate: boolean("is_accurate"), // Quick thumbs up/down for accuracy
  isHelpful: boolean("is_helpful"), // Quick thumbs up/down for helpfulness
  
  // Detailed feedback
  feedback: text("feedback"), // Open text feedback
  improvementSuggestions: text("improvement_suggestions"), // What could be better?
  
  // Specific feedback categories
  feedbackCategories: jsonb("feedback_categories").default([]), // ['accuracy', 'completeness', 'relevance', 'clarity']
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Professional Account Applications
export const professionalApplications = pgTable("professional_applications", {
  id: serial("id").primaryKey(),
  planType: text("plan_type").notNull(), // 'professional' or 'enterprise'
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  industry: text("industry").notNull(),
  teamSize: text("team_size").notNull(),
  monthlyVolume: text("monthly_volume").notNull(),
  useCase: text("use_case").notNull(),
  additionalInfo: text("additional_info"),
  status: text("status").default("pending").notNull(), // pending, approved, rejected
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
});

// Consultation Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  preferredContact: text("preferred_contact").notNull(), // phone, whatsapp, viber
  subject: text("subject").notNull(),
  message: text("message"),
  requestedDate: timestamp("requested_date"),
  status: text("status").default("pending").notNull(), // pending, confirmed, completed, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// System Updates/Notifications
export const updates = pgTable("updates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(), // Short description for list view
  imageUrl: text("image_url"), // URL for update image (jpg/png)
  type: text("type").notNull(), // 'general', 'visa_category', 'individual'
  priority: text("priority").default("normal").notNull(), // 'low', 'normal', 'high', 'urgent'
  targetAudience: text("target_audience").default("all").notNull(), // 'all', 'students', 'agents', 'other'
  targetVisaCategories: text("target_visa_categories").array(), // For visa category specific updates
  targetUserIds: integer("target_user_ids").array(), // For individual user updates
  callToAction: text("call_to_action"), // Button text
  externalLink: text("external_link"), // External URL
  isActive: boolean("is_active").default(true).notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Optional expiration date
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Update Views Tracking
export const userUpdateViews = pgTable("user_update_views", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  updateId: integer("update_id").references(() => updates.id).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  actionTaken: boolean("action_taken").default(false).notNull(),
});

// Offer Letter Analysis
export const offerLetterAnalyses = pgTable("offer_letter_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  filename: text("filename").notNull(),
  fileSize: integer("file_size").notNull(),
  originalText: text("original_text").notNull(),
  
  // University Information
  universityName: text("university_name"),
  universityLocation: text("university_location"),
  program: text("program"),
  tuition: text("tuition"),
  duration: text("duration"),
  
  // Profile Analysis
  academicStanding: text("academic_standing"),
  gpa: text("gpa"),
  financialStatus: text("financial_status"),
  relevantSkills: jsonb("relevant_skills"),
  strengths: jsonb("strengths"),
  weaknesses: jsonb("weaknesses"),
  
  // Scholarship Opportunities (JSONB for structured data)
  scholarshipOpportunities: jsonb("scholarship_opportunities"),
  
  // Cost Saving Strategies (JSONB for structured data)
  costSavingStrategies: jsonb("cost_saving_strategies"),
  
  // Recommendations and Next Steps (JSONB for complex structures)
  recommendations: jsonb("recommendations"),
  nextSteps: jsonb("next_steps"),
  
  // Analysis metadata
  analysisResults: jsonb("analysis_results"), // Complete OpenAI response
  tokensUsed: integer("tokens_used"),
  processingTime: integer("processing_time"), // in milliseconds
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Base user schema for registration
const baseUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  phoneNumber: true,
  studyDestination: true,
  startDate: true,
  city: true,
  country: true,
  counsellingMode: true,
  fundingSource: true,
  studyLevel: true,
  agreeToTerms: true,
  allowContact: true,
  receiveUpdates: true,
});

// Enhanced schema with password confirmation
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(1, "Mobile number is required"),
  studyDestination: z.string().min(1, "Please select your preferred study destination"),
  startDate: z.string().min(1, "Please select when you'd like to start"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  counsellingMode: z.string().min(1, "Please select your preferred counselling mode"),
  fundingSource: z.string().min(1, "Please select how you would fund your education"),
  studyLevel: z.string().min(1, "Please select your preferred study level"),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms and privacy policy"),
  allowContact: z.boolean().optional(),
  receiveUpdates: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
});

export const appointmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  preferredContact: z.enum(["phone", "whatsapp", "viber"]),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().optional(),
  requestedDate: z.string().datetime("Invalid date format"),
});

export const professionalApplicationSchema = z.object({
  planType: z.enum(["professional", "enterprise"]),
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(1, "Phone number is required"),
  industry: z.string().min(1, "Industry is required"),
  teamSize: z.string().min(1, "Team size is required"),
  monthlyVolume: z.string().min(1, "Monthly volume is required"),
  useCase: z.string().min(10, "Please provide more details about your use case"),
  additionalInfo: z.string().optional(),
});

// FileUpload schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
});

// Analysis response schema for OpenAI
export const analysisResponseSchema = z.object({
  summary: z.string(),
  rejectionReasons: z.array(z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(["financial", "documentation", "eligibility", "academic", "immigration_history", "ties_to_home", "credibility", "general"]),
    severity: z.enum(["high", "medium", "low"]).optional(), // Keep for backward compatibility
  })),
  recommendations: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
  nextSteps: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;

export type OfferLetterAnalysis = typeof offerLetterAnalyses.$inferSelect;
export type InsertOfferLetterAnalysis = typeof offerLetterAnalyses.$inferInsert;

// Offer Letter Analysis schemas
export const insertOfferLetterAnalysisSchema = createInsertSchema(offerLetterAnalyses).omit({
  id: true,
  createdAt: true,
});

export const offerLetterAnalysisResponseSchema = z.object({
  universityInfo: z.object({
    name: z.string(),
    location: z.string(),
    program: z.string(),
    tuition: z.string(),
    duration: z.string(),
  }),
  profileAnalysis: z.object({
    academicStanding: z.string(),
    gpa: z.string(),
    financialStatus: z.string(),
    relevantSkills: z.array(z.string()),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
  }),
  scholarshipOpportunities: z.array(z.object({
    name: z.string(),
    amount: z.string(),
    criteria: z.array(z.string()),
    applicationDeadline: z.string(),
    applicationProcess: z.string(),
    sourceUrl: z.string(),
  })),
  costSavingStrategies: z.array(z.object({
    strategy: z.string(),
    description: z.string(),
    potentialSavings: z.string(),
    implementationSteps: z.array(z.string()),
    timeline: z.string(),
    difficulty: z.enum(['Low', 'Medium', 'High']),
  })),
  recommendations: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof appointmentSchema>;
export type AppointmentFormData = Omit<InsertAppointment, 'requestedDate'> & {
  requestedDate: string;
};

export type ProfessionalApplication = typeof professionalApplications.$inferSelect;
export type InsertProfessionalApplication = z.infer<typeof professionalApplicationSchema>;

export type StudyDestinationSuggestion = typeof studyDestinationSuggestions.$inferSelect;
export type InsertStudyDestinationSuggestion = typeof studyDestinationSuggestions.$inferInsert;

export type Country = typeof countries.$inferSelect;
export type InsertCountry = typeof countries.$inferInsert;

// Enhanced destination analysis validation schemas
export const countryRecommendationSchema = z.object({
  country: z.string(),
  countryCode: z.string(),
  matchScore: z.number().min(0).max(100),
  ranking: z.number(),
  reasons: z.array(z.string()),
  advantages: z.array(z.string()),
  challenges: z.array(z.string()),
  estimatedCosts: z.object({
    tuitionRange: z.string(),
    livingCosts: z.string(),
    totalAnnualCost: z.string(),
  }),
  topUniversities: z.array(z.string()),
  visaRequirements: z.object({
    difficulty: z.string(),
    processingTime: z.string(),
    workPermit: z.string(),
  }),
  careerProspects: z.object({
    jobMarket: z.string(),
    averageSalary: z.string(),
    growthOpportunities: z.string(),
  }),
  culturalFit: z.object({
    languageBarrier: z.string(),
    culturalAdaptation: z.string(),
    internationalStudentSupport: z.string(),
  }),
});

export const intelligentAlternativeSchema = z.object({
  country: z.string(),
  whyBetter: z.string(),
  keyBenefits: z.array(z.string()),
  matchScore: z.number().min(0).max(100),
  costAdvantage: z.string().optional(),
});

export const personalizedInsightsSchema = z.object({
  strengthsAnalysis: z.array(z.string()),
  improvementAreas: z.array(z.string()),
  strategicRecommendations: z.array(z.string()),
});

export const nextStepsSchema = z.object({
  immediate: z.array(z.string()),
  shortTerm: z.array(z.string()),
  longTerm: z.array(z.string()),
});

export const budgetOptimizationSchema = z.object({
  costSavingStrategies: z.array(z.string()),
  scholarshipOpportunities: z.array(z.string()),
  financialPlanningTips: z.array(z.string()),
});

export const timelineSchema = z.object({
  preparation: z.string(),
  application: z.string(),
  decisionMaking: z.string(),
});

export const pathwayProgramSchema = z.object({
  type: z.string(), // foundation, diploma, tafe, 2+2
  description: z.string(),
  duration: z.string(),
  cost: z.string(),
  entryRequirements: z.array(z.string()),
  pathwayTo: z.string(),
});

// Complete destination suggestion response schema
export const destinationSuggestionResponseSchema = z.object({
  executiveSummary: z.string(),
  overallMatchScore: z.number().min(0).max(100),
  topRecommendations: z.array(countryRecommendationSchema),
  keyFactors: z.array(z.string()),
  personalizedInsights: personalizedInsightsSchema,
  nextSteps: nextStepsSchema,
  budgetOptimization: budgetOptimizationSchema,
  timeline: timelineSchema,
  intelligentAlternatives: z.array(intelligentAlternativeSchema).optional(),
  pathwayPrograms: z.array(pathwayProgramSchema).optional(),
});

// Study destination suggestion schemas
export const insertStudyDestinationSuggestionSchema = createInsertSchema(studyDestinationSuggestions).omit({
  id: true,
  createdAt: true,
});

export const insertCountrySchema = createInsertSchema(countries).omit({
  id: true,
  createdAt: true,
});

// Study preferences schema for user profile updates
export const studyPreferencesSchema = z.object({
  preferredStudyFields: z.array(z.string()).optional(),
  budgetRange: z.enum(['low', 'medium', 'high']).optional(),
  languagePreferences: z.array(z.string()).optional(),
  climatePreference: z.enum(['tropical', 'temperate', 'cold', 'arid']).optional(),
  universityRankingImportance: z.enum(['not-important', 'somewhat', 'very-important']).optional(),
  workPermitImportance: z.enum(['not-important', 'somewhat', 'very-important']).optional(),
  culturalPreferences: z.array(z.string()).optional(),
  careerGoals: z.string().optional(),
});

// AI-powered destination suggestion request schema
export const destinationSuggestionRequestSchema = z.object({
  userPreferences: studyPreferencesSchema,
  currentEducation: z.string().optional(),
  academicPerformance: z.string().optional(),
  workExperience: z.string().optional(),
  additionalContext: z.string().optional(),
});

export type FileUpload = z.infer<typeof fileUploadSchema>;
export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;

// Update schema for creation
export const insertUpdateSchema = createInsertSchema(updates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export const updateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  summary: z.string().min(1, "Summary is required"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  type: z.enum(["general", "visa_category", "individual"]),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  targetAudience: z.enum(["all", "students", "agents", "other", "visa_type"]).default("all"),
  targetVisaCategories: z.array(z.string()).optional(),
  targetUserIds: z.array(z.number()).optional(),
  callToAction: z.string().optional(),
  externalLink: z.string().url().optional().or(z.literal("")),
  expiresAt: z.string().optional(),
});

export type Update = typeof updates.$inferSelect;
export type InsertUpdate = z.infer<typeof insertUpdateSchema>;
export type UpdateFormData = z.infer<typeof updateSchema>;

// Extended Update type with user view status
export type UpdateWithViewStatus = Update & {
  isViewed: boolean;
  actionTaken: boolean;
};

export type UserUpdateView = typeof userUpdateViews.$inferSelect;
export type InsertUserUpdateView = typeof userUpdateViews.$inferInsert;

// Document Templates table - For sample document files
export const documentTemplates = pgTable("document_templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(), // e.g., "Bank Statement Template - USA F-1 Visa"
  description: text("description").notNull(),
  documentType: text("document_type").notNull(), // 'bank_statement', 'sop', 'recommendation_letter', 'financial_affidavit', etc.
  category: text("category").notNull(), // 'financial', 'academic', 'personal', 'employment', 'travel', 'legal'
  visaTypes: text("visa_types").array().notNull().default([]),
  countries: text("countries").array().notNull().default([]),
  fileName: text("file_name"), // Original file name
  filePath: text("file_path"), // Server file path for downloads
  fileSize: integer("file_size"), // File size in bytes
  fileType: text("file_type"), // MIME type
  externalUrl: text("external_url"), // External URL for templates
  instructions: text("instructions").array().notNull().default([]),
  tips: text("tips").array().notNull().default([]),
  requirements: text("requirements").array().notNull().default([]), // What info to fill in template
  isActive: boolean("is_active").default(true),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document Checklists table - Simplified destination-country focused
export const documentChecklists = pgTable("document_checklists", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  country: text("country").notNull(), // Destination country only
  visaType: text("visa_type").notNull(),
  userType: text("user_type").notNull(), // 'student', 'tourist', 'work', 'family', 'business'
  items: jsonb("items").notNull().default([]), // ChecklistItem[]
  estimatedProcessingTime: text("estimated_processing_time").notNull(),
  totalFees: text("total_fees").notNull(),
  importantNotes: jsonb("important_notes").notNull().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document Templates schemas - File-based templates
export const insertDocumentTemplateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  documentType: z.string().min(1, "Document type is required"),
  category: z.enum(["financial", "academic", "personal", "employment", "travel", "legal", "medical", "insurance", "accommodation", "language", "others"]),
  visaTypes: z.array(z.string()).default([]),
  countries: z.array(z.string()).default([]),
  fileName: z.string().min(1, "File name is required"),
  filePath: z.string().min(1, "File path is required"),
  fileSize: z.number().optional(),
  fileType: z.string().min(1, "File type is required"),
  instructions: z.array(z.string()).default([]),
  tips: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  uploadedBy: z.number().optional(),
});

export const documentTemplateUploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  documentType: z.string().min(1, "Document type is required"),
  category: z.enum(["financial", "academic", "personal", "employment", "travel", "legal", "medical", "insurance", "accommodation", "language", "others"]),
  visaTypes: z.array(z.string()).default([]),
  countries: z.array(z.string()).default([]),
  instructions: z.array(z.string()).default([]),
  tips: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  externalUrl: z.string().url().optional().or(z.literal("")),
});

// Schema exports moved to end of file to avoid duplicates

// Document Checklists schemas - Simplified for destination country focus
export const insertDocumentChecklistSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  country: z.string().min(1, "Country is required"), // Destination country only
  visaType: z.string().min(1, "Visa type is required"),
  userType: z.enum(["student", "tourist", "work", "family", "business"]),
  items: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Item name is required"),
    description: z.string().min(1, "Description is required"),
    required: z.boolean().default(true),
    completed: z.boolean().default(false),
    category: z.enum(["application", "documentation", "financial", "medical", "submission"]).default("documentation"),
    order: z.number().optional(),
    tips: z.array(z.string()).default([]),
    sampleUrl: z.string().optional(),
  })).default([]),
  estimatedProcessingTime: z.string().min(1, "Processing time is required"),
  totalFees: z.string().min(1, "Total fees is required"),
  importantNotes: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

// Type exports for document templates and checklists
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
export type DocumentTemplateUpload = z.infer<typeof documentTemplateUploadSchema>;

export type DocumentChecklist = typeof documentChecklists.$inferSelect;
export type InsertDocumentChecklist = z.infer<typeof insertDocumentChecklistSchema>;
export type DocumentChecklistFormData = InsertDocumentChecklist;

// Analysis Feedback schemas
export const insertAnalysisFeedbackSchema = createInsertSchema(analysisFeedback, {
  analysisId: z.number().positive("Analysis ID is required"),
  userId: z.number().positive("User ID is required"),
  analysisType: z.enum(["visa", "enrollment"], {
    required_error: "Analysis type is required",
  }),
  accuracyRating: z.number().min(1).max(5).optional(),
  helpfulnessRating: z.number().min(1).max(5).optional(),
  clarityRating: z.number().min(1).max(5).optional(),
  overallRating: z.number().min(1).max(5).optional(),
  isAccurate: z.boolean().optional(),
  isHelpful: z.boolean().optional(),
  feedback: z.string().max(1000).optional(),
  improvementSuggestions: z.string().max(1000).optional(),
  feedbackCategories: z.array(z.enum([
    "accuracy", "completeness", "relevance", "clarity", "helpfulness", "timeliness"
  ])).default([]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AnalysisFeedback = typeof analysisFeedback.$inferSelect;
export type InsertAnalysisFeedback = z.infer<typeof insertAnalysisFeedbackSchema>;

// Enrollment Analysis schemas
export const insertEnrollmentAnalysisSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  documentType: z.enum(["i20", "cas", "admission_letter", "offer_letter", "confirmation_enrollment", "enrollment_letter", "coe", "visa_letter", "sponsor_letter", "financial_guarantee", "other"]),
  originalText: z.string().min(1, "Document text is required"),
});

export const enrollmentAnalysisResponseSchema = z.object({
  // Core document details
  institutionName: z.string().optional(),
  studentName: z.string().optional(),
  studentId: z.string().optional(),
  programName: z.string().optional(),
  programLevel: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  
  // Geographic information
  institutionCountry: z.string().optional(),
  studentCountry: z.string().optional(),
  visaType: z.string().optional(),
  
  // Financial information
  tuitionAmount: z.string().optional(),
  currency: z.string().optional(),
  scholarshipAmount: z.string().optional(),
  totalCost: z.string().optional(),
  
  // Additional comprehensive document details
  healthCover: z.string().optional(),
  englishTestScore: z.string().optional(),
  institutionContact: z.string().optional(),
  visaObligations: z.string().optional(),
  
  // Offer letter specific fields
  paymentSchedule: z.string().optional(),
  bankDetails: z.string().optional(),
  conditionsOfOffer: z.string().optional(),
  orientationDate: z.string().optional(),
  passportDetails: z.string().optional(),
  supportServices: z.string().optional(),
  
  // Enhanced enrollment fields
  scholarshipDetails: z.string().optional(),
  scholarshipPercentage: z.string().optional(),
  scholarshipDuration: z.string().optional(),
  scholarshipConditions: z.string().optional(),
  internshipRequired: z.string().optional(),
  internshipDuration: z.string().optional(),
  workAuthorization: z.string().optional(),
  workHoursLimit: z.string().optional(),
  academicRequirements: z.string().optional(),
  gpaRequirement: z.string().optional(),
  attendanceRequirement: z.string().optional(),
  languageRequirements: z.string().optional(),
  insuranceRequirements: z.string().optional(),
  accommodationInfo: z.string().optional(),
  transportationInfo: z.string().optional(),
  libraryAccess: z.string().optional(),
  technologyRequirements: z.string().optional(),
  courseMaterials: z.string().optional(),
  examRequirements: z.string().optional(),
  graduationRequirements: z.string().optional(),
  transferCredits: z.string().optional(),
  additionalFees: z.string().optional(),
  refundPolicy: z.string().optional(),
  withdrawalPolicy: z.string().optional(),
  disciplinaryPolicies: z.string().optional(),
  codeOfConduct: z.string().optional(),
  emergencyContacts: z.string().optional(),
  campusServices: z.string().optional(),
  studentRights: z.string().optional(),
  termsToFulfil: z.string().optional(),
  
  // Analysis results
  summary: z.string(),
  keyFindings: z.array(z.object({
    title: z.string(),
    description: z.string(),
    importance: z.enum(["high", "medium", "low"]),
    category: z.enum(["financial", "academic", "visa", "health", "accommodation", "scholarship", "compliance", "deadline", "requirement", "internship", "work_authorization", "academic_obligations", "terms_conditions", "other"]).optional(),
    actionRequired: z.string().optional(),
    deadline: z.string().optional(),
    amount: z.string().optional(),
    consequence: z.string().optional(),
  })),
  missingInformation: z.array(z.object({
    field: z.string(),
    description: z.string(),
    impact: z.string(),
  })),
  recommendations: z.array(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(["urgent", "important", "suggested"]),
    category: z.enum(["documentation", "financial", "academic", "visa", "preparation", "health", "accommodation", "language", "legal", "insurance"]),
  })),
  nextSteps: z.array(z.object({
    step: z.string(),
    description: z.string(),
    deadline: z.string().optional(),
    category: z.enum(["immediate", "short_term", "long_term"]),
  })),
  
  // Document validity
  isValid: z.boolean(),
  expiryDate: z.string().optional(),
  complianceIssues: z.array(z.object({
    issue: z.string(),
    severity: z.enum(["critical", "moderate", "minor", "low", "high"]),
    resolution: z.string(),
  })),
  
  // Metadata
  analysisScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
});

// Type exports for enrollment analysis
export type EnrollmentAnalysis = typeof enrollmentAnalyses.$inferSelect;
export type InsertEnrollmentAnalysis = z.infer<typeof insertEnrollmentAnalysisSchema>;
export type EnrollmentAnalysisResponse = z.infer<typeof enrollmentAnalysisResponseSchema>;

// Document Categories - Admin managed categories
export const documentCategories = pgTable("document_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Document Types - Admin managed document types
export const documentTypes = pgTable("document_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas for categories and document types
export const insertDocumentCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const insertDocumentTypeSchema = z.object({
  name: z.string().min(1, "Document type name is required").max(100),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type DocumentCategory = typeof documentCategories.$inferSelect;
export type InsertDocumentCategory = z.infer<typeof insertDocumentCategorySchema>;

export type DocumentType = typeof documentTypes.$inferSelect;
export type InsertDocumentType = z.infer<typeof insertDocumentTypeSchema>;
