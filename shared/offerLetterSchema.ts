import { pgTable, text, serial, integer, timestamp, jsonb, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const offerLetterInfo = pgTable("offer_letter_info", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  extractedText: text("extracted_text").notNull(),
  
  // Institution Information (Provider Details)
  institutionName: text("institution_name"),
  tradingAs: text("trading_as"),
  institutionAddress: text("institution_address"),
  institutionPhone: text("institution_phone"),
  institutionEmail: text("institution_email"),
  institutionWebsite: text("institution_website"),
  providerId: text("provider_id"),
  cricosProviderCode: text("cricos_provider_code"),
  abn: text("abn"),
  
  // Student Personal Information
  studentName: text("student_name"),
  studentId: text("student_id"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  citizenship: text("citizenship"),
  maritalStatus: text("marital_status"),
  homeAddress: text("home_address"),
  contactNumber: text("contact_number"),
  emailAddress: text("email_address"),
  correspondenceAddress: text("correspondence_address"),
  passportNumber: text("passport_number"),
  passportExpiryDate: text("passport_expiry_date"),
  agentDetails: text("agent_details"),
  
  // Course/Program Information
  courseName: text("course_name"),
  courseSpecialization: text("course_specialization"),
  courseLevel: text("course_level"),
  cricosCode: text("cricos_code"),
  courseDuration: text("course_duration"),
  numberOfUnits: text("number_of_units"),
  creditPoints: text("credit_points"),
  orientationDate: text("orientation_date"),
  courseStartDate: text("course_start_date"),
  courseEndDate: text("course_end_date"),
  studyMode: text("study_mode"),
  campusLocation: text("campus_location"),
  
  // Financial Information - Detailed Breakdown
  tuitionFeePerUnit: text("tuition_fee_per_unit"),
  upfrontFeeForCoe: text("upfront_fee_for_coe"),
  totalTuitionFees: text("total_tuition_fees"),
  enrollmentFee: text("enrollment_fee"),
  materialFee: text("material_fee"),
  totalFeeDue: text("total_fee_due"),
  paymentSchedule: jsonb("payment_schedule"),
  scholarshipAmount: text("scholarship_amount"),
  scholarshipDetails: text("scholarship_details"),
  
  // Payment Information
  paymentMethods: jsonb("payment_methods"),
  bankDetails: jsonb("bank_details"),
  creditCardPaymentLink: text("credit_card_payment_link"),
  paymentReference: text("payment_reference"),
  
  // Conditions of Offer
  offerConditions: jsonb("offer_conditions"),
  genuineStudentRequirement: text("genuine_student_requirement"),
  minimumEntryRequirements: text("minimum_entry_requirements"),
  academicPrerequisites: text("academic_prerequisites"),
  englishLanguageRequirements: text("english_language_requirements"),
  documentationRequired: text("documentation_required"),
  creditTransferDetails: text("credit_transfer_details"),
  
  // Course Structure & Requirements
  unitsPerYear: text("units_per_year"),
  yearlyBreakdown: text("yearly_breakdown"),
  fullTimeStudyRequirement: text("full_time_study_requirement"),
  attendanceRequirements: text("attendance_requirements"),
  academicProgressRequirements: text("academic_progress_requirements"),
  
  // Additional Fees and Costs
  otherFeesAndCosts: jsonb("other_fees_and_costs"),
  estimatedLivingCosts: text("estimated_living_costs"),
  accommodationCosts: text("accommodation_costs"),
  additionalCharges: jsonb("additional_charges"),
  
  // Student Support and Services
  studentSupportServices: jsonb("student_support_services"),
  specialNeedsSupport: jsonb("special_needs_support"),
  airportPickup: text("airport_pickup"),
  accommodationAssistance: text("accommodation_assistance"),
  visaAdvice: text("visa_advice"),
  orientationProgram: text("orientation_program"),
  
  // Terms and Conditions
  refundPolicy: text("refund_policy"),
  refundConditions: jsonb("refund_conditions"),
  withdrawalPolicy: text("withdrawal_policy"),
  transferPolicy: text("transfer_policy"),
  appealProcedures: text("appeal_procedures"),
  grievanceProcedures: text("grievance_procedures"),
  studentCodeOfConduct: text("student_code_of_conduct"),
  
  // Legal and Compliance
  esosLegislation: text("esos_legislation"),
  privacyPolicy: text("privacy_policy"),
  studentRights: text("student_rights"),
  tuitionProtectionScheme: text("tuition_protection_scheme"),
  defermentPolicy: text("deferment_policy"),
  suspensionPolicy: text("suspension_policy"),
  
  // Health and Insurance
  oshcRequirement: text("oshc_requirement"),
  healthInsuranceDetails: text("health_insurance_details"),
  medicalRequirements: text("medical_requirements"),
  
  // Visa and Immigration
  visaRequirements: text("visa_requirements"),
  studentVisaConditions: text("student_visa_conditions"),
  workRights: text("work_rights"),
  dependentsInformation: text("dependents_information"),
  schoolAgedDependents: text("school_aged_dependents"),
  
  // Study Materials and Resources
  laptopRequirement: text("laptop_requirement"),
  textbookCosts: text("textbook_costs"),
  libraryAccess: text("library_access"),
  technologyRequirements: text("technology_requirements"),
  
  // Contact Information
  admissionsOfficer: text("admissions_officer"),
  admissionsEmail: text("admissions_email"),
  studentServicesContact: text("student_services_contact"),
  emergencyContacts: text("emergency_contacts"),
  qualitySystemsManager: text("quality_systems_manager"),
  
  // Acceptance and Declaration
  acceptanceDeadline: text("acceptance_deadline"),
  studentDeclaration: text("student_declaration"),
  declarationRequirements: jsonb("declaration_requirements"),
  signatureRequirements: text("signature_requirements"),
  returnInstructions: text("return_instructions"),
  
  // Administrative Information
  applicationId: text("application_id"),
  offerDate: text("offer_date"),
  offerVersion: text("offer_version"),
  pageCount: text("page_count"),
  documentStatus: text("document_status"),
  
  // Processing Metadata
  tokensUsed: integer("tokens_used"),
  processingTime: integer("processing_time"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOfferLetterInfoSchema = createInsertSchema(offerLetterInfo).omit({
  id: true,
  createdAt: true,
});

export type OfferLetterInfo = typeof offerLetterInfo.$inferSelect;
export type InsertOfferLetterInfo = z.infer<typeof insertOfferLetterInfoSchema>;