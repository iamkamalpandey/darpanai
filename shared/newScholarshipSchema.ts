import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal, varchar, date, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { countries } from "./newInstitutionSchema";
import { users } from "./schema";

// =============================================
// REFERENCE/LOOKUP TABLES
// =============================================

// Education levels
export const educationLevels = pgTable("education_levels", {
  id: serial("id").primaryKey(),
  levelName: varchar("level_name", { length: 50 }).notNull().unique(), // e.g., Undergraduate, Graduate, PhD, High School
  levelOrder: integer("level_order").notNull(), // 1=High School, 2=Associate, 3=Bachelor, 4=Master, 5=PhD
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Fields of study
export const fieldsOfStudy = pgTable("fields_of_study", {
  id: serial("id").primaryKey(),
  fieldName: varchar("field_name", { length: 100 }).notNull(),
  parentFieldId: integer("parent_field_id").references(() => fieldsOfStudy.id), // For hierarchical categorization
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Scholarship provider institutions/organizations
export const scholarshipInstitutions = pgTable("scholarship_institutions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'University', 'College', 'Government', 'Non-Profit', 'Private Foundation', 'Corporate', 'International Organization'
  countryId: integer("country_id").references(() => countries.id),
  website: varchar("website", { length: 255 }),
  description: text("description"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Scholarship categories
export const scholarshipCategories = pgTable("scholarship_categories", {
  id: serial("id").primaryKey(),
  categoryName: varchar("category_name", { length: 100 }).notNull().unique(), // e.g., Merit-based, Need-based, Athletic, Minority, etc.
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Application requirements types
export const requirementTypes = pgTable("requirement_types", {
  id: serial("id").primaryKey(),
  requirementName: varchar("requirement_name", { length: 100 }).notNull().unique(), // e.g., Essay, GPA, Test Score, Portfolio, etc.
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Scholarship tags for better categorization
export const scholarshipTags = pgTable("scholarship_tags", {
  id: serial("id").primaryKey(),
  tagName: varchar("tag_name", { length: 50 }).notNull().unique(),
  colorCode: varchar("color_code", { length: 7 }), // Hex color for UI
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================
// MAIN SCHOLARSHIP TABLE
// =============================================

export const newScholarships = pgTable("new_newScholarships", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  providerInstitutionId: integer("provider_institution_id").references(() => scholarshipInstitutions.id).notNull(),
  
  // Financial Information
  awardAmountMin: decimal("award_amount_min", { precision: 12, scale: 2 }),
  awardAmountMax: decimal("award_amount_max", { precision: 12, scale: 2 }),
  currencyCode: varchar("currency_code", { length: 3 }).default("USD").notNull(),
  totalAwardsAvailable: integer("total_awards_available"),
  isRenewable: boolean("is_renewable").default(false).notNull(),
  renewalDurationYears: integer("renewal_duration_years"),
  
  // Eligibility Criteria
  minGpa: decimal("min_gpa", { precision: 3, scale: 2 }),
  maxGpa: decimal("max_gpa", { precision: 3, scale: 2 }),
  minAge: integer("min_age"),
  maxAge: integer("max_age"),
  genderRequirement: varchar("gender_requirement", { length: 20 }).default("Any").notNull(), // 'Male', 'Female', 'Non-Binary', 'Any'
  
  // Academic Requirements
  educationLevelId: integer("education_level_id").references(() => educationLevels.id),
  specificMajorRequired: boolean("specific_major_required").default(false).notNull(),
  
  // Geographic Eligibility
  residenceCountryRequired: integer("residence_country_required").references(() => countries.id), // Must be resident of this country
  studyCountryRequired: integer("study_country_required").references(() => countries.id), // Must study in this country
  
  // Application Information
  applicationDeadline: date("application_deadline"),
  applicationOpens: date("application_opens"),
  applicationFee: decimal("application_fee", { precision: 8, scale: 2 }).default("0.00").notNull(),
  applicationUrl: varchar("application_url", { length: 500 }),
  contactEmail: varchar("contact_email", { length: 100 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  
  // Additional Information
  selectionCriteria: text("selection_criteria"),
  benefitsIncluded: text("benefits_included"),
  obligations: text("obligations"),
  restrictionsLimitations: text("restrictions_limitations"),
  
  // SEO and Search
  keywords: text("keywords"), // Comma-separated keywords for search
  searchTags: text("search_tags").array(), // Array of search tags
  
  // Status and Metadata
  status: varchar("status", { length: 20 }).default("Active").notNull(), // 'Active', 'Inactive', 'Suspended', 'Expired'
  isSponsored: boolean("is_sponsored").default(false).notNull(), // For paid promotions
  sponsorshipLevel: varchar("sponsorship_level", { length: 20 }), // 'Premium', 'Standard', 'Basic'
  featuredUntil: date("featured_until"), // Featured scholarship expiry
  
  // Quality and Verification
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationDate: date("verification_date"),
  verifiedBy: varchar("verified_by", { length: 100 }),
  dataQualityScore: decimal("data_quality_score", { precision: 3, scale: 2 }), // For AI training quality assessment
  
  // Analytics and Engagement
  viewCount: integer("view_count").default(0).notNull(),
  applicationCount: integer("application_count").default(0).notNull(),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // Percentage of successful applications
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastVerifiedAt: timestamp("last_verified_at"),
  lastModifiedBy: varchar("last_modified_by", { length: 100 }),
});

// =============================================
// JUNCTION/RELATIONSHIP TABLES
// =============================================

// Scholarship categories mapping (many-to-many)
export const scholarshipCategoryMapping = pgTable("scholarship_category_mapping", {
  scholarshipId: integer("scholarship_id").references(() => newScholarships.id).notNull(),
  categoryId: integer("category_id").references(() => scholarshipCategories.id).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.scholarshipId, table.categoryId] }),
}));

// Eligible fields of study (many-to-many)
export const scholarshipEligibleFields = pgTable("scholarship_eligible_fields", {
  scholarshipId: integer("scholarship_id").references(() => newScholarships.id).notNull(),
  fieldId: integer("field_id").references(() => fieldsOfStudy.id).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.scholarshipId, table.fieldId] }),
}));

// Eligible countries for applicants (many-to-many)
export const scholarshipEligibleCountries = pgTable("scholarship_eligible_countries", {
  scholarshipId: integer("scholarship_id").references(() => newScholarships.id).notNull(),
  countryId: integer("country_id").references(() => countries.id).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.scholarshipId, table.countryId] }),
}));

// Target demographics (many-to-many)
export const scholarshipTargetDemographics = pgTable("scholarship_target_demographics", {
  id: serial("id").primaryKey(),
  scholarshipId: integer("scholarship_id").references(() => newScholarships.id).notNull(),
  demographicType: varchar("demographic_type", { length: 30 }).notNull(), // 'Ethnicity', 'Religion', 'Disability', 'Military', 'First Generation', 'Low Income', 'Other'
  demographicValue: varchar("demographic_value", { length: 100 }).notNull(),
});

// Application requirements (many-to-many)
export const scholarshipRequirements = pgTable("scholarship_requirements", {
  id: serial("id").primaryKey(),
  scholarshipId: integer("scholarship_id").references(() => newScholarships.id).notNull(),
  requirementTypeId: integer("requirement_type_id").references(() => requirementTypes.id).notNull(),
  requirementDetails: text("requirement_details"),
  isMandatory: boolean("is_mandatory").default(true).notNull(),
  minValue: varchar("min_value", { length: 50 }), // For numeric requirements like GPA, test scores
  maxValue: varchar("max_value", { length: 50 }),
});

// Scholarship tag mapping
export const scholarshipTagMapping = pgTable("scholarship_tag_mapping", {
  scholarshipId: integer("scholarship_id").references(() => newScholarships.id).notNull(),
  tagId: integer("tag_id").references(() => scholarshipTags.id).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.scholarshipId, table.tagId] }),
}));

