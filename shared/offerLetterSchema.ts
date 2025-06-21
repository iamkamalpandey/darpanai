import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const offerLetterInfo = pgTable("offer_letter_info", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  extractedText: text("extracted_text").notNull(),
  
  // Institution Information
  institutionName: text("institution_name"),
  institutionAddress: text("institution_address"),
  institutionPhone: text("institution_phone"),
  institutionEmail: text("institution_email"),
  institutionWebsite: text("institution_website"),
  
  // Program Information
  programName: text("program_name"),
  programLevel: text("program_level"),
  programDuration: text("program_duration"),
  studyMode: text("study_mode"),
  campusLocation: text("campus_location"),
  
  // Academic Details
  startDate: text("start_date"),
  endDate: text("end_date"),
  applicationDeadline: text("application_deadline"),
  acceptanceDeadline: text("acceptance_deadline"),
  
  // Financial Information
  tuitionFee: text("tuition_fee"),
  applicationFee: text("application_fee"),
  depositRequired: text("deposit_required"),
  totalCost: text("total_cost"),
  paymentSchedule: text("payment_schedule"),
  
  // Requirements
  academicRequirements: text("academic_requirements"),
  englishRequirements: text("english_requirements"),
  documentRequirements: text("document_requirements"),
  
  // Student Information
  studentName: text("student_name"),
  studentId: text("student_id"),
  applicationNumber: text("application_number"),
  
  // Additional Information
  scholarshipInfo: text("scholarship_info"),
  accommodationInfo: text("accommodation_info"),
  visaInfo: text("visa_info"),
  contactPerson: text("contact_person"),
  additionalNotes: text("additional_notes"),
  
  // Processing metadata
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