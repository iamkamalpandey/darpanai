import { db } from './db';
import { offerLetterInfo } from '@shared/offerLetterSchema';
import { eq } from 'drizzle-orm';
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
}

export const offerLetterInfoStorage = new OfferLetterInfoStorage();