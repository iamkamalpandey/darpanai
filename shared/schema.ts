import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced User Model with additional fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  qualification: text("qualification"),
  graduationYear: text("graduation_year"),
  phoneNumber: text("phone_number"),
  role: text("role").default("user").notNull(),
  status: text("status").default("active").notNull(), // active, inactive, suspended
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

// Schemas for validation and type inference
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  qualification: true,
  graduationYear: true,
  phoneNumber: true,
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
