import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { generateAdvancedRecommendations } from "./advancedDarpanAI";
import { advancedAssessmentSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Update the database tables with proper schema
async function updateAssessmentsTable() {
  try {
    await storage.executeQuery(`
      DROP TABLE IF EXISTS assessments CASCADE;
      CREATE TABLE assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        personal_info JSONB NOT NULL,
        academic_background JSONB NOT NULL,
        study_preferences JSONB NOT NULL,
        geographic_preferences JSONB NOT NULL,
        financial_planning JSONB NOT NULL,
        test_scores JSONB,
        lifestyle_factors JSONB NOT NULL,
        additional_requirements JSONB NOT NULL,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Advanced assessments table updated successfully");
  } catch (error) {
    console.error("Error updating assessments table:", error);
  }
}

async function updateUniversityMatchesTable() {
  try {
    await storage.executeQuery(`
      DROP TABLE IF EXISTS university_matches CASCADE;
      CREATE TABLE university_matches (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
        university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
        match_score DECIMAL(5,2) NOT NULL,
        match_reasons TEXT[] NOT NULL,
        financial_fit VARCHAR(20) NOT NULL,
        academic_fit VARCHAR(20) NOT NULL,
        cultural_fit VARCHAR(20) NOT NULL,
        career_prospects VARCHAR(20) NOT NULL,
        admission_probability VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("University matches table updated successfully");
  } catch (error) {
    console.error("Error updating university matches table:", error);
  }
}

// Initialize tables on startup
updateAssessmentsTable();
updateUniversityMatchesTable();

// Advanced Assessment Submission
router.post("/advanced-assessment", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Validate the comprehensive assessment data
    const validatedData = advancedAssessmentSchema.parse(req.body);

    // Get all universities from database
    const universities = await storage.executeQuery(`
      SELECT id, name, country, city, ranking, tuition_fee as "tuitionFee", 
             acceptance_rate as "acceptanceRate", gpa_requirement as "gpaRequirement",
             sat_requirement as "satRequirement", ielts_requirement as "ieltsRequirement",
             toefl_requirement as "toeflRequirement", programs, scholarships,
             research_opportunities as "researchOpportunities", campus_size as "campusSize",
             student_population as "studentPopulation", international_students as "internationalStudents",
             website, image_url as "imageUrl", description
      FROM universities 
      ORDER BY ranking ASC
    `);

    if (!universities || universities.length === 0) {
      return res.status(404).json({ error: "No universities found in database" });
    }

    // Generate AI-powered recommendations
    const analysisResults = await generateAdvancedRecommendations(validatedData, universities);

    // Save assessment to database
    const assessmentResult = await storage.executeQuery(`
      INSERT INTO assessments (
        user_id, personal_info, academic_background, study_preferences,
        geographic_preferences, financial_planning, test_scores,
        lifestyle_factors, additional_requirements, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING id
    `, [
      userId,
      JSON.stringify(validatedData.personalInfo),
      JSON.stringify(validatedData.academicBackground),
      JSON.stringify(validatedData.studyPreferences),
      JSON.stringify(validatedData.geographicPreferences),
      JSON.stringify(validatedData.financialPlanning),
      JSON.stringify(validatedData.testScores),
      JSON.stringify(validatedData.lifestyleFactors),
      JSON.stringify(validatedData.additionalRequirements)
    ]);

    const assessmentId = assessmentResult[0].id;

    // Save university matches
    for (const match of analysisResults.matches) {
      await storage.executeQuery(`
        INSERT INTO university_matches (
          assessment_id, university_id, match_score, match_reasons,
          financial_fit, academic_fit, cultural_fit, career_prospects,
          admission_probability
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        assessmentId,
        match.university.id,
        match.matchScore,
        match.matchReasons,
        match.financialFit,
        match.academicFit,
        match.culturalFit,
        match.careerProspects,
        match.admissionProbability
      ]);
    }

    // Return comprehensive results
    res.json({
      assessmentId,
      overallMatch: analysisResults.overallMatch,
      matches: analysisResults.matches,
      recommendations: analysisResults.recommendations,
      nextSteps: analysisResults.nextSteps,
      analysisTime: analysisResults.analysisTime
    });

  } catch (error) {
    console.error("Error processing advanced assessment:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid assessment data", 
        details: error.errors 
      });
    }

    res.status(500).json({ 
      error: "Failed to process assessment", 
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get User's Assessment History
router.get("/assessments", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const assessments = await storage.executeQuery(`
      SELECT a.id, a.completed_at, a.created_at,
             a.personal_info->>'fullName' as student_name,
             a.study_preferences->>'studyField' as study_field,
             a.geographic_preferences->>'preferredCountries' as preferred_countries,
             COUNT(um.id) as university_matches
      FROM assessments a
      LEFT JOIN university_matches um ON a.id = um.assessment_id
      WHERE a.user_id = $1
      GROUP BY a.id, a.completed_at, a.created_at, a.personal_info, a.study_preferences, a.geographic_preferences
      ORDER BY a.created_at DESC
    `, [userId]);

    res.json(assessments);

  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
});

// Get Detailed Assessment Results
router.get("/assessment/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const assessmentId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get assessment details
    const assessment = await storage.executeQuery(`
      SELECT * FROM assessments 
      WHERE id = $1 AND user_id = $2
    `, [assessmentId, userId]);

    if (!assessment || assessment.length === 0) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // Get university matches with full university details
    const matches = await storage.executeQuery(`
      SELECT um.*, u.name, u.country, u.city, u.ranking, u.tuition_fee,
             u.acceptance_rate, u.gpa_requirement, u.sat_requirement,
             u.ielts_requirement, u.toefl_requirement, u.programs,
             u.scholarships, u.research_opportunities, u.campus_size,
             u.student_population, u.international_students, u.website,
             u.image_url, u.description
      FROM university_matches um
      JOIN universities u ON um.university_id = u.id
      WHERE um.assessment_id = $1
      ORDER BY um.match_score DESC
    `, [assessmentId]);

    // Calculate overall match
    const overallMatch = matches.length > 0 
      ? Math.round(matches.reduce((sum: number, match: any) => sum + parseFloat(match.match_score), 0) / matches.length)
      : 0;

    res.json({
      assessment: assessment[0],
      overallMatch,
      matches: matches.map((match: any) => ({
        university: {
          id: match.university_id,
          name: match.name,
          country: match.country,
          city: match.city,
          ranking: match.ranking,
          tuitionFee: match.tuition_fee,
          acceptanceRate: match.acceptance_rate,
          gpaRequirement: match.gpa_requirement,
          satRequirement: match.sat_requirement,
          ieltsRequirement: match.ielts_requirement,
          toeflRequirement: match.toefl_requirement,
          programs: match.programs,
          scholarships: match.scholarships,
          researchOpportunities: match.research_opportunities,
          campusSize: match.campus_size,
          studentPopulation: match.student_population,
          internationalStudents: match.international_students,
          website: match.website,
          imageUrl: match.image_url,
          description: match.description
        },
        matchScore: parseFloat(match.match_score),
        matchReasons: match.match_reasons,
        financialFit: match.financial_fit,
        academicFit: match.academic_fit,
        culturalFit: match.cultural_fit,
        careerProspects: match.career_prospects,
        admissionProbability: match.admission_probability
      }))
    });

  } catch (error) {
    console.error("Error fetching assessment details:", error);
    res.status(500).json({ error: "Failed to fetch assessment details" });
  }
});

// Get University Details
router.get("/universities", async (req: Request, res: Response) => {
  try {
    const universities = await storage.executeQuery(`
      SELECT id, name, country, city, ranking, tuition_fee as "tuitionFee",
             acceptance_rate as "acceptanceRate", gpa_requirement as "gpaRequirement",
             sat_requirement as "satRequirement", ielts_requirement as "ieltsRequirement",
             toefl_requirement as "toeflRequirement", programs, scholarships,
             research_opportunities as "researchOpportunities", campus_size as "campusSize",
             student_population as "studentPopulation", international_students as "internationalStudents",
             website, image_url as "imageUrl", description, created_at
      FROM universities 
      ORDER BY ranking ASC
    `);

    res.json(universities);

  } catch (error) {
    console.error("Error fetching universities:", error);
    res.status(500).json({ error: "Failed to fetch universities" });
  }
});

// Get Assessment Statistics
router.get("/statistics", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const stats = await storage.executeQuery(`
      SELECT 
        COUNT(DISTINCT a.id) as total_assessments,
        COUNT(DISTINCT um.university_id) as total_universities_matched,
        COUNT(DISTINCT a.geographic_preferences->>'preferredCountries') as countries_explored,
        AVG(um.match_score) as average_match_score,
        MAX(a.created_at) as last_assessment_date
      FROM assessments a
      LEFT JOIN university_matches um ON a.id = um.assessment_id
      WHERE a.user_id = $1
    `, [userId]);

    const recentAssessments = await storage.executeQuery(`
      SELECT id, completed_at, 
             personal_info->>'fullName' as student_name,
             study_preferences->>'studyField' as study_field
      FROM assessments 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 5
    `, [userId]);

    res.json({
      statistics: stats[0] || {
        total_assessments: 0,
        total_universities_matched: 0,
        countries_explored: 0,
        average_match_score: 0,
        last_assessment_date: null
      },
      recentAssessments
    });

  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

export default router;