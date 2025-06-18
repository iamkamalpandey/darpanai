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
  city: text("city").notNull(),
  country: text("country").notNull(),
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

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof appointmentSchema>;
export type AppointmentFormData = Omit<InsertAppointment, 'requestedDate'> & {
  requestedDate: string;
};

export type ProfessionalApplication = typeof professionalApplications.$inferSelect;
export type InsertProfessionalApplication = z.infer<typeof professionalApplicationSchema>;

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
  category: z.enum(["financial", "academic", "personal", "employment", "travel", "legal"]),
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
  category: z.enum(["financial", "academic", "personal", "employment", "travel", "legal"]),
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
  
  // Analysis results
  summary: z.string(),
  keyFindings: z.array(z.object({
    title: z.string(),
    description: z.string(),
    importance: z.enum(["high", "medium", "low"]),
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
    category: z.enum(["documentation", "financial", "academic", "visa", "preparation"]),
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
    severity: z.enum(["critical", "moderate", "minor"]),
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
