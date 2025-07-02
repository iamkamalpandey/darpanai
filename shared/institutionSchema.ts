import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Institution Table
export const institutions = pgTable("institutions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name"), // e.g., "MIT", "Harvard"
  country: text("country").notNull(),
  city: text("city").notNull(),
  state: text("state"), // For countries like USA, Canada
  website: text("website"),
  logo: text("logo"), // URL to logo
  establishedYear: integer("established_year"),
  institutionType: text("institution_type").notNull(), // university, college, institute, school
  ranking: jsonb("ranking"), // { world: 50, country: 10, subject_rankings: {...} }
  accreditation: jsonb("accreditation"), // Accrediting bodies
  campuses: jsonb("campuses"), // Multiple campus locations
  description: text("description"),
  features: jsonb("features"), // Key features, facilities, etc.
  contactInfo: jsonb("contact_info"), // Phone, email, address
  socialMedia: jsonb("social_media"), // Links to social platforms
  isActive: boolean("is_active").default(true).notNull(),
  isPartner: boolean("is_partner").default(false).notNull(), // Partner institutions
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Academic Programs Table
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").references(() => institutions.id).notNull(),
  name: text("name").notNull(),
  degree: text("degree").notNull(), // Bachelor, Master, PhD, Diploma, Certificate
  field: text("field").notNull(), // Computer Science, Business, Engineering, etc.
  specialization: text("specialization"), // Machine Learning, Finance, etc.
  duration: text("duration").notNull(), // "2 years", "4 years"
  studyMode: text("study_mode").notNull(), // full-time, part-time, online, hybrid
  language: text("language").default("English").notNull(),
  credits: integer("credits"), // Total credits required
  description: text("description"),
  curriculum: jsonb("curriculum"), // Course structure
  prerequisites: jsonb("prerequisites"), // Entry requirements
  careerOutcomes: jsonb("career_outcomes"), // Job prospects
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Program Fees Table
export const programFees = pgTable("program_fees", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").references(() => programs.id).notNull(),
  studentType: text("student_type").notNull(), // domestic, international
  currency: text("currency").notNull(), // USD, AUD, CAD, etc.
  tuitionFee: decimal("tuition_fee", { precision: 10, scale: 2 }),
  applicationFee: decimal("application_fee", { precision: 10, scale: 2 }),
  depositFee: decimal("deposit_fee", { precision: 10, scale: 2 }),
  otherFees: jsonb("other_fees"), // Lab fees, library fees, etc.
  totalEstimated: decimal("total_estimated", { precision: 10, scale: 2 }),
  paymentStructure: jsonb("payment_structure"), // Semester-wise breakdown
  livingCosts: jsonb("living_costs"), // Accommodation, food, transport
  academicYear: text("academic_year").notNull(), // "2024-2025"
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Institution Programs (for scholarship connections)
export const institutionPrograms = pgTable("institution_programs", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").references(() => institutions.id).notNull(),
  programId: integer("program_id").references(() => programs.id).notNull(),
  scholarshipId: integer("scholarship_id"), // Reference to scholarships table
  isPartnership: boolean("is_partnership").default(false), // Special partnership programs
  applicationDeadline: text("application_deadline"),
  intakeMonths: jsonb("intake_months"), // ["September", "January", "May"]
  availableSeats: integer("available_seats"),
  requirements: jsonb("requirements"), // Specific requirements for this program at this institution
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Complete Student Application Process Management
export const studentApplications = pgTable("student_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  institutionId: integer("institution_id").references(() => institutions.id).notNull(),
  programId: integer("program_id").references(() => programs.id).notNull(),
  
  // Application status tracking
  applicationStatus: text("application_status").default("draft").notNull(), 
  // draft, document_collection, eligibility_verification, application_review, submitted, under_institutional_review, accepted, rejected, waitlisted, withdrawn
  
  // Application reference and tracking
  applicationReference: varchar("application_reference"), // Unique ID like APP-2025-001
  currentStep: varchar("current_step").default("personal_info"), // personal_info, academic_info, documents, eligibility, review, terms, submit
  completionPercentage: integer("completion_percentage").default(0),
  stepsCompleted: jsonb("steps_completed").default([]),
  
  // Personal Information
  personalInfo: jsonb("personal_info"), // Full name, DOB, nationality, passport, contact details
  academicBackground: jsonb("academic_background"), // Previous qualifications, GPA, institution details
  englishProficiency: jsonb("english_proficiency"), // IELTS, TOEFL scores and dates
  workExperience: jsonb("work_experience"), // Professional background if required
  
  // Program and Study Preferences  
  programPreferences: jsonb("program_preferences"), // Intake period, study mode, campus preference
  motivationStatement: text("motivation_statement"), // Statement of Purpose
  careerGoals: text("career_goals"),
  
  // Financial Information
  financialInfo: jsonb("financial_info"), // Funding source, sponsor details, financial capacity
  
  // Document Management
  requiredDocuments: jsonb("required_documents"), // List of docs needed for this program
  uploadedDocuments: jsonb("uploaded_documents"), // Files with verification status
  documentVerification: jsonb("document_verification"), // AI verification results
  missingDocuments: jsonb("missing_documents").default([]),
  
  // Eligibility Assessment
  eligibilityCheck: jsonb("eligibility_check"), // Automated requirement verification
  meetsRequirements: boolean("meets_requirements").default(false),
  requirementGaps: jsonb("requirement_gaps"), // What needs improvement
  eligibilityScore: integer("eligibility_score"), // 0-100 match score
  
  // Terms and Legal Compliance
  termsAccepted: boolean("terms_accepted").default(false),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  privacyPolicyAccepted: boolean("privacy_policy_accepted").default(false),
  dataProcessingConsent: boolean("data_processing_consent").default(false),
  
  // Submission and Processing
  submittedAt: timestamp("submitted_at"),
  institutionSubmittedAt: timestamp("institution_submitted_at"), // When sent to institution
  expectedResponse: timestamp("expected_response"), // Institution response deadline
  
  // Admin and Counselor Management
  assignedCounselor: varchar("assigned_counselor"), // Staff member handling application
  counselorNotes: text("counselor_notes"),
  adminNotes: text("admin_notes"),
  internalPriority: text("internal_priority").default("medium"), // high, medium, low
  
  // Communication and Updates
  statusHistory: jsonb("status_history").default([]), // All status changes with timestamps
  communicationLog: jsonb("communication_log").default([]), // Messages between user/admin/institution
  lastUserActivity: timestamp("last_user_activity").defaultNow(),
  lastAdminActivity: timestamp("last_admin_activity"),
  
  // Follow-up and Reminders
  followUpDate: timestamp("follow_up_date"),
  remindersSent: integer("reminders_sent").default(0),
  urgentFlag: boolean("urgent_flag").default(false),
  
  // Application Source and Analytics
  source: text("source").default("chat").notNull(), // chat, direct, referral, consultation
  referredBy: varchar("referred_by"), // Referral source if applicable
  campaignSource: varchar("campaign_source"), // Marketing attribution
  
  // Institution Response
  institutionResponse: jsonb("institution_response"), // Decision details from institution
  institutionFeedback: text("institution_feedback"),
  alternativeOffers: jsonb("alternative_offers"), // Other programs offered
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Document Requirements by Program
export const programDocumentRequirements = pgTable("program_document_requirements", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").references(() => programs.id).notNull(),
  documentType: varchar("document_type").notNull(), // transcript, diploma, passport, english_test, sop, lor, financial_proof
  isRequired: boolean("is_required").default(true),
  minimumRequirement: jsonb("minimum_requirement"), // GPA, test scores, etc.
  description: text("description"),
  verificationCriteria: jsonb("verification_criteria"),
  acceptedFormats: jsonb("accepted_formats").default(["PDF", "JPG", "PNG"]),
  maxFileSize: integer("max_file_size").default(10485760), // 10MB in bytes
  createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const institutionsRelations = relations(institutions, ({ many }) => ({
  programs: many(programs),
  programFees: many(programFees),
  institutionPrograms: many(institutionPrograms),
  applications: many(studentApplications)
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [programs.institutionId],
    references: [institutions.id]
  }),
  fees: many(programFees),
  institutionPrograms: many(institutionPrograms),
  applications: many(studentApplications)
}));

export const programFeesRelations = relations(programFees, ({ one }) => ({
  program: one(programs, {
    fields: [programFees.programId],
    references: [programs.id]
  })
}));

export const studentApplicationsRelations = relations(studentApplications, ({ one }) => ({
  institution: one(institutions, {
    fields: [studentApplications.institutionId],
    references: [institutions.id]
  }),
  program: one(programs, {
    fields: [studentApplications.programId],
    references: [programs.id]
  })
}));

// Zod Schemas
export const insertInstitutionSchema = createInsertSchema(institutions);
export const insertProgramSchema = createInsertSchema(programs);
export const insertProgramFeesSchema = createInsertSchema(programFees);
export const insertStudentApplicationSchema = createInsertSchema(studentApplications);

// Types
export type Institution = typeof institutions.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type ProgramFees = typeof programFees.$inferSelect;
export type StudentApplication = typeof studentApplications.$inferSelect;

export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type InsertProgramFees = z.infer<typeof insertProgramFeesSchema>;
export type InsertStudentApplication = z.infer<typeof insertStudentApplicationSchema>;