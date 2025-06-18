import { 
  users, analyses, appointments, professionalApplications, updates, userUpdateViews,
  documentTemplates, documentChecklists, enrollmentAnalyses,
  type User, type InsertUser, type Analysis, type InsertAnalysis, 
  type Appointment, type InsertAppointment, type LoginUser,
  type ProfessionalApplication, type InsertProfessionalApplication,
  type Update, type InsertUpdate, type UserUpdateView,
  type DocumentTemplate, type InsertDocumentTemplate,
  type DocumentChecklist, type InsertDocumentChecklist,
  type EnrollmentAnalysis, type InsertEnrollmentAnalysis
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull, isNotNull, sql, or, gt } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Password hashing functions
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
}

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(credentials: LoginUser): Promise<User | null>;
  
  // Admin methods
  getAllUsers(): Promise<User[]>;
  updateUser(userId: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(userId: number): Promise<boolean>;
  updateUserMaxAnalyses(userId: number, maxAnalyses: number): Promise<User | undefined>;
  updateUserRole(userId: number, role: string): Promise<User | undefined>;
  updateUserStatus(userId: number, status: string): Promise<User | undefined>;
  incrementUserAnalysisCount(userId: number): Promise<User | undefined>;
  
  // Email verification methods
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  verifyUserEmail(userId: number): Promise<User | undefined>;
  
  // Analysis methods
  saveAnalysis(analysis: InsertAnalysis, userId?: number): Promise<Analysis>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  getUserAnalyses(userId: number): Promise<Analysis[]>;
  getAllAnalyses(): Promise<Analysis[]>;
  getAllAnalysesWithUsers(): Promise<any[]>;
  getPublicAnalyses(): Promise<Analysis[]>;
  
  // Appointment methods
  createAppointment(appointment: any, userId: number): Promise<Appointment>;
  getUserAppointments(userId: number): Promise<Appointment[]>;
  getAllAppointmentsWithUsers(): Promise<any[]>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  
  // Professional application methods
  createProfessionalApplication(application: InsertProfessionalApplication): Promise<ProfessionalApplication>;
  getAllProfessionalApplications(): Promise<ProfessionalApplication[]>;
  updateProfessionalApplicationStatus(id: number, status: string, adminNotes?: string, reviewedBy?: number): Promise<ProfessionalApplication | undefined>;
  
  // Updates/Notifications methods
  createUpdate(update: InsertUpdate): Promise<Update>;
  getAllUpdates(): Promise<Update[]>;
  getUpdatesForUser(userId: number, userType?: string): Promise<Update[]>;
  getUpdate(id: number): Promise<Update | undefined>;
  updateUpdate(id: number, updates: Partial<Update>): Promise<Update | undefined>;
  deleteUpdate(id: number): Promise<boolean>;
  markUpdateAsViewed(userId: number, updateId: number): Promise<UserUpdateView>;
  markUpdateActionTaken(userId: number, updateId: number): Promise<UserUpdateView | undefined>;
  getUserUpdateViews(userId: number): Promise<UserUpdateView[]>;
  
  // Document Templates methods
  createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate>;
  getAllDocumentTemplates(): Promise<DocumentTemplate[]>;
  getActiveDocumentTemplates(): Promise<DocumentTemplate[]>;
  getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined>;
  updateDocumentTemplate(id: number, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate | undefined>;
  deleteDocumentTemplate(id: number): Promise<boolean>;
  
  // Document Checklists methods
  createDocumentChecklist(checklist: InsertDocumentChecklist): Promise<DocumentChecklist>;
  getAllDocumentChecklists(): Promise<DocumentChecklist[]>;
  getActiveDocumentChecklists(): Promise<DocumentChecklist[]>;
  getDocumentChecklist(id: number): Promise<DocumentChecklist | undefined>;
  updateDocumentChecklist(id: number, updates: Partial<DocumentChecklist>): Promise<DocumentChecklist | undefined>;
  deleteDocumentChecklist(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before saving
    const hashedPassword = await hashPassword(insertUser.password);
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword
      })
      .returning();
    return user;
  }
  
  async authenticateUser(credentials: LoginUser): Promise<User | null> {
    const user = await this.getUserByUsername(credentials.username);
    
    if (!user) {
      return null;
    }
    
    const passwordValid = await comparePasswords(credentials.password, user.password);
    return passwordValid ? user : null;
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async updateUserMaxAnalyses(userId: number, maxAnalyses: number): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ maxAnalyses })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  }

  async updateUserRole(userId: number, role: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  }

  async updateUserStatus(userId: number, status: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ status })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  }

  async updateUser(userId: number, updates: Partial<User>): Promise<User | undefined> {
    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    // Remove any undefined fields and fields that shouldn't be updated directly
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    const [updatedUser] = await db
      .update(users)
      .set(cleanUpdates)
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser || undefined;
  }

  async deleteUser(userId: number): Promise<boolean> {
    try {
      // First delete related data to maintain referential integrity
      await db.delete(analyses).where(eq(analyses.userId, userId));
      await db.delete(appointments).where(eq(appointments.userId, userId));
      
      // Then delete the user
      const result = await db.delete(users).where(eq(users.id, userId));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async incrementUserAnalysisCount(userId: number): Promise<User | undefined> {
    const currentUser = await this.getUser(userId);
    if (!currentUser) return undefined;
    
    const [updatedUser] = await db
      .update(users)
      .set({ analysisCount: currentUser.analysisCount + 1 })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  }
  
  // Analysis methods
  async saveAnalysis(analysisData: InsertAnalysis, userId?: number): Promise<Analysis> {
    const [analysis] = await db
      .insert(analyses)
      .values({
        ...analysisData,
        userId: userId || null,
        isPublic: false
      })
      .returning();
    return analysis;
  }
  
  async getAnalysis(id: number): Promise<Analysis | undefined> {
    const [analysis] = await db.select().from(analyses).where(eq(analyses.id, id));
    return analysis || undefined;
  }
  
  async getUserAnalyses(userId: number): Promise<Analysis[]> {
    const results = await db
      .select()
      .from(analyses)
      .where(eq(analyses.userId, userId))
      .orderBy(desc(analyses.id));
    
    // Structure the analysis results for frontend consumption
    return results.map(analysis => ({
      ...analysis,
      results: {
        summary: analysis.summary,
        rejectionReasons: analysis.rejectionReasons,
        recommendations: analysis.recommendations,
        nextSteps: analysis.nextSteps
      }
    }));
  }
  
  async getAllAnalyses(): Promise<Analysis[]> {
    return await db.select().from(analyses).orderBy(desc(analyses.id));
  }
  
  async getAllAnalysesWithUsers(): Promise<any[]> {
    const result = await db
      .select({
        id: analyses.id,
        userId: analyses.userId,
        fileName: analyses.filename,
        analysisResults: {
          summary: analyses.summary,
          rejectionReasons: analyses.rejectionReasons,
          recommendations: analyses.recommendations,
          nextSteps: analyses.nextSteps,
        },
        createdAt: analyses.createdAt,
        isPublic: analyses.isPublic,
        user: {
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        }
      })
      .from(analyses)
      .leftJoin(users, eq(analyses.userId, users.id))
      .orderBy(desc(analyses.createdAt));
    return result;
  }

  async getPublicAnalyses(): Promise<Analysis[]> {
    return await db
      .select()
      .from(analyses)
      .where(eq(analyses.isPublic, true))
      .orderBy(desc(analyses.id));
  }
  
  // Appointment methods
  async createAppointment(appointmentData: any, userId: number): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values({
        ...appointmentData,
        userId
      })
      .returning();
    return appointment;
  }
  
  async getUserAppointments(userId: number): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, userId))
      .orderBy(desc(appointments.createdAt));
  }

  async getAllAppointmentsWithUsers(): Promise<any[]> {
    const result = await db
      .select({
        id: appointments.id,
        userId: appointments.userId,
        fullName: appointments.name,
        email: appointments.email,
        phoneNumber: appointments.phoneNumber,
        preferredDate: appointments.requestedDate,
        message: appointments.message,
        status: appointments.status,
        createdAt: appointments.createdAt,
        user: {
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          analysisCount: users.analysisCount,
          maxAnalyses: users.maxAnalyses,
        }
      })
      .from(appointments)
      .leftJoin(users, eq(appointments.userId, users.id))
      .orderBy(desc(appointments.createdAt));
    return result;
  }
  
  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const [appointment] = await db
      .update(appointments)
      .set({ status })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  // Professional application methods
  async createProfessionalApplication(applicationData: InsertProfessionalApplication): Promise<ProfessionalApplication> {
    const [application] = await db
      .insert(professionalApplications)
      .values(applicationData)
      .returning();
    return application;
  }

  async getAllProfessionalApplications(): Promise<ProfessionalApplication[]> {
    return await db
      .select()
      .from(professionalApplications)
      .orderBy(desc(professionalApplications.createdAt));
  }

  async updateProfessionalApplicationStatus(
    id: number, 
    status: string, 
    adminNotes?: string, 
    reviewedBy?: number
  ): Promise<ProfessionalApplication | undefined> {
    const [application] = await db
      .update(professionalApplications)
      .set({ 
        status, 
        adminNotes,
        reviewedBy,
        reviewedAt: new Date()
      })
      .where(eq(professionalApplications.id, id))
      .returning();
    return application;
  }

  // Email verification methods
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token));
    return user || undefined;
  }

  async verifyUserEmail(userId: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        emailVerified: true, 
        emailVerificationToken: null,
        status: 'active' // Activate user account after email verification
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  // Updates/Notifications methods
  async createUpdate(updateData: InsertUpdate): Promise<Update> {
    try {
      const [update] = await db.insert(updates).values(updateData).returning();
      return update;
    } catch (error) {
      console.error("Error creating update:", error);
      throw error;
    }
  }

  async getAllUpdates(): Promise<Update[]> {
    try {
      const allUpdates = await db.select().from(updates).orderBy(desc(updates.createdAt));
      return allUpdates;
    } catch (error) {
      console.error("Error fetching all updates:", error);
      return [];
    }
  }

  async getUpdatesForUser(userId: number, userType?: string): Promise<any[]> {
    try {
      // Get user info if userType not provided
      let targetUserType = userType;
      if (!targetUserType) {
        const user = await this.getUser(userId);
        targetUserType = user?.userType || 'student';
      }

      const userUpdates = await db
        .select({
          id: updates.id,
          title: updates.title,
          content: updates.content,
          summary: updates.summary,
          imageUrl: updates.imageUrl,
          type: updates.type,
          priority: updates.priority,
          targetAudience: updates.targetAudience,
          targetVisaCategories: updates.targetVisaCategories,
          targetUserIds: updates.targetUserIds,
          callToAction: updates.callToAction,
          externalLink: updates.externalLink,
          isActive: updates.isActive,
          expiresAt: updates.expiresAt,
          createdAt: updates.createdAt,
          updatedAt: updates.updatedAt,
          isViewed: userUpdateViews.viewedAt,
          actionTaken: userUpdateViews.actionTaken,
        })
        .from(updates)
        .leftJoin(
          userUpdateViews,
          and(
            eq(userUpdateViews.updateId, updates.id),
            eq(userUpdateViews.userId, userId)
          )
        )
        .where(
          and(
            eq(updates.isActive, true),
            or(
              eq(updates.targetAudience, 'all'),
              eq(updates.targetAudience, targetUserType),
              sql`${updates.targetUserIds} @> ARRAY[${userId}]::integer[]`
            ),
            or(
              isNull(updates.expiresAt),
              gt(updates.expiresAt, new Date())
            )
          )
        )
        .orderBy(desc(updates.priority), desc(updates.createdAt));
      
      return userUpdates.map(update => ({
        ...update,
        isViewed: !!update.isViewed,
        actionTaken: !!update.actionTaken
      }));
    } catch (error) {
      console.error("Error fetching user updates:", error);
      return [];
    }
  }

  async getUpdate(id: number): Promise<Update | undefined> {
    try {
      const [update] = await db.select().from(updates).where(eq(updates.id, id));
      return update;
    } catch (error) {
      console.error("Error fetching update:", error);
      return undefined;
    }
  }

  async updateUpdate(id: number, updateData: Partial<Update>): Promise<Update | undefined> {
    try {
      const [update] = await db
        .update(updates)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(updates.id, id))
        .returning();
      return update;
    } catch (error) {
      console.error("Error updating update:", error);
      return undefined;
    }
  }

  async deleteUpdate(id: number): Promise<boolean> {
    try {
      // First delete all user update views for this update
      await db.delete(userUpdateViews).where(eq(userUpdateViews.updateId, id));
      
      // Then delete the update itself
      await db.delete(updates).where(eq(updates.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting update:", error);
      return false;
    }
  }

  async markUpdateAsViewed(userId: number, updateId: number): Promise<UserUpdateView> {
    try {
      // Check if already viewed
      const existing = await db
        .select()
        .from(userUpdateViews)
        .where(and(eq(userUpdateViews.userId, userId), eq(userUpdateViews.updateId, updateId)));

      if (existing.length > 0) {
        return existing[0];
      }

      const [view] = await db
        .insert(userUpdateViews)
        .values({ userId, updateId })
        .returning();
      return view;
    } catch (error) {
      console.error("Error marking update as viewed:", error);
      throw error;
    }
  }

  async markUpdateActionTaken(userId: number, updateId: number): Promise<UserUpdateView | undefined> {
    try {
      const [view] = await db
        .update(userUpdateViews)
        .set({ actionTaken: true })
        .where(and(eq(userUpdateViews.userId, userId), eq(userUpdateViews.updateId, updateId)))
        .returning();
      return view;
    } catch (error) {
      console.error("Error marking update action taken:", error);
      return undefined;
    }
  }

  async getUserUpdateViews(userId: number): Promise<UserUpdateView[]> {
    try {
      const views = await db
        .select()
        .from(userUpdateViews)
        .where(eq(userUpdateViews.userId, userId));
      return views;
    } catch (error) {
      console.error("Error fetching user update views:", error);
      return [];
    }
  }

  // Document Templates methods
  async createDocumentTemplate(templateData: InsertDocumentTemplate): Promise<DocumentTemplate> {
    try {
      const [template] = await db
        .insert(documentTemplates)
        .values(templateData)
        .returning();
      return template;
    } catch (error) {
      console.error("Error creating document template:", error);
      throw error;
    }
  }

  async getAllDocumentTemplates(): Promise<DocumentTemplate[]> {
    try {
      const templates = await db
        .select()
        .from(documentTemplates)
        .orderBy(desc(documentTemplates.createdAt));
      return templates;
    } catch (error) {
      console.error("Error fetching all document templates:", error);
      return [];
    }
  }

  async getActiveDocumentTemplates(): Promise<DocumentTemplate[]> {
    try {
      const templates = await db
        .select()
        .from(documentTemplates)
        .where(eq(documentTemplates.isActive, true))
        .orderBy(desc(documentTemplates.createdAt));
      return templates;
    } catch (error) {
      console.error("Error fetching active document templates:", error);
      return [];
    }
  }

  async getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined> {
    try {
      const [template] = await db
        .select()
        .from(documentTemplates)
        .where(eq(documentTemplates.id, id));
      return template;
    } catch (error) {
      console.error("Error fetching document template:", error);
      return undefined;
    }
  }

  async updateDocumentTemplate(id: number, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate | undefined> {
    try {
      const [template] = await db
        .update(documentTemplates)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(documentTemplates.id, id))
        .returning();
      return template;
    } catch (error) {
      console.error("Error updating document template:", error);
      return undefined;
    }
  }

  async deleteDocumentTemplate(id: number): Promise<boolean> {
    try {
      await db.delete(documentTemplates).where(eq(documentTemplates.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting document template:", error);
      return false;
    }
  }

  // Document Checklists methods
  async createDocumentChecklist(checklistData: InsertDocumentChecklist): Promise<DocumentChecklist> {
    try {
      const [checklist] = await db
        .insert(documentChecklists)
        .values(checklistData)
        .returning();
      return checklist;
    } catch (error) {
      console.error("Error creating document checklist:", error);
      throw error;
    }
  }

  async getAllDocumentChecklists(): Promise<DocumentChecklist[]> {
    try {
      const checklists = await db
        .select()
        .from(documentChecklists)
        .orderBy(desc(documentChecklists.createdAt));
      return checklists;
    } catch (error) {
      console.error("Error fetching all document checklists:", error);
      return [];
    }
  }

  async getActiveDocumentChecklists(): Promise<DocumentChecklist[]> {
    try {
      const checklists = await db
        .select()
        .from(documentChecklists)
        .where(eq(documentChecklists.isActive, true))
        .orderBy(desc(documentChecklists.createdAt));
      return checklists;
    } catch (error) {
      console.error("Error fetching active document checklists:", error);
      return [];
    }
  }

  async getDocumentChecklist(id: number): Promise<DocumentChecklist | undefined> {
    try {
      const [checklist] = await db
        .select()
        .from(documentChecklists)
        .where(eq(documentChecklists.id, id));
      return checklist;
    } catch (error) {
      console.error("Error fetching document checklist:", error);
      return undefined;
    }
  }

  async updateDocumentChecklist(id: number, updates: Partial<DocumentChecklist>): Promise<DocumentChecklist | undefined> {
    try {
      // Deep clone to prevent reference issues and validate all data
      const sanitizedUpdates: any = {};
      
      // Copy non-JSON fields directly
      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'items' && key !== 'importantNotes') {
          sanitizedUpdates[key] = value;
        }
      }
      
      // Handle items array for JSONB column (keep as JavaScript array)
      if (updates.items !== undefined) {
        if (Array.isArray(updates.items)) {
          sanitizedUpdates.items = updates.items.map((item: any) => {
            const validatedItem = {
              id: String(item.id || '').trim(),
              name: String(item.name || '').trim(),
              description: String(item.description || '').trim(),
              category: String(item.category || 'documentation'),
              required: Boolean(item.required),
              completed: Boolean(item.completed),
              order: parseInt(String(item.order)) || 0,
              tips: []
            };
            
            // Validate tips array
            if (Array.isArray(item.tips)) {
              validatedItem.tips = item.tips
                .filter((tip: any) => tip && typeof tip === 'string')
                .map((tip: any) => String(tip).trim())
                .filter((tip: string) => tip.length > 0);
            }
            
            return validatedItem;
          });
        } else {
          sanitizedUpdates.items = [];
        }
      }
      
      // Handle importantNotes array for PostgreSQL array column (keep as JavaScript array)
      if (updates.importantNotes !== undefined) {
        if (Array.isArray(updates.importantNotes)) {
          sanitizedUpdates.importantNotes = updates.importantNotes
            .filter((note: any) => note !== null && note !== undefined)
            .map((note: any) => String(note).trim())
            .filter((note: string) => note.length > 0);
        } else if (typeof updates.importantNotes === 'string') {
          const trimmedNote = String(updates.importantNotes).trim();
          sanitizedUpdates.importantNotes = trimmedNote.length > 0 ? [trimmedNote] : [];
        } else {
          sanitizedUpdates.importantNotes = [];
        }
      }
      
      // Ensure proper timestamp
      sanitizedUpdates.updatedAt = new Date();
      
      const [checklist] = await db
        .update(documentChecklists)
        .set(sanitizedUpdates)
        .where(eq(documentChecklists.id, id))
        .returning();
      return checklist;
    } catch (error) {
      console.error("Error updating document checklist:", error);
      throw error;
    }
  }

  async deleteDocumentChecklist(id: number): Promise<boolean> {
    try {
      await db.delete(documentChecklists).where(eq(documentChecklists.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting document checklist:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