// Document requirements
export const scholarshipDocuments = pgTable("scholarship_documents", {
  id: serial("id").primaryKey(),
  scholarshipId: integer("scholarship_id").references(() => newScholarships.id).notNull(),
  documentType: varchar("document_type", { length: 50 }).notNull(), // 'Transcript', 'Essay', 'Letter of Recommendation', 'Portfolio', 'Resume', 'Financial Statement', 'Other'
  documentName: varchar("document_name", { length: 255 }),
  description: text("description"),
  isRequired: boolean("is_required").default(true).notNull(),
  fileFormatAccepted: varchar("file_format_accepted", { length: 100 }), // e.g., PDF, DOC, DOCX
  maxFileSizeMb: integer("max_file_size_mb"),
});

// Scholarship reviews/ratings (for quality assessment)
export const scholarshipReviews = pgTable("scholarship_reviews", {
  id: serial("id").primaryKey(),
  scholarshipId: integer("scholarship_id").references(() => newScholarships.id).notNull(),
  reviewerType: varchar("reviewer_type", { length: 20 }).notNull(), // 'Admin', 'Student', 'Counselor', 'AI_Validator'
  rating: integer("rating"), // 1-5 scale
  reviewText: text("review_text"),
  dataQualityScore: decimal("data_quality_score", { precision: 3, scale: 2 }), // For AI training quality assessment
  isVerified: boolean("is_verified").default(false).notNull(),
  reviewerName: varchar("reviewer_name", { length: 100 }),
  reviewerEmail: varchar("reviewer_email", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================
// USER INTERACTION TABLES
// =============================================

// User saved newScholarships (watchlist)
export const userSavedScholarships = pgTable("user_saved_newScholarships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  scholarshipId: integer("scholarship_id").references(() => newScholarships.id).notNull(),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
  notes: text("notes"),
  applicationStatus: varchar("application_status", { length: 20 }).default("Saved").notNull(), // 'Saved', 'Applied', 'Rejected', 'Accepted', 'Withdrawn'
  applicationDate: date("application_date"),
  followUpDate: date("follow_up_date"),
  priority: varchar("priority", { length: 10 }).default("Medium").notNull(), // 'High', 'Medium', 'Low'
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.scholarshipId] }),
}));

