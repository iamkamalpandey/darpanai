import { Router, Request, Response } from "express";
import { z } from "zod";
import { storage } from "./storage";

const router = Router();

// Assessment data schema
const assessmentSchema = z.object({
  academicLevel: z.string().min(1),
  fieldOfStudy: z.string().min(1),
  gpa: z.string().min(1),
  testScores: z.record(z.number()).optional(),
  preferredCountries: z.array(z.string()).min(1),
  budgetRange: z.string().min(1),
  lifestyle: z.string().min(1),
  specialRequirements: z.string().optional(),
});

// POST /api/assessments - Create a new assessment
router.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = assessmentSchema.parse(req.body);
    
    // Get user ID from session
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Generate sample recommendations based on user input
    const recommendations = generateRecommendations(validatedData);
    
    // Create assessment record
    const assessmentId = Date.now(); // Simple ID generation
    const assessment = {
      id: assessmentId,
      userId,
      ...validatedData,
      recommendations,
      createdAt: new Date(),
    };

    // Store assessment (you can implement proper storage later)
    // For now, return the generated data
    
    res.json({
      success: true,
      assessment: {
        id: assessmentId,
        recommendations
      }
    });
  } catch (error) {
    console.error("Assessment creation error:", error);
    res.status(400).json({ 
      error: "Invalid assessment data",
      details: error instanceof z.ZodError ? error.errors : "Unknown error"
    });
  }
});

// GET /api/assessments/:id - Get assessment results
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const assessmentId = parseInt(req.params.id);
    
    // For demo purposes, return sample data
    // In production, you'd fetch from database
    const sampleResults = {
      id: assessmentId,
      universities: [
        {
          name: "Harvard University",
          country: "United States",
          city: "Cambridge, MA",
          ranking: 1,
          tuitionFee: 54002,
          matchScore: 95,
          matchReasons: [
            "Excellent match for your academic level and field",
            "Strong research opportunities in your area of interest",
            "Located in preferred country"
          ]
        },
        {
          name: "University of Toronto",
          country: "Canada",
          city: "Toronto, ON",
          ranking: 25,
          tuitionFee: 45690,
          matchScore: 88,
          matchReasons: [
            "Great academic programs in your field",
            "More affordable option within budget range",
            "Diverse international student community"
          ]
        }
      ],
      summary: "Based on your preferences, we've identified excellent universities that match your academic background and budget requirements."
    };
    
    res.json(sampleResults);
  } catch (error) {
    console.error("Assessment retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve assessment" });
  }
});

function generateRecommendations(data: any) {
  const universities = [
    {
      name: "Harvard University",
      country: "US",
      city: "Cambridge, MA",
      ranking: 1,
      tuitionFee: 54002,
      programs: ["Computer Science", "Business", "Medicine", "Law"]
    },
    {
      name: "University of Toronto",
      country: "CA",
      city: "Toronto, ON",
      ranking: 25,
      tuitionFee: 45690,
      programs: ["Engineering", "Computer Science", "Business"]
    },
    {
      name: "University of Cambridge",
      country: "GB",
      city: "Cambridge",
      ranking: 3,
      tuitionFee: 52000,
      programs: ["Natural Sciences", "Engineering", "Medicine"]
    },
    {
      name: "University of Melbourne",
      country: "AU",
      city: "Melbourne",
      ranking: 33,
      tuitionFee: 38000,
      programs: ["Engineering", "Business", "Arts"]
    },
    {
      name: "Technical University of Munich",
      country: "DE",
      city: "Munich",
      ranking: 50,
      tuitionFee: 15000,
      programs: ["Engineering", "Computer Science", "Natural Sciences"]
    },
    {
      name: "University of Amsterdam",
      country: "NL",
      city: "Amsterdam",
      ranking: 55,
      tuitionFee: 18000,
      programs: ["Business", "Social Sciences", "Arts"]
    }
  ];

  // Filter universities based on user preferences
  let filteredUniversities = universities.filter(uni => 
    data.preferredCountries.includes(uni.country)
  );

  // Apply budget filtering
  if (data.budgetRange === "low") {
    filteredUniversities = filteredUniversities.filter(uni => uni.tuitionFee <= 30000);
  } else if (data.budgetRange === "medium") {
    filteredUniversities = filteredUniversities.filter(uni => uni.tuitionFee <= 60000);
  }

  // Generate match scores and reasons
  return filteredUniversities.slice(0, 4).map(uni => ({
    name: uni.name,
    country: getCountryName(uni.country),
    city: uni.city,
    ranking: uni.ranking,
    tuitionFee: uni.tuitionFee,
    matchScore: Math.floor(Math.random() * 20) + 80, // 80-99% match
    matchReasons: generateMatchReasons(data, uni)
  }));
}

function getCountryName(code: string): string {
  const countryMap: Record<string, string> = {
    'US': 'United States',
    'CA': 'Canada',
    'GB': 'United Kingdom',
    'AU': 'Australia',
    'DE': 'Germany',
    'NL': 'Netherlands',
    'FR': 'France',
    'CH': 'Switzerland',
    'SE': 'Sweden',
    'DK': 'Denmark',
    'NO': 'Norway',
    'SG': 'Singapore'
  };
  return countryMap[code] || code;
}

function generateMatchReasons(data: any, uni: any): string[] {
  const reasons = [];
  
  // Academic level match
  if (data.academicLevel === "undergraduate" && uni.ranking <= 50) {
    reasons.push("Excellent undergraduate programs with strong career prospects");
  } else if (data.academicLevel === "graduate" && uni.ranking <= 30) {
    reasons.push("Outstanding graduate research opportunities");
  }
  
  // Budget compatibility
  if (uni.tuitionFee <= 30000) {
    reasons.push("Fits well within your budget-friendly range");
  } else if (uni.tuitionFee <= 60000) {
    reasons.push("Good value for quality education within moderate budget");
  }
  
  // Field alignment
  if (uni.programs.some((program: string) => program.toLowerCase().includes(data.fieldOfStudy.toLowerCase()))) {
    reasons.push("Strong programs in your field of study");
  }
  
  // Location preference
  if (data.lifestyle === "urban" && ["Cambridge, MA", "Toronto, ON", "Cambridge", "Melbourne", "Munich", "Amsterdam"].includes(uni.city)) {
    reasons.push("Located in vibrant urban environment matching your lifestyle preference");
  }
  
  // Default reasons if none match
  if (reasons.length === 0) {
    reasons.push("Good academic reputation and international recognition");
    reasons.push("Strong alumni network and career support");
  }
  
  return reasons.slice(0, 3);
}

export default router;