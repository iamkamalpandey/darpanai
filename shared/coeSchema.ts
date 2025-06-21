import { pgTable, serial, integer, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const coeInformation = pgTable('coe_information', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  documentText: text('document_text'),
  
  // Student Information
  studentName: text('student_name'),
  studentId: text('student_id'),
  dateOfBirth: text('date_of_birth'),
  nationality: text('nationality'),
  passportNumber: text('passport_number'),
  
  // Institution Information
  institutionName: text('institution_name'),
  institutionCode: text('institution_code'),
  cricosCode: text('cricos_code'),
  institutionAddress: text('institution_address'),
  institutionPhone: text('institution_phone'),
  institutionEmail: text('institution_email'),
  
  // Course Information
  courseName: text('course_name'),
  courseCode: text('course_code'),
  courseLevel: text('course_level'),
  fieldOfStudy: text('field_of_study'),
  courseDuration: text('course_duration'),
  studyMode: text('study_mode'),
  campusLocation: text('campus_location'),
  
  // Enrollment Details
  commencementDate: text('commencement_date'),
  completionDate: text('completion_date'),
  expectedGraduation: text('expected_graduation'),
  enrollmentStatus: text('enrollment_status'),
  studyLoad: text('study_load'),
  
  // Financial Information
  tuitionFees: text('tuition_fees'),
  totalCourseFee: text('total_course_fee'),
  feesPerYear: text('fees_per_year'),
  feesPerSemester: text('fees_per_semester'),
  oshcProvider: text('oshc_provider'),
  oshcCost: text('oshc_cost'),
  oshcDuration: text('oshc_duration'),
  
  // Visa Information
  visaSubclass: text('visa_subclass'),
  visaConditions: text('visa_conditions'),
  workRights: text('work_rights'),
  studyRequirements: text('study_requirements'),
  
  // Academic Requirements
  academicRequirements: text('academic_requirements'),
  englishRequirements: text('english_requirements'),
  attendanceRequirements: text('attendance_requirements'),
  progressRequirements: text('progress_requirements'),
  
  // Contact Information
  contactPerson: text('contact_person'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  studentSupportContact: text('student_support_contact'),
  
  // Additional Information
  accommodationInfo: text('accommodation_info'),
  orientationInfo: text('orientation_info'),
  additionalNotes: text('additional_notes'),
  terms: text('terms'),
  
  // System fields
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertCoeInformationSchema = createInsertSchema(coeInformation).omit({
  id: true,
  createdAt: true,
});

export const selectCoeInformationSchema = createSelectSchema(coeInformation);

export type CoeInformation = typeof coeInformation.$inferSelect;
export type InsertCoeInformation = z.infer<typeof insertCoeInformationSchema>;