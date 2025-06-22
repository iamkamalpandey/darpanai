import { pgTable, text, integer, timestamp, decimal, boolean, date, json, serial } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Comprehensive scholarships table schema
export const scholarships = pgTable("scholarships", {
  id: serial("id").primaryKey(),
  scholarshipId: text("scholarship_id").notNull().unique(),
  name: text("name").notNull(),
  shortName: text("short_name"),
  providerName: text("provider_name").notNull(),
  providerType: text("provider_type").notNull(),
  providerCountry: text("provider_country").notNull(),
  hostCountries: json("host_countries"),
  eligibleCountries: json("eligible_countries"),
  studyLevels: json("study_levels"),
  fieldCategories: json("field_categories"),
  specificFields: json("specific_fields"),
  fundingType: text("funding_type").notNull(),
  fundingCurrency: text("funding_currency").default("USD"),
  tuitionCoveragePercentage: decimal("tuition_coverage_percentage", { precision: 5, scale: 2 }),
  livingAllowanceAmount: decimal("living_allowance_amount", { precision: 15, scale: 2 }),
  livingAllowanceFrequency: text("living_allowance_frequency"),
  totalValueMin: decimal("total_value_min", { precision: 15, scale: 2 }),
  totalValueMax: decimal("total_value_max", { precision: 15, scale: 2 }),
  applicationOpenDate: date("application_open_date"),
  applicationDeadline: date("application_deadline"),
  notificationDate: date("notification_date"),
  programStartDate: date("program_start_date"),
  durationValue: integer("duration_value"),
  durationUnit: text("duration_unit"),
  minGpa: decimal("min_gpa", { precision: 3, scale: 2 }),
  gpaScale: decimal("gpa_scale", { precision: 3, scale: 1 }),
  degreeRequired: json("degree_required"),
  minAge: integer("min_age"),
  maxAge: integer("max_age"),
  genderRequirement: text("gender_requirement").default("any"),
  minWorkExperience: integer("min_work_experience"),
  leadershipRequired: boolean("leadership_required").default(false),
  languageRequirements: json("language_requirements"),
  applicationUrl: text("application_url"),
  applicationFeeAmount: decimal("application_fee_amount", { precision: 10, scale: 2 }).default("0.00"),
  applicationFeeCurrency: text("application_fee_currency").default("USD"),
  feeWaiverAvailable: boolean("fee_waiver_available").default(false),
  documentsRequired: json("documents_required"),
  interviewRequired: boolean("interview_required").default(false),
  essayRequired: boolean("essay_required").default(false),
  renewable: boolean("renewable").default(false),
  maxRenewalDuration: text("max_renewal_duration"),
  renewalCriteria: json("renewal_criteria"),
  workRestrictions: text("work_restrictions"),
  travelRestrictions: text("travel_restrictions"),
  otherScholarshipsAllowed: text("other_scholarships_allowed"),
  mentorshipAvailable: boolean("mentorship_available").default(false),
  networkingOpportunities: boolean("networking_opportunities").default(false),
  internshipOpportunities: boolean("internship_opportunities").default(false),
  researchOpportunities: boolean("research_opportunities").default(false),
  description: text("description"),
  tags: json("tags"),
  difficultyLevel: text("difficulty_level"),
  totalApplicantsPerYear: integer("total_applicants_per_year"),
  acceptanceRate: decimal("acceptance_rate", { precision: 5, scale: 2 }),
  status: text("status").default("active"),
  dataSource: text("data_source").default("official"),
  verified: boolean("verified").default(true),
  createdDate: timestamp("created_date").defaultNow(),
  updatedDate: timestamp("updated_date").defaultNow()
});

// Insert and select schemas
export const insertScholarshipSchema = createInsertSchema(scholarships).omit({
  scholarshipId: true,
  createdDate: true,
  updatedDate: true
});

export const selectScholarshipSchema = createSelectSchema(scholarships);

// Types
export type Scholarship = typeof scholarships.$inferSelect;
export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;

// Enhanced search schema for filtering
export const scholarshipSearchSchema = z.object({
  search: z.string().optional(),
  providerType: z.string().optional(),
  providerCountry: z.string().optional(),
  studyLevel: z.string().optional(),
  fieldCategory: z.string().optional(),
  fundingType: z.string().optional(),
  status: z.string().optional(),
  difficultyLevel: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  deadlineFrom: z.string().optional(),
  deadlineTo: z.string().optional(),
  renewable: z.boolean().optional(),
  leadershipRequired: z.boolean().optional(),
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
  filters: ScholarshipFilterOptions;
}

// Statistics response
export interface ScholarshipStatistics {
  totalScholarships: number;
  totalProviders: number;
  totalCountries: number;
  averageAmount: number;
  totalFunding: string;
}

// Enhanced country type for standardized filtering with currency information
export interface CountryWithCurrency {
  code: string;
  name: string;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
}

// Filter options response with enhanced country data
export interface ScholarshipFilterOptions {
  providerTypes: string[];
  countries: CountryWithCurrency[];
  studyLevels: string[];
  fieldCategories: string[];
  fundingTypes: string[];
  difficultyLevels: string[];
}