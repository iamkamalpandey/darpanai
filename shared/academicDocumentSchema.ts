import { z } from 'zod';
import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Academic Document Analysis Results Schema
export const academicDocumentAnalysisResultsSchema = z.object({
  // Document Classification
  documentType: z.string().optional(), // transcript, diploma, certificate, etc.
  
  // Institution Information
  institutionName: z.string().optional(),
  institutionCountry: z.string().optional(),
  institutionCity: z.string().optional(),
  institutionType: z.string().optional(), // University, College, Institute, etc.
  
  // Qualification Details
  qualificationLevel: z.string().optional(), // Bachelor's, Master's, PhD, Diploma, etc.
  qualificationTitle: z.string().optional(), // Degree name
  fieldOfStudy: z.string().optional(),
  major: z.string().optional(),
  minor: z.string().optional(),
  specialization: z.string().optional(),
  
  // Academic Performance
  gpa: z.string().optional(),
  gradeScale: z.string().optional(), // 4.0, 10.0, Percentage, etc.
  overallGrade: z.string().optional(),
  honors: z.string().optional(), // Magna Cum Laude, First Class, etc.
  
  // Timeline
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  graduationDate: z.string().optional(),
  duration: z.string().optional(),
  
  // Program Details
  programType: z.string().optional(), // Full-time, Part-time, Distance Learning
  credits: z.string().optional(),
  thesis: z.string().optional(),
  
  // Additional Information
  accreditation: z.string().optional(),
  languageOfInstruction: z.string().optional(),
  studentId: z.string().optional(),
  studentName: z.string().optional(),
  
  // Course and Skills Information
  courses: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
  
  // Confidence Scores (0-100)
  confidenceScores: z.object({
    institutionName: z.number().min(0).max(100).optional(),
    qualificationLevel: z.number().min(0).max(100).optional(),
    fieldOfStudy: z.number().min(0).max(100).optional(),
    gpa: z.number().min(0).max(100).optional(),
    graduationDate: z.number().min(0).max(100).optional(),
  }).optional(),
  
  // Summary
  summary: z.string().optional(),
  recommendations: z.array(z.string()).optional(),
});

export type AcademicDocumentAnalysisResults = z.infer<typeof academicDocumentAnalysisResultsSchema>;

// Academic Document Analysis Database Schema
export const academicDocumentAnalysisSchema = z.object({
  id: z.number(),
  userId: z.number(),
  fileName: z.string(),
  fileSize: z.number(),
  extractedText: z.string(),
  analysisResults: academicDocumentAnalysisResultsSchema,
  tokensUsed: z.number().optional(),
  processingTime: z.number().optional(),
  isAppliedToProfile: z.boolean().default(false),
  createdAt: z.date(),
});

export type AcademicDocumentAnalysis = z.infer<typeof academicDocumentAnalysisSchema>;

// Insert schema for creating new academic document analysis
export const insertAcademicDocumentAnalysisSchema = academicDocumentAnalysisSchema.omit({
  id: true,
  createdAt: true,
});

export type InsertAcademicDocumentAnalysis = z.infer<typeof insertAcademicDocumentAnalysisSchema>;

// Academic Document Analysis Database Table
export const academicDocumentAnalyses = pgTable("academic_document_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  extractedText: text("extracted_text").notNull(),
  analysisResults: jsonb("analysis_results").notNull(),
  processingTime: integer("processing_time"),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isAppliedToProfile: boolean("is_applied_to_profile").default(false).notNull(),
});

// Academic Document Analysis Types
export type AcademicDocumentAnalysisTable = typeof academicDocumentAnalyses.$inferSelect;
export type InsertAcademicDocumentAnalysisTable = typeof academicDocumentAnalyses.$inferInsert;

// Validation Schemas
export const insertAcademicDocumentAnalysisSchemaValidation = createInsertSchema(academicDocumentAnalyses, {
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().min(1, "File size must be positive"),
  extractedText: z.string().min(1, "Extracted text is required"),
  analysisResults: z.object({}).passthrough(),
});