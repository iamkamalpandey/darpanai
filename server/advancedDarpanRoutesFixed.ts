import { Router, Request, Response } from "express";
import { db } from "./db";
import { generateAdvancedRecommendations } from "./advancedDarpanAI";
import { advancedAssessmentSchema, advancedAssessments, universities } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

// Advanced Assessment Submission
router.post("/advanced-assessment", async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = req.user.id;

    // Validate the comprehensive assessment data
    const validatedData = advancedAssessmentSchema.parse(req.body);

    // Get all universities from database
    const universitiesData = await db.select().from(universities).orderBy(universities.ranking);

    if (!universitiesData || universitiesData.length === 0) {
      return res.status(404).json({ error: "No universities found in database" });
    }

    // Transform database universities to match expected format
    const transformedUniversities = universitiesData.map(uni => ({
      id: uni.id,
      name: uni.name,
      country: uni.country,
      city: uni.city,
      ranking: uni.ranking || 0,
      tuitionFee: uni.tuitionFee || 0,
      acceptanceRate: uni.acceptanceRate || "N/A",
      gpaRequirement: uni.gpaRequirement || "N/A",
      satRequirement: 0,
      ieltsRequirement: 0,
      toeflRequirement: 0,
      programs: [],
      scholarships: [],
      researchOpportunities: false,
      campusSize: "Medium",
      studentPopulation: 0,
      internationalStudents: 0,
      website: uni.website || "",
      imageUrl: uni.imageUrl ?? undefined,
      description: uni.description || ""
    }));

    // Generate AI-powered recommendations
    const analysisResults = await generateAdvancedRecommendations(validatedData, transformedUniversities);

    // Save assessment to database
    const assessmentData = {
      userId: userId,
      personalInfo: validatedData.personalInfo,
      academicBackground: validatedData.academicBackground,
      studyPreferences: validatedData.studyPreferences,
      geographicPreferences: validatedData.geographicPreferences,
      financialPlanning: validatedData.financialPlanning,
      testScores: validatedData.testScores || {},
      lifestyleFactors: validatedData.lifestyleFactors,
      additionalRequirements: validatedData.additionalRequirements,
      completedAt: new Date()
    };

    const [savedAssessment] = await db.insert(advancedAssessments).values(assessmentData).returning();
    const assessmentId = savedAssessment.id;

    // Return comprehensive results
    res.json({
      assessmentId,
      overallMatch: analysisResults.overallMatch,
      matches: analysisResults.matches,
      analysisTime: analysisResults.analysisTime,
      recommendations: analysisResults.recommendations,
      nextSteps: analysisResults.nextSteps
    });

  } catch (error) {
    console.error("Error in advanced assessment:", error);
    res.status(500).json({ 
      error: "Failed to process advanced assessment",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get all assessments for user
router.get("/assessments", async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userAssessments = await db.select()
      .from(advancedAssessments)
      .where(eq(advancedAssessments.userId, req.user.id))
      .orderBy(desc(advancedAssessments.createdAt));

    res.json(userAssessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
});

// Get specific assessment by ID
router.get("/assessment/:id", async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const assessmentId = parseInt(req.params.id);
    
    const [assessment] = await db.select()
      .from(advancedAssessments)
      .where(eq(advancedAssessments.id, assessmentId));

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // Verify ownership
    if (assessment.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(assessment);
  } catch (error) {
    console.error("Error fetching assessment:", error);
    res.status(500).json({ error: "Failed to fetch assessment" });
  }
});

// Get universities for recommendation system
router.get("/universities", async (req: Request, res: Response) => {
  try {
    const universitiesData = await db.select().from(universities).orderBy(universities.ranking);
    res.json(universitiesData);
  } catch (error) {
    console.error("Error fetching universities:", error);
    res.status(500).json({ error: "Failed to fetch universities" });
  }
});

// Get assessment statistics
router.get("/statistics", async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userAssessments = await db.select()
      .from(advancedAssessments)
      .where(eq(advancedAssessments.userId, req.user.id));

    const totalAssessments = userAssessments.length;
    const completedAssessments = userAssessments.filter(a => a.completedAt).length;

    res.json({
      totalAssessments,
      completedAssessments,
      lastAssessment: userAssessments[0]?.createdAt || null
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

export default router;