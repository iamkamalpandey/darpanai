import { pgTable, serial, text, integer, decimal, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const scholarships = pgTable('scholarships', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  institutionName: text('institution_name').notNull(),
  programName: text('program_name').notNull(),
  programLevel: text('program_level').notNull(), // Bachelor's, Master's, PhD, etc.
  
  // Scholarship Details
  scholarshipName: text('scholarship_name').notNull(),
  description: text('description'),
  availableFunds: text('available_funds'), // e.g., "$5,000", "Full tuition", "50% coverage"
  fundingType: text('funding_type'), // Merit-based, Need-based, Athletic, etc.
  eligibilityCriteria: text('eligibility_criteria'),
  
  // Application Details
  applicationDeadline: text('application_deadline'),
  applicationProcess: text('application_process'),
  requiredDocuments: text('required_documents'),
  
  // Contact Information
  scholarshipUrl: text('scholarship_url'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  
  // Additional Information
  numberOfAwards: text('number_of_awards'), // e.g., "10 awards annually", "Unlimited"
  renewalCriteria: text('renewal_criteria'),
  additionalBenefits: text('additional_benefits'), // Housing, books, etc.
  
  // Research Metadata
  researchDate: timestamp('research_date').defaultNow().notNull(),
  sourceUrl: text('source_url'), // Main institution URL researched
  researchTokensUsed: integer('research_tokens_used'),
  researchQuality: text('research_quality'), // High, Medium, Low based on data completeness
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertScholarshipSchema = createInsertSchema(scholarships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const scholarshipSearchSchema = z.object({
  institutionName: z.string().min(2, 'Institution name must be at least 2 characters'),
  programName: z.string().min(2, 'Program name must be at least 2 characters'),
  programLevel: z.enum(['Bachelor\'s', 'Master\'s', 'PhD', 'Diploma', 'Certificate', 'Other'])
});

export type Scholarship = typeof scholarships.$inferSelect;
export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;
export type ScholarshipSearch = z.infer<typeof scholarshipSearchSchema>;