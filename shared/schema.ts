import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced User Model for Student Information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  studyDestination: text("study_destination").notNull(), // Country preference
  startDate: text("start_date").notNull(), // When they want to start
  city: text("city").notNull(),
  country: text("country").notNull(),
  counsellingMode: text("counselling_mode").notNull(), // online, in-person, phone
  fundingSource: text("funding_source").notNull(), // self-funded, scholarship, loan, family
  studyLevel: text("study_level").notNull(), // bachelor, master, phd, diploma, certificate
  agreeToTerms: boolean("agree_to_terms").default(false).notNull(),
  allowContact: boolean("allow_contact").default(false).notNull(),
  receiveUpdates: boolean("receive_updates").default(false).notNull(),
  role: text("role").default("user").notNull(),
  status: text("status").default("active").notNull(),
  analysisCount: integer("analysis_count").default(0).notNull(),
  maxAnalyses: integer("max_analyses").default(3).notNull(),
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
    severity: z.enum(["high", "medium", "low"]),
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

export type FileUpload = z.infer<typeof fileUploadSchema>;
export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;
