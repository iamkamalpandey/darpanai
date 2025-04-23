import { users, analyses, type User, type InsertUser, type Analysis, type InsertAnalysis, type AnalysisResponse } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Analysis methods
  saveAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  getAllAnalyses(): Promise<Analysis[]>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Analysis methods
  async saveAnalysis(analysisData: InsertAnalysis): Promise<Analysis> {
    const [analysis] = await db
      .insert(analyses)
      .values(analysisData)
      .returning();
    return analysis;
  }
  
  async getAnalysis(id: number): Promise<Analysis | undefined> {
    const [analysis] = await db.select().from(analyses).where(eq(analyses.id, id));
    return analysis || undefined;
  }
  
  async getAllAnalyses(): Promise<Analysis[]> {
    return await db.select().from(analyses).orderBy(analyses.id);
  }
}

export const storage = new DatabaseStorage();
