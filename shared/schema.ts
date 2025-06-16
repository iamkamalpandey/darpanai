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

export type UserUpdateView = typeof userUpdateViews.$inferSelect;
export type InsertUserUpdateView = typeof userUpdateViews.$inferInsert;
