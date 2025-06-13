import { 
  users, analyses, appointments,
  type User, type InsertUser, type Analysis, type InsertAnalysis, 
  type Appointment, type InsertAppointment, type LoginUser
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull, isNotNull, sql } from "drizzle-orm";
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
}

export const storage = new DatabaseStorage();
