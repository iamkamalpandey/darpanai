import { db } from './db';
import { countryDocumentRequirements, applicationDocuments } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export interface DocumentRequirement {
  id: number;
  countryCode: string;
  studyLevel: string;
  documentType: string;
  documentName: string;
  description: string;
  isRequired: boolean;
  acceptedFormats: string[];
  maxFileSize: number;
  notes?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateDocumentRequirement {
  countryCode: string;
  studyLevel: string;
  documentType: string;
  documentName: string;
  description: string;
  isRequired: boolean;
  acceptedFormats: string[];
  maxFileSize?: number;
  notes?: string;
  sortOrder?: number;
}

class DocumentRequirementsService {
  // Get document requirements for a specific country and study level
  async getRequirements(countryCode: string, studyLevel: string): Promise<DocumentRequirement[]> {
    try {
      const requirements = await db
        .select()
        .from(countryDocumentRequirements)
        .where(
          and(
            eq(countryDocumentRequirements.countryCode, countryCode.toUpperCase()),
            eq(countryDocumentRequirements.studyLevel, studyLevel.toLowerCase()),
            eq(countryDocumentRequirements.isActive, true)
          )
        )
        .orderBy(countryDocumentRequirements.sortOrder);

      return requirements;
    } catch (error) {
      console.error('Error fetching document requirements:', error);
      throw new Error('Failed to fetch document requirements');
    }
  }

  // Admin: Get all document requirements
  async getAllRequirements(): Promise<DocumentRequirement[]> {
    try {
      const requirements = await db
        .select()
        .from(countryDocumentRequirements)
        .orderBy(countryDocumentRequirements.countryCode, countryDocumentRequirements.studyLevel, countryDocumentRequirements.sortOrder);

      return requirements;
    } catch (error) {
      console.error('Error fetching all document requirements:', error);
      throw new Error('Failed to fetch document requirements');
    }
  }

  // Admin: Create new document requirement
  async createRequirement(data: CreateDocumentRequirement): Promise<DocumentRequirement> {
    try {
      const [requirement] = await db
        .insert(countryDocumentRequirements)
        .values({
          ...data,
          countryCode: data.countryCode.toUpperCase(),
          studyLevel: data.studyLevel.toLowerCase(),
          maxFileSize: data.maxFileSize || 10485760, // 10MB default
          sortOrder: data.sortOrder || 0,
        })
        .returning();

      return requirement;
    } catch (error) {
      console.error('Error creating document requirement:', error);
      throw new Error('Failed to create document requirement');
    }
  }

  // Admin: Update document requirement
  async updateRequirement(id: number, data: Partial<CreateDocumentRequirement>): Promise<DocumentRequirement> {
    try {
      const updateData = { ...data };
      if (data.countryCode) {
        updateData.countryCode = data.countryCode.toUpperCase();
      }
      if (data.studyLevel) {
        updateData.studyLevel = data.studyLevel.toLowerCase();
      }

      const [requirement] = await db
        .update(countryDocumentRequirements)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(countryDocumentRequirements.id, id))
        .returning();

      if (!requirement) {
        throw new Error('Document requirement not found');
      }

      return requirement;
    } catch (error) {
      console.error('Error updating document requirement:', error);
      throw new Error('Failed to update document requirement');
    }
  }

  // Admin: Delete document requirement
  async deleteRequirement(id: number): Promise<void> {
    try {
      const result = await db
        .delete(countryDocumentRequirements)
        .where(eq(countryDocumentRequirements.id, id));

      if (result.rowCount === 0) {
        throw new Error('Document requirement not found');
      }
    } catch (error) {
      console.error('Error deleting document requirement:', error);
      throw new Error('Failed to delete document requirement');
    }
  }

  // Get unique countries with document requirements
  async getCountriesWithRequirements(): Promise<Array<{ countryCode: string; studyLevels: string[] }>> {
    try {
      const results = await db
        .selectDistinct({
          countryCode: countryDocumentRequirements.countryCode,
          studyLevel: countryDocumentRequirements.studyLevel,
        })
        .from(countryDocumentRequirements)
        .where(eq(countryDocumentRequirements.isActive, true));

      // Group by country
      const countryMap = new Map<string, Set<string>>();
      
      for (const result of results) {
        if (!countryMap.has(result.countryCode)) {
          countryMap.set(result.countryCode, new Set());
        }
        countryMap.get(result.countryCode)!.add(result.studyLevel);
      }

      return Array.from(countryMap.entries()).map(([countryCode, studyLevels]) => ({
        countryCode,
        studyLevels: Array.from(studyLevels),
      }));
    } catch (error) {
      console.error('Error fetching countries with requirements:', error);
      throw new Error('Failed to fetch countries with requirements');
    }
  }

  // Initialize default document requirements for common countries
  async initializeDefaultRequirements(): Promise<void> {
    try {
      const defaultRequirements = [
        // Australia Requirements
        {
          countryCode: 'AU',
          studyLevel: 'bachelor',
          documentType: 'passport',
          documentName: 'Valid Passport',
          description: 'Valid passport with at least 6 months remaining validity',
          isRequired: true,
          acceptedFormats: ['pdf', 'jpg', 'png'],
          sortOrder: 1,
        },
        {
          countryCode: 'AU',
          studyLevel: 'bachelor',
          documentType: 'academic_transcript',
          documentName: 'Academic Transcripts',
          description: 'Official academic transcripts from previous studies',
          isRequired: true,
          acceptedFormats: ['pdf'],
          sortOrder: 2,
        },
        {
          countryCode: 'AU',
          studyLevel: 'bachelor',
          documentType: 'english_proficiency',
          documentName: 'English Proficiency Test',
          description: 'IELTS, TOEFL, or PTE Academic scores',
          isRequired: true,
          acceptedFormats: ['pdf'],
          sortOrder: 3,
        },
        {
          countryCode: 'AU',
          studyLevel: 'bachelor',
          documentType: 'financial_proof',
          documentName: 'Financial Evidence',
          description: 'Bank statements or financial sponsorship documents',
          isRequired: true,
          acceptedFormats: ['pdf'],
          sortOrder: 4,
        },
        {
          countryCode: 'AU',
          studyLevel: 'bachelor',
          documentType: 'statement_of_purpose',
          documentName: 'Statement of Purpose',
          description: 'Personal statement explaining study goals and motivation',
          isRequired: true,
          acceptedFormats: ['pdf', 'doc', 'docx'],
          sortOrder: 5,
        },

        // USA Requirements
        {
          countryCode: 'US',
          studyLevel: 'bachelor',
          documentType: 'passport',
          documentName: 'Valid Passport',
          description: 'Valid passport with at least 6 months remaining validity',
          isRequired: true,
          acceptedFormats: ['pdf', 'jpg', 'png'],
          sortOrder: 1,
        },
        {
          countryCode: 'US',
          studyLevel: 'bachelor',
          documentType: 'academic_transcript',
          documentName: 'Academic Transcripts',
          description: 'Official academic transcripts with course-by-course evaluation',
          isRequired: true,
          acceptedFormats: ['pdf'],
          sortOrder: 2,
        },
        {
          countryCode: 'US',
          studyLevel: 'bachelor',
          documentType: 'standardized_test',
          documentName: 'SAT/ACT Scores',
          description: 'SAT or ACT standardized test scores',
          isRequired: true,
          acceptedFormats: ['pdf'],
          sortOrder: 3,
        },
        {
          countryCode: 'US',
          studyLevel: 'bachelor',
          documentType: 'english_proficiency',
          documentName: 'English Proficiency Test',
          description: 'TOEFL or IELTS scores for non-native English speakers',
          isRequired: false,
          acceptedFormats: ['pdf'],
          sortOrder: 4,
        },
        {
          countryCode: 'US',
          studyLevel: 'bachelor',
          documentType: 'financial_proof',
          documentName: 'Financial Documentation',
          description: 'Bank statements, affidavit of support, or scholarship documents',
          isRequired: true,
          acceptedFormats: ['pdf'],
          sortOrder: 5,
        },

        // UK Requirements
        {
          countryCode: 'UK',
          studyLevel: 'bachelor',
          documentType: 'passport',
          documentName: 'Valid Passport',
          description: 'Valid passport with at least 6 months remaining validity',
          isRequired: true,
          acceptedFormats: ['pdf', 'jpg', 'png'],
          sortOrder: 1,
        },
        {
          countryCode: 'UK',
          studyLevel: 'bachelor',
          documentType: 'academic_transcript',
          documentName: 'Academic Qualifications',
          description: 'A-levels, IB, or equivalent qualification certificates',
          isRequired: true,
          acceptedFormats: ['pdf'],
          sortOrder: 2,
        },
        {
          countryCode: 'UK',
          studyLevel: 'bachelor',
          documentType: 'english_proficiency',
          documentName: 'English Language Test',
          description: 'IELTS Academic, TOEFL, or approved equivalent',
          isRequired: true,
          acceptedFormats: ['pdf'],
          sortOrder: 3,
        },
        {
          countryCode: 'UK',
          studyLevel: 'bachelor',
          documentType: 'personal_statement',
          documentName: 'Personal Statement',
          description: 'UCAS personal statement or university-specific essay',
          isRequired: true,
          acceptedFormats: ['pdf', 'doc', 'docx'],
          sortOrder: 4,
        },
        {
          countryCode: 'UK',
          studyLevel: 'bachelor',
          documentType: 'financial_proof',
          documentName: 'Financial Evidence',
          description: 'Bank statements or financial sponsorship proof',
          isRequired: true,
          acceptedFormats: ['pdf'],
          sortOrder: 5,
        },

        // Canada Requirements
        {
          countryCode: 'CA',
          studyLevel: 'bachelor',
          documentType: 'passport',
          documentName: 'Valid Passport',
          description: 'Valid passport with at least 6 months remaining validity',
          isRequired: true,
          acceptedFormats: ['pdf', 'jpg', 'png'],
          sortOrder: 1,
        },
        {
          countryCode: 'CA',
          studyLevel: 'bachelor',
          documentType: 'academic_transcript',
          documentName: 'Academic Transcripts',
          description: 'Official transcripts from secondary school',
          isRequired: true,
          acceptedFormats: ['pdf'],
          sortOrder: 2,
        },
        {
          countryCode: 'CA',
          studyLevel: 'bachelor',
          documentType: 'english_proficiency',
          documentName: 'English/French Proficiency',
          description: 'IELTS, TOEFL, or TEF scores depending on program language',
          isRequired: true,
          acceptedFormats: ['pdf'],
          sortOrder: 3,
        },
        {
          countryCode: 'CA',
          studyLevel: 'bachelor',
          documentType: 'statement_of_purpose',
          documentName: 'Statement of Purpose',
          description: 'Letter of intent explaining study plans and goals',
          isRequired: true,
          acceptedFormats: ['pdf', 'doc', 'docx'],
          sortOrder: 4,
        },
        {
          countryCode: 'CA',
          studyLevel: 'bachelor',
          documentType: 'financial_proof',
          documentName: 'Proof of Funds',
          description: 'Bank statements showing adequate financial support',
          isRequired: true,
          acceptedFormats: ['pdf'],
          sortOrder: 5,
        },
      ];

      // Check if requirements already exist
      const existingCount = await db
        .select({ count: countryDocumentRequirements.id })
        .from(countryDocumentRequirements);

      if (existingCount.length === 0) {
        await db.insert(countryDocumentRequirements).values(defaultRequirements);
        console.log('Default document requirements initialized');
      }
    } catch (error) {
      console.error('Error initializing default requirements:', error);
    }
  }
}

export const documentRequirementsService = new DocumentRequirementsService();