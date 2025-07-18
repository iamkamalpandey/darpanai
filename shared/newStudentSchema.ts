import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal, varchar, date, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { countries, languages, institutions, academicPrograms } from "./newInstitutionSchema";
import { users } from "./schema";

// =============================================
// REFERENCE/LOOKUP TABLES
// =============================================

// Student status types
export const studentStatusTypes = pgTable("student_status_types", {
  id: serial("id").primaryKey(),
  statusName: varchar("status_name", { length: 50 }).notNull().unique(),
  statusCode: varchar("status_code", { length: 20 }).notNull().unique(), // e.g., 'ACTIVE', 'INACTIVE', 'GRADUATED'
  description: text("description"),
  isEnrolled: boolean("is_enrolled").default(true).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Learning styles and preferences
export const learningStyles = pgTable("learning_styles", {
  id: serial("id").primaryKey(),
  styleName: varchar("style_name", { length: 50 }).notNull().unique(),
  description: text("description"),
  characteristics: text("characteristics"),
  recommendedStrategies: text("recommended_strategies"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Student types/categories
export const studentTypes = pgTable("student_types", {
  id: serial("id").primaryKey(),
  typeName: varchar("type_name", { length: 50 }).notNull().unique(), // e.g., 'Full-time', 'Part-time', 'Distance', 'Exchange'
  description: text("description"),
  typicalCreditLoadMin: integer("typical_credit_load_min"),
  typicalCreditLoadMax: integer("typical_credit_load_max"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Disability types and accommodations
export const disabilityTypes = pgTable("disability_types", {
  id: serial("id").primaryKey(),
  disabilityCategory: varchar("disability_category", { length: 100 }).notNull(),
  description: text("description"),
  commonAccommodations: text("common_accommodations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Financial aid types
export const financialAidTypes = pgTable("financial_aid_types", {
  id: serial("id").primaryKey(),
  aidType: varchar("aid_type", { length: 100 }).notNull().unique(), // e.g., 'Scholarship', 'Grant', 'Loan', 'Work-Study'
  description: text("description"),
  isNeedBased: boolean("is_need_based").default(false).notNull(),
  isMeritBased: boolean("is_merit_based").default(false).notNull(),
  requiresRepayment: boolean("requires_repayment").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Career interests/fields
export const careerFields = pgTable("career_fields", {
  id: serial("id").primaryKey(),
  fieldName: varchar("field_name", { length: 100 }).notNull().unique(),
  parentFieldId: integer("parent_field_id").references(() => careerFields.id),
  description: text("description"),
  growthOutlook: varchar("growth_outlook", { length: 50 }), // e.g., 'High Growth', 'Stable', 'Declining'
  medianSalary: decimal("median_salary", { precision: 10, scale: 2 }),
  currencyCode: varchar("currency_code", { length: 3 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Skills taxonomy
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  skillName: varchar("skill_name", { length: 100 }).notNull().unique(),
  skillCategory: varchar("skill_category", { length: 50 }), // e.g., 'Technical', 'Soft', 'Language', 'Leadership'
  description: text("description"),
  isTechnical: boolean("is_technical").default(false).notNull(),
  industryRelevance: text("industry_relevance"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Course sections for enrollment tracking
export const courseSections = pgTable("course_sections", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(), // Will be linked to courses table when created
  sectionNumber: varchar("section_number", { length: 10 }).notNull(),
  instructorName: varchar("instructor_name", { length: 255 }),
  instructorEmail: varchar("instructor_email", { length: 255 }),
  classSchedule: text("class_schedule"),
  location: varchar("location", { length: 255 }),
  maxEnrollment: integer("max_enrollment"),
  currentEnrollment: integer("current_enrollment").default(0).notNull(),
  academicYear: varchar("academic_year", { length: 9 }), // e.g., '2023-2024'
  semester: varchar("semester", { length: 20 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Course assessments/assignments
export const courseAssessments = pgTable("course_assessments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(), // Will be linked to courses table when created
  sectionId: integer("section_id").references(() => courseSections.id),
  assessmentName: varchar("assessment_name", { length: 255 }).notNull(),
  assessmentType: varchar("assessment_type", { length: 50 }).notNull(), // 'Exam', 'Quiz', 'Assignment', 'Project', 'Lab', 'Presentation'
  description: text("description"),
  totalPoints: decimal("total_points", { precision: 8, scale: 2 }),
  weight: decimal("weight", { precision: 5, scale: 2 }), // Percentage weight in final grade
  dueDate: timestamp("due_date"),
  availableFrom: timestamp("available_from"),
  availableUntil: timestamp("available_until"),
  allowLateSubmission: boolean("allow_late_submission").default(false).notNull(),
  latePenalty: decimal("late_penalty", { precision: 5, scale: 2 }), // Percentage penalty per day
  maxAttempts: integer("max_attempts").default(1).notNull(),
  rubricCriteria: jsonb("rubric_criteria"), // JSON object with rubric details
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================
// MAIN STUDENT PROFILE TABLE
// =============================================

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  
  // Basic Identity Information
  studentId: varchar("student_id", { length: 50 }).notNull().unique(), // Institution-specific ID
  firstName: varchar("first_name", { length: 100 }).notNull(),
  middleName: varchar("middle_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  preferredName: varchar("preferred_name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  alternateEmail: varchar("alternate_email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  alternatePhone: varchar("alternate_phone", { length: 20 }),
  
  // Personal Information
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender", { length: 25 }), // 'Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'
  nationalityId: integer("nationality_id").references(() => countries.id),
  citizenshipId: integer("citizenship_id").references(() => countries.id),
  primaryLanguageId: integer("primary_language_id").references(() => languages.id),
  
  // Address Information
  permanentAddress: text("permanent_address"),
  permanentCity: varchar("permanent_city", { length: 100 }),
  permanentState: varchar("permanent_state", { length: 100 }),
  permanentCountryId: integer("permanent_country_id").references(() => countries.id),
  permanentPostalCode: varchar("permanent_postal_code", { length: 20 }),
  currentAddress: text("current_address"),
  currentCity: varchar("current_city", { length: 100 }),
  currentState: varchar("current_state", { length: 100 }),
  currentCountryId: integer("current_country_id").references(() => countries.id),
  currentPostalCode: varchar("current_postal_code", { length: 20 }),
  
  // Academic Information
  primaryInstitutionId: integer("primary_institution_id").references(() => institutions.id).notNull(),
  studentTypeId: integer("student_type_id").references(() => studentTypes.id).notNull(),
  statusId: integer("status_id").references(() => studentStatusTypes.id).notNull(),
  enrollmentDate: date("enrollment_date"),
  expectedGraduationDate: date("expected_graduation_date"),
  actualGraduationDate: date("actual_graduation_date"),
  
  // Academic Standing
  currentGpa: decimal("current_gpa", { precision: 4, scale: 3 }),
  cumulativeGpa: decimal("cumulative_gpa", { precision: 4, scale: 3 }),
  totalCreditsEarned: decimal("total_credits_earned", { precision: 6, scale: 2 }),
  totalCreditsAttempted: decimal("total_credits_attempted", { precision: 6, scale: 2 }),
  currentSemesterCredits: decimal("current_semester_credits", { precision: 5, scale: 2 }),
  academicStanding: varchar("academic_standing", { length: 50 }), // e.g., 'Good Standing', 'Probation', 'Suspension'
  
  // Learning Profile
  learningStyleId: integer("learning_style_id").references(() => learningStyles.id),
  preferredStudyTime: varchar("preferred_study_time", { length: 20 }), // 'Morning', 'Afternoon', 'Evening', 'Night', 'Flexible'
  preferredLearningPace: varchar("preferred_learning_pace", { length: 20 }), // 'Fast', 'Moderate', 'Slow', 'Self-paced'
  technologyProficiency: varchar("technology_proficiency", { length: 20 }), // 'Beginner', 'Intermediate', 'Advanced', 'Expert'
  
  // Goals and Interests
  careerGoal: text("career_goal"),
  academicInterests: text("academic_interests"),
  personalStatement: text("personal_statement"),
  
  // Support and Accommodation
  hasDisabilities: boolean("has_disabilities").default(false).notNull(),
  accommodationNeeded: boolean("accommodation_needed").default(false).notNull(),
  accommodationDetails: text("accommodation_details"),
  
  // Financial Information
  financialAidRecipient: boolean("financial_aid_recipient").default(false).notNull(),
  workStudyEligible: boolean("work_study_eligible").default(false).notNull(),
  estimatedFamilyContribution: decimal("estimated_family_contribution", { precision: 10, scale: 2 }),
  
  // Contact Preferences
  preferredContactMethod: varchar("preferred_contact_method", { length: 20 }), // 'Email', 'Phone', 'Text', 'Mail', 'In-person'
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  smsNotifications: boolean("sms_notifications").default(false).notNull(),
  
  // Emergency Contact
  emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
  emergencyContactRelationship: varchar("emergency_contact_relationship", { length: 50 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
  emergencyContactEmail: varchar("emergency_contact_email", { length: 255 }),
  
  // Privacy and Consent
  photoConsent: boolean("photo_consent").default(false).notNull(),
  directoryConsent: boolean("directory_consent").default(true).notNull(),
  researchConsent: boolean("research_consent").default(false).notNull(),
  marketingConsent: boolean("marketing_consent").default(false).notNull(),
  
  // System Information
  accountCreatedAt: timestamp("account_created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
  profileCompletionPercentage: decimal("profile_completion_percentage", { precision: 5, scale: 2 }),
  dataQualityScore: decimal("data_quality_score", { precision: 3, scale: 2 }), // For AI training
  
  // Status and Metadata
  isActive: boolean("is_active").default(true).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationDate: date("verification_date"),
  notes: text("notes"), // Administrative notes
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =============================================
// ACADEMIC PROGRAMS AND MAJORS
// =============================================

// Student program enrollment
export const studentPrograms = pgTable("student_programs", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  programId: integer("program_id").references(() => academicPrograms.id).notNull(), // Links to academic_programs
  programType: varchar("program_type", { length: 20 }).notNull(), // 'Major', 'Minor', 'Concentration', 'Certificate', 'Double Major'
  enrollmentDate: date("enrollment_date").notNull(),
  completionDate: date("completion_date"),
  expectedCompletionDate: date("expected_completion_date"),
  isPrimary: boolean("is_primary").default(false).notNull(),
  status: varchar("status", { length: 20 }).default("Active").notNull(), // 'Active', 'Completed', 'Dropped', 'Suspended', 'On Hold'
  completionPercentage: decimal("completion_percentage", { precision: 5, scale: 2 }),
  requirementsMet: decimal("requirements_met", { precision: 5, scale: 2 }), // Percentage of requirements completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Academic advisors assignment
export const studentAdvisors = pgTable("student_advisors", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  advisorName: varchar("advisor_name", { length: 255 }).notNull(),
  advisorEmail: varchar("advisor_email", { length: 255 }),
  advisorType: varchar("advisor_type", { length: 20 }).notNull(), // 'Academic', 'Faculty', 'Career', 'Financial', 'Personal'
  department: varchar("department", { length: 100 }),
  assignmentDate: date("assignment_date").notNull(),
  endDate: date("end_date"),
  isPrimary: boolean("is_primary").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================
// COURSE ENROLLMENT AND ACADEMIC HISTORY
// =============================================

// Student course enrollments
export const studentEnrollments = pgTable("student_enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  courseId: integer("course_id").notNull(), // Will be linked to courses table when created
  sectionId: integer("section_id").references(() => courseSections.id),
  enrollmentDate: date("enrollment_date").notNull(),
  enrollmentStatus: varchar("enrollment_status", { length: 20 }).default("Enrolled").notNull(), // 'Enrolled', 'Waitlisted', 'Dropped', 'Withdrawn', 'Completed', 'Audit'
  
  // Academic Term
  academicYear: varchar("academic_year", { length: 9 }), // e.g., '2023-2024'
  semester: varchar("semester", { length: 20 }),
  
  // Grade Information
  finalGrade: varchar("final_grade", { length: 10 }),
  finalPercentage: decimal("final_percentage", { precision: 5, scale: 2 }),
  gradePoints: decimal("grade_points", { precision: 4, scale: 2 }),
  creditHours: decimal("credit_hours", { precision: 3, scale: 1 }),
  isTransferCredit: boolean("is_transfer_credit").default(false).notNull(),
  
  // Completion Information
  completionDate: date("completion_date"),
  completionStatus: varchar("completion_status", { length: 20 }).default("In Progress").notNull(), // 'Completed', 'Incomplete', 'Withdrawn', 'Failed', 'In Progress'
  
  // Performance Metrics
  attendanceRate: decimal("attendance_rate", { precision: 5, scale: 2 }),
  participationScore: decimal("participation_score", { precision: 5, scale: 2 }),
  effortRating: decimal("effort_rating", { precision: 3, scale: 2 }), // 1-5 scale
  
  // Course Feedback
  courseRating: decimal("course_rating", { precision: 3, scale: 2 }), // Student's rating of the course
  difficultyRating: decimal("difficulty_rating", { precision: 3, scale: 2 }),
  workloadRating: decimal("workload_rating", { precision: 3, scale: 2 }),
  instructorRating: decimal("instructor_rating", { precision: 3, scale: 2 }),
  wouldRecommend: boolean("would_recommend"),
  
  // Academic Impact
  contributedToGpa: boolean("contributed_to_gpa").default(true).notNull(),
  repeatAttemptNumber: integer("repeat_attempt_number").default(1).notNull(),
  isRetake: boolean("is_retake").default(false).notNull(),
  
  // Notes and Comments
  instructorComments: text("instructor_comments"),
  studentNotes: text("student_notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Individual assignment/assessment grades
export const studentAssessmentGrades = pgTable("student_assessment_grades", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").references(() => studentEnrollments.id).notNull(),
  assessmentId: integer("assessment_id").references(() => courseAssessments.id).notNull(),
  scoreEarned: decimal("score_earned", { precision: 8, scale: 2 }),
  scorePossible: decimal("score_possible", { precision: 8, scale: 2 }),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  grade: varchar("grade", { length: 10 }),
  submissionDate: timestamp("submission_date"),
  gradedDate: timestamp("graded_date"),
  lateSubmission: boolean("late_submission").default(false).notNull(),
  latePenalty: decimal("late_penalty", { precision: 5, scale: 2 }),
  extraCredit: boolean("extra_credit").default(false).notNull(),
  feedback: text("feedback"),
  rubricScores: jsonb("rubric_scores"), // JSON with rubric criterion scores
  attemptsUsed: integer("attempts_used").default(1).notNull(),
  maxAttempts: integer("max_attempts").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================
// STUDENT SKILLS AND COMPETENCIES
// =============================================

// Student skills tracking
export const studentSkills = pgTable("student_skills", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  skillId: integer("skill_id").references(() => skills.id).notNull(),
  proficiencyLevel: varchar("proficiency_level", { length: 20 }).notNull(), // 'Beginner', 'Intermediate', 'Advanced', 'Expert'
  selfAssessed: boolean("self_assessed").default(true).notNull(),
  verifiedBy: varchar("verified_by", { length: 255 }), // Who verified this skill
  verificationDate: date("verification_date"),
  skillSource: varchar("skill_source", { length: 100 }), // 'Course', 'Project', 'Internship', 'Certification', 'Self-study'
  evidenceUrl: varchar("evidence_url", { length: 500 }), // Link to portfolio/certificate
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Student disability accommodations
export const studentDisabilityAccommodations = pgTable("student_disability_accommodations", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  disabilityTypeId: integer("disability_type_id").references(() => disabilityTypes.id).notNull(),
  accommodationDetails: text("accommodation_details"),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvalDate: date("approval_date"),
  effectiveDate: date("effective_date"),
  expirationDate: date("expiration_date"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Student financial aid records
export const studentFinancialAid = pgTable("student_financial_aid", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  aidTypeId: integer("aid_type_id").references(() => financialAidTypes.id).notNull(),
  academicYear: varchar("academic_year", { length: 9 }).notNull(),
  awardAmount: decimal("award_amount", { precision: 10, scale: 2 }),
  disbursedAmount: decimal("disbursed_amount", { precision: 10, scale: 2 }),
  awardDate: date("award_date"),
  disbursementDate: date("disbursement_date"),
  status: varchar("status", { length: 20 }).default("Active").notNull(), // 'Active', 'Cancelled', 'Suspended', 'Completed'
  conditions: text("conditions"),
  renewalEligible: boolean("renewal_eligible").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Student career interests and goals
export const studentCareerInterests = pgTable("student_career_interests", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  careerFieldId: integer("career_field_id").references(() => careerFields.id).notNull(),
  interestLevel: varchar("interest_level", { length: 20 }).notNull(), // 'High', 'Medium', 'Low'
  experienceLevel: varchar("experience_level", { length: 20 }), // 'None', 'Some', 'Moderate', 'Extensive'
  goalType: varchar("goal_type", { length: 20 }).notNull(), // 'Short-term', 'Medium-term', 'Long-term'
  priority: integer("priority").default(1).notNull(), // 1 = highest priority
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =============================================
// DRIZZLE RELATIONS
// =============================================

export const studentsRelations = relations(students, ({ one, many }) => ({
  nationality: one(countries, { fields: [students.nationalityId], references: [countries.id] }),
  citizenship: one(countries, { fields: [students.citizenshipId], references: [countries.id] }),
  primaryLanguage: one(languages, { fields: [students.primaryLanguageId], references: [languages.id] }),
  permanentCountry: one(countries, { fields: [students.permanentCountryId], references: [countries.id] }),
  currentCountry: one(countries, { fields: [students.currentCountryId], references: [countries.id] }),
  primaryInstitution: one(institutions, { fields: [students.primaryInstitutionId], references: [institutions.id] }),
  studentType: one(studentTypes, { fields: [students.studentTypeId], references: [studentTypes.id] }),
  status: one(studentStatusTypes, { fields: [students.statusId], references: [studentStatusTypes.id] }),
  learningStyle: one(learningStyles, { fields: [students.learningStyleId], references: [learningStyles.id] }),
  programs: many(studentPrograms),
  advisors: many(studentAdvisors),
  enrollments: many(studentEnrollments),
  skills: many(studentSkills),
  disabilityAccommodations: many(studentDisabilityAccommodations),
  financialAid: many(studentFinancialAid),
  careerInterests: many(studentCareerInterests),
}));

export const studentProgramsRelations = relations(studentPrograms, ({ one }) => ({
  student: one(students, { fields: [studentPrograms.studentId], references: [students.id] }),
  program: one(academicPrograms, { fields: [studentPrograms.programId], references: [academicPrograms.id] }),
}));

export const studentEnrollmentsRelations = relations(studentEnrollments, ({ one, many }) => ({
  student: one(students, { fields: [studentEnrollments.studentId], references: [students.id] }),
  // course: one(courses, { fields: [studentEnrollments.courseId], references: [courses.id] }), // Will be added when courses schema is imported
  section: one(courseSections, { fields: [studentEnrollments.sectionId], references: [courseSections.id] }),
  assessmentGrades: many(studentAssessmentGrades),
}));

export const studentSkillsRelations = relations(studentSkills, ({ one }) => ({
  student: one(students, { fields: [studentSkills.studentId], references: [students.id] }),
  skill: one(skills, { fields: [studentSkills.skillId], references: [skills.id] }),
}));

export const careerFieldsRelations = relations(careerFields, ({ one, many }) => ({
  parentField: one(careerFields, { fields: [careerFields.parentFieldId], references: [careerFields.id] }),
  subFields: many(careerFields),
  studentInterests: many(studentCareerInterests),
}));

// =============================================
// ZOD SCHEMAS
// =============================================

export const insertStudentSchema = createInsertSchema(students);
export const insertStudentProgramSchema = createInsertSchema(studentPrograms);
export const insertStudentEnrollmentSchema = createInsertSchema(studentEnrollments);
export const insertStudentSkillSchema = createInsertSchema(studentSkills);
export const insertStudentStatusTypeSchema = createInsertSchema(studentStatusTypes);
export const insertLearningStyleSchema = createInsertSchema(learningStyles);
export const insertStudentTypeSchema = createInsertSchema(studentTypes);
export const insertDisabilityTypeSchema = createInsertSchema(disabilityTypes);
export const insertFinancialAidTypeSchema = createInsertSchema(financialAidTypes);
export const insertCareerFieldSchema = createInsertSchema(careerFields);
export const insertSkillSchema = createInsertSchema(skills);
export const insertCourseSectionSchema = createInsertSchema(courseSections);
export const insertCourseAssessmentSchema = createInsertSchema(courseAssessments);
export const insertStudentAssessmentGradeSchema = createInsertSchema(studentAssessmentGrades);

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertStudentProgram = z.infer<typeof insertStudentProgramSchema>;
export type InsertStudentEnrollment = z.infer<typeof insertStudentEnrollmentSchema>;
export type InsertStudentSkill = z.infer<typeof insertStudentSkillSchema>;
export type InsertStudentStatusType = z.infer<typeof insertStudentStatusTypeSchema>;
export type InsertLearningStyle = z.infer<typeof insertLearningStyleSchema>;
export type InsertStudentType = z.infer<typeof insertStudentTypeSchema>;
export type InsertDisabilityType = z.infer<typeof insertDisabilityTypeSchema>;
export type InsertFinancialAidType = z.infer<typeof insertFinancialAidTypeSchema>;
export type InsertCareerField = z.infer<typeof insertCareerFieldSchema>;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type InsertCourseSection = z.infer<typeof insertCourseSectionSchema>;
export type InsertCourseAssessment = z.infer<typeof insertCourseAssessmentSchema>;
export type InsertStudentAssessmentGrade = z.infer<typeof insertStudentAssessmentGradeSchema>;

export type Student = typeof students.$inferSelect;
export type StudentProgram = typeof studentPrograms.$inferSelect;
export type StudentEnrollment = typeof studentEnrollments.$inferSelect;
export type StudentSkill = typeof studentSkills.$inferSelect;
export type StudentStatusType = typeof studentStatusTypes.$inferSelect;
export type LearningStyle = typeof learningStyles.$inferSelect;
export type StudentType = typeof studentTypes.$inferSelect;
export type DisabilityType = typeof disabilityTypes.$inferSelect;
export type FinancialAidType = typeof financialAidTypes.$inferSelect;
export type CareerField = typeof careerFields.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type CourseSection = typeof courseSections.$inferSelect;
export type CourseAssessment = typeof courseAssessments.$inferSelect;
export type StudentAssessmentGrade = typeof studentAssessmentGrades.$inferSelect;