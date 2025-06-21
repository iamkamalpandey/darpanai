import { pgTable, serial, integer, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const coeInformation = pgTable('coe_information', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  documentText: text('document_text'),
  
  // CoE Reference Information
  coeNumber: text('coe_number'), // e.g., "106EBD133"
  coeCreatedDate: text('coe_created_date'),
  coeUpdatedDate: text('coe_updated_date'),
  
  // Provider Information (Institution)
  providerName: text('provider_name'), // e.g., "Victoria University"
  providerCricosCode: text('provider_cricos_code'), // e.g., "[00124K]"
  tradingAs: text('trading_as'), // e.g., "Victoria University"
  providerPhone: text('provider_phone'),
  providerFax: text('provider_fax'),
  providerEmail: text('provider_email'),
  
  // Course Details
  courseName: text('course_name'), // e.g., "Bachelor of Early Childhood Education"
  courseCricosCode: text('course_cricos_code'), // e.g., "[096869G]"
  courseLevel: text('course_level'), // e.g., "Bachelor Degree"
  courseStartDate: text('course_start_date'), // e.g., "28/07/2025"
  courseEndDate: text('course_end_date'), // e.g., "16/06/2028"
  
  // Financial Information (Pre-paid and Total)
  initialPrePaidTuitionFee: text('initial_pre_paid_tuition_fee'), // e.g., "$AU 12,880"
  otherPrePaidNonTuitionFee: text('other_pre_paid_non_tuition_fee'), // e.g., "$AU 2,473"
  totalTuitionFee: text('total_tuition_fee'), // e.g., "$AU 95,958"
  
  // Student Details
  providerStudentId: text('provider_student_id'), // e.g., "8188302"
  familyName: text('family_name'), // e.g., "GURUNG"
  givenNames: text('given_names'), // e.g., "Sneha"
  gender: text('gender'), // e.g., "Female"
  dateOfBirth: text('date_of_birth'), // e.g., "10/03/2006"
  countryOfBirth: text('country_of_birth'), // e.g., "Nepal"
  nationality: text('nationality'), // e.g., "Nepal"
  
  // OSHC (Overseas Student Health Cover) Information
  providerArrangedOshc: text('provider_arranged_oshc'), // Yes/No
  oshcStartDate: text('oshc_start_date'), // e.g., "14/07/2025"
  oshcEndDate: text('oshc_end_date'), // e.g., "16/08/2028"
  oshcProviderName: text('oshc_provider_name'), // e.g., "Medibank Private"
  oshcCoverType: text('oshc_cover_type'), // e.g., "Single"
  
  // English Language Test Information
  englishTestType: text('english_test_type'), // e.g., "International English Language Testing System (IELTS)"
  englishTestScore: text('english_test_score'), // e.g., "7"
  englishTestDate: text('english_test_date'), // e.g., "19/09/2024"
  
  // Comments and Scholarships
  comments: text('comments'), // Free text for additional information including scholarships
  scholarshipInfo: text('scholarship_info'), // Extracted scholarship information
  
  // Legal and Compliance Information
  esosActCompliance: text('esos_act_compliance'), // Information about ESOS Act compliance
  cricosRegistration: text('cricos_registration'), // CRICOS registration details
  nationalCodeCompliance: text('national_code_compliance'), // National Code compliance
  governmentDataSharing: text('government_data_sharing'), // Information sharing with government agencies
  
  // Important Notes and Reminders
  importantNotes: text('important_notes'), // Keep CoE and Written Agreement, etc.
  studyAustraliaLink: text('study_australia_link'), // https://www.studyaustralia.gov.au/
  qualityAssuranceInfo: text('quality_assurance_info'), // Quality assurance information
  
  // Visa Related Information (if mentioned)
  visaApplicationInfo: text('visa_application_info'), // Information about visa application process
  veVOInfo: text('vevo_info'), // VEVO verification information
  homeAffairsLink: text('home_affairs_link'), // Department of Home Affairs links
  
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