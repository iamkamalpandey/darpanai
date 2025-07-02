import { eq, and, like, desc, asc } from "drizzle-orm";
import { db } from "./db";
import { 
  institutions, 
  programs, 
  programFees, 
  studentApplications,
  type Institution, 
  type Program, 
  type ProgramFees,
  type StudentApplication,
  type InsertInstitution, 
  type InsertProgram, 
  type InsertProgramFees,
  type InsertStudentApplication
} from "@shared/schema";

export class InstitutionStorage {
  // Institution CRUD
  async getAllInstitutions(filters?: { 
    country?: string; 
    institutionType?: string; 
    isPartner?: boolean;
    searchTerm?: string;
  }) {
    let query = db
      .select()
      .from(institutions)
      .where(eq(institutions.isActive, true));

    if (filters?.country) {
      query = query.where(eq(institutions.country, filters.country));
    }
    if (filters?.institutionType) {
      query = query.where(eq(institutions.institutionType, filters.institutionType));
    }
    if (filters?.isPartner !== undefined) {
      query = query.where(eq(institutions.isPartner, filters.isPartner));
    }
    if (filters?.searchTerm) {
      query = query.where(like(institutions.name, `%${filters.searchTerm}%`));
    }

    return await query.orderBy(asc(institutions.name));
  }

  async getInstitutionById(id: number) {
    const result = await db
      .select()
      .from(institutions)
      .where(and(eq(institutions.id, id), eq(institutions.isActive, true)))
      .limit(1);
    
    return result[0] || null;
  }

  async createInstitution(data: InsertInstitution) {
    const result = await db.insert(institutions).values(data).returning();
    return result[0];
  }

  async updateInstitution(id: number, data: Partial<InsertInstitution>) {
    const result = await db
      .update(institutions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(institutions.id, id))
      .returning();
    
    return result[0] || null;
  }

  // Program CRUD
  async getProgramsByInstitution(institutionId: number) {
    return await db
      .select({
        id: programs.id,
        name: programs.name,
        degree: programs.degree,
        field: programs.field,
        specialization: programs.specialization,
        duration: programs.duration,
        studyMode: programs.studyMode,
        language: programs.language,
        description: programs.description,
        institutionName: institutions.name,
        institutionCountry: institutions.country
      })
      .from(programs)
      .innerJoin(institutions, eq(programs.institutionId, institutions.id))
      .where(and(
        eq(programs.institutionId, institutionId),
        eq(programs.isActive, true),
        eq(institutions.isActive, true)
      ))
      .orderBy(asc(programs.name));
  }

  async searchPrograms(filters: {
    field?: string;
    degree?: string;
    country?: string;
    studyMode?: string;
    searchTerm?: string;
  }) {
    let query = db
      .select({
        programId: programs.id,
        programName: programs.name,
        degree: programs.degree,
        field: programs.field,
        specialization: programs.specialization,
        duration: programs.duration,
        studyMode: programs.studyMode,
        institutionId: institutions.id,
        institutionName: institutions.name,
        institutionCountry: institutions.country,
        institutionCity: institutions.city,
        ranking: institutions.ranking,
        isPartner: institutions.isPartner
      })
      .from(programs)
      .innerJoin(institutions, eq(programs.institutionId, institutions.id))
      .where(and(
        eq(programs.isActive, true),
        eq(institutions.isActive, true)
      ));

    if (filters.field) {
      query = query.where(eq(programs.field, filters.field));
    }
    if (filters.degree) {
      query = query.where(eq(programs.degree, filters.degree));
    }
    if (filters.country) {
      query = query.where(eq(institutions.country, filters.country));
    }
    if (filters.studyMode) {
      query = query.where(eq(programs.studyMode, filters.studyMode));
    }
    if (filters.searchTerm) {
      query = query.where(like(programs.name, `%${filters.searchTerm}%`));
    }

    return await query.orderBy(asc(institutions.country), asc(institutions.name));
  }

