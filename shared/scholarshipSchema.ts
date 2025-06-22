import { pgTable, varchar, text, integer, decimal, date, boolean, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for scholarship data
export const providerTypeEnum = pgEnum('provider_type', ['government', 'university', 'foundation', 'corporate', 'ngo']);
export const studyLevelEnum = pgEnum('study_level', ['undergraduate', 'masters', 'phd', 'postdoc', 'any']);
export const fundingTypeEnum = pgEnum('funding_type', ['full', 'partial', 'tuition_only', 'living_allowance', 'research']);
export const applicationStatusEnum = pgEnum('application_status', ['open', 'closed', 'upcoming', 'rolling']);

// Main scholarships table
export const scholarships = pgTable("scholarships", {
  // Primary identification
  scholarshipId: varchar("scholarship_id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  shortName: varchar("short_name", { length: 100 }),
  
  // Provider information
  providerName: varchar("provider_name", { length: 255 }).notNull(),
  providerType: providerTypeEnum("provider_type").notNull(),
  providerCountry: varchar("provider_country", { length: 2 }).notNull(), // ISO country code
  providerWebsite: varchar("provider_website", { length: 500 }),
  providerLogo: varchar("provider_logo", { length: 500 }),
  
  // Scholarship details
  description: text("description"),
  shortDescription: varchar("short_description", { length: 500 }),
  fieldOfStudy: text("field_of_study"), // JSON array of fields
  studyLevel: studyLevelEnum("study_level").notNull(),
  
  // Financial information
  fundingType: fundingTypeEnum("funding_type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"), // ISO currency code
  amountDescription: varchar("amount_description", { length: 255 }),
  duration: integer("duration"), // Duration in months
  renewable: boolean("renewable").default(false),
  renewalCriteria: text("renewal_criteria"),
  
  // Eligibility
  eligibilityCountries: text("eligibility_countries"), // JSON array of country codes
  minGpa: decimal("min_gpa", { precision: 3, scale: 2 }),
  maxAge: integer("max_age"),
  minAge: integer("min_age"),
  languageRequirements: text("language_requirements"), // JSON object
  academicRequirements: text("academic_requirements"),
  otherRequirements: text("other_requirements"),
  
  // Application information
  applicationDeadline: date("application_deadline"),
  applicationUrl: varchar("application_url", { length: 500 }),
  applicationFee: decimal("application_fee", { precision: 8, scale: 2 }),
  applicationFeeCurrency: varchar("application_fee_currency", { length: 3 }).default("USD"),
  requiredDocuments: text("required_documents"), // JSON array
  applicationStatus: applicationStatusEnum("application_status").default("open"),
  
  // Additional information
  numberOfAwards: integer("number_of_awards"),
  selectionCriteria: text("selection_criteria"),
  benefits: text("benefits"), // JSON array of additional benefits
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  
  // Host institutions/countries
  hostCountries: text("host_countries"), // JSON array of country codes
  hostInstitutions: text("host_institutions"), // JSON array of institution names
  
  // Internal tracking
  isActive: boolean("is_active").default(true),
  featuredPriority: integer("featured_priority").default(0), // Higher numbers = more featured
  lastVerified: date("last_verified"),
  dataSource: varchar("data_source", { length: 255 }),
  tags: text("tags"), // JSON array of tags for searching
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Insert and select schemas
export const insertScholarshipSchema = createInsertSchema(scholarships).omit({
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
  country: z.string().optional(),
  studyLevel: z.enum(['undergraduate', 'masters', 'phd', 'postdoc', 'any']).optional(),
  fieldOfStudy: z.string().optional(),
  fundingType: z.enum(['full', 'partial', 'tuition_only', 'living_allowance', 'research']).optional(),
  providerType: z.enum(['government', 'university', 'foundation', 'corporate', 'ngo']).optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  deadlineFrom: z.string().optional(),
  deadlineTo: z.string().optional(),
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
    countries: string[];
    studyLevels: string[];
    fieldsOfStudy: string[];
    fundingTypes: string[];
    providerTypes: string[];
  };
}