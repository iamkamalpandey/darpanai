import { studentApplications, applicationStatusHistory, applicationRequirements, users, type StudentApplication, type InsertStudentApplication, type InsertApplicationStatusHistory } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, count, sql } from "drizzle-orm";
import { randomBytes } from "crypto";

export class StudentApplicationService {
  // Generate unique application number
  private generateApplicationNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(4).toString('hex').toUpperCase();
    return `APP-${timestamp}-${random}`;
  }

  // Create new student application
  async createApplication(userId: number, initialData: Partial<InsertStudentApplication>): Promise<StudentApplication> {
    const applicationNumber = this.generateApplicationNumber();
    
    const applicationData: InsertStudentApplication = {
      userId,
      applicationNumber,
      status: 'draft',
      targetCountry: initialData.targetCountry || '',
      studyLevel: initialData.studyLevel || '',
      fieldOfStudy: initialData.fieldOfStudy || '',
      preferredIntake: initialData.preferredIntake || '',
      budgetRange: initialData.budgetRange || '',
      fundingSource: initialData.fundingSource || '',
      personalDetails: initialData.personalDetails || {},
      academicDetails: initialData.academicDetails || {},
      currentStep: 'personal_info',
      progressPercentage: 0,
      completedSteps: [],
      requiredDocuments: [],
      uploadedDocuments: [],
      documentStatus: {},
      communicationLog: [],
      studentQueries: [],
      termsAccepted: false,
      dataProcessingConsent: false,
      ...initialData,
    };

    const [application] = await db
      .insert(studentApplications)
      .values(applicationData)
      .returning();

    // Create initial status history
    await this.addStatusHistory(application.id, null, 'draft', userId, 'Application created');

    return application;
  }

  // Get user applications
  async getUserApplications(userId: number): Promise<StudentApplication[]> {
    return await db
      .select()
      .from(studentApplications)
      .where(eq(studentApplications.userId, userId))
      .orderBy(desc(studentApplications.createdAt));
  }

  // Get application by ID
  async getApplicationById(applicationId: number): Promise<StudentApplication | null> {
    const [application] = await db
      .select()
      .from(studentApplications)
      .where(eq(studentApplications.id, applicationId));
    
    return application || null;
  }

  // Update application step data
  async updateApplicationStep(applicationId: number, stepData: Partial<StudentApplication>): Promise<StudentApplication> {
    const [updated] = await db
      .update(studentApplications)
      .set({
        ...stepData,
        updatedAt: new Date(),
      })
      .where(eq(studentApplications.id, applicationId))
      .returning();

    return updated;
  }

  // Update application status
  async updateApplicationStatus(
    applicationId: number, 
    newStatus: string, 
    changedBy: number,
    reason?: string,
    notes?: string
  ): Promise<void> {
    // Get current status
    const [currentApp] = await db
      .select({ status: studentApplications.status })
      .from(studentApplications)
      .where(eq(studentApplications.id, applicationId));

    if (!currentApp) throw new Error('Application not found');

    // Update application status
    await db
      .update(studentApplications)
      .set({ 
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === 'submitted' && { submittedAt: new Date() }),
        ...(newStatus === 'under_review' && { reviewStartedAt: new Date() }),
        ...(newStatus === 'documents_requested' && { documentRequestedAt: new Date() }),
        ...(newStatus === 'approved' || newStatus === 'rejected' ? { completedAt: new Date() } : {}),
      })
      .where(eq(studentApplications.id, applicationId));

    // Add status history
    await this.addStatusHistory(applicationId, currentApp.status, newStatus, changedBy, reason, notes);
  }

  // Add status history entry
  private async addStatusHistory(
    applicationId: number,
    previousStatus: string | null,
    newStatus: string,
    changedBy: number,
    reason?: string,
    notes?: string
  ): Promise<void> {
    const historyData: InsertApplicationStatusHistory = {
      applicationId,
      previousStatus,
      newStatus,
      changedBy,
      reason,
      notes,
    };

    await db.insert(applicationStatusHistory).values(historyData);
  }

  // Get application status history
  async getApplicationStatusHistory(applicationId: number) {
    return await db
      .select({
        id: applicationStatusHistory.id,
        previousStatus: applicationStatusHistory.previousStatus,
        newStatus: applicationStatusHistory.newStatus,
        reason: applicationStatusHistory.reason,
        notes: applicationStatusHistory.notes,
        createdAt: applicationStatusHistory.createdAt,
        changedBy: users.username,
        changedByName: sql`${users.firstName} || ' ' || ${users.lastName}`.as('changedByName'),
      })
      .from(applicationStatusHistory)
      .leftJoin(users, eq(applicationStatusHistory.changedBy, users.id))
      .where(eq(applicationStatusHistory.applicationId, applicationId))
      .orderBy(desc(applicationStatusHistory.createdAt));
  }

  // Get all applications for admin
  async getAllApplications(filters?: {
    status?: string;
    country?: string;
    studyLevel?: string;
    assignedCounselor?: string;
    priority?: string;
  }) {
    let query = db
      .select({
        id: studentApplications.id,
        applicationNumber: studentApplications.applicationNumber,
        status: studentApplications.status,
        priority: studentApplications.priority,
        targetCountry: studentApplications.targetCountry,
        studyLevel: studentApplications.studyLevel,
        fieldOfStudy: studentApplications.fieldOfStudy,
        preferredIntake: studentApplications.preferredIntake,
        progressPercentage: studentApplications.progressPercentage,
        assignedCounselor: studentApplications.assignedCounselor,
        submittedAt: studentApplications.submittedAt,
        createdAt: studentApplications.createdAt,
        updatedAt: studentApplications.updatedAt,
        userName: sql`${users.firstName} || ' ' || ${users.lastName}`.as('userName'),
        userEmail: users.email,
        userPhone: users.phoneNumber,
      })
      .from(studentApplications)
      .leftJoin(users, eq(studentApplications.userId, users.id));

    if (filters) {
      const conditions = [];
      if (filters.status) conditions.push(eq(studentApplications.status, filters.status));
      if (filters.country) conditions.push(eq(studentApplications.targetCountry, filters.country));
      if (filters.studyLevel) conditions.push(eq(studentApplications.studyLevel, filters.studyLevel));
      if (filters.assignedCounselor) conditions.push(eq(studentApplications.assignedCounselor, filters.assignedCounselor));
      if (filters.priority) conditions.push(eq(studentApplications.priority, filters.priority));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    return await query.orderBy(desc(studentApplications.createdAt));
  }

  // Get application statistics
  async getApplicationStatistics() {
    const stats = await db
      .select({
        total: count(),
        status: studentApplications.status,
      })
      .from(studentApplications)
      .groupBy(studentApplications.status);

    const countryStats = await db
      .select({
        total: count(),
        country: studentApplications.targetCountry,
      })
      .from(studentApplications)
      .groupBy(studentApplications.targetCountry)
      .orderBy(desc(count()));

    const levelStats = await db
      .select({
        total: count(),
        level: studentApplications.studyLevel,
      })
      .from(studentApplications)
      .groupBy(studentApplications.studyLevel);

    return {
      statusBreakdown: stats,
      popularCountries: countryStats,
      studyLevelDistribution: levelStats,
    };
  }

  // Complete application step
  async completeApplicationStep(applicationId: number, stepName: string): Promise<void> {
    const [application] = await db
      .select()
      .from(studentApplications)
      .where(eq(studentApplications.id, applicationId));

    if (!application) throw new Error('Application not found');

    const completedSteps = application.completedSteps as string[] || [];
    if (!completedSteps.includes(stepName)) {
      completedSteps.push(stepName);
    }

    // Calculate progress percentage
    const totalSteps = ['personal_info', 'academic_info', 'documents', 'review'];
    const progressPercentage = Math.round((completedSteps.length / totalSteps.length) * 100);

    // Determine next step
    const stepOrder = ['personal_info', 'academic_info', 'documents', 'review', 'submit'];
    const currentStepIndex = stepOrder.indexOf(stepName);
    const nextStep = currentStepIndex < stepOrder.length - 1 ? stepOrder[currentStepIndex + 1] : 'submit';

    await db
      .update(studentApplications)
      .set({
        completedSteps,
        progressPercentage,
        currentStep: nextStep,
        updatedAt: new Date(),
      })
      .where(eq(studentApplications.id, applicationId));
  }

  // Add document to application
  async addDocument(applicationId: number, document: {
    documentType: string;
    fileName: string;
    filePath: string;
    uploadedAt: string;
  }): Promise<void> {
    const [application] = await db
      .select()
      .from(studentApplications)
      .where(eq(studentApplications.id, applicationId));

    if (!application) throw new Error('Application not found');

    const uploadedDocuments = application.uploadedDocuments as any[] || [];
    uploadedDocuments.push(document);

    await db
      .update(studentApplications)
      .set({
        uploadedDocuments,
        updatedAt: new Date(),
      })
      .where(eq(studentApplications.id, applicationId));
  }

  // Submit application for review
  async submitApplication(applicationId: number): Promise<void> {
    await this.updateApplicationStatus(applicationId, 'submitted', 0, 'Application submitted by student');
    
    // Auto-assign to available counselor (simple round-robin)
    const admins = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.role, 'admin'));

    if (admins.length > 0) {
      const randomAdmin = admins[Math.floor(Math.random() * admins.length)];
      await db
        .update(studentApplications)
        .set({
          assignedCounselor: randomAdmin.username,
          updatedAt: new Date(),
        })
        .where(eq(studentApplications.id, applicationId));
    }
  }

  // Get applications assigned to counselor
  async getCounselorApplications(counselorUsername: string) {
    return await db
      .select({
        id: studentApplications.id,
        applicationNumber: studentApplications.applicationNumber,
        status: studentApplications.status,
        priority: studentApplications.priority,
        targetCountry: studentApplications.targetCountry,
        studyLevel: studentApplications.studyLevel,
        fieldOfStudy: studentApplications.fieldOfStudy,
        progressPercentage: studentApplications.progressPercentage,
        submittedAt: studentApplications.submittedAt,
        followUpDate: studentApplications.followUpDate,
        userName: sql`${users.firstName} || ' ' || ${users.lastName}`.as('userName'),
        userEmail: users.email,
        userPhone: users.phoneNumber,
      })
      .from(studentApplications)
      .leftJoin(users, eq(studentApplications.userId, users.id))
      .where(eq(studentApplications.assignedCounselor, counselorUsername))
      .orderBy(desc(studentApplications.updatedAt));
  }

  // Add communication log entry
  async addCommunicationLog(applicationId: number, entry: {
    type: 'email' | 'phone' | 'message' | 'note';
    subject?: string;
    content: string;
    direction: 'incoming' | 'outgoing';
    userId?: number;
    timestamp: string;
  }): Promise<void> {
    const [application] = await db
      .select()
      .from(studentApplications)
      .where(eq(studentApplications.id, applicationId));

    if (!application) throw new Error('Application not found');

    const communicationLog = application.communicationLog as any[] || [];
    communicationLog.push(entry);

    await db
      .update(studentApplications)
      .set({
        communicationLog,
        lastContactDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(studentApplications.id, applicationId));
  }

  // Get application requirements for country/level
  async getApplicationRequirements(country: string, studyLevel: string) {
    const [requirements] = await db
      .select()
      .from(applicationRequirements)
      .where(and(
        eq(applicationRequirements.country, country),
        eq(applicationRequirements.studyLevel, studyLevel),
        eq(applicationRequirements.isActive, true)
      ));

    return requirements;
  }

  // Search applications
  async searchApplications(searchTerm: string) {
    return await db
      .select({
        id: studentApplications.id,
        applicationNumber: studentApplications.applicationNumber,
        status: studentApplications.status,
        targetCountry: studentApplications.targetCountry,
        studyLevel: studentApplications.studyLevel,
        fieldOfStudy: studentApplications.fieldOfStudy,
        userName: sql`${users.firstName} || ' ' || ${users.lastName}`.as('userName'),
        userEmail: users.email,
      })
      .from(studentApplications)
      .leftJoin(users, eq(studentApplications.userId, users.id))
      .where(or(
        sql`${studentApplications.applicationNumber} ILIKE ${`%${searchTerm}%`}`,
        sql`${studentApplications.targetCountry} ILIKE ${`%${searchTerm}%`}`,
        sql`${studentApplications.fieldOfStudy} ILIKE ${`%${searchTerm}%`}`,
        sql`${users.firstName} ILIKE ${`%${searchTerm}%`}`,
        sql`${users.lastName} ILIKE ${`%${searchTerm}%`}`,
        sql`${users.email} ILIKE ${`%${searchTerm}%`}`
      ))
      .orderBy(desc(studentApplications.updatedAt));
  }
}

// Export singleton instance
export const studentApplicationService = new StudentApplicationService();