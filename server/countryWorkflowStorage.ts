import { db } from "./db";
import { 
  countryWorkflows, 
  // applicationChecklistItems, // TODO: Define this table
  userApplications, 
  consultationBookings,
  type CountryWorkflow,
  type InsertCountryWorkflow,
  // type ApplicationChecklistItem,
  // type InsertApplicationChecklistItem,
  type UserApplication,
  type InsertUserApplication,
  type ConsultationBooking,
  type InsertConsultationBooking
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export class CountryWorkflowStorage {
  // Country Workflow Management
  async createWorkflow(workflow: InsertCountryWorkflow): Promise<CountryWorkflow> {
    const [created] = await db.insert(countryWorkflows).values(workflow).returning();
    return created;
  }

  async getWorkflows(): Promise<CountryWorkflow[]> {
    return await db.select().from(countryWorkflows).orderBy(desc(countryWorkflows.createdAt));
  }

  async getWorkflow(id: number): Promise<CountryWorkflow | undefined> {
    const [workflow] = await db.select().from(countryWorkflows).where(eq(countryWorkflows.id, id));
    return workflow;
  }

  async getWorkflowByCountry(countryCode: string, studyLevel: string): Promise<CountryWorkflow | undefined> {
    const [workflow] = await db.select()
      .from(countryWorkflows)
      .where(and(
        eq(countryWorkflows.countryCode, countryCode),
        eq(countryWorkflows.studyLevel, studyLevel),
        eq(countryWorkflows.isActive, true)
      ));
    return workflow;
  }

  async updateWorkflow(id: number, updates: Partial<InsertCountryWorkflow>): Promise<CountryWorkflow | undefined> {
    const [updated] = await db.update(countryWorkflows)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(countryWorkflows.id, id))
      .returning();
    return updated;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    const result = await db.delete(countryWorkflows).where(eq(countryWorkflows.id, id));
    return result.rowCount > 0;
  }

  async getSupportedCountries(): Promise<Array<{ countryCode: string; countryName: string; studyLevels: string[] }>> {
    const workflows = await db.select({
      countryCode: countryWorkflows.countryCode,
      countryName: countryWorkflows.countryName,
      studyLevel: countryWorkflows.studyLevel
    }).from(countryWorkflows).where(eq(countryWorkflows.isActive, true));

    // Group by country and collect study levels
    const countryMap = new Map<string, { countryCode: string; countryName: string; studyLevels: string[] }>();
    
    workflows.forEach(workflow => {
      const key = workflow.countryCode;
      if (!countryMap.has(key)) {
        countryMap.set(key, {
          countryCode: workflow.countryCode,
          countryName: workflow.countryName,
          studyLevels: []
        });
      }
      const country = countryMap.get(key)!;
      if (!country.studyLevels.includes(workflow.studyLevel)) {
        country.studyLevels.push(workflow.studyLevel);
      }
    });

    return Array.from(countryMap.values());
  }

  // Checklist Items Management
  async createChecklistItem(item: InsertApplicationChecklistItem): Promise<ApplicationChecklistItem> {
    const [created] = await db.insert(applicationChecklistItems).values(item).returning();
    return created;
  }

  async getChecklistItems(workflowId: number): Promise<ApplicationChecklistItem[]> {
    return await db.select()
      .from(applicationChecklistItems)
      .where(eq(applicationChecklistItems.workflowId, workflowId))
      .orderBy(applicationChecklistItems.sortOrder);
  }

  async updateChecklistItem(id: number, updates: Partial<InsertApplicationChecklistItem>): Promise<ApplicationChecklistItem | undefined> {
    const [updated] = await db.update(applicationChecklistItems)
      .set(updates)
      .where(eq(applicationChecklistItems.id, id))
      .returning();
    return updated;
  }

  async deleteChecklistItem(id: number): Promise<boolean> {
    const result = await db.delete(applicationChecklistItems).where(eq(applicationChecklistItems.id, id));
    return result.rowCount > 0;
  }

  // User Applications Management
  async createUserApplication(application: InsertUserApplication): Promise<UserApplication> {
    const [created] = await db.insert(userApplications).values(application).returning();
    return created;
  }

  async getUserApplications(userId: number): Promise<UserApplication[]> {
    return await db.select()
      .from(userApplications)
      .where(eq(userApplications.userId, userId))
      .orderBy(desc(userApplications.createdAt));
  }

  async getUserApplication(id: number): Promise<UserApplication | undefined> {
    const [application] = await db.select().from(userApplications).where(eq(userApplications.id, id));
    return application;
  }

  async getUserApplicationByWorkflow(userId: number, workflowId: number): Promise<UserApplication | undefined> {
    const [application] = await db.select()
      .from(userApplications)
      .where(and(
        eq(userApplications.userId, userId),
        eq(userApplications.workflowId, workflowId)
      ));
    return application;
  }

  async updateUserApplication(id: number, updates: Partial<InsertUserApplication>): Promise<UserApplication | undefined> {
    const [updated] = await db.update(userApplications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userApplications.id, id))
      .returning();
    return updated;
  }

  async updateApplicationProgress(
    id: number, 
    applicationData: Record<string, any>, 
    completedItems: number[], 
    progressPercentage: number
  ): Promise<UserApplication | undefined> {
    const [updated] = await db.update(userApplications)
      .set({
        applicationData,
        completedItems,
        progressPercentage,
        updatedAt: new Date()
      })
      .where(eq(userApplications.id, id))
      .returning();
    return updated;
  }

  // Consultation Bookings Management
  async createConsultationBooking(booking: InsertConsultationBooking): Promise<ConsultationBooking> {
    const [created] = await db.insert(consultationBookings).values(booking).returning();
    return created;
  }

  async getConsultationBookings(userId?: number): Promise<ConsultationBooking[]> {
    if (userId) {
      return await db.select()
        .from(consultationBookings)
        .where(eq(consultationBookings.userId, userId))
        .orderBy(desc(consultationBookings.createdAt));
    }
    return await db.select()
      .from(consultationBookings)
      .orderBy(desc(consultationBookings.createdAt));
  }

  async getConsultationBooking(id: number): Promise<ConsultationBooking | undefined> {
    const [booking] = await db.select().from(consultationBookings).where(eq(consultationBookings.id, id));
    return booking;
  }

  async updateConsultationBooking(id: number, updates: Partial<InsertConsultationBooking>): Promise<ConsultationBooking | undefined> {
    const [updated] = await db.update(consultationBookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(consultationBookings.id, id))
      .returning();
    return updated;
  }

  async deleteConsultationBooking(id: number): Promise<boolean> {
    const result = await db.delete(consultationBookings).where(eq(consultationBookings.id, id));
    return result.rowCount > 0;
  }

  // Analytics and Statistics
  async getWorkflowStats() {
    const totalWorkflows = await db.select().from(countryWorkflows);
    const activeWorkflows = await db.select().from(countryWorkflows).where(eq(countryWorkflows.isActive, true));
    const totalApplications = await db.select().from(userApplications);
    const totalBookings = await db.select().from(consultationBookings);

    return {
      totalWorkflows: totalWorkflows.length,
      activeWorkflows: activeWorkflows.length,
      totalApplications: totalApplications.length,
      totalConsultationBookings: totalBookings.length,
      supportedCountries: [...new Set(activeWorkflows.map(w => w.countryCode))].length
    };
  }
}

export const countryWorkflowStorage = new CountryWorkflowStorage();