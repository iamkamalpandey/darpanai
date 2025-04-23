import { 
  users, analyses, appointments,
  type User, type InsertUser, type Analysis, type InsertAnalysis, 
  type Appointment, type InsertAppointment, type LoginUser
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull, isNotNull } from "drizzle-orm";
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
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(credentials: LoginUser): Promise<User | null>;
  
  // Analysis methods
  saveAnalysis(analysis: InsertAnalysis, userId?: number): Promise<Analysis>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  getUserAnalyses(userId: number): Promise<Analysis[]>;
  getAllAnalyses(): Promise<Analysis[]>;
  getPublicAnalyses(): Promise<Analysis[]>;
  
  // Appointment methods
  createAppointment(appointment: InsertAppointment, userId: number): Promise<Appointment>;
  getUserAppointments(userId: number): Promise<Appointment[]>;
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
    return await db
      .select()
      .from(analyses)
      .where(eq(analyses.userId, userId))
      .orderBy(desc(analyses.id));
  }
  
  async getAllAnalyses(): Promise<Analysis[]> {
    return await db.select().from(analyses).orderBy(desc(analyses.id));
  }
  
  async getPublicAnalyses(): Promise<Analysis[]> {
    return await db
      .select()
      .from(analyses)
      .where(eq(analyses.isPublic, true))
      .orderBy(desc(analyses.id));
  }
  
  // Appointment methods
  async createAppointment(appointmentData: InsertAppointment, userId: number): Promise<Appointment> {
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
  
  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const [appointment] = await db
      .update(appointments)
      .set({ status })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }
}

export const storage = new DatabaseStorage();
