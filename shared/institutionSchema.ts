import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Institution Table
export const institutions = pgTable("institutions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name"), // e.g., "MIT", "Harvard"
  country: text("country").notNull(),
  city: text("city").notNull(),
  state: text("state"), // For countries like USA, Canada
  website: text("website"),
  logo: text("logo"), // URL to logo
  establishedYear: integer("established_year"),
  institutionType: text("institution_type").notNull(), // university, college, institute, school
  ranking: jsonb("ranking"), // { world: 50, country: 10, subject_rankings: {...} }
  accreditation: jsonb("accreditation"), // Accrediting bodies
  campuses: jsonb("campuses"), // Multiple campus locations
  description: text("description"),
  features: jsonb("features"), // Key features, facilities, etc.
  contactInfo: jsonb("contact_info"), // Phone, email, address
  socialMedia: jsonb("social_media"), // Links to social platforms
  isActive: boolean("is_active").default(true).notNull(),
  isPartner: boolean("is_partner").default(false).notNull(), // Partner institutions
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Academic Programs Table
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").references(() => institutions.id).notNull(),
  name: text("name").notNull(),
  degree: text("degree").notNull(), // Bachelor, Master, PhD, Diploma, Certificate
  field: text("field").notNull(), // Computer Science, Business, Engineering, etc.
  specialization: text("specialization"), // Machine Learning, Finance, etc.
  duration: text("duration").notNull(), // "2 years", "4 years"
  studyMode: text("study_mode").notNull(), // full-time, part-time, online, hybrid
  language: text("language").default("English").notNull(),
  credits: integer("credits"), // Total credits required
  description: text("description"),
  curriculum: jsonb("curriculum"), // Course structure
  prerequisites: jsonb("prerequisites"), // Entry requirements
  careerOutcomes: jsonb("career_outcomes"), // Job prospects
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Program Fees Table
export const programFees = pgTable("program_fees", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").references(() => programs.id).notNull(),
  studentType: text("student_type").notNull(), // domestic, international
  currency: text("currency").notNull(), // USD, AUD, CAD, etc.
  tuitionFee: decimal("tuition_fee", { precision: 10, scale: 2 }),
  applicationFee: decimal("application_fee", { precision: 10, scale: 2 }),
  depositFee: decimal("deposit_fee", { precision: 10, scale: 2 }),
  otherFees: jsonb("other_fees"), // Lab fees, library fees, etc.
  totalEstimated: decimal("total_estimated", { precision: 10, scale: 2 }),
  paymentStructure: jsonb("payment_structure"), // Semester-wise breakdown
  livingCosts: jsonb("living_costs"), // Accommodation, food, transport
  academicYear: text("academic_year").notNull(), // "2024-2025"
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Institution Programs (for scholarship connections)
export const institutionPrograms = pgTable("institution_programs", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").references(() => institutions.id).notNull(),
  programId: integer("program_id").references(() => programs.id).notNull(),
  scholarshipId: integer("scholarship_id"), // Reference to scholarships table
  isPartnership: boolean("is_partnership").default(false), // Special partnership programs
  applicationDeadline: text("application_deadline"),
  intakeMonths: jsonb("intake_months"), // ["September", "January", "May"]
  availableSeats: integer("available_seats"),
  requirements: jsonb("requirements"), // Specific requirements for this program at this institution
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Student Applications Table
export const studentApplications = pgTable("student_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Reference to users table
  institutionId: integer("institution_id").references(() => institutions.id).notNull(),
  programId: integer("program_id").references(() => programs.id).notNull(),
  applicationStatus: text("application_status").default("draft").notNull(), // draft, submitted, under_review, accepted, rejected
  submittedAt: timestamp("submitted_at"),
  counselorNotes: text("counselor_notes"),
  applicationData: jsonb("application_data"), // Form data, documents, etc.
  followUpDate: timestamp("follow_up_date"),
  priority: text("priority").default("medium").notNull(), // high, medium, low
  source: text("source").default("chat").notNull(), // chat, direct, referral
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Relations
export const institutionsRelations = relations(institutions, ({ many }) => ({
  programs: many(programs),
  programFees: many(programFees),
  institutionPrograms: many(institutionPrograms),
  applications: many(studentApplications)
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [programs.institutionId],
    references: [institutions.id]
  }),
  fees: many(programFees),
  institutionPrograms: many(institutionPrograms),
  applications: many(studentApplications)
}));

export const programFeesRelations = relations(programFees, ({ one }) => ({
  program: one(programs, {
    fields: [programFees.programId],
    references: [programs.id]
  })
}));

export const studentApplicationsRelations = relations(studentApplications, ({ one }) => ({
  institution: one(institutions, {
    fields: [studentApplications.institutionId],
    references: [institutions.id]
  }),
  program: one(programs, {
    fields: [studentApplications.programId],
    references: [programs.id]
  })
}));

// Zod Schemas
export const insertInstitutionSchema = createInsertSchema(institutions);
export const insertProgramSchema = createInsertSchema(programs);
export const insertProgramFeesSchema = createInsertSchema(programFees);
export const insertStudentApplicationSchema = createInsertSchema(studentApplications);

// Types
export type Institution = typeof institutions.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type ProgramFees = typeof programFees.$inferSelect;
export type StudentApplication = typeof studentApplications.$inferSelect;

export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type InsertProgramFees = z.infer<typeof insertProgramFeesSchema>;
export type InsertStudentApplication = z.infer<typeof insertStudentApplicationSchema>;