  async getProgramWithFees(programId: number) {
    const programData = await db
      .select({
        // Program details
        programId: programs.id,
        programName: programs.name,
        degree: programs.degree,
        field: programs.field,
        specialization: programs.specialization,
        duration: programs.duration,
        studyMode: programs.studyMode,
        language: programs.language,
        description: programs.description,
        curriculum: programs.curriculum,
        prerequisites: programs.prerequisites,
        careerOutcomes: programs.careerOutcomes,
        // Institution details
        institutionId: institutions.id,
        institutionName: institutions.name,
        institutionCountry: institutions.country,
        institutionCity: institutions.city,
        website: institutions.website,
        ranking: institutions.ranking,
        features: institutions.features,
        contactInfo: institutions.contactInfo
      })
      .from(programs)
      .innerJoin(institutions, eq(programs.institutionId, institutions.id))
      .where(and(
        eq(programs.id, programId),
        eq(programs.isActive, true),
        eq(institutions.isActive, true)
      ))
      .limit(1);

    if (!programData[0]) return null;

    // Get fee information
    const fees = await db
      .select()
      .from(programFees)
      .where(and(
        eq(programFees.programId, programId),
        eq(programFees.isActive, true)
      ))
      .orderBy(asc(programFees.studentType));

    return {
      ...programData[0],
      fees
    };
  }

  async createProgram(data: InsertProgram) {
    const result = await db.insert(programs).values(data).returning();
    return result[0];
  }

  async createProgramFees(data: InsertProgramFees) {
    const result = await db.insert(programFees).values(data).returning();
    return result[0];
  }

  // Student Applications
  async createStudentApplication(data: InsertStudentApplication) {
    const result = await db.insert(studentApplications).values(data).returning();
    return result[0];
  }

  async getStudentApplications(userId: number) {
    return await db
      .select({
        id: studentApplications.id,
        applicationStatus: studentApplications.applicationStatus,
        submittedAt: studentApplications.submittedAt,
        priority: studentApplications.priority,
        institutionName: institutions.name,
        institutionCountry: institutions.country,
        programName: programs.name,
        degree: programs.degree,
        field: programs.field,
        followUpDate: studentApplications.followUpDate,
        createdAt: studentApplications.createdAt
      })
      .from(studentApplications)
      .innerJoin(institutions, eq(studentApplications.institutionId, institutions.id))
      .innerJoin(programs, eq(studentApplications.programId, programs.id))
      .where(eq(studentApplications.userId, userId))
      .orderBy(desc(studentApplications.createdAt));
  }

  async updateApplicationStatus(applicationId: number, status: string, notes?: string) {
    const result = await db
      .update(studentApplications)
      .set({ 
        applicationStatus: status,
        counselorNotes: notes,
        updatedAt: new Date()
      })
      .where(eq(studentApplications.id, applicationId))
      .returning();
    
    return result[0] || null;
  }

  // Statistics and Analytics
  async getInstitutionStats() {
    const totalInstitutions = await db
      .select({ count: institutions.id })
      .from(institutions)
      .where(eq(institutions.isActive, true));

    const partnerInstitutions = await db
      .select({ count: institutions.id })
      .from(institutions)
      .where(and(eq(institutions.isActive, true), eq(institutions.isPartner, true)));

    const totalPrograms = await db
      .select({ count: programs.id })
      .from(programs)
      .where(eq(programs.isActive, true));

    const applicationStats = await db
      .select({ count: studentApplications.id })
      .from(studentApplications);

    return {
      totalInstitutions: totalInstitutions.length,
      partnerInstitutions: partnerInstitutions.length,
      totalPrograms: totalPrograms.length,
      totalApplications: applicationStats.length
    };
  }

  // Get featured/recommended institutions based on user profile
  async getRecommendedInstitutions(userProfile: {
    preferredCountries?: string[];
    fieldOfStudy?: string;
    studyLevel?: string;
    budgetRange?: string;
  }) {
    let query = db
      .select({
        id: institutions.id,
        name: institutions.name,
        country: institutions.country,
        city: institutions.city,
        ranking: institutions.ranking,
        isPartner: institutions.isPartner,
        features: institutions.features,
        programCount: programs.id
      })
      .from(institutions)
      .leftJoin(programs, eq(institutions.id, programs.institutionId))
      .where(and(
        eq(institutions.isActive, true),
        eq(institutions.isPartner, true) // Prioritize partner institutions
      ));

    if (userProfile.preferredCountries?.length) {
      // This would need to be adapted based on your DB setup for array queries
      // For now, checking first preferred country
      query = query.where(eq(institutions.country, userProfile.preferredCountries[0]));
    }

    const results = await query
      .groupBy(institutions.id, institutions.name, institutions.country, institutions.city)
      .orderBy(desc(institutions.isPartner), asc(institutions.name))
      .limit(6);

    return results;
  }
}

export const institutionStorage = new InstitutionStorage();