import { db } from "./db";
import { offerLetterDocuments, offerLetterAnalyses } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export class OfferLetterStorage {
  // Document storage methods
  async saveDocument(documentData: {
    userId: number;
    fileName: string;
    fileSize: number;
    documentText: string;
    institutionName?: string;
    studentName?: string;
    programName?: string;
    tuitionAmount?: string;
    startDate?: string;
  }) {
    try {
      const [document] = await db
        .insert(offerLetterDocuments)
        .values({
          userId: documentData.userId,
          fileName: documentData.fileName,
          fileSize: documentData.fileSize,
          documentText: documentData.documentText,
          institutionName: documentData.institutionName,
          studentName: documentData.studentName,
          programName: documentData.programName,
          tuitionAmount: documentData.tuitionAmount,
          startDate: documentData.startDate,
          extractionStatus: 'completed'
        })
        .returning();
      return document;
    } catch (error) {
      console.error("Error saving offer letter document:", error);
      throw error;
    }
  }

  async getDocumentById(documentId: number, userId?: number) {
    try {
      const whereCondition = userId 
        ? and(eq(offerLetterDocuments.id, documentId), eq(offerLetterDocuments.userId, userId))
        : eq(offerLetterDocuments.id, documentId);

      const [document] = await db
        .select()
        .from(offerLetterDocuments)
        .where(whereCondition);
      
      return document;
    } catch (error) {
      console.error("Error fetching offer letter document:", error);
      return null;
    }
  }

  async getUserDocuments(userId: number) {
    try {
      const documents = await db
        .select()
        .from(offerLetterDocuments)
        .where(eq(offerLetterDocuments.userId, userId))
        .orderBy(desc(offerLetterDocuments.createdAt));
      
      return documents;
    } catch (error) {
      console.error("Error fetching user documents:", error);
      return [];
    }
  }

  // Analysis storage methods
  async saveAnalysis(analysisData: {
    documentId: number;
    userId: number;
    analysisResults: any;
    gptAnalysisResults?: any;
    claudeAnalysisResults?: any;
    hybridAnalysisResults?: any;
    institutionalData?: any;
    scholarshipData?: any;
    competitorAnalysis?: any;
    tokensUsed?: number;
    claudeTokensUsed?: number;
    totalAiCost?: string;
    processingTime?: number;
    scrapingTime?: number;
    isPublic?: boolean;
  }) {
    try {
      const [analysis] = await db
        .insert(offerLetterAnalyses)
        .values({
          documentId: analysisData.documentId,
          userId: analysisData.userId,
          analysisResults: analysisData.analysisResults,
          gptAnalysisResults: analysisData.gptAnalysisResults,
          claudeAnalysisResults: analysisData.claudeAnalysisResults,
          hybridAnalysisResults: analysisData.hybridAnalysisResults,
          institutionalData: analysisData.institutionalData,
          scholarshipData: analysisData.scholarshipData,
          competitorAnalysis: analysisData.competitorAnalysis,
          tokensUsed: analysisData.tokensUsed,
          claudeTokensUsed: analysisData.claudeTokensUsed,
          totalAiCost: analysisData.totalAiCost,
          processingTime: analysisData.processingTime,
          scrapingTime: analysisData.scrapingTime,
          analysisStatus: 'completed',
          isPublic: analysisData.isPublic || false
        })
        .returning();
      
      return analysis;
    } catch (error) {
      console.error("Error saving offer letter analysis:", error);
      throw error;
    }
  }

  async getAnalysisById(analysisId: number, userId?: number) {
    try {
      const whereCondition = userId 
        ? and(eq(offerLetterAnalyses.id, analysisId), eq(offerLetterAnalyses.userId, userId))
        : eq(offerLetterAnalyses.id, analysisId);

      const [analysis] = await db
        .select()
        .from(offerLetterAnalyses)
        .where(whereCondition);
      
      return analysis;
    } catch (error) {
      console.error("Error fetching offer letter analysis:", error);
      return null;
    }
  }

  async getUserAnalyses(userId: number) {
    try {
      const analyses = await db
        .select({
          id: offerLetterAnalyses.id,
          documentId: offerLetterAnalyses.documentId,
          analysisResults: offerLetterAnalyses.analysisResults,
          processingTime: offerLetterAnalyses.processingTime,
          tokensUsed: offerLetterAnalyses.tokensUsed,
          claudeTokensUsed: offerLetterAnalyses.claudeTokensUsed,
          createdAt: offerLetterAnalyses.createdAt,
          isPublic: offerLetterAnalyses.isPublic,
          // Document fields
          fileName: offerLetterDocuments.fileName,
          fileSize: offerLetterDocuments.fileSize,
          institutionName: offerLetterDocuments.institutionName,
          programName: offerLetterDocuments.programName,
        })
        .from(offerLetterAnalyses)
        .leftJoin(offerLetterDocuments, eq(offerLetterAnalyses.documentId, offerLetterDocuments.id))
        .where(eq(offerLetterAnalyses.userId, userId))
        .orderBy(desc(offerLetterAnalyses.createdAt));
      
      return analyses;
    } catch (error) {
      console.error("Error fetching user analyses:", error);
      return [];
    }
  }

  async getAllAnalysesWithUsers() {
    try {
      const analyses = await db
        .select({
          id: offerLetterAnalyses.id,
          documentId: offerLetterAnalyses.documentId,
          analysisResults: offerLetterAnalyses.analysisResults,
          tokensUsed: offerLetterAnalyses.tokensUsed,
          claudeTokensUsed: offerLetterAnalyses.claudeTokensUsed,
          processingTime: offerLetterAnalyses.processingTime,
          isPublic: offerLetterAnalyses.isPublic,
          createdAt: offerLetterAnalyses.createdAt,
          userId: offerLetterAnalyses.userId,
          // Document fields
          fileName: offerLetterDocuments.fileName,
          fileSize: offerLetterDocuments.fileSize,
          institutionName: offerLetterDocuments.institutionName,
          programName: offerLetterDocuments.programName,
        })
        .from(offerLetterAnalyses)
        .leftJoin(offerLetterDocuments, eq(offerLetterAnalyses.documentId, offerLetterDocuments.id))
        .orderBy(desc(offerLetterAnalyses.createdAt));
      
      return analyses;
    } catch (error) {
      console.error("Error fetching all analyses with users:", error);
      return [];
    }
  }

  async deleteAnalysis(analysisId: number, userId?: number) {
    try {
      const whereCondition = userId 
        ? and(eq(offerLetterAnalyses.id, analysisId), eq(offerLetterAnalyses.userId, userId))
        : eq(offerLetterAnalyses.id, analysisId);

      await db
        .delete(offerLetterAnalyses)
        .where(whereCondition);
      
      return true;
    } catch (error) {
      console.error("Error deleting offer letter analysis:", error);
      return false;
    }
  }
}

export const offerLetterStorage = new OfferLetterStorage();