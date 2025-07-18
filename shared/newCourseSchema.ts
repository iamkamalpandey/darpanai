import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal, varchar, date, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { institutions, academicDisciplines, degreeLevels, languages } from "./newInstitutionSchema";
import { skills, careerFields } from "./newStudentSchema";

// =============================================
// COURSE REFERENCE TABLES
// =============================================

// Course categories/subjects
export const courseCategories = pgTable("course_categories", {
  id: serial("id").primaryKey(),
  categoryName: varchar("category_name", { length: 100 }).notNull().unique(),
  parentCategoryId: integer("parent_category_id").references(() => courseCategories.id),
  description: text("description"),
  categoryCode: varchar("category_code", { length: 20 }), // e.g., 'CS', 'MATH', 'ENG'
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Course delivery modes
export const courseDeliveryModes = pgTable("course_delivery_modes", {
  id: serial("id").primaryKey(),
  modeName: varchar("mode_name", { length: 50 }).notNull().unique(), // e.g., 'In-Person', 'Online', 'Hybrid', 'Blended'
  description: text("description"),
  requiresPhysicalAttendance: boolean("requires_physical_attendance").default(true).notNull(),
  technologyRequirements: text("technology_requirements"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Course difficulty levels
export const courseDifficultyLevels = pgTable("course_difficulty_levels", {
  id: serial("id").primaryKey(),
  levelName: varchar("level_name", { length: 50 }).notNull().unique(), // e.g., 'Beginner', 'Intermediate', 'Advanced', 'Expert'
  levelOrder: integer("level_order").notNull(), // 1 = easiest, higher = harder
  description: text("description"),
  typicalPrerequisites: text("typical_prerequisites"),
  expectedWorkload: varchar("expected_workload", { length: 100 }), // e.g., '10-15 hours per week'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Course formats/types
export const courseFormats = pgTable("course_formats", {
  id: serial("id").primaryKey(),
  formatName: varchar("format_name", { length: 50 }).notNull().unique(), // e.g., 'Lecture', 'Lab', 'Seminar', 'Workshop', 'Tutorial'
  description: text("description"),
  typicalDuration: varchar("typical_duration", { length: 50 }), // e.g., '3 hours', '90 minutes'
  maxClassSize: integer("max_class_size"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Grading systems
export const gradingSystems = pgTable("grading_systems", {
  id: serial("id").primaryKey(),
  systemName: varchar("system_name", { length: 50 }).notNull().unique(), // e.g., 'Letter Grades', 'Percentage', 'Pass/Fail', 'Numerical'
  description: text("description"),
  gradeScale: jsonb("grade_scale"), // JSON object defining the scale (e.g., A=90-100, B=80-89, etc.)
  passingGrade: varchar("passing_grade", { length: 10 }), // Minimum grade to pass
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================
// MAIN COURSE TABLE
// =============================================

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  
  // Basic Course Information
  courseCode: varchar("course_code", { length: 20 }).notNull(), // e.g., 'CS101', 'MATH201'
  courseName: varchar("course_name", { length: 255 }).notNull(),
  shortName: varchar("short_name", { length: 100 }), // Abbreviated name
  description: text("description"),
  longDescription: text("long_description"), // Detailed course description
  
  // Institution and Academic Information
  institutionId: integer("institution_id").references(() => institutions.id).notNull(),
  categoryId: integer("category_id").references(() => courseCategories.id).notNull(),
  disciplineId: integer("discipline_id").references(() => academicDisciplines.id).notNull(),
  degreeLevelId: integer("degree_level_id").references(() => degreeLevels.id).notNull(),
  
  // Course Structure
  creditHours: decimal("credit_hours", { precision: 3, scale: 1 }).notNull(),
  contactHours: decimal("contact_hours", { precision: 4, scale: 1 }), // Total hours of instruction
  lectureHours: decimal("lecture_hours", { precision: 4, scale: 1 }),
  labHours: decimal("lab_hours", { precision: 4, scale: 1 }),
  tutorialHours: decimal("tutorial_hours", { precision: 4, scale: 1 }),
  
  // Course Characteristics
  difficultyLevelId: integer("difficulty_level_id").references(() => courseDifficultyLevels.id),
  deliveryModeId: integer("delivery_mode_id").references(() => courseDeliveryModes.id),
  formatId: integer("format_id").references(() => courseFormats.id),
  gradingSystemId: integer("grading_system_id").references(() => gradingSystems.id),
  
  // Prerequisites and Requirements
  prerequisites: text("prerequisites"), // Text description of prerequisites
  corequisites: text("corequisites"), // Courses that must be taken simultaneously
  equivalentCourses: text("equivalent_courses"), // Courses that fulfill the same requirement
  restrictedEnrollment: text("restricted_enrollment"), // Enrollment restrictions
  
  // Language and Accessibility
  primaryLanguageId: integer("primary_language_id").references(() => languages.id),
  secondaryLanguageId: integer("secondary_language_id").references(() => languages.id),
  accessibilityFeatures: text("accessibility_features"), // Special accommodations available
  
  // Enrollment and Capacity
  maxEnrollment: integer("max_enrollment"),
  typicalEnrollment: integer("typical_enrollment"),
  waitlistCapacity: integer("waitlist_capacity"),
  enrollmentRestrictions: text("enrollment_restrictions"),
  
  // Academic Calendar
  duration: varchar("duration", { length: 50 }), // e.g., '16 weeks', '8 weeks', '4 weeks'
  durationWeeks: integer("duration_weeks"),
  durationMonths: decimal("duration_months", { precision: 3, scale: 1 }),
  intensiveFormat: boolean("intensive_format").default(false).notNull(), // Summer intensive, etc.
  
  // Scheduling Information
  typicalSchedule: text("typical_schedule"), // e.g., 'MWF 9:00-10:00 AM'
  schedulingFlexibility: varchar("scheduling_flexibility", { length: 50 }), // 'Fixed', 'Flexible', 'Self-paced'
  timeCommitment: varchar("time_commitment", { length: 100 }), // Expected weekly time commitment
  
  // Financial Information
  tuitionFee: decimal("tuition_fee", { precision: 10, scale: 2 }),
  labFee: decimal("lab_fee", { precision: 8, scale: 2 }),
  materialFee: decimal("material_fee", { precision: 8, scale: 2 }),
  technologyFee: decimal("technology_fee", { precision: 8, scale: 2 }),
  totalFee: decimal("total_fee", { precision: 10, scale: 2 }),
  currencyCode: varchar("currency_code", { length: 3 }),
  
  // Course Content and Outcomes
  learningOutcomes: text("learning_outcomes"), // Expected learning outcomes
  courseObjectives: text("course_objectives"), // Specific course objectives
  topicsOutline: text("topics_outline"), // Course content outline
  skillsAcquired: text("skills_acquired"), // Skills students will gain
  
  // Assessment Information
  assessmentMethods: text("assessment_methods"), // How students are evaluated
  examFormat: varchar("exam_format", { length: 100 }), // 'Written', 'Oral', 'Practical', 'Online', 'Mixed'
  assignmentTypes: text("assignment_types"), // Types of assignments
  gradingBreakdown: jsonb("grading_breakdown"), // JSON with grade component percentages
  
  // Resources and Materials
  textbooks: text("textbooks"), // Required and recommended textbooks
  materials: text("materials"), // Required materials and supplies
  softwareRequirements: text("software_requirements"), // Required software/technology
  equipmentNeeded: text("equipment_needed"), // Special equipment requirements
  
  // Quality and Feedback
  studentRating: decimal("student_rating", { precision: 3, scale: 2 }), // Average student rating
  difficultyRating: decimal("difficulty_rating", { precision: 3, scale: 2 }), // Student-reported difficulty
  workloadRating: decimal("workload_rating", { precision: 3, scale: 2 }), // Student-reported workload
  recommendationRate: decimal("recommendation_rate", { precision: 5, scale: 2 }), // % who would recommend
  
  // Transferability and Recognition
  transferable: boolean("transferable").default(true).notNull(),
  transferCredit: boolean("transfer_credit").default(true).notNull(),
  professionalRecognition: text("professional_recognition"), // Professional body recognition
  industryRelevance: text("industry_relevance"), // Industry connections/relevance
  
  // Availability and Offering
  offeringSemesters: text("offering_semesters").array(), // ['Fall', 'Spring', 'Summer']
  offeringFrequency: varchar("offering_frequency", { length: 50 }), // 'Every semester', 'Annually', 'Bi-annually'
  lastOffered: date("last_offered"),
  nextOffering: date("next_offering"),
  
  // Course Evolution and Updates
  courseVersion: varchar("course_version", { length: 20 }).default("1.0").notNull(),
  lastUpdated: date("last_updated"),
  lastReviewed: date("last_reviewed"),
  nextReviewDate: date("next_review_date"),
  
  // Status and Metadata
  status: varchar("status", { length: 20 }).default("Active").notNull(), // 'Active', 'Inactive', 'Suspended', 'Retired', 'Under Review'
  isCore: boolean("is_core").default(false).notNull(), // Core requirement for degree
  isElective: boolean("is_elective").default(true).notNull(),
  isHonors: boolean("is_honors").default(false).notNull(),
  isRemote: boolean("is_remote").default(false).notNull(),
  isAccelerated: boolean("is_accelerated").default(false).notNull(),
  
  // Approval and Accreditation
  isApproved: boolean("is_approved").default(false).notNull(),
  approvalDate: date("approval_date"),
  approvedBy: varchar("approved_by", { length: 255 }),
  accreditation: text("accreditation"), // Accreditation information
  
  // Quality Assurance
  dataQualityScore: decimal("data_quality_score", { precision: 3, scale: 2 }), // For AI training
  completenessScore: decimal("completeness_score", { precision: 3, scale: 2 }), // Data completeness
  
  // Analytics and Insights
  enrollmentTrend: varchar("enrollment_trend", { length: 20 }), // 'Increasing', 'Stable', 'Decreasing'
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // % students who pass
  dropoutRate: decimal("dropout_rate", { precision: 5, scale: 2 }), // % students who drop
  averageGrade: decimal("average_grade", { precision: 4, scale: 2 }), // Average final grade
  
  // SEO and Discovery
  keywords: text("keywords"), // Search keywords
  tags: text("tags").array(), // Search tags
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: varchar("created_by", { length: 100 }),
  updatedBy: varchar("updated_by", { length: 100 }),
});

// =============================================
// COURSE RELATIONSHIP TABLES
// =============================================

// Course prerequisites (many-to-many)
export const coursePrerequisites = pgTable("course_prerequisites", {
  courseId: integer("course_id").references(() => courses.id).notNull(),
  prerequisiteCourseId: integer("prerequisite_course_id").references(() => courses.id).notNull(),
  isRequired: boolean("is_required").default(true).notNull(),
  canWaive: boolean("can_waive").default(false).notNull(),
  waiveConditions: text("waive_conditions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.courseId, table.prerequisiteCourseId] }),
}));

// Course equivalencies (many-to-many)
export const courseEquivalencies = pgTable("course_equivalencies", {
  courseId: integer("course_id").references(() => courses.id).notNull(),
  equivalentCourseId: integer("equivalent_course_id").references(() => courses.id).notNull(),
  equivalencyType: varchar("equivalency_type", { length: 50 }).notNull(), // 'Full', 'Partial', 'Transfer'
  notes: text("notes"),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvalDate: date("approval_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.courseId, table.equivalentCourseId] }),
}));

// Course skills mapping (many-to-many)
export const courseSkills = pgTable("course_skills", {
  courseId: integer("course_id").references(() => courses.id).notNull(),
  skillId: integer("skill_id").references(() => skills.id).notNull(),
  skillLevel: varchar("skill_level", { length: 20 }), // 'Introduced', 'Developed', 'Mastered'
  importance: varchar("importance", { length: 20 }), // 'Primary', 'Secondary', 'Minor'
  assessmentMethod: varchar("assessment_method", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.courseId, table.skillId] }),
}));

// Course career field relevance (many-to-many)
export const courseCareerFields = pgTable("course_career_fields", {
  courseId: integer("course_id").references(() => courses.id).notNull(),
  careerFieldId: integer("career_field_id").references(() => careerFields.id).notNull(),
  relevanceLevel: varchar("relevance_level", { length: 20 }), // 'High', 'Medium', 'Low'
  jobRoleRelevance: text("job_role_relevance"), // Specific job roles this course prepares for
  industryApplication: text("industry_application"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.courseId, table.careerFieldId] }),
}));

// Course instructor assignments
export const courseInstructors = pgTable("course_instructors", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  instructorName: varchar("instructor_name", { length: 255 }).notNull(),
  instructorEmail: varchar("instructor_email", { length: 255 }),
  instructorTitle: varchar("instructor_title", { length: 100 }),
  department: varchar("department", { length: 100 }),
  role: varchar("role", { length: 50 }), // 'Primary', 'Assistant', 'Guest', 'Lab'
  expertise: text("expertise"),
  qualifications: text("qualifications"),
  teachingExperience: text("teaching_experience"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  assignmentDate: date("assignment_date"),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Course reviews and feedback
export const courseReviews = pgTable("course_reviews", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  reviewerType: varchar("reviewer_type", { length: 20 }).notNull(), // 'Student', 'Instructor', 'Administrator', 'Industry Expert'
  rating: integer("rating"), // 1-5 scale
  difficultyRating: integer("difficulty_rating"), // 1-5 scale
  workloadRating: integer("workload_rating"), // 1-5 scale
  recommendationRating: integer("recommendation_rating"), // 1-5 scale
  reviewText: text("review_text"),
  pros: text("pros"),
  cons: text("cons"),
  improvements: text("improvements"),
  wouldRecommend: boolean("would_recommend"),
  anonymous: boolean("anonymous").default(true).notNull(),
  reviewerName: varchar("reviewer_name", { length: 100 }),
  reviewerEmail: varchar("reviewer_email", { length: 100 }),
  semester: varchar("semester", { length: 20 }),
  academicYear: varchar("academic_year", { length: 9 }),
  isVerified: boolean("is_verified").default(false).notNull(),
  helpfulVotes: integer("helpful_votes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Course materials and resources
export const courseMaterials = pgTable("course_materials", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  materialType: varchar("material_type", { length: 50 }).notNull(), // 'Textbook', 'Software', 'Equipment', 'Online Resource', 'Supplies'
  materialName: varchar("material_name", { length: 255 }).notNull(),
  description: text("description"),
  isRequired: boolean("is_required").default(true).notNull(),
  cost: decimal("cost", { precision: 8, scale: 2 }),
  supplier: varchar("supplier", { length: 255 }),
  isbn: varchar("isbn", { length: 20 }),
  version: varchar("version", { length: 50 }),
  url: varchar("url", { length: 500 }),
  availability: varchar("availability", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================
// DRIZZLE RELATIONS
// =============================================

export const coursesRelations = relations(courses, ({ one, many }) => ({
  institution: one(institutions, { fields: [courses.institutionId], references: [institutions.id] }),
  category: one(courseCategories, { fields: [courses.categoryId], references: [courseCategories.id] }),
  discipline: one(academicDisciplines, { fields: [courses.disciplineId], references: [academicDisciplines.id] }),
  degreeLevel: one(degreeLevels, { fields: [courses.degreeLevelId], references: [degreeLevels.id] }),
  difficultyLevel: one(courseDifficultyLevels, { fields: [courses.difficultyLevelId], references: [courseDifficultyLevels.id] }),
  deliveryMode: one(courseDeliveryModes, { fields: [courses.deliveryModeId], references: [courseDeliveryModes.id] }),
  format: one(courseFormats, { fields: [courses.formatId], references: [courseFormats.id] }),
  gradingSystem: one(gradingSystems, { fields: [courses.gradingSystemId], references: [gradingSystems.id] }),
  primaryLanguage: one(languages, { fields: [courses.primaryLanguageId], references: [languages.id] }),
  secondaryLanguage: one(languages, { fields: [courses.secondaryLanguageId], references: [languages.id] }),
  prerequisites: many(coursePrerequisites, { relationName: "coursePrerequisites" }),
  prerequisiteFor: many(coursePrerequisites, { relationName: "prerequisiteFor" }),
  equivalencies: many(courseEquivalencies, { relationName: "courseEquivalencies" }),
  equivalentTo: many(courseEquivalencies, { relationName: "equivalentTo" }),
  skills: many(courseSkills),
  careerFields: many(courseCareerFields),
  instructors: many(courseInstructors),
  reviews: many(courseReviews),
  materials: many(courseMaterials),
}));

export const courseCategoriesRelations = relations(courseCategories, ({ one, many }) => ({
  parentCategory: one(courseCategories, { fields: [courseCategories.parentCategoryId], references: [courseCategories.id] }),
  subCategories: many(courseCategories),
  courses: many(courses),
}));

export const coursePrerequisitesRelations = relations(coursePrerequisites, ({ one }) => ({
  course: one(courses, { fields: [coursePrerequisites.courseId], references: [courses.id], relationName: "coursePrerequisites" }),
  prerequisiteCourse: one(courses, { fields: [coursePrerequisites.prerequisiteCourseId], references: [courses.id], relationName: "prerequisiteFor" }),
}));

export const courseEquivalenciesRelations = relations(courseEquivalencies, ({ one }) => ({
  course: one(courses, { fields: [courseEquivalencies.courseId], references: [courses.id], relationName: "courseEquivalencies" }),
  equivalentCourse: one(courses, { fields: [courseEquivalencies.equivalentCourseId], references: [courses.id], relationName: "equivalentTo" }),
}));

export const courseSkillsRelations = relations(courseSkills, ({ one }) => ({
  course: one(courses, { fields: [courseSkills.courseId], references: [courses.id] }),
  skill: one(skills, { fields: [courseSkills.skillId], references: [skills.id] }),
}));

export const courseCareerFieldsRelations = relations(courseCareerFields, ({ one }) => ({
  course: one(courses, { fields: [courseCareerFields.courseId], references: [courses.id] }),
  careerField: one(careerFields, { fields: [courseCareerFields.careerFieldId], references: [careerFields.id] }),
}));

export const courseInstructorsRelations = relations(courseInstructors, ({ one }) => ({
  course: one(courses, { fields: [courseInstructors.courseId], references: [courses.id] }),
}));

export const courseReviewsRelations = relations(courseReviews, ({ one }) => ({
  course: one(courses, { fields: [courseReviews.courseId], references: [courses.id] }),
}));

export const courseMaterialsRelations = relations(courseMaterials, ({ one }) => ({
  course: one(courses, { fields: [courseMaterials.courseId], references: [courses.id] }),
}));

// =============================================
// ZOD SCHEMAS
// =============================================

export const insertCourseSchema = createInsertSchema(courses);
export const insertCourseCategorySchema = createInsertSchema(courseCategories);
export const insertCourseDeliveryModeSchema = createInsertSchema(courseDeliveryModes);
export const insertCourseDifficultyLevelSchema = createInsertSchema(courseDifficultyLevels);
export const insertCourseFormatSchema = createInsertSchema(courseFormats);
export const insertGradingSystemSchema = createInsertSchema(gradingSystems);
export const insertCoursePrerequisiteSchema = createInsertSchema(coursePrerequisites);
export const insertCourseEquivalencySchema = createInsertSchema(courseEquivalencies);
export const insertCourseSkillSchema = createInsertSchema(courseSkills);
export const insertCourseCareerFieldSchema = createInsertSchema(courseCareerFields);
export const insertCourseInstructorSchema = createInsertSchema(courseInstructors);
export const insertCourseReviewSchema = createInsertSchema(courseReviews);
export const insertCourseMaterialSchema = createInsertSchema(courseMaterials);

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertCourseCategory = z.infer<typeof insertCourseCategorySchema>;
export type InsertCourseDeliveryMode = z.infer<typeof insertCourseDeliveryModeSchema>;
export type InsertCourseDifficultyLevel = z.infer<typeof insertCourseDifficultyLevelSchema>;
export type InsertCourseFormat = z.infer<typeof insertCourseFormatSchema>;
export type InsertGradingSystem = z.infer<typeof insertGradingSystemSchema>;
export type InsertCoursePrerequisite = z.infer<typeof insertCoursePrerequisiteSchema>;
export type InsertCourseEquivalency = z.infer<typeof insertCourseEquivalencySchema>;
export type InsertCourseSkill = z.infer<typeof insertCourseSkillSchema>;
export type InsertCourseCareerField = z.infer<typeof insertCourseCareerFieldSchema>;
export type InsertCourseInstructor = z.infer<typeof insertCourseInstructorSchema>;
export type InsertCourseReview = z.infer<typeof insertCourseReviewSchema>;
export type InsertCourseMaterial = z.infer<typeof insertCourseMaterialSchema>;

export type Course = typeof courses.$inferSelect;
export type CourseCategory = typeof courseCategories.$inferSelect;
export type CourseDeliveryMode = typeof courseDeliveryModes.$inferSelect;
export type CourseDifficultyLevel = typeof courseDifficultyLevels.$inferSelect;
export type CourseFormat = typeof courseFormats.$inferSelect;
export type GradingSystem = typeof gradingSystems.$inferSelect;
export type CoursePrerequisite = typeof coursePrerequisites.$inferSelect;
export type CourseEquivalency = typeof courseEquivalencies.$inferSelect;
export type CourseSkill = typeof courseSkills.$inferSelect;
export type CourseCareerField = typeof courseCareerFields.$inferSelect;
export type CourseInstructor = typeof courseInstructors.$inferSelect;
export type CourseReview = typeof courseReviews.$inferSelect;
export type CourseMaterial = typeof courseMaterials.$inferSelect;