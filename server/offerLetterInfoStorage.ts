import { db } from './db';
import { offerLetterInfo } from '@shared/offerLetterSchema';
import { users } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import type { InsertOfferLetterInfo, OfferLetterInfo } from '@shared/offerLetterSchema';

export class OfferLetterInfoStorage {
  async saveOfferLetterInfo(data: InsertOfferLetterInfo): Promise<OfferLetterInfo> {
    const [saved] = await db.insert(offerLetterInfo).values(data).returning();
    return saved;
  }

  async getOfferLetterInfoById(id: number): Promise<OfferLetterInfo | undefined> {
    const [result] = await db
      .select()
      .from(offerLetterInfo)
      .where(eq(offerLetterInfo.id, id));
    return result;
  }

  async getOfferLetterInfoByUserId(userId: number): Promise<OfferLetterInfo[]> {
    return await db
      .select()
      .from(offerLetterInfo)
      .where(eq(offerLetterInfo.userId, userId))
      .orderBy(offerLetterInfo.createdAt);
  }

  async getAllOfferLetterInfo(): Promise<OfferLetterInfo[]> {
    return await db
      .select()
      .from(offerLetterInfo)
      .orderBy(offerLetterInfo.createdAt);
  }

  async getAllOfferLetterInfoWithUsers(): Promise<any[]> {
    return await db
      .select({
        id: offerLetterInfo.id,
        userId: offerLetterInfo.userId,
        fileName: offerLetterInfo.fileName,
        fileSize: offerLetterInfo.fileSize,
        institutionName: offerLetterInfo.institutionName,
        programName: offerLetterInfo.programName,
        courseName: offerLetterInfo.programName, // alias for compatibility
        tuitionFees: offerLetterInfo.tuitionFee,
        createdAt: offerLetterInfo.createdAt,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName
      })
      .from(offerLetterInfo)
      .leftJoin(users, eq(offerLetterInfo.userId, users.id))
      .orderBy(desc(offerLetterInfo.createdAt));
  }
}

export const offerLetterInfoStorage = new OfferLetterInfoStorage();