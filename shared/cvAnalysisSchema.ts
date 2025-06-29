import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// CV Analysis Table
export const cvAnalyses = pgTable("cv_analyses", {
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

// CV Analysis Types
export type CvAnalysis = typeof cvAnalyses.$inferSelect;
export type InsertCvAnalysis = typeof cvAnalyses.$inferInsert;

// CV Analysis Results Interface
export interface CvAnalysisResults {
  personalInfo: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    nationality?: string;
    dateOfBirth?: string;
    linkedIn?: string;
  };
  education: {
    highestQualification?: string;
    institution?: string;
    graduationYear?: string;
    gpa?: string;
    fieldOfStudy?: string;
    additionalQualifications?: string[];
  };
  workExperience: {
    currentEmploymentStatus?: string;
    totalExperienceYears?: number;
    currentJobTitle?: string;
    currentOrganization?: string;
    workHistory?: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>;
  };
  skills: {
    technicalSkills?: string[];
    languages?: Array<{
      language: string;
      proficiency: string;
    }>;
    certifications?: string[];
  };
  preferences: {
    interestedCourse?: string;
    preferredCountries?: string[];
    careerGoals?: string;
  };
  confidence: {
    personalInfo: number;
    education: number;
    workExperience: number;
    skills: number;
    overall: number;
  };
}

// Validation Schemas
export const insertCvAnalysisSchema = createInsertSchema(cvAnalyses, {
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().min(1, "File size must be positive"),
  extractedText: z.string().min(1, "Extracted text is required"),
  analysisResults: z.object({}).passthrough(),
});

export const cvAnalysisSchema = z.object({
  id: z.number(),
  userId: z.number(),
  fileName: z.string(),
  fileSize: z.number(),
  extractedText: z.string(),
  analysisResults: z.object({}).passthrough(),
  processingTime: z.number().nullable(),
  tokensUsed: z.number().nullable(),
  createdAt: z.date(),
  isAppliedToProfile: z.boolean(),
});