// User scholarship applications tracking
export const userScholarshipApplications = pgTable("user_scholarship_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  scholarshipId: integer("scholarship_id").references(() => newScholarships.id).notNull(),
  applicationStatus: varchar("application_status", { length: 20 }).default("Draft").notNull(), // 'Draft', 'Submitted', 'Under Review', 'Shortlisted', 'Rejected', 'Accepted', 'Withdrawn'
  applicationDate: date("application_date"),
  submissionDate: date("submission_date"),
  responseDate: date("response_date"),
  
  // Application Details
  applicationUrl: varchar("application_url", { length: 500 }),
  applicationNumber: varchar("application_number", { length: 100 }),
  documentsSubmitted: text("documents_submitted").array(),
  
  // Communication
  lastContactDate: date("last_contact_date"),
  nextFollowUpDate: date("next_follow_up_date"),
  contactNotes: text("contact_notes"),
  
  // Result
  resultStatus: varchar("result_status", { length: 20 }), // 'Pending', 'Accepted', 'Rejected', 'Waitlisted'
  awardAmount: decimal("award_amount", { precision: 12, scale: 2 }),
  awardDetails: text("award_details"),
  
  // Analytics
  timeToDecision: integer("time_to_decision"), // Days from application to decision
  competitiveness: varchar("competitiveness", { length: 20 }), // 'Low', 'Medium', 'High', 'Very High'
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =============================================
// DRIZZLE RELATIONS
// =============================================

export const newScholarshipsRelations = relations(newScholarships, ({ one, many }) => ({
  providerInstitution: one(scholarshipInstitutions, { fields: [newScholarships.providerInstitutionId], references: [scholarshipInstitutions.id] }),
  educationLevel: one(educationLevels, { fields: [newScholarships.educationLevelId], references: [educationLevels.id] }),
  residenceCountry: one(countries, { fields: [newScholarships.residenceCountryRequired], references: [countries.id] }),
  studyCountry: one(countries, { fields: [newScholarships.studyCountryRequired], references: [countries.id] }),
  categories: many(scholarshipCategoryMapping),
  eligibleFields: many(scholarshipEligibleFields),
  eligibleCountries: many(scholarshipEligibleCountries),
  targetDemographics: many(scholarshipTargetDemographics),
  requirements: many(scholarshipRequirements),
  tags: many(scholarshipTagMapping),
  documents: many(scholarshipDocuments),
  reviews: many(scholarshipReviews),
  userSaved: many(userSavedScholarships),
  userApplications: many(userScholarshipApplications),
}));

export const scholarshipInstitutionsRelations = relations(scholarshipInstitutions, ({ one, many }) => ({
  country: one(countries, { fields: [scholarshipInstitutions.countryId], references: [countries.id] }),
  newScholarships: many(newScholarships),
}));

export const educationLevelsRelations = relations(educationLevels, ({ many }) => ({
  newScholarships: many(newScholarships),
}));

export const fieldsOfStudyRelations = relations(fieldsOfStudy, ({ one, many }) => ({
  parentField: one(fieldsOfStudy, { fields: [fieldsOfStudy.parentFieldId], references: [fieldsOfStudy.id] }),
  subFields: many(fieldsOfStudy),
  scholarshipEligibleFields: many(scholarshipEligibleFields),
}));

export const userSavedScholarshipsRelations = relations(userSavedScholarships, ({ one }) => ({
  user: one(users, { fields: [userSavedScholarships.userId], references: [users.id] }),
  scholarship: one(newScholarships, { fields: [userSavedScholarships.scholarshipId], references: [newScholarships.id] }),
}));

export const userScholarshipApplicationsRelations = relations(userScholarshipApplications, ({ one }) => ({
  user: one(users, { fields: [userScholarshipApplications.userId], references: [users.id] }),
  scholarship: one(newScholarships, { fields: [userScholarshipApplications.scholarshipId], references: [newScholarships.id] }),
}));

// =============================================
// ZOD SCHEMAS
// =============================================

export const insertScholarshipSchema = createInsertSchema(newScholarships);
export const insertScholarshipInstitutionSchema = createInsertSchema(scholarshipInstitutions);
export const insertEducationLevelSchema = createInsertSchema(educationLevels);
export const insertFieldOfStudySchema = createInsertSchema(fieldsOfStudy);
export const insertScholarshipCategorySchema = createInsertSchema(scholarshipCategories);
export const insertRequirementTypeSchema = createInsertSchema(requirementTypes);
export const insertUserSavedScholarshipSchema = createInsertSchema(userSavedScholarships);
export const insertUserScholarshipApplicationSchema = createInsertSchema(userScholarshipApplications);

export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;
export type InsertScholarshipInstitution = z.infer<typeof insertScholarshipInstitutionSchema>;
export type InsertEducationLevel = z.infer<typeof insertEducationLevelSchema>;
export type InsertFieldOfStudy = z.infer<typeof insertFieldOfStudySchema>;
export type InsertScholarshipCategory = z.infer<typeof insertScholarshipCategorySchema>;
export type InsertRequirementType = z.infer<typeof insertRequirementTypeSchema>;
export type InsertUserSavedScholarship = z.infer<typeof insertUserSavedScholarshipSchema>;
export type InsertUserScholarshipApplication = z.infer<typeof insertUserScholarshipApplicationSchema>;

export type Scholarship = typeof newScholarships.$inferSelect;
export type ScholarshipInstitution = typeof scholarshipInstitutions.$inferSelect;
export type EducationLevel = typeof educationLevels.$inferSelect;
export type FieldOfStudy = typeof fieldsOfStudy.$inferSelect;
export type ScholarshipCategory = typeof scholarshipCategories.$inferSelect;
export type RequirementType = typeof requirementTypes.$inferSelect;
export type UserSavedScholarship = typeof userSavedScholarships.$inferSelect;
export type UserScholarshipApplication = typeof userScholarshipApplications.$inferSelect;