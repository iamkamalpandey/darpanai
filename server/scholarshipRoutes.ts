import { Router, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { scholarships } from '@shared/scholarshipSchema';
import { scholarshipSearchSchema, type ScholarshipSearch, type InsertScholarship } from '@shared/scholarshipSchema';
import { researchInstitutionScholarships } from './scholarshipResearcher';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
};

// Research and save scholarships for an institution/program
router.post('/research', requireAuth, async (req, res) => {
  try {
    const validatedData = scholarshipSearchSchema.parse(req.body);
    const { institutionName, programName, programLevel } = validatedData;
    const userId = req.user!.id;

    console.log(`[Scholarship Research] Starting research for ${institutionName} - ${programName} (${programLevel})`);

    // Check if user already has recent research for this combination (within last 7 days)
    const existingResearch = await db
      .select()
      .from(scholarships)
      .where(
        and(
          eq(scholarships.userId, userId),
          eq(scholarships.institutionName, institutionName),
          eq(scholarships.programName, programName),
          eq(scholarships.programLevel, programLevel)
        )
      )
      .orderBy(desc(scholarships.researchDate))
      .limit(1);

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    if (existingResearch.length > 0 && existingResearch[0].researchDate > oneWeekAgo) {
      console.log(`[Scholarship Research] Recent research exists, returning cached results`);
      
      // Return existing research results
      const allScholarships = await db
        .select()
        .from(scholarships)
        .where(
          and(
            eq(scholarships.userId, userId),
            eq(scholarships.institutionName, institutionName),
            eq(scholarships.programName, programName),
            eq(scholarships.programLevel, programLevel)
          )
        )
        .orderBy(desc(scholarships.researchDate));

      return res.json({
        success: true,
        scholarships: allScholarships,
        isFromCache: true,
        message: `Found ${allScholarships.length} scholarships from recent research`
      });
    }

    // Perform new research using OpenAI
    console.log(`[Scholarship Research] Performing new OpenAI research`);
    const researchResult = await researchInstitutionScholarships(
      institutionName,
      programName,
      programLevel
    );

    // Save all scholarships to database
    const savedScholarships = [];
    
    for (const scholarshipData of researchResult.scholarships) {
      const scholarshipToInsert: InsertScholarship = {
        userId,
        institutionName,
        programName,
        programLevel,
        scholarshipName: scholarshipData.scholarshipName,
        description: scholarshipData.description,
        availableFunds: scholarshipData.availableFunds,
        fundingType: scholarshipData.fundingType,
        eligibilityCriteria: scholarshipData.eligibilityCriteria,
        applicationDeadline: scholarshipData.applicationDeadline,
        applicationProcess: scholarshipData.applicationProcess,
        requiredDocuments: scholarshipData.requiredDocuments,
        scholarshipUrl: scholarshipData.scholarshipUrl,
        contactEmail: scholarshipData.contactEmail,
        contactPhone: scholarshipData.contactPhone,
        numberOfAwards: scholarshipData.numberOfAwards,
        renewalCriteria: scholarshipData.renewalCriteria,
        additionalBenefits: scholarshipData.additionalBenefits,
        researchDate: researchResult.researchMetadata.researchDate,
        sourceUrl: researchResult.researchMetadata.sourceUrls.join(', '),
        researchTokensUsed: researchResult.researchMetadata.tokensUsed,
        researchQuality: researchResult.researchMetadata.researchQuality,
      };

      const [savedScholarship] = await db
        .insert(scholarships)
        .values(scholarshipToInsert)
        .returning();

      savedScholarships.push(savedScholarship);
    }

    console.log(`[Scholarship Research] Saved ${savedScholarships.length} scholarships to database`);

    res.json({
      success: true,
      scholarships: savedScholarships,
      researchMetadata: researchResult.researchMetadata,
      isFromCache: false,
      message: `Successfully researched and saved ${savedScholarships.length} scholarships`
    });

  } catch (error) {
    console.error('[Scholarship Research] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: 'Failed to research scholarships',
      details: errorMessage
    });
  }
});

// Get user's scholarship research history
router.get('/my-research', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    const userScholarships = await db
      .select()
      .from(scholarships)
      .where(eq(scholarships.userId, userId))
      .orderBy(desc(scholarships.researchDate));

    // Group scholarships by institution/program combination
    const groupedScholarships = userScholarships.reduce((acc, scholarship) => {
      const key = `${scholarship.institutionName}-${scholarship.programName}-${scholarship.programLevel}`;
      if (!acc[key]) {
        acc[key] = {
          institutionName: scholarship.institutionName,
          programName: scholarship.programName,
          programLevel: scholarship.programLevel,
          researchDate: scholarship.researchDate,
          scholarshipCount: 0,
          scholarships: []
        };
      }
      acc[key].scholarshipCount++;
      acc[key].scholarships.push(scholarship);
      return acc;
    }, {} as Record<string, any>);

    res.json({
      success: true,
      researchGroups: Object.values(groupedScholarships),
      totalScholarships: userScholarships.length
    });

  } catch (error) {
    console.error('[Scholarship Research] Error fetching user research:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scholarship research'
    });
  }
});

// Get scholarships for a specific institution/program combination
router.get('/institution/:institutionName/program/:programName/level/:programLevel', requireAuth, async (req, res) => {
  try {
    const { institutionName, programName, programLevel } = req.params;
    const userId = req.user!.id;

    const institutionScholarships = await db
      .select()
      .from(scholarships)
      .where(
        and(
          eq(scholarships.userId, userId),
          eq(scholarships.institutionName, decodeURIComponent(institutionName)),
          eq(scholarships.programName, decodeURIComponent(programName)),
          eq(scholarships.programLevel, decodeURIComponent(programLevel))
        )
      )
      .orderBy(desc(scholarships.researchDate));

    res.json({
      success: true,
      scholarships: institutionScholarships,
      institutionName: decodeURIComponent(institutionName),
      programName: decodeURIComponent(programName),
      programLevel: decodeURIComponent(programLevel)
    });

  } catch (error) {
    console.error('[Scholarship Research] Error fetching institution scholarships:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scholarships for institution'
    });
  }
});

// Get single scholarship details
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const scholarshipId = parseInt(req.params.id);
    const userId = req.user!.id;

    const [scholarship] = await db
      .select()
      .from(scholarships)
      .where(
        and(
          eq(scholarships.id, scholarshipId),
          eq(scholarships.userId, userId)
        )
      );

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: 'Scholarship not found'
      });
    }

    res.json({
      success: true,
      scholarship
    });

  } catch (error) {
    console.error('[Scholarship Research] Error fetching scholarship:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scholarship details'
    });
  }
});

// Delete scholarship research (for specific institution/program combination)
router.delete('/institution/:institutionName/program/:programName/level/:programLevel', requireAuth, async (req, res) => {
  try {
    const { institutionName, programName, programLevel } = req.params;
    const userId = req.user!.id;

    const deletedScholarships = await db
      .delete(scholarships)
      .where(
        and(
          eq(scholarships.userId, userId),
          eq(scholarships.institutionName, decodeURIComponent(institutionName)),
          eq(scholarships.programName, decodeURIComponent(programName)),
          eq(scholarships.programLevel, decodeURIComponent(programLevel))
        )
      )
      .returning();

    res.json({
      success: true,
      message: `Deleted ${deletedScholarships.length} scholarships`,
      deletedCount: deletedScholarships.length
    });

  } catch (error) {
    console.error('[Scholarship Research] Error deleting scholarships:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete scholarship research'
    });
  }
});

export { router as scholarshipRoutes };