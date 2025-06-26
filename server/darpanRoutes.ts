import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { generateUniversityMatches, generateUniversityInsights, generateCareerPathAnalysis } from "./darpanAI";
import { assessmentFormSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

// POST /api/assessments - Create new assessment and generate matches
router.post("/assessments", requireAuth, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = assessmentFormSchema.parse(req.body);
    
    // Create assessment record
    const assessment = await storage.createAssessment({
      ...validatedData,
      userId: req.user!.id,
    });

    // Get all universities for matching
    const universities = await storage.getAllUniversities();
    
    if (universities.length === 0) {
      return res.status(400).json({ 
        error: "No universities available for matching. Please contact support." 
      });
    }

    // Generate AI-powered university matches
    const matches = await generateUniversityMatches(validatedData, universities);
    
    if (matches.length === 0) {
      return res.status(400).json({ 
        error: "Unable to find suitable university matches. Please adjust your criteria." 
      });
    }

    // Save matches to database
    await storage.createUniversityMatches(assessment.id, matches);
    
    // Mark assessment as completed
    await storage.completeAssessment(assessment.id);
    
    res.json({ 
      message: "Assessment completed successfully",
      assessmentId: assessment.id,
      matchCount: matches.length
    });
  } catch (error) {
    console.error("Error processing assessment:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid assessment data", 
        details: error.errors 
      });
    }
    res.status(500).json({ error: "Failed to process assessment" });
  }
});

// GET /api/assessments/:id/results - Get assessment results with matches
router.get("/assessments/:id/results", requireAuth, async (req: Request, res: Response) => {
  try {
    const assessmentId = parseInt(req.params.id);
    
    if (isNaN(assessmentId)) {
      return res.status(400).json({ error: "Invalid assessment ID" });
    }

    const results = await storage.getAssessmentResults(assessmentId);
    
    // Check if user owns this assessment
    if (results.assessment.userId !== req.user!.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(results);
  } catch (error) {
    console.error("Error fetching assessment results:", error);
    if (error.message === 'Assessment not found') {
      return res.status(404).json({ error: "Assessment not found" });
    }
    res.status(500).json({ error: "Failed to fetch assessment results" });
  }
});

// GET /api/assessments - Get user's assessments
router.get("/assessments", requireAuth, async (req: Request, res: Response) => {
  try {
    const assessments = await storage.getUserAssessments(req.user!.id);
    res.json(assessments);
  } catch (error) {
    console.error("Error fetching user assessments:", error);
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
});

// GET /api/assessments/:id/insights/:universityId - Get detailed insights for a specific university match
router.get("/assessments/:id/insights/:universityId", requireAuth, async (req: Request, res: Response) => {
  try {
    const assessmentId = parseInt(req.params.id);
    const universityId = parseInt(req.params.universityId);
    
    if (isNaN(assessmentId) || isNaN(universityId)) {
      return res.status(400).json({ error: "Invalid assessment or university ID" });
    }

    // Get assessment and verify ownership
    const assessment = await storage.getAssessment(assessmentId);
    if (!assessment || assessment.userId !== req.user!.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get university details
    const university = await storage.getUniversity(universityId);
    if (!university) {
      return res.status(404).json({ error: "University not found" });
    }

    // Generate insights
    const insights = await generateUniversityInsights(university, {
      academicLevel: assessment.academicLevel!,
      fieldOfStudy: assessment.fieldOfStudy!,
      gpa: assessment.gpa!,
      testScores: assessment.testScores as Record<string, number> || {},
      preferredCountries: assessment.preferredCountries as string[] || [],
      budgetRange: assessment.budgetRange!,
      lifestyle: assessment.lifestyle!,
      specialRequirements: assessment.specialRequirements || undefined
    });

    res.json({
      university,
      insights
    });
  } catch (error) {
    console.error("Error generating university insights:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

// GET /api/assessments/:id/career-analysis - Get career path analysis
router.get("/assessments/:id/career-analysis", requireAuth, async (req: Request, res: Response) => {
  try {
    const assessmentId = parseInt(req.params.id);
    
    if (isNaN(assessmentId)) {
      return res.status(400).json({ error: "Invalid assessment ID" });
    }

    // Get assessment results
    const results = await storage.getAssessmentResults(assessmentId);
    
    // Check ownership
    if (results.assessment.userId !== req.user!.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Generate career analysis
    const careerAnalysis = await generateCareerPathAnalysis(
      {
        academicLevel: results.assessment.academicLevel!,
        fieldOfStudy: results.assessment.fieldOfStudy!,
        gpa: results.assessment.gpa!,
        testScores: results.assessment.testScores as Record<string, number> || {},
        preferredCountries: results.assessment.preferredCountries as string[] || [],
        budgetRange: results.assessment.budgetRange!,
        lifestyle: results.assessment.lifestyle!,
        specialRequirements: results.assessment.specialRequirements || undefined
      },
      results.matches.map(m => ({
        universityId: m.universityId,
        matchScore: m.matchScore,
        matchReasons: m.matchReasons as string[]
      })),
      results.matches.map(m => m.university)
    );

    res.json(careerAnalysis);
  } catch (error) {
    console.error("Error generating career analysis:", error);
    res.status(500).json({ error: "Failed to generate career analysis" });
  }
});

// GET /api/universities - Get all universities (for admin)
router.get("/universities", requireAuth, async (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const universities = await storage.getAllUniversities();
    res.json(universities);
  } catch (error) {
    console.error("Error fetching universities:", error);
    res.status(500).json({ error: "Failed to fetch universities" });
  }
});

// POST /api/universities - Create new university (admin only)
router.post("/universities", requireAuth, async (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const university = await storage.createUniversity(req.body);
    res.json(university);
  } catch (error) {
    console.error("Error creating university:", error);
    res.status(500).json({ error: "Failed to create university" });
  }
});

// DELETE /api/assessments/:id - Delete assessment
router.delete("/assessments/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const assessmentId = parseInt(req.params.id);
    
    if (isNaN(assessmentId)) {
      return res.status(400).json({ error: "Invalid assessment ID" });
    }

    // Check ownership
    const assessment = await storage.getAssessment(assessmentId);
    if (!assessment || assessment.userId !== req.user!.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const success = await storage.deleteAssessment(assessmentId);
    if (success) {
      res.json({ message: "Assessment deleted successfully" });
    } else {
      res.status(404).json({ error: "Assessment not found" });
    }
  } catch (error) {
    console.error("Error deleting assessment:", error);
    res.status(500).json({ error: "Failed to delete assessment" });
  }
});

export default router;