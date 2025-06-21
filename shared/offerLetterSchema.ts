import { pgTable, text, serial, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Simple offer letter information extraction table
export const offerLetterInfo = pgTable("offer_letter_info", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  
  // Institution Information
  institutionName: text("institution_name"),
  institutionAddress: text("institution_address"),
  institutionPhone: text("institution_phone"),
  institutionEmail: text("institution_email"),
  institutionWebsite: text("institution_website"),
  cricosCode: text("cricos_code"),
  providerCode: text("provider_code"),
  
  // Student Information
  studentName: text("student_name"),
  studentId: text("student_id"),
  studentEmail: text("student_email"),
  studentPhone: text("student_phone"),
  studentAddress: text("student_address"),
  dateOfBirth: text("date_of_birth"),
  nationality: text("nationality"),
  passportNumber: text("passport_number"),
  
  // Program Information
  programName: text("program_name"),
  programCode: text("program_code"),
  programLevel: text("program_level"), // Bachelor, Master, PhD, Diploma, Certificate
  fieldOfStudy: text("field_of_study"),
  specialization: text("specialization"),
  programDuration: text("program_duration"),
  totalUnits: text("total_units"),
  studyMode: text("study_mode"), // Full-time, Part-time
  deliveryMode: text("delivery_mode"), // On-campus, Online, Blended
  campus: text("campus"),
  
  // Academic Dates
  startDate: text("start_date"),
  endDate: text("end_date"),
  orientationDate: text("orientation_date"),
  enrolmentDate: text("enrolment_date"),
  censusDate: text("census_date"),
  applicationDeadline: text("application_deadline"),
  acceptanceDeadline: text("acceptance_deadline"),
  
  // Financial Information
  tuitionFee: text("tuition_fee"),
  currency: text("currency"),
  paymentFrequency: text("payment_frequency"), // Annual, Semester, Monthly
  applicationFee: text("application_fee"),
  enrollmentFee: text("enrollment_fee"),
  materialsFee: text("materials_fee"),
  technologyFee: text("technology_fee"),
  studentServicesFee: text("student_services_fee"),
  totalFirstYearFee: text("total_first_year_fee"),
  totalProgramFee: text("total_program_fee"),
  
  // Payment Information
  paymentDueDate: text("payment_due_date"),
  paymentMethods: text("payment_methods"),
  refundPolicy: text("refund_policy"),
  scholarshipInfo: text("scholarship_info"),
  discountsAvailable: text("discounts_available"),
  
  // Admission Requirements
  academicRequirements: text("academic_requirements"),
  englishRequirements: text("english_requirements"),
  minimumGpa: text("minimum_gpa"),
  prerequisiteSubjects: text("prerequisite_subjects"),
  workExperienceRequired: text("work_experience_required"),
  portfolioRequired: text("portfolio_required"),
  interviewRequired: text("interview_required"),
  
  // Visa and Immigration
  visaType: text("visa_type"),
  visaSubclass: text("visa_subclass"),
  coe: text("coe"), // Confirmation of Enrollment
  oshc: text("oshc"), // Overseas Student Health Cover
  workRights: text("work_rights"),
  
  // Contact Information
  admissionsContact: text("admissions_contact"),
  internationalOfficeContact: text("international_office_contact"),
  studentServicesContact: text("student_services_contact"),
  financialAidContact: text("financial_aid_contact"),
  
  // Terms and Conditions
  terms: text("terms"),
  conditions: text("conditions"),
  policiesUrl: text("policies_url"),
  handbookUrl: text("handbook_url"),
  
  // Additional Information
  accreditation: text("accreditation"),
  professionalRecognition: text("professional_recognition"),
  pathwayOptions: text("pathway_options"),
  transferCredit: text("transfer_credit"),
  graduationRequirements: text("graduation_requirements"),
  facilities: text("facilities"),
  supportServices: text("support_services"),
  
  // Processing Information
  extractedText: text("extracted_text"),
  tokensUsed: integer("tokens_used"),
  processingTime: integer("processing_time"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOfferLetterInfoSchema = createInsertSchema(offerLetterInfo).omit({
  id: true,
  createdAt: true,
});

export type OfferLetterInfo = typeof offerLetterInfo.$inferSelect;
export type InsertOfferLetterInfo = z.infer<typeof insertOfferLetterInfoSchema>;