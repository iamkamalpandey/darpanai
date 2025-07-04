import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey, uniqueIndex, varchar, decimal } from "drizzle-orm/pg-core";
export * from "./offerLetterSchema";
export * from "./coeSchema";
export * from "./scholarshipSchema";
export * from "./cvAnalysisSchema";
export * from "./academicDocumentSchema";
export * from "./institutionSchema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Unified Professional Application System
export const institutions = pgTable("institutions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  city: text("city").notNull(),
  type: text("type").notNull(), // university, college, institute
  ranking: integer("ranking"),
  website: text("website"),
  logo: text("logo"),
  description: text("description"),
  accreditation: text("accreditation"),
  establishedYear: integer("established_year"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").references(() => institutions.id).notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  level: text("level").notNull(), // diploma, bachelor, master, phd
  field: text("field").notNull(),
  duration: text("duration").notNull(),
  tuitionFee: decimal("tuition_fee", { precision: 10, scale: 2 }).notNull(),
  applicationFee: decimal("application_fee", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  intakeMonths: text("intake_months").array().notNull(), // ["January", "September"]
  requirements: jsonb("requirements").notNull(), // Academic requirements
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const requiredDocuments = pgTable("required_documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // academic, personal, financial, visa
  isRequired: boolean("is_required").default(true).notNull(),
  fileTypes: text("file_types").array().notNull(), // ["pdf", "jpg", "png"]
  maxSize: integer("max_size").notNull(), // in MB
  instructions: text("instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Country-specific document requirements
export const countryDocumentRequirements = pgTable("country_document_requirements", {
  id: serial("id").primaryKey(),
  countryCode: text("country_code").notNull(), // ISO country code
  countryName: text("country_name").notNull(),
  documentId: integer("document_id").references(() => requiredDocuments.id).notNull(),
  isRequired: boolean("is_required").default(true).notNull(),
  specificInstructions: text("specific_instructions"), // Country-specific instructions
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User document library - where users store their analyzed documents
export const userDocuments = pgTable("user_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  documentCategory: text("document_category").notNull(), // academic, personal, financial, visa
  isAnalyzed: boolean("is_analyzed").default(false).notNull(),
  analysisData: jsonb("analysis_data"), // AI extracted data
  extractedFields: jsonb("extracted_fields"), // Structured extracted information
  validationStatus: text("validation_status").default("pending").notNull(), // pending, valid, invalid, needs_review
  validationIssues: jsonb("validation_issues"), // Array of validation issues found
  tags: text("tags").array().default([]), // User-defined tags for organization
  description: text("description"), // User description
  
  // Resource optimization fields - prevent wasteful re-analysis
  analysisAttempts: integer("analysis_attempts").default(0).notNull(), // Track analysis attempts
  firstAnalysisDate: timestamp("first_analysis_date"), // When first analyzed
  lastAnalysisAttempt: timestamp("last_analysis_attempt"), // Last attempt timestamp
  canReanalyze: boolean("can_reanalyze").default(true).notNull(), // Admin override for reanalysis
  
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courseDocuments = pgTable("course_documents", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  documentId: integer("document_id").references(() => requiredDocuments.id).notNull(),
  isRequired: boolean("is_required").default(true).notNull(),
  order: integer("order").default(0).notNull(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  institutionId: integer("institution_id").references(() => institutions.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  applicationNumber: text("application_number").notNull().unique(),
  status: text("status").default("draft").notNull(), // draft, submitted, under_review, approved, rejected, withdrawn
  personalInfo: jsonb("personal_info").notNull(),
  academicInfo: jsonb("academic_info").notNull(),
  contactInfo: jsonb("contact_info").notNull(),
  emergencyContact: jsonb("emergency_contact").notNull(),
  statementOfPurpose: text("statement_of_purpose"),
  scholarshipApplications: jsonb("scholarship_applications"), // Array of applied scholarships
  totalFees: decimal("total_fees", { precision: 10, scale: 2 }).notNull(),
  scholarshipAmount: decimal("scholarship_amount", { precision: 10, scale: 2 }).default("0"),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  intakeMonth: text("intake_month").notNull(),
  intakeYear: integer("intake_year").notNull(),
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewComments: text("review_comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const applicationDocuments = pgTable("application_documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => applications.id).notNull(),
  documentId: integer("document_id").references(() => requiredDocuments.id).notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: integer("verified_by").references(() => users.id),
  verificationStatus: text("verification_status").default("pending").notNull(), // pending, verified, rejected
  verificationComments: text("verification_comments"),
});

// Communication Center Tables
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  priority: text("priority").default("medium").notNull(), // low, medium, high, urgent
  status: text("status").default("active").notNull(), // active, closed, waiting_response
  applicationId: integer("application_id").references(() => applications.id),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  userType: text("user_type").notNull(), // student, admin, expert
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  messageType: text("message_type").default("text").notNull(), // text, file, system
  attachments: jsonb("attachments"), // Array of file attachments
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Study Abroad Expert Profiles - Complete expert management system
export const studyAbroadExperts = pgTable("study_abroad_experts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id), // Links to users table
  expertType: text("expert_type").notNull(), // 'counselor', 'documentation_expert', 'visa_expert'
  
  // Professional Information
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number"),
  profileImage: text("profile_image"),
  
  // Expertise & Specialization
  specializations: text("specializations").array(), // ['USA', 'Canada', 'Australia'] or ['MBA', 'Engineering']
  expertiseAreas: text("expertise_areas").array(), // ['visa_processing', 'document_review', 'interview_prep']
  languages: text("languages").array().default(['English']).notNull(),
  yearsOfExperience: integer("years_of_experience").default(0).notNull(),
  
  // Professional Details
  qualifications: text("qualifications").array(), // Educational qualifications
  certifications: text("certifications").array(), // Professional certifications
  bio: text("bio"), // Professional biography
  linkedinProfile: text("linkedin_profile"),
  
  // Work Schedule & Availability
  workingHours: jsonb("working_hours").default({}).notNull(), // {"monday": "9:00-17:00", ...}
  timezone: text("timezone").default("UTC").notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  maxStudentsAllowed: integer("max_students_allowed").default(20).notNull(),
  currentStudentCount: integer("current_student_count").default(0).notNull(),
  
  // Performance & Analytics
  totalStudentsHelped: integer("total_students_helped").default(0).notNull(),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("0.00").notNull(), // Percentage
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0.00").notNull(), // 1-5 stars
  totalReviews: integer("total_reviews").default(0).notNull(),
  
  // Status Management
  status: text("status").default("active").notNull(), // active, inactive, suspended, on_leave
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationDate: timestamp("verification_date"),
  
  // Assignment & Management
  assignedBy: text("assigned_by").references(() => users.id), // Admin who created this expert
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
});

// Student-Expert Assignments - Track which experts are assigned to which students
export const studentExpertAssignments = pgTable("student_expert_assignments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => users.id),
  expertId: integer("expert_id").notNull().references(() => studyAbroadExperts.id),
  assignedBy: integer("assigned_by").notNull().references(() => users.id), // Admin who made the assignment
  
  // Assignment Details
  assignmentType: text("assignment_type").notNull(), // 'primary', 'secondary', 'consultation'
  assignmentReason: text("assignment_reason"), // Why this expert was assigned
  priority: text("priority").default("normal").notNull(), // urgent, high, normal, low
  
  // Status & Progress
  status: text("status").default("active").notNull(), // active, completed, transferred, cancelled
  progressNotes: text("progress_notes"),
  expectedCompletionDate: timestamp("expected_completion_date"),
  
  // Communication Tracking
  lastContactDate: timestamp("last_contact_date"),
  totalInteractions: integer("total_interactions").default(0).notNull(),
  studentSatisfactionRating: integer("student_satisfaction_rating"), // 1-5 stars
  studentFeedback: text("student_feedback"),
  
  // Assignment Management
  isActive: boolean("is_active").default(true).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Country Application Workflows
export const countryWorkflows = pgTable("country_workflows", {
  id: serial("id").primaryKey(),
  countryCode: text("country_code").notNull().unique(), // ISO country code (AU, US, UK, CA, etc.)
  countryName: text("country_name").notNull(),
  studyLevel: text("study_level").notNull(), // bachelor, master, phd, diploma
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Workflow metadata
  workflowTitle: text("workflow_title").notNull(),
  workflowDescription: text("workflow_description"),
  estimatedCompletionTime: text("estimated_completion_time"), // "2-3 weeks"
  applicationFee: decimal("application_fee", { precision: 10, scale: 2 }),
  currency: text("currency").default("USD"),
});

// Cleaned up schema - removed syntax errors

// Legacy student applications table - keeping for backward compatibility
export const studentApplications = pgTable("student_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  applicationNumber: text("application_number").notNull().unique(),
  status: text("status").default("draft").notNull(),
  targetCountry: text("target_country").notNull(),
  studyLevel: text("study_level").notNull(),
  fieldOfStudy: text("field_of_study").notNull(),
  preferredIntake: text("preferred_intake").notNull(),
  personalDetails: jsonb("personal_details").notNull(),
  academicDetails: jsonb("academic_details").notNull(),
  budgetRange: text("budget_range").notNull(),
  fundingSource: text("funding_source").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Application Status History for tracking changes
export const applicationStatusHistory = pgTable("application_status_history", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => studentApplications.id).notNull(),
  previousStatus: text("previous_status"),
  newStatus: text("new_status").notNull(),
  changedBy: integer("changed_by").references(() => users.id), // Admin who made the change
  reason: text("reason"), // Reason for status change
  notes: text("notes"), // Additional notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Application Requirements Template (for different countries/programs)
export const applicationRequirements = pgTable("application_requirements", {
  id: serial("id").primaryKey(),
  country: text("country").notNull(),
  studyLevel: text("study_level").notNull(),
  requirements: jsonb("requirements").notNull(), // Detailed requirements object
  documentTypes: jsonb("document_types").notNull(), // Required document types
  minimumScores: jsonb("minimum_scores"), // Minimum language/academic scores
  processingTime: text("processing_time"), // Expected processing time
  fees: jsonb("fees"), // Application fees
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Legacy table for backward compatibility - will be phased out
export const userApplications = pgTable("user_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  workflowId: integer("workflow_id").references(() => countryWorkflows.id),
  status: text("status").default("in_progress").notNull(),
  applicationData: jsonb("application_data").notNull(),
  completedItems: jsonb("completed_items").default([]).notNull(),
  documentsUploaded: jsonb("documents_uploaded").default([]).notNull(),
  currentStep: text("current_step"),
  progressPercentage: integer("progress_percentage").default(0).notNull(),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Consultation Bookings for Unsupported Countries
export const consultationBookings = pgTable("consultation_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  requestedCountry: text("requested_country").notNull(),
  studyLevel: text("study_level").notNull(),
  fieldOfStudy: text("field_of_study"),
  preferredDate: text("preferred_date"),
  preferredTime: text("preferred_time"),
  message: text("message"),
  status: text("status").default("pending").notNull(), // pending, confirmed, completed, cancelled
  assignedCounselor: text("assigned_counselor"),
  meetingLink: text("meeting_link"),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
  profileImageUrl: text("profile_image_url"), // User profile image (base64 or URL)
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
  
  // CRM Lead Management Fields
  leadCategory: text("lead_category").default("warm").notNull(), // hot, warm, cold
  studentStage: text("student_stage").default("potential").notNull(), // potential, joined_classes, applied, under_processing, failed, success
  assignedExpertId: integer("assigned_expert_id").references(() => studyAbroadExperts.id), // Primary assigned expert
  assignedBy: integer("assigned_by").references(() => users.id), // Admin who made the assignment
  assignedAt: timestamp("assigned_at"), // When the assignment was made
  lastContactDate: timestamp("last_contact_date"), // Last time expert/admin contacted this student
  priority: text("priority").default("normal").notNull(), // urgent, high, normal, low
  notes: text("notes"), // Internal notes for admins and experts
  tags: text("tags").array().default([]).notNull(), // Searchable tags for categorization
  source: text("source"), // How the lead was acquired (website, referral, ads, etc.)
  
  // Progress & Performance Tracking
  successProbability: integer("success_probability").default(50), // 0-100 percentage
  engagementScore: integer("engagement_score").default(0), // Calculated based on interactions
  totalInteractions: integer("total_interactions").default(0),
  lastEngagementDate: timestamp("last_engagement_date").defaultNow(),
  conversionDate: timestamp("conversion_date"), // When they became a paying customer
  
  // Quality & Satisfaction
  satisfactionRating: integer("satisfaction_rating"), // 1-5 stars rating from student
  completionPercentage: integer("completion_percentage").default(0), // Profile completion
  
  // CRM Management
  isArchived: boolean("is_archived").default(false).notNull(),
  archivedAt: timestamp("archived_at"),
  archivedBy: integer("archived_by").references(() => users.id),
  
  // Additional profile fields (maintaining existing functionality)
  counsellingMode: text("counselling_mode"), // online, in-person, phone
  fundingSource: text("funding_source"), // self-funded, scholarship, loan, family
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
  
  // Application Status (legacy fields maintained for compatibility)
  leadType: text("lead_type").default("Prospect"), // Prospect, Applicant, Enrolled
  campaignId: text("campaign_id"),
  dropout: boolean("dropout").default(false)
});

// Destination suggestion feature removed - tables deprecated

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

// Scholarship Watchlist - Complete User Saved Scholarships System
export const scholarshipWatchlist = pgTable("scholarship_watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  scholarshipId: integer("scholarship_id").notNull(), // Reference to scholarship ID
  scholarshipName: text("scholarship_name").notNull(), // Cache for quick display
  providerName: text("provider_name").notNull(),
  hostCountries: jsonb("host_countries").notNull().default([]),
  fundingType: text("funding_type"),
  totalValueMax: text("total_value_max"),
  applicationDeadline: text("application_deadline"),
  tags: text("tags").array().notNull().default([]),
  notes: text("notes"), // User's personal notes about the scholarship
  status: text("status").default("saved").notNull(), // saved, applied, rejected, awarded
  priority: text("priority").default("normal").notNull(), // low, normal, high
  reminderDate: timestamp("reminder_date"), // User can set reminders
  savedAt: timestamp("saved_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userScholarshipUnique: uniqueIndex("user_scholarship_unique").on(table.userId, table.scholarshipId)
}));

// User Update Views Tracking
export const userUpdateViews = pgTable("user_update_views", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  updateId: integer("update_id").references(() => updates.id).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  actionTaken: boolean("action_taken").default(false).notNull(),
});

// Remove duplicate - using scholarshipWatchlist above

// Offer Letter Documents - Raw document storage
export const offerLetterDocuments = pgTable("offer_letter_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  documentText: text("document_text").notNull(),
  
  // Basic document metadata extracted directly from text
  institutionName: text("institution_name"),
  studentName: text("student_name"),
  programName: text("program_name"),
  tuitionAmount: text("tuition_amount"),
  startDate: text("start_date"),
  
  // Document processing status
  extractionStatus: text("extraction_status").default("pending"), // pending, completed, failed
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isPublic: boolean("is_public").default(false),
});

// Offer Letter Analysis Results - Separate table for AI analysis
export const offerLetterAnalyses = pgTable("offer_letter_analyses", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => offerLetterDocuments.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // File Information (added for compatibility)
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  
  // Multi-AI Analysis Results
  analysisResults: jsonb("analysis_results"), // Combined final analysis
  gptAnalysisResults: jsonb("gpt_analysis_results"), // OpenAI GPT-4o analysis
  claudeAnalysisResults: jsonb("claude_analysis_results"), // Claude Anthropic analysis
  hybridAnalysisResults: jsonb("hybrid_analysis_results"), // Combined AI insights
  
  // Scraped Data
  institutionalData: jsonb("institutional_data"), // Scraped institutional information
  scholarshipData: jsonb("scholarship_data"), // Available scholarships
  competitorAnalysis: jsonb("competitor_analysis"), // Similar institutions data
  
  // AI Processing Metrics
  tokensUsed: integer("tokens_used"), // OpenAI API usage tracking
  claudeTokensUsed: integer("claude_tokens_used"), // Claude API usage tracking
  totalAiCost: text("total_ai_cost"), // Combined AI processing cost
  processingTime: integer("processing_time"), // Analysis duration in seconds
  scrapingTime: integer("scraping_time"), // Web scraping duration in seconds
  
  // Analysis status
  analysisStatus: text("analysis_status").default("pending"), // pending, processing, completed, failed
  
  // Metadata
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Base user schema for database insertion - using Drizzle schema
export const baseInsertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  emailVerified: true,
  emailVerificationToken: true,
  analysisCount: true,
  maxAnalyses: true,
  role: true,
  status: true,
});

// Enhanced schema with password confirmation for full registration
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

// Darpan AI Recommendation System Tables
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  academicLevel: varchar("academic_level", { length: 50 }),
  fieldOfStudy: varchar("field_of_study", { length: 100 }),
  gpa: varchar("gpa", { length: 10 }),
  testScores: jsonb("test_scores").$type<Record<string, number>>(),
  preferredCountries: jsonb("preferred_countries").$type<string[]>(),
  budgetRange: varchar("budget_range", { length: 50 }),
  lifestyle: varchar("lifestyle", { length: 50 }),
  specialRequirements: text("special_requirements"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const universities = pgTable("universities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  ranking: integer("ranking"),
  tuitionFee: integer("tuition_fee"),
  gpaRequirement: varchar("gpa_requirement", { length: 10 }),
  programs: jsonb("programs").$type<string[]>(),
  website: varchar("website", { length: 200 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const universityMatches = pgTable("university_matches", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").references(() => assessments.id),
  universityId: integer("university_id").references(() => universities.id),
  matchScore: integer("match_score"),
  matchReasons: jsonb("match_reasons").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for Communication Center
export const conversationRelations = relations(conversations, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [conversations.createdBy],
    references: [users.id],
  }),
  application: one(studentApplications, {
    fields: [conversations.applicationId],
    references: [studentApplications.id],
  }),
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
  }),
}));

export const messageRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Relations for Darpan AI System
export const assessmentRelations = relations(assessments, ({ one, many }) => ({
  user: one(users, {
    fields: [assessments.userId],
    references: [users.id],
  }),
  matches: many(universityMatches),
}));

export const universityRelations = relations(universities, ({ many }) => ({
  matches: many(universityMatches),
}));

export const universityMatchRelations = relations(universityMatches, ({ one }) => ({
  assessment: one(assessments, {
    fields: [universityMatches.assessmentId],
    references: [assessments.id],
  }),
  university: one(universities, {
    fields: [universityMatches.universityId],
    references: [universities.id],
  }),
}));

// Types for Darpan AI System
export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;
export type University = typeof universities.$inferSelect;
export type InsertUniversity = typeof universities.$inferInsert;
export type UniversityMatch = typeof universityMatches.$inferSelect;
export type InsertUniversityMatch = typeof universityMatches.$inferInsert;

// Validation schemas for Darpan AI System
export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertUniversitySchema = createInsertSchema(universities).omit({
  id: true,
  createdAt: true,
});

// Communication Center Types and Schemas
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type InsertConversationParticipant = typeof conversationParticipants.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertParticipantSchema = createInsertSchema(conversationParticipants).omit({
  id: true,
  joinedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isRead: true,
  readAt: true,
});

// Advanced Assessments Database Table
export const advancedAssessments = pgTable("advanced_assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  personalInfo: jsonb("personal_info").notNull(),
  academicBackground: jsonb("academic_background").notNull(),
  studyPreferences: jsonb("study_preferences").notNull(),
  geographicPreferences: jsonb("geographic_preferences").notNull(),
  financialPlanning: jsonb("financial_planning").notNull(),
  testScores: jsonb("test_scores"),
  lifestyleFactors: jsonb("lifestyle_factors").notNull(),
  additionalRequirements: jsonb("additional_requirements").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Advanced Assessment Schema
export const advancedAssessmentSchema = z.object({
  // Personal Information
  personalInfo: z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(10, "Phone number is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    nationality: z.string().min(1, "Nationality is required"),
    currentCountry: z.string().min(1, "Current country is required"),
    languagesProficient: z.array(z.string()).min(1, "At least one language required"),
  }),

  // Academic Background
  academicBackground: z.object({
    currentEducationLevel: z.string().min(1, "Education level is required"),
    fieldOfStudy: z.string().min(1, "Field of study is required"),
    institutionName: z.string().min(1, "Institution name is required"),
    graduationYear: z.string().min(1, "Graduation year is required"),
    gpa: z.string().min(1, "GPA is required"),
    gradingScale: z.string().min(1, "Grading scale is required"),
    academicAchievements: z.string().optional(),
    researchExperience: z.string().optional(),
  }),

  // Study Preferences
  studyPreferences: z.object({
    intendedLevel: z.string().min(1, "Intended study level is required"),
    studyField: z.string().min(1, "Study field is required"),
    specificPrograms: z.array(z.string()),
    studyMode: z.string().min(1, "Study mode is required"),
    startSemester: z.string().min(1, "Start semester is required"),
    studyDuration: z.string().min(1, "Study duration is required"),
    researchInterest: z.string().optional(),
    careerGoals: z.string().min(1, "Career goals are required"),
  }),

  // Geographic Preferences
  geographicPreferences: z.object({
    preferredCountries: z.array(z.string()).min(1, "At least one country required"),
    preferredCities: z.array(z.string()),
    climatePreference: z.string().min(1, "Climate preference is required"),
    culturalPreferences: z.array(z.string()),
    languageRequirements: z.array(z.string()),
    proximityToHome: z.string().min(1, "Proximity preference is required"),
  }),

  // Financial Planning
  financialPlanning: z.object({
    annualBudget: z.string().min(1, "Annual budget is required"),
    tuitionBudget: z.string().min(1, "Tuition budget is required"),
    livingExpensesBudget: z.string().min(1, "Living expenses budget is required"),
    fundingSources: z.array(z.string()).min(1, "At least one funding source required"),
    scholarshipInterest: z.string().min(1, "Scholarship interest is required"),
    workPermitInterest: z.string().min(1, "Work permit interest is required"),
    financialSupport: z.string().min(1, "Financial support is required"),
  }),

  // Test Scores & Requirements
  testScores: z.object({
    englishTest: z.string().optional(),
    englishScore: z.string().optional(),
    englishTestDate: z.string().optional(),
    standardizedTest: z.string().optional(),
    standardizedScore: z.string().optional(),
    standardizedTestDate: z.string().optional(),
    gmatGre: z.string().optional(),
    gmatGreScore: z.string().optional(),
    otherTests: z.string().optional(),
  }),

  // Lifestyle & Personal Factors
  lifestyleFactors: z.object({
    accommodationType: z.string().min(1, "Accommodation type is required"),
    campusSize: z.string().min(1, "Campus size preference is required"),
    socialEnvironment: z.string().min(1, "Social environment preference is required"),
    extracurriculars: z.array(z.string()),
    dietaryRequirements: z.string().optional(),
    healthConditions: z.string().optional(),
    transportationNeeds: z.string().optional(),
    technologyAccess: z.string().min(1, "Technology access is required"),
  }),

  // Additional Requirements
  additionalRequirements: z.object({
    visaSupport: z.string().min(1, "Visa support preference is required"),
    internshipOpportunities: z.string().min(1, "Internship interest is required"),
    industryConnections: z.string().min(1, "Industry connections interest is required"),
    alumniNetwork: z.string().min(1, "Alumni network importance is required"),
    postGraduation: z.string().min(1, "Post-graduation plans are required"),
    specialNeeds: z.string().optional(),
    additionalComments: z.string().optional(),
  }),
});

// Legacy assessment schema for backward compatibility
export const assessmentFormSchema = z.object({
  academicLevel: z.string().min(1, "Academic level is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  gpa: z.string().min(1, "GPA is required"),
  testScores: z.record(z.number()).default({}),
  preferredCountries: z.array(z.string()).min(1, "Select at least one country"),
  budgetRange: z.string().min(1, "Budget range is required"),
  lifestyle: z.string().min(1, "Lifestyle preference is required"),
  specialRequirements: z.string().optional(),
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

// Student Application Types
export type StudentApplication = typeof studentApplications.$inferSelect;
export type InsertStudentApplication = typeof studentApplications.$inferInsert;
export type ApplicationStatusHistory = typeof applicationStatusHistory.$inferSelect;
export type InsertApplicationStatusHistory = typeof applicationStatusHistory.$inferInsert;
export type ApplicationRequirement = typeof applicationRequirements.$inferSelect;
export type InsertApplicationRequirement = typeof applicationRequirements.$inferInsert;

// Application-related schemas
export const insertStudentApplicationSchema = createInsertSchema(studentApplications);
export const insertApplicationStatusHistorySchema = createInsertSchema(applicationStatusHistory);
export const insertApplicationRequirementSchema = createInsertSchema(applicationRequirements);

// Application step validation schemas
export const personalInfoStepSchema = z.object({
  personalDetails: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    nationality: z.string().min(1, "Nationality is required"),
    passportNumber: z.string().min(1, "Passport number is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    email: z.string().email("Valid email is required"),
    address: z.string().min(1, "Address is required"),
  }),
  emergencyContact: z.object({
    name: z.string().min(1, "Emergency contact name is required"),
    relationship: z.string().min(1, "Relationship is required"),
    phoneNumber: z.string().min(1, "Emergency contact phone is required"),
    email: z.string().email("Valid emergency contact email is required").optional(),
  }).optional(),
});

export const academicInfoStepSchema = z.object({
  academicDetails: z.object({
    highestQualification: z.string().min(1, "Highest qualification is required"),
    highestInstitution: z.string().min(1, "Institution name is required"),
    highestCountry: z.string().min(1, "Country of study is required"),
    highestGpa: z.string().min(1, "GPA/Grade is required"),
    graduationYear: z.number().min(1980).max(new Date().getFullYear() + 10),
    educationHistory: z.array(z.object({
      level: z.string(),
      institution: z.string(),
      country: z.string(),
      gpa: z.string(),
      graduationYear: z.number(),
    })).optional(),
  }),
});

export const documentsStepSchema = z.object({
  uploadedDocuments: z.array(z.object({
    documentType: z.string(),
    fileName: z.string(),
    filePath: z.string(),
    uploadedAt: z.string(),
  })),
  highestQualificationDocument: z.string().min(1, "Highest qualification document is required"),
});

export const financialInfoStepSchema = z.object({
  budgetRange: z.string().min(1, "Budget range is required"),
  fundingSource: z.string().min(1, "Funding source is required"),
  financialDocuments: z.array(z.object({
    documentType: z.string(),
    fileName: z.string(),
    filePath: z.string(),
  })).optional(),
  sponsorInformation: z.object({
    sponsorName: z.string(),
    relationship: z.string(),
    annualIncome: z.string(),
    sponsorCountry: z.string(),
  }).optional(),
});

export const applicationSubmissionSchema = z.object({
  targetCountry: z.string().min(1, "Target country is required"),
  studyLevel: z.string().min(1, "Study level is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  preferredIntake: z.string().min(1, "Preferred intake is required"),
  specificInstitutions: z.array(z.string()).optional(),
  termsAccepted: z.boolean().refine(val => val === true, "Terms must be accepted"),
  dataProcessingConsent: z.boolean().refine(val => val === true, "Data processing consent is required"),
});

// Scholarship Watchlist types
export type ScholarshipWatchlist = typeof scholarshipWatchlist.$inferSelect;
export type InsertScholarshipWatchlist = typeof scholarshipWatchlist.$inferInsert;

// Watchlist schema for validation
export const insertWatchlistSchema = createInsertSchema(scholarshipWatchlist).omit({
  id: true,
  savedAt: true,
  updatedAt: true,
});

// Offer Letter Document types and schemas - Raw document storage
export type OfferLetterDocument = typeof offerLetterDocuments.$inferSelect;
export type InsertOfferLetterDocument = typeof offerLetterDocuments.$inferInsert;

export const insertOfferLetterDocumentSchema = createInsertSchema(offerLetterDocuments).omit({
  id: true,
  createdAt: true,
});

// Offer Letter Analysis types and schemas - Separate analysis processing  
export type OfferLetterAnalysis = typeof offerLetterAnalyses.$inferSelect;
export type InsertOfferLetterAnalysis = typeof offerLetterAnalyses.$inferInsert;

export const insertOfferLetterAnalysisSchema = createInsertSchema(offerLetterAnalyses).omit({
  id: true,
  createdAt: true,
});

export const offerLetterAnalysisResponseSchema = z.object({
  id: z.number(),
  documentId: z.number(),
  fileName: z.string(),
  fileSize: z.number(),
  analysisDate: z.date(),
  analysisResults: z.any(),
  createdAt: z.date()
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof appointmentSchema>;
export type AppointmentFormData = Omit<InsertAppointment, 'requestedDate'> & {
  requestedDate: string;
};

export type ProfessionalApplication = typeof professionalApplications.$inferSelect;
export type InsertProfessionalApplication = z.infer<typeof professionalApplicationSchema>;

// Removed destination suggestion related schemas - feature discontinued

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

// Gamified Learning Path System - Application Process Gamification

// Learning Path Milestones - Predefined achievement points in application journey
export const learningPathMilestones = pgTable("learning_path_milestones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Profile Setup Master", "Document Detective", "Application Ace"
  description: text("description").notNull(),
  category: text("category").notNull(), // "profile", "documents", "applications", "tests", "financial"
  milestoneType: text("milestone_type").notNull(), // "achievement", "progress", "completion"
  points: integer("points").notNull().default(0), // XP points earned
  requiredActions: jsonb("required_actions").notNull().default([]), // Array of required actions
  badge: text("badge").notNull(), // Badge identifier for frontend
  color: text("color").notNull().default("#3B82F6"), // Badge color
  level: integer("level").notNull().default(1), // Difficulty level 1-5
  order: integer("order").notNull().default(0), // Display order
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Progress Tracking - Individual user's journey through learning path
export const userLearningProgress = pgTable("user_learning_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  milestoneId: integer("milestone_id").references(() => learningPathMilestones.id).notNull(),
  status: text("status").notNull().default("locked"), // "locked", "active", "completed", "skipped"
  progress: integer("progress").notNull().default(0), // Progress percentage 0-100
  pointsEarned: integer("points_earned").notNull().default(0),
  completedAt: timestamp("completed_at"),
  startedAt: timestamp("started_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  
  // Achievement details
  completionData: jsonb("completion_data").default({}), // Store completion details
  feedback: text("feedback"), // User feedback on milestone
  difficultyRating: integer("difficulty_rating"), // User rated difficulty 1-5
}, (table) => ({
  userMilestoneUnique: uniqueIndex("user_milestone_unique").on(table.userId, table.milestoneId)
}));

// Gamification User Stats - Overall progress and achievements
export const userGamificationStats = pgTable("user_gamification_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  totalPoints: integer("total_points").notNull().default(0),
  currentLevel: integer("current_level").notNull().default(1),
  currentStreak: integer("current_streak").notNull().default(0), // Days of consecutive activity
  longestStreak: integer("longest_streak").notNull().default(0),
  totalMilestones: integer("total_milestones").notNull().default(0),
  completedMilestones: integer("completed_milestones").notNull().default(0),
  
  // Engagement metrics
  lastActivityDate: timestamp("last_activity_date"),
  weeklyGoal: integer("weekly_goal").default(3), // Milestones per week
  weeklyCompleted: integer("weekly_completed").default(0),
  weekStartDate: timestamp("week_start_date").defaultNow(),
  
  // Achievement categories
  profileCompletionLevel: integer("profile_completion_level").default(0), // 0-5
  documentMasteryLevel: integer("document_mastery_level").default(0), // 0-5
  applicationExpertLevel: integer("application_expert_level").default(0), // 0-5
  financialPlanningLevel: integer("financial_planning_level").default(0), // 0-5
  testPrepLevel: integer("test_prep_level").default(0), // 0-5
  
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Learning Path Activities - Individual actions within milestones
export const learningPathActivities = pgTable("learning_path_activities", {
  id: serial("id").primaryKey(),
  milestoneId: integer("milestone_id").references(() => learningPathMilestones.id).notNull(),
  name: text("name").notNull(), // "Upload Transcript", "Complete IELTS Practice Test"
  description: text("description").notNull(),
  activityType: text("activity_type").notNull(), // "upload", "form", "quiz", "external", "verification"
  instructions: text("instructions").notNull(),
  
  // Activity configuration
  estimatedTime: text("estimated_time").notNull(), // "5 minutes", "30 minutes"
  difficulty: text("difficulty").notNull().default("easy"), // "easy", "medium", "hard"
  points: integer("points").notNull().default(10),
  isRequired: boolean("is_required").default(true).notNull(),
  order: integer("order").notNull().default(0),
  
  // Activity metadata
  externalUrl: text("external_url"), // For external activities
  validationCriteria: jsonb("validation_criteria").default({}), // Validation rules
  tips: jsonb("tips").default([]), // Helpful tips array
  commonMistakes: jsonb("common_mistakes").default([]), // Common mistakes to avoid
  
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Activity Progress - Progress on individual activities
export const userActivityProgress = pgTable("user_activity_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activityId: integer("activity_id").references(() => learningPathActivities.id).notNull(),
  milestoneId: integer("milestone_id").references(() => learningPathMilestones.id).notNull(),
  
  status: text("status").notNull().default("not_started"), // "not_started", "in_progress", "completed", "verified"
  progress: integer("progress").notNull().default(0), // 0-100
  pointsEarned: integer("points_earned").notNull().default(0),
  
  // Activity specific data
  submissionData: jsonb("submission_data").default({}), // User's submitted data
  feedback: text("feedback"), // System or admin feedback
  attempts: integer("attempts").notNull().default(0),
  timeSpent: integer("time_spent").default(0), // Time in minutes
  
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  lastAttemptAt: timestamp("last_attempt_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userActivityUnique: uniqueIndex("user_activity_unique").on(table.userId, table.activityId)
}));

// Achievement Badges - Collectible badges for special accomplishments
export const achievementBadges = pgTable("achievement_badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Speed Demon", "Perfectionist", "Helper"
  description: text("description").notNull(),
  badgeType: text("badge_type").notNull(), // "speed", "accuracy", "consistency", "special", "social"
  icon: text("icon").notNull(), // Icon identifier
  color: text("color").notNull(),
  rarity: text("rarity").notNull().default("common"), // "common", "rare", "epic", "legendary"
  
  // Unlock criteria
  unlockCriteria: jsonb("unlock_criteria").notNull(), // Conditions to unlock
  points: integer("points").notNull().default(50),
  isSecret: boolean("is_secret").default(false), // Hidden until unlocked
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Earned Badges - Badges earned by users
export const userEarnedBadges = pgTable("user_earned_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  badgeId: integer("badge_id").references(() => achievementBadges.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  
  // Context of earning
  contextType: text("context_type"), // "milestone", "activity", "streak", "special"
  contextId: integer("context_id"), // Related milestone/activity ID
  earnedData: jsonb("earned_data").default({}), // Achievement specific data
  
  isDisplayed: boolean("is_displayed").default(true), // Show on profile
  notificationSent: boolean("notification_sent").default(false),
}, (table) => ({
  userBadgeUnique: uniqueIndex("user_badge_unique").on(table.userId, table.badgeId)
}));

// Learning Path Challenges - Time-limited challenges and events
export const learningPathChallenges = pgTable("learning_path_challenges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Application Sprint Week", "Document Upload Challenge"
  description: text("description").notNull(),
  challengeType: text("challenge_type").notNull(), // "speed", "consistency", "completion", "social"
  
  // Challenge timing
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  
  // Challenge configuration
  targetMilestones: jsonb("target_milestones").default([]), // Specific milestones
  bonusMultiplier: decimal("bonus_multiplier", { precision: 3, scale: 2 }).default("1.5"), // Points multiplier
  maxParticipants: integer("max_participants"),
  
  // Rewards
  rewards: jsonb("rewards").default([]), // Special rewards for completion
  leaderboardEnabled: boolean("leaderboard_enabled").default(true),
  
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Challenge Participation - User participation in challenges
export const userChallengeParticipation = pgTable("user_challenge_participation", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  challengeId: integer("challenge_id").references(() => learningPathChallenges.id).notNull(),
  
  status: text("status").notNull().default("active"), // "active", "completed", "withdrawn"
  pointsEarned: integer("points_earned").notNull().default(0),
  milestonesCompleted: integer("milestones_completed").notNull().default(0),
  rank: integer("rank"), // Current rank in challenge
  
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  lastActivityAt: timestamp("last_activity_at"),
}, (table) => ({
  userChallengeUnique: uniqueIndex("user_challenge_unique").on(table.userId, table.challengeId)
}));

// Gamification schemas
export const insertLearningPathMilestoneSchema = createInsertSchema(learningPathMilestones).omit({
  id: true,
  createdAt: true,
});

export const insertUserLearningProgressSchema = createInsertSchema(userLearningProgress).omit({
  id: true,
  updatedAt: true,
});

export const insertUserGamificationStatsSchema = createInsertSchema(userGamificationStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLearningPathActivitySchema = createInsertSchema(learningPathActivities).omit({
  id: true,
  createdAt: true,
});

export const insertUserActivityProgressSchema = createInsertSchema(userActivityProgress).omit({
  id: true,
  updatedAt: true,
});

export const insertAchievementBadgeSchema = createInsertSchema(achievementBadges).omit({
  id: true,
  createdAt: true,
});

export const insertUserEarnedBadgeSchema = createInsertSchema(userEarnedBadges).omit({
  id: true,
  earnedAt: true,
});

export const insertLearningPathChallengeSchema = createInsertSchema(learningPathChallenges).omit({
  id: true,
  createdAt: true,
});

export const insertUserChallengeParticipationSchema = createInsertSchema(userChallengeParticipation).omit({
  id: true,
  joinedAt: true,
});

// Gamification type exports
export type LearningPathMilestone = typeof learningPathMilestones.$inferSelect;
export type InsertLearningPathMilestone = z.infer<typeof insertLearningPathMilestoneSchema>;

export type UserLearningProgress = typeof userLearningProgress.$inferSelect;
export type InsertUserLearningProgress = z.infer<typeof insertUserLearningProgressSchema>;

export type UserGamificationStats = typeof userGamificationStats.$inferSelect;
export type InsertUserGamificationStats = z.infer<typeof insertUserGamificationStatsSchema>;

export type LearningPathActivity = typeof learningPathActivities.$inferSelect;
export type InsertLearningPathActivity = z.infer<typeof insertLearningPathActivitySchema>;

export type UserActivityProgress = typeof userActivityProgress.$inferSelect;
export type InsertUserActivityProgress = z.infer<typeof insertUserActivityProgressSchema>;

export type AchievementBadge = typeof achievementBadges.$inferSelect;
export type InsertAchievementBadge = z.infer<typeof insertAchievementBadgeSchema>;

export type UserEarnedBadge = typeof userEarnedBadges.$inferSelect;
export type InsertUserEarnedBadge = z.infer<typeof insertUserEarnedBadgeSchema>;

export type LearningPathChallenge = typeof learningPathChallenges.$inferSelect;
export type InsertLearningPathChallenge = z.infer<typeof insertLearningPathChallengeSchema>;

export type UserChallengeParticipation = typeof userChallengeParticipation.$inferSelect;
export type InsertUserChallengeParticipation = z.infer<typeof insertUserChallengeParticipationSchema>;

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

// Country Workflow schemas and types
export const insertCountryWorkflowSchema = createInsertSchema(countryWorkflows, {
  countryCode: z.string().min(2, "Country code is required (e.g., US, AU, UK)"),
  countryName: z.string().min(1, "Country name is required"),
  studyLevel: z.enum(["bachelor", "master", "phd", "diploma", "certificate"]),
  workflowTitle: z.string().min(1, "Workflow title is required"),
  workflowDescription: z.string().optional(),
  estimatedCompletionTime: z.string().optional(),
  applicationFee: z.string().optional(),
  currency: z.string().default("USD"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TODO: Define applicationChecklistItems table first
// export const insertChecklistItemSchema = createInsertSchema(applicationChecklistItems, {
//   workflowId: z.number().positive("Workflow ID is required"),
//   itemType: z.enum(["personal_info", "academic_docs", "financial_docs", "language_tests", "visa_docs", "other"]),
//   fieldName: z.string().min(1, "Field name is required"),
//   displayLabel: z.string().min(1, "Display label is required"),
//   description: z.string().optional(),
//   fieldType: z.enum(["text", "number", "date", "file", "dropdown", "checkbox", "textarea"]),
//   validationRules: z.object({
//     required: z.boolean().default(true),
//     minLength: z.number().optional(),
//     maxLength: z.number().optional(),
//     pattern: z.string().optional(),
//     fileTypes: z.array(z.string()).optional(),
//     maxFileSize: z.number().optional(),
//   }).optional(),
//   options: z.array(z.string()).optional(),
//   sortOrder: z.number().default(0),
//   helpText: z.string().optional(),
// }).omit({
//   id: true,
//   createdAt: true,
// });

export const insertUserApplicationSchema = createInsertSchema(userApplications, {
  userId: z.number().positive("User ID is required"),
  workflowId: z.number().positive("Workflow ID is required"),
  status: z.enum(["in_progress", "completed", "submitted", "on_hold"]).default("in_progress"),
  applicationData: z.record(z.any()).default({}),
  completedItems: z.array(z.number()).default([]),
  documentsUploaded: z.array(z.object({
    fieldName: z.string(),
    fileName: z.string(),
    fileUrl: z.string(),
    uploadedAt: z.string(),
  })).default([]),
  currentStep: z.string().optional(),
  progressPercentage: z.number().min(0).max(100).default(0),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  submittedAt: true,
});

export const insertConsultationBookingSchema = createInsertSchema(consultationBookings, {
  userId: z.number().positive("User ID is required"),
  requestedCountry: z.string().min(1, "Country is required"),
  studyLevel: z.enum(["bachelor", "master", "phd", "diploma", "certificate"]),
  fieldOfStudy: z.string().optional(),
  preferredDate: z.string().min(1, "Preferred date is required"),
  preferredTime: z.string().min(1, "Preferred time is required"),
  message: z.string().optional(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).default("pending"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  assignedCounselor: true,
  meetingLink: true,
  scheduledAt: true,
});

// Type exports for Country Workflow system
export type CountryWorkflow = typeof countryWorkflows.$inferSelect;
export type InsertCountryWorkflow = z.infer<typeof insertCountryWorkflowSchema>;

export type ApplicationChecklistItem = typeof applicationChecklistItems.$inferSelect;
export type InsertApplicationChecklistItem = z.infer<typeof insertChecklistItemSchema>;

export type UserApplication = typeof userApplications.$inferSelect;
export type InsertUserApplication = z.infer<typeof insertUserApplicationSchema>;

export type ConsultationBooking = typeof consultationBookings.$inferSelect;
export type InsertConsultationBooking = z.infer<typeof insertConsultationBookingSchema>;

// Country selection workflow schema for AI interactions
export const countrySelectionSchema = z.object({
  selectedCountry: z.string().min(1, "Country selection is required"),
  studyLevel: z.enum(["bachelor", "master", "phd", "diploma", "certificate"]),
  fieldOfStudy: z.string().optional(),
  hasWorkflowSupport: z.boolean(),
  workflowId: z.number().optional(),
});

// Unified Application System Type Definitions
export const insertInstitutionSchema = createInsertSchema(institutions, {
  name: z.string().min(1, "Institution name is required"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  type: z.enum(["university", "college", "institute"]),
  ranking: z.number().optional(),
  website: z.string().url().optional(),
  logo: z.string().optional(),
  description: z.string().optional(),
  accreditation: z.string().optional(),
  establishedYear: z.number().optional(),
  isActive: z.boolean().default(true),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses, {
  institutionId: z.number().positive("Institution ID is required"),
  name: z.string().min(1, "Course name is required"),
  code: z.string().min(1, "Course code is required"),
  level: z.enum(["diploma", "bachelor", "master", "phd"]),
  field: z.string().min(1, "Field of study is required"),
  duration: z.string().min(1, "Duration is required"),
  tuitionFee: z.string().min(1, "Tuition fee is required"),
  applicationFee: z.string().min(1, "Application fee is required"),
  currency: z.string().min(1, "Currency is required"),
  intakeMonths: z.array(z.string()).min(1, "At least one intake month is required"),
  requirements: z.record(z.any()).default({}),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRequiredDocumentSchema = createInsertSchema(requiredDocuments, {
  name: z.string().min(1, "Document name is required"),
  description: z.string().optional(),
  category: z.enum(["academic", "personal", "financial", "visa"]),
  isRequired: z.boolean().default(true),
  fileTypes: z.array(z.string()).min(1, "At least one file type is required"),
  maxSize: z.number().positive("Maximum file size is required"),
  instructions: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications, {
  userId: z.number().positive("User ID is required"),
  institutionId: z.number().positive("Institution ID is required"),
  courseId: z.number().positive("Course ID is required"),
  applicationNumber: z.string().min(1, "Application number is required"),
  status: z.enum(["draft", "submitted", "under_review", "approved", "rejected", "withdrawn"]).default("draft"),
  personalInfo: z.record(z.any()).default({}),
  academicInfo: z.record(z.any()).default({}),
  contactInfo: z.record(z.any()).default({}),
  emergencyContact: z.record(z.any()).default({}),
  statementOfPurpose: z.string().optional(),
  scholarshipApplications: z.array(z.any()).default([]),
  totalFees: z.string().min(1, "Total fees is required"),
  scholarshipAmount: z.string().default("0"),
  netAmount: z.string().min(1, "Net amount is required"),
  intakeMonth: z.string().min(1, "Intake month is required"),
  intakeYear: z.number().positive("Intake year is required"),
}).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
  reviewedBy: true,
  reviewComments: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationDocumentSchema = createInsertSchema(applicationDocuments, {
  applicationId: z.number().positive("Application ID is required"),
  documentId: z.number().positive("Document ID is required"),
  fileName: z.string().min(1, "File name is required"),
  filePath: z.string().min(1, "File path is required"),
  fileSize: z.number().positive("File size is required"),
  fileType: z.string().min(1, "File type is required"),
  verificationStatus: z.enum(["pending", "verified", "rejected"]).default("pending"),
  verificationComments: z.string().optional(),
}).omit({
  id: true,
  uploadedAt: true,
  verifiedAt: true,
  verifiedBy: true,
});

// Database relations for unified application system
export const institutionRelations = relations(institutions, ({ many }) => ({
  courses: many(courses),
  applications: many(applications),
}));

export const courseRelations = relations(courses, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [courses.institutionId],
    references: [institutions.id],
  }),
  applications: many(applications),
  requiredDocuments: many(courseDocuments),
}));

export const applicationRelations = relations(applications, ({ one, many }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  institution: one(institutions, {
    fields: [applications.institutionId],
    references: [institutions.id],
  }),
  course: one(courses, {
    fields: [applications.courseId],
    references: [courses.id],
  }),
  documents: many(applicationDocuments),
  conversations: many(conversations),
}));

export const applicationDocumentRelations = relations(applicationDocuments, ({ one }) => ({
  application: one(applications, {
    fields: [applicationDocuments.applicationId],
    references: [applications.id],
  }),
  requiredDocument: one(requiredDocuments, {
    fields: [applicationDocuments.documentId],
    references: [requiredDocuments.id],
  }),
  verifiedByUser: one(users, {
    fields: [applicationDocuments.verifiedBy],
    references: [users.id],
  }),
}));

// Type exports for unified application system
export type Institution = typeof institutions.$inferSelect;
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type RequiredDocument = typeof requiredDocuments.$inferSelect;
export type InsertRequiredDocument = z.infer<typeof insertRequiredDocumentSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type ApplicationDocument = typeof applicationDocuments.$inferSelect;
export type InsertApplicationDocument = z.infer<typeof insertApplicationDocumentSchema>;

// Document management type definitions
export type UserDocument = typeof userDocuments.$inferSelect;
export type InsertUserDocument = typeof userDocuments.$inferInsert;

export const insertUserDocumentSchema = createInsertSchema(userDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CountryDocumentRequirement = typeof countryDocumentRequirements.$inferSelect;
export type InsertCountryDocumentRequirement = typeof countryDocumentRequirements.$inferInsert;

export const insertCountryDocumentRequirementSchema = createInsertSchema(countryDocumentRequirements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Study Abroad Expert schemas and types
export const insertStudyAbroadExpertSchema = createInsertSchema(studyAbroadExperts, {
  userId: z.number().positive("User ID is required"),
  expertType: z.enum(["counselor", "documentation_expert", "visa_expert"]),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().optional(),
  profileImage: z.string().optional(),
  specializations: z.array(z.string()).default([]),
  expertiseAreas: z.array(z.string()).default([]),
  languages: z.array(z.string()).default(["English"]),
  yearsOfExperience: z.number().min(0).default(0),
  qualifications: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  bio: z.string().optional(),
  linkedinProfile: z.string().optional(),
  workingHours: z.record(z.string()).default({}),
  timezone: z.string().default("UTC"),
  isAvailable: z.boolean().default(true),
  maxStudentsAllowed: z.number().min(1).default(20),
  status: z.enum(["active", "inactive", "suspended", "on_leave"]).default("active"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastActiveAt: true,
  currentStudentCount: true,
  totalStudentsHelped: true,
  successRate: true,
  averageRating: true,
  totalReviews: true,
  isVerified: true,
  verificationDate: true,
});

export const insertStudentExpertAssignmentSchema = createInsertSchema(studentExpertAssignments, {
  studentId: z.number().positive("Student ID is required"),
  expertId: z.number().positive("Expert ID is required"),
  assignedBy: z.number().positive("Assigned by admin ID is required"),
  assignmentType: z.enum(["primary", "secondary", "consultation"]),
  assignmentReason: z.string().optional(),
  priority: z.enum(["urgent", "high", "normal", "low"]).default("normal"),
  progressNotes: z.string().optional(),
  expectedCompletionDate: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  assignedAt: true,
  completedAt: true,
  status: true,
  lastContactDate: true,
  totalInteractions: true,
  studentSatisfactionRating: true,
  studentFeedback: true,
  isActive: true,
});

// Type exports for Study Abroad Expert system
export type StudyAbroadExpert = typeof studyAbroadExperts.$inferSelect;
export type InsertStudyAbroadExpert = z.infer<typeof insertStudyAbroadExpertSchema>;

export type StudentExpertAssignment = typeof studentExpertAssignments.$inferSelect;
export type InsertStudentExpertAssignment = z.infer<typeof insertStudentExpertAssignmentSchema>;

// Cultural Adaptation Challenges - Micro-learning system for cultural adaptation
export const culturalChallenges = pgTable("cultural_challenges", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // 'communication', 'social', 'academic', 'daily_life', 'professional'
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // 'beginner', 'intermediate', 'advanced'
  timeEstimate: text("time_estimate").notNull(), // e.g., "2-3 minutes"
  points: integer("points").notNull().default(10),
  country: text("country").notNull(), // Target country for cultural context
  scenario: text("scenario").notNull(), // Cultural scenario description
  options: text("options").array().notNull(), // Multiple choice options
  correctAnswer: integer("correct_answer").notNull(), // Index of correct answer
  explanation: text("explanation").notNull(), // Why the answer is correct
  culturalTip: text("cultural_tip").notNull(), // Additional cultural insight
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User progress tracking for cultural challenges
export const culturalProgress = pgTable("cultural_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalPoints: integer("total_points").default(0),
  challengesCompleted: integer("challenges_completed").default(0),
  streakDays: integer("streak_days").default(0),
  lastCompletedDate: timestamp("last_completed_date"),
  categoryProgress: jsonb("category_progress").default({
    communication: 0,
    social: 0,
    academic: 0,
    daily_life: 0,
    professional: 0
  }),
  achievements: text("achievements").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual challenge completions
export const challengeCompletions = pgTable("challenge_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  challengeId: integer("challenge_id").references(() => culturalChallenges.id).notNull(),
  userAnswer: integer("user_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  pointsEarned: integer("points_earned").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Cultural challenge schemas
export const insertCulturalChallengeSchema = createInsertSchema(culturalChallenges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCulturalProgressSchema = createInsertSchema(culturalProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChallengeCompletionSchema = createInsertSchema(challengeCompletions).omit({
  id: true,
  completedAt: true,
});

export type CulturalChallenge = typeof culturalChallenges.$inferSelect;
export type InsertCulturalChallenge = z.infer<typeof insertCulturalChallengeSchema>;
export type CulturalProgress = typeof culturalProgress.$inferSelect;
export type InsertCulturalProgress = z.infer<typeof insertCulturalProgressSchema>;
export type ChallengeCompletion = typeof challengeCompletions.$inferSelect;
export type InsertChallengeCompletion = z.infer<typeof insertChallengeCompletionSchema>;

// ============================================================================
// ENHANCED CRM USER PROFILE SYSTEM
// ============================================================================

// Enhanced User Profile with comprehensive CRM functionality
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  
  // Personal Information
  firstName: text('first_name'),
  lastName: text('last_name'),
  dateOfBirth: text('date_of_birth'), // Store as text to handle various formats
  gender: text('gender'), // male, female, other, prefer_not_to_say
  phoneNumber: text('phone_number'),
  alternatePhone: text('alternate_phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  postalCode: text('postal_code'),
  nationality: text('nationality'),
  profilePicture: text('profile_picture'),
  
  // Academic Information - SLC/High School
  slcInstitutionName: text('slc_institution_name'),
  slcGrade: text('slc_grade'),
  slcYear: integer('slc_year'),
  slcBoard: text('slc_board'), // SEE, SLC, etc.
  
  // Higher Secondary/12th Grade
  highschoolInstitutionName: text('highschool_institution_name'),
  highschoolGrade: text('highschool_grade'),
  highschoolYear: integer('highschool_year'),
  highschoolStream: text('highschool_stream'), // Science, Management, Arts, etc.
  
  // Bachelor's Degree
  bachelorsInstitutionName: text('bachelors_institution_name'),
  bachelorsGrade: text('bachelors_grade'),
  bachelorsYear: integer('bachelors_year'),
  bachelorsProgram: text('bachelors_program'),
  bachelorsDuration: text('bachelors_duration'), // 3 years, 4 years, etc.
  
  // Master's Degree
  mastersInstitutionName: text('masters_institution_name'),
  mastersGrade: text('masters_grade'),
  mastersYear: integer('masters_year'),
  mastersProgram: text('masters_program'),
  mastersDuration: text('masters_duration'),
  
  // Current Education
  currentEducationLevel: text('current_education_level'), // bachelor, master, phd, completed
  fieldOfStudy: text('field_of_study'),
  
  // Study Abroad Preferences
  interestedCourse: text('interested_course'),
  preferredCountries: text('preferred_countries').array(),
  preferredPrograms: text('preferred_programs').array(),
  studyLevel: text('study_level'), // bachelor, master, phd, diploma
  budgetRange: text('budget_range'),
  intakePreference: text('intake_preference'), // fall, spring, summer
  
  // English Test Scores - IELTS
  ieltsOverallScore: text('ielts_overall_score'),
  ieltsListeningScore: text('ielts_listening_score'),
  ieltsSpeakingScore: text('ielts_speaking_score'),
  ieltsReadingScore: text('ielts_reading_score'),
  ieltsWritingScore: text('ielts_writing_score'),
  ieltsDate: text('ielts_date'),
  
  // PTE Scores
  pteOverallScore: text('pte_overall_score'),
  pteListeningScore: text('pte_listening_score'),
  pteSpeakingScore: text('pte_speaking_score'),
  pteReadingScore: text('pte_reading_score'),
  pteWritingScore: text('pte_writing_score'),
  pteDate: text('pte_date'),
  
  // TOEFL Scores
  toeflOverallScore: text('toefl_overall_score'),
  toeflListeningScore: text('toefl_listening_score'),
  toeflSpeakingScore: text('toefl_speaking_score'),
  toeflReadingScore: text('toefl_reading_score'),
  toeflWritingScore: text('toefl_writing_score'),
  toeflDate: text('toefl_date'),
  
  // Standardized Test Scores
  satOverallScore: text('sat_overall_score'),
  satMathScore: text('sat_math_score'),
  satReadingScore: text('sat_reading_score'),
  satWritingAndLanguageScore: text('sat_writing_and_language_score'),
  satDate: text('sat_date'),
  
  greOverallScore: text('gre_overall_score'),
  greQuantitativeScore: text('gre_quantitative_score'),
  greVerbalScore: text('gre_verbal_score'),
  greAnalyticalScore: text('gre_analytical_score'),
  greDate: text('gre_date'),
  
  gmatOverallScore: text('gmat_overall_score'),
  gmatQuantitativeScore: text('gmat_quantitative_score'),
  gmatVerbalScore: text('gmat_verbal_score'),
  gmatAnalyticalScore: text('gmat_analytical_score'),
  gmatIntegratedScore: text('gmat_integrated_score'),
  gmatDate: text('gmat_date'),
  
  // Work Experience
  workExperienceYears: integer('work_experience_years'),
  currentJobTitle: text('current_job_title'),
  currentCompany: text('current_company'),
  workExperienceDescription: text('work_experience_description'),
  employmentStatus: text('employment_status'), // employed, unemployed, student, self_employed
  
  // Financial Information
  financialCapacity: text('financial_capacity'),
  sponsorshipDetails: text('sponsorship_details'),
  bankBalance: text('bank_balance'),
  
  // Emergency Contact
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  emergencyContactRelationship: text('emergency_contact_relationship'),
  emergencyContactAddress: text('emergency_contact_address'),
  
  // CRM and Lead Management Fields
  leadSource: text('lead_source'), // website, referral, social_media, advertisement, etc.
  leadStatus: text('lead_status').default('new'), // new, contacted, qualified, interested, enrolled, closed
  leadScore: integer('lead_score').default(0), // 0-100 scoring system
  leadPriority: text('lead_priority').default('medium'), // high, medium, low
  assignedCounselor: integer('assigned_counselor').references(() => users.id),
  lastContactDate: timestamp('last_contact_date'),
  nextFollowUpDate: timestamp('next_follow_up_date'),
  communicationPreference: text('communication_preference'), // phone, email, whatsapp, video_call
  
  // Consultation and Interaction History
  totalConsultations: integer('total_consultations').default(0),
  lastConsultationDate: timestamp('last_consultation_date'),
  satisfactionRating: integer('satisfaction_rating'), // 1-5 rating
  conversionProbability: integer('conversion_probability').default(0), // 0-100%
  
  // Notes and Tags
  notes: text('notes'),
  internalNotes: text('internal_notes'), // For counselor use only
  tags: text('tags').array(), // Custom tags for categorization
  
  // Profile Completion and Engagement
  profileCompletionPercentage: integer('profile_completion_percentage').default(0),
  lastProfileUpdate: timestamp('last_profile_update'),
  engagementScore: integer('engagement_score').default(0), // Platform activity score
  documentUploads: integer('document_uploads').default(0),
  consultationBookings: integer('consultation_bookings').default(0),
  
  // Marketing and Communication Consent
  marketingConsent: boolean('marketing_consent').default(false),
  smsConsent: boolean('sms_consent').default(false),
  emailConsent: boolean('email_consent').default(true),
  whatsappConsent: boolean('whatsapp_consent').default(false),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Lead Activities and Interaction History
export const leadActivities = pgTable('lead_activities', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  activityType: text('activity_type').notNull(), // call, email, meeting, document_upload, analysis, etc.
  activityDescription: text('activity_description'),
  activityDetails: jsonb('activity_details'), // Additional metadata
  performedBy: integer('performed_by').references(() => users.id), // Staff member who performed activity
  activityDate: timestamp('activity_date').defaultNow(),
  duration: integer('duration'), // In minutes for calls/meetings
  outcome: text('outcome'), // successful, no_answer, follow_up_required, etc.
  nextAction: text('next_action'),
  nextActionDate: timestamp('next_action_date'),
  createdAt: timestamp('created_at').defaultNow()
});

// Lead Notes and Communication Log
export const leadNotes = pgTable('lead_notes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  noteType: text('note_type'), // general, consultation, follow_up, internal
  noteTitle: text('note_title'),
  noteContent: text('note_content').notNull(),
  isInternal: boolean('is_internal').default(false), // Only visible to staff
  priority: text('priority').default('normal'), // high, normal, low
  addedBy: integer('added_by').references(() => users.id).notNull(),
  visibleTo: text('visible_to').array(), // User roles that can see this note
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Lead Assignments and Territory Management
export const leadAssignments = pgTable('lead_assignments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  assignedTo: integer('assigned_to').references(() => users.id).notNull(),
  assignedBy: integer('assigned_by').references(() => users.id).notNull(),
  assignmentType: text('assignment_type'), // primary, secondary, team
  assignmentReason: text('assignment_reason'),
  assignmentDate: timestamp('assignment_date').defaultNow(),
  status: text('status').default('active'), // active, transferred, completed
  priority: text('priority').default('medium'),
  expectedCloseDate: timestamp('expected_close_date'),
  actualCloseDate: timestamp('actual_close_date'),
  transferReason: text('transfer_reason'),
  createdAt: timestamp('created_at').defaultNow()
});

// User Profile Relations
export const userProfilesRelations = relations(userProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
  assignedCounselorUser: one(users, {
    fields: [userProfiles.assignedCounselor],
    references: [users.id],
  }),
  activities: many(leadActivities),
  notes: many(leadNotes),
  assignments: many(leadAssignments),
}));

export const leadActivitiesRelations = relations(leadActivities, ({ one }) => ({
  user: one(users, {
    fields: [leadActivities.userId],
    references: [users.id],
  }),
  performedByUser: one(users, {
    fields: [leadActivities.performedBy],
    references: [users.id],
  }),
}));

export const leadNotesRelations = relations(leadNotes, ({ one }) => ({
  user: one(users, {
    fields: [leadNotes.userId],
    references: [users.id],
  }),
  addedByUser: one(users, {
    fields: [leadNotes.addedBy],
    references: [users.id],
  }),
}));

export const leadAssignmentsRelations = relations(leadAssignments, ({ one }) => ({
  user: one(users, {
    fields: [leadAssignments.userId],
    references: [users.id],
  }),
  assignedToUser: one(users, {
    fields: [leadAssignments.assignedTo],
    references: [users.id],
  }),
  assignedByUser: one(users, {
    fields: [leadAssignments.assignedBy],
    references: [users.id],
  }),
}));

// Enhanced User Profile Schema Validation
export const insertUserProfileSchema = createInsertSchema(userProfiles, {
  userId: z.number().positive("User ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().regex(/^[\+]?[\d\s\-\(\)]{7,15}$/, "Invalid phone number format").optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  leadStatus: z.enum(["new", "contacted", "qualified", "interested", "enrolled", "closed"]).default("new"),
  leadPriority: z.enum(["high", "medium", "low"]).default("medium"),
  leadScore: z.number().min(0).max(100).default(0),
  communicationPreference: z.enum(["phone", "email", "whatsapp", "video_call"]).optional(),
  preferredCountries: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadActivitySchema = createInsertSchema(leadActivities, {
  userId: z.number().positive("User ID is required"),
  activityType: z.string().min(1, "Activity type is required"),
  activityDescription: z.string().optional(),
  performedBy: z.number().positive().optional(),
  duration: z.number().min(0).optional(),
  outcome: z.string().optional(),
  nextAction: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  activityDate: true,
});

export const insertLeadNoteSchema = createInsertSchema(leadNotes, {
  userId: z.number().positive("User ID is required"),
  noteContent: z.string().min(1, "Note content is required"),
  addedBy: z.number().positive("Added by user ID is required"),
  noteType: z.enum(["general", "consultation", "follow_up", "internal"]).optional(),
  priority: z.enum(["high", "normal", "low"]).default("normal"),
  isInternal: z.boolean().default(false),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports for CRM system
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type LeadActivity = typeof leadActivities.$inferSelect;
export type InsertLeadActivity = z.infer<typeof insertLeadActivitySchema>;

export type LeadNote = typeof leadNotes.$inferSelect;
export type InsertLeadNote = z.infer<typeof insertLeadNoteSchema>;

export type LeadAssignment = typeof leadAssignments.$inferSelect;


