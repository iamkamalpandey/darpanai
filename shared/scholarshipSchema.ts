import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Scholarships table schema based on existing database structure
export const scholarships = pgTable("scholarships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  institutionName: text("institution_name").notNull(),
  programName: text("program_name").notNull(),
  programLevel: text("program_level").notNull(),
  scholarshipName: text("scholarship_name").notNull(),
  description: text("description"),
  availableFunds: text("available_funds"),
  fundingType: text("funding_type"),
  eligibilityCriteria: text("eligibility_criteria"),
  applicationDeadline: text("application_deadline"),
  applicationProcess: text("application_process"),
  requiredDocuments: text("required_documents"),
  scholarshipUrl: text("scholarship_url"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  numberOfAwards: text("number_of_awards"),
  renewalCriteria: text("renewal_criteria"),
  additionalBenefits: text("additional_benefits"),
  researchDate: timestamp("research_date").notNull(),
  sourceUrl: text("source_url"),
  researchTokensUsed: integer("research_tokens_used"),
  researchQuality: text("research_quality"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Insert and select schemas
export const insertScholarshipSchema = createInsertSchema(scholarships).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const selectScholarshipSchema = createSelectSchema(scholarships);

// Types
export type Scholarship = typeof scholarships.$inferSelect;
export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;

// Search schema for filtering
export const scholarshipSearchSchema = z.object({
  search: z.string().optional(),
  programLevel: z.string().optional(),
  institutionName: z.string().optional(),
  fundingType: z.string().optional(),
  limit: z.number().default(20),
  offset: z.number().default(0)
});

export type ScholarshipSearch = z.infer<typeof scholarshipSearchSchema>;

// Response types
export interface ScholarshipSearchResponse {
  scholarships: Scholarship[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    programLevels: string[];
    institutions: string[];
    fundingTypes: string[];
  };
}