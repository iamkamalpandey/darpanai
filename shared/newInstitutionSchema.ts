import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// =============================================
// REFERENCE/LOOKUP TABLES
// =============================================

// Countries table (enhanced with education system info)
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  code: varchar("code", { length: 3 }).notNull().unique(), // ISO 3166-1 alpha-3
  region: varchar("region", { length: 50 }),
  continent: varchar("continent", { length: 30 }),
  currencyCode: varchar("currency_code", { length: 3 }),
  educationSystem: varchar("education_system", { length: 50 }), // e.g., 'American', 'British', 'European', 'Asian'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// States/Provinces/Regions within countries
export const statesProvinces = pgTable("states_provinces", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 10 }), // State/province code
  countryId: integer("country_id").references(() => countries.id).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'State', 'Province', 'Territory', 'Region', 'Canton', 'Prefecture'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Cities
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  stateProvinceId: integer("state_province_id").references(() => statesProvinces.id),
  countryId: integer("country_id").references(() => countries.id).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  population: integer("population"),
  isCapital: boolean("is_capital").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Institution types
export const institutionTypes = pgTable("institution_types", {
  id: serial("id").primaryKey(),
  typeName: varchar("type_name", { length: 100 }).notNull().unique(),
  description: text("description"),
  typicalDurationYears: integer("typical_duration_years"), // Typical program duration
  levelOrder: integer("level_order"), // 1=Community College, 2=College, 3=University, 4=Research University
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Academic disciplines/fields
export const academicDisciplines = pgTable("academic_disciplines", {
  id: serial("id").primaryKey(),
  disciplineName: varchar("discipline_name", { length: 100 }).notNull(),
  parentDisciplineId: integer("parent_discipline_id").references(() => academicDisciplines.id),
  code: varchar("code", { length: 20 }), // e.g., CIP code, JACS code
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Degree levels
export const degreeLevels = pgTable("degree_levels", {
  id: serial("id").primaryKey(),
  levelName: varchar("level_name", { length: 50 }).notNull().unique(),
  levelOrder: integer("level_order").notNull(),
  typicalDurationYears: integer("typical_duration_years"),
  description: text("description"),
  internationalEquivalent: varchar("international_equivalent", { length: 100 }), // e.g., 'Bachelor = Licence (France)'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Accreditation bodies
export const accreditationBodies = pgTable("accreditation_bodies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  acronym: varchar("acronym", { length: 20 }),
  countryId: integer("country_id").references(() => countries.id),
  type: varchar("type", { length: 20 }).notNull(), // 'National', 'Regional', 'Professional', 'International'
  website: varchar("website", { length: 255 }),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Language codes
export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  languageName: varchar("language_name", { length: 50 }).notNull(),
  code: varchar("code", { length: 5 }).notNull().unique(), // ISO 639-1 or 639-2
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================
// MAIN INSTITUTION TABLE
// =============================================

export const institutions = pgTable("institutions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  localName: varchar("local_name", { length: 255 }), // Name in local language
  commonName: varchar("common_name", { length: 255 }), // Popular/abbreviated name
  institutionTypeId: integer("institution_type_id").references(() => institutionTypes.id).notNull(),
  
  // Location Information
  countryId: integer("country_id").references(() => countries.id).notNull(),
  stateProvinceId: integer("state_province_id").references(() => statesProvinces.id),
  cityId: integer("city_id").references(() => cities.id),
  addressLine1: varchar("address_line1", { length: 255 }),
  addressLine2: varchar("address_line2", { length: 255 }),
  postalCode: varchar("postal_code", { length: 20 }),
  
  // Contact Information
  website: varchar("website", { length: 255 }),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  fax: varchar("fax", { length: 20 }),
  
  // Academic Information
  foundedYear: integer("founded_year"),
  academicCalendar: varchar("academic_calendar", { length: 20 }).default("Semester"), // 'Semester', 'Quarter', 'Trimester', 'Annual', 'Other'
  primaryLanguageId: integer("primary_language_id").references(() => languages.id),
  
  // Institutional Characteristics
  ownershipType: varchar("ownership_type", { length: 30 }).notNull(), // 'Public', 'Private Non-Profit', 'Private For-Profit', 'Government'
  religiousAffiliation: varchar("religious_affiliation", { length: 100 }),
  coeducational: boolean("coeducational").default(true).notNull(),
  
  // Size and Capacity
  totalEnrollment: integer("total_enrollment"),
  undergraduateEnrollment: integer("undergraduate_enrollment"),
  graduateEnrollment: integer("graduate_enrollment"),
  internationalStudentCount: integer("international_student_count"),
  facultyCount: integer("faculty_count"),
  staffCount: integer("staff_count"),
  
  // Financial Information
  annualTuitionDomesticMin: decimal("annual_tuition_domestic_min", { precision: 12, scale: 2 }),
  annualTuitionDomesticMax: decimal("annual_tuition_domestic_max", { precision: 12, scale: 2 }),
  annualTuitionInternationalMin: decimal("annual_tuition_international_min", { precision: 12, scale: 2 }),
  annualTuitionInternationalMax: decimal("annual_tuition_international_max", { precision: 12, scale: 2 }),
  currencyCode: varchar("currency_code", { length: 3 }),
  
  // Rankings and Recognition
  worldRank: integer("world_rank"),
  nationalRank: integer("national_rank"),
  researchClassification: varchar("research_classification", { length: 100 }),
  
  // Campus Information
  campusSizeAcres: decimal("campus_size_acres", { precision: 10, scale: 2 }),
  campusSetting: varchar("campus_setting", { length: 20 }).default("Urban"), // 'Urban', 'Suburban', 'Rural', 'Online'
  housingAvailable: boolean("housing_available").default(true).notNull(),
  
  // Online/Distance Learning
  onlineProgramsAvailable: boolean("online_programs_available").default(false).notNull(),
  distanceLearningAvailable: boolean("distance_learning_available").default(false).notNull(),
  
  // Status and Metadata
  status: varchar("status", { length: 20 }).default("Active").notNull(), // 'Active', 'Inactive', 'Merged', 'Closed', 'Suspended'
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationDate: date("verification_date"),
  dataQualityScore: decimal("data_quality_score", { precision: 3, scale: 2 }), // For AI training quality assessment
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastVerifiedAt: timestamp("last_verified_at"),
});

// =============================================
// ACADEMIC PROGRAMS AND OFFERINGS
// =============================================

// Academic programs offered by institutions
export const academicPrograms = pgTable("academic_programs", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").references(() => institutions.id).notNull(),
  programName: varchar("program_name", { length: 255 }).notNull(),
  disciplineId: integer("discipline_id").references(() => academicDisciplines.id).notNull(),
  degreeLevelId: integer("degree_level_id").references(() => degreeLevels.id).notNull(),
  
  // Program Details
  durationYears: decimal("duration_years", { precision: 3, scale: 1 }),
  durationMonths: integer("duration_months"),
  creditsRequired: integer("credits_required"),
  programCode: varchar("program_code", { length: 20 }),
  
  // Admission Requirements
  minGpa: decimal("min_gpa", { precision: 3, scale: 2 }),
  standardizedTestRequired: varchar("standardized_test_required", { length: 100 }), // SAT, ACT, GRE, GMAT, etc.
  minTestScore: integer("min_test_score"),
  languageTestRequired: varchar("language_test_required", { length: 20 }), // TOEFL, IELTS, etc.
  minLanguageScore: integer("min_language_score"),
  
  // Program Characteristics
  isOnline: boolean("is_online").default(false).notNull(),
  isPartTime: boolean("is_part_time").default(false).notNull(),
  isAccelerated: boolean("is_accelerated").default(false).notNull(),
  internshipRequired: boolean("internship_required").default(false).notNull(),
  thesisRequired: boolean("thesis_required").default(false).notNull(),
  
  // Financial Information
  tuitionPerYear: decimal("tuition_per_year", { precision: 12, scale: 2 }),
  feesPerYear: decimal("fees_per_year", { precision: 12, scale: 2 }),
  
  // Capacity and Enrollment
  maxEnrollment: integer("max_enrollment"),
  currentEnrollment: integer("current_enrollment"),
  acceptanceRate: decimal("acceptance_rate", { precision: 5, scale: 2 }), // Percentage
  
  // Status
  status: varchar("status", { length: 20 }).default("Active").notNull(), // 'Active', 'Inactive', 'Suspended', 'Under Review'
  accreditationStatus: varchar("accreditation_status", { length: 20 }).default("Not Accredited").notNull(), // 'Accredited', 'Candidacy', 'Not Accredited', 'Under Review'
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =============================================
// RELATIONSHIP TABLES
// =============================================

// Institution accreditations (many-to-many)
export const institutionAccreditations = pgTable("institution_accreditations", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").references(() => institutions.id).notNull(),
  accreditationBodyId: integer("accreditation_body_id").references(() => accreditationBodies.id).notNull(),
  accreditationDate: date("accreditation_date"),
  expirationDate: date("expiration_date"),
  status: varchar("status", { length: 20 }).default("Active").notNull(), // 'Active', 'Expired', 'Suspended', 'Under Review'
  accreditationLevel: varchar("accreditation_level", { length: 20 }).notNull(), // 'Institutional', 'Program', 'Specialized'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Institution languages (many-to-many)
export const institutionLanguages = pgTable("institution_languages", {
  institutionId: integer("institution_id").references(() => institutions.id).notNull(),
  languageId: integer("language_id").references(() => languages.id).notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  instructionAvailable: boolean("instruction_available").default(true).notNull(),
  supportServicesAvailable: boolean("support_services_available").default(false).notNull(),
});

// Institution partnerships/affiliations
export const institutionPartnerships = pgTable("institution_partnerships", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").references(() => institutions.id).notNull(),
  partnerInstitutionId: integer("partner_institution_id").references(() => institutions.id).notNull(),
  partnershipType: varchar("partnership_type", { length: 30 }).notNull(), // 'Sister Institution', 'Exchange Program', 'Joint Degree', 'Research Collaboration', 'Consortium'
  startDate: date("start_date"),
  endDate: date("end_date"),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Institution specializations/strengths
export const institutionSpecializations = pgTable("institution_specializations", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").references(() => institutions.id).notNull(),
  disciplineId: integer("discipline_id").references(() => academicDisciplines.id).notNull(),
  specializationLevel: varchar("specialization_level", { length: 20 }).notNull(), // 'Excellent', 'Very Good', 'Good', 'Average'
  rankingPosition: integer("ranking_position"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================
// FACILITIES AND SERVICES
// =============================================

// Campus facilities
export const campusFacilities = pgTable("campus_facilities", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").references(() => institutions.id).notNull(),
  facilityType: varchar("facility_type", { length: 30 }).notNull(), // 'Library', 'Laboratory', 'Sports Complex', 'Student Center', 'Dormitory', 'Research Center', 'Medical Center', 'Other'
  facilityName: varchar("facility_name", { length: 255 }),
  capacity: integer("capacity"),
  description: text("description"),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Student services
export const studentServices = pgTable("student_services", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").references(() => institutions.id).notNull(),
  serviceType: varchar("service_type", { length: 50 }).notNull(), // 'Career Services', 'Counseling', 'Health Services', 'Financial Aid', 'International Student Services', 'Disability Services', 'Academic Support', 'Other'
  serviceName: varchar("service_name", { length: 255 }),
  description: text("description"),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================
// DRIZZLE RELATIONS
// =============================================

export const countriesRelations = relations(countries, ({ many }) => ({
  statesProvinces: many(statesProvinces),
  cities: many(cities),
  institutions: many(institutions),
}));

export const statesProvincesRelations = relations(statesProvinces, ({ one, many }) => ({
  country: one(countries, { fields: [statesProvinces.countryId], references: [countries.id] }),
  cities: many(cities),
  institutions: many(institutions),
}));

export const institutionsRelations = relations(institutions, ({ one, many }) => ({
  country: one(countries, { fields: [institutions.countryId], references: [countries.id] }),
  stateProvince: one(statesProvinces, { fields: [institutions.stateProvinceId], references: [statesProvinces.id] }),
  city: one(cities, { fields: [institutions.cityId], references: [cities.id] }),
  institutionType: one(institutionTypes, { fields: [institutions.institutionTypeId], references: [institutionTypes.id] }),
  primaryLanguage: one(languages, { fields: [institutions.primaryLanguageId], references: [languages.id] }),
  academicPrograms: many(academicPrograms),
  accreditations: many(institutionAccreditations),
  languages: many(institutionLanguages),
  partnerships: many(institutionPartnerships),
  specializations: many(institutionSpecializations),
  facilities: many(campusFacilities),
  services: many(studentServices),
}));

export const academicProgramsRelations = relations(academicPrograms, ({ one }) => ({
  institution: one(institutions, { fields: [academicPrograms.institutionId], references: [institutions.id] }),
  discipline: one(academicDisciplines, { fields: [academicPrograms.disciplineId], references: [academicDisciplines.id] }),
  degreeLevel: one(degreeLevels, { fields: [academicPrograms.degreeLevelId], references: [degreeLevels.id] }),
}));

// =============================================
// ZOD SCHEMAS
// =============================================

export const insertCountrySchema = createInsertSchema(countries);
export const insertInstitutionSchema = createInsertSchema(institutions);
export const insertAcademicProgramSchema = createInsertSchema(academicPrograms);
export const insertInstitutionTypeSchema = createInsertSchema(institutionTypes);
export const insertAcademicDisciplineSchema = createInsertSchema(academicDisciplines);
export const insertDegreeLevelSchema = createInsertSchema(degreeLevels);

export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type InsertAcademicProgram = z.infer<typeof insertAcademicProgramSchema>;
export type InsertInstitutionType = z.infer<typeof insertInstitutionTypeSchema>;
export type InsertAcademicDiscipline = z.infer<typeof insertAcademicDisciplineSchema>;
export type InsertDegreeLevel = z.infer<typeof insertDegreeLevelSchema>;

export type Country = typeof countries.$inferSelect;
export type Institution = typeof institutions.$inferSelect;
export type AcademicProgram = typeof academicPrograms.$inferSelect;
export type InstitutionType = typeof institutionTypes.$inferSelect;
export type AcademicDiscipline = typeof academicDisciplines.$inferSelect;
export type DegreeLevel = typeof degreeLevels.$inferSelect;