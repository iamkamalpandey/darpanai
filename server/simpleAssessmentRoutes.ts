import { Router } from 'express';
import { storage } from './storage';

const router = Router();

// Simple university recommendations with essential fields only
const sampleUniversities = [
  {
    id: 1,
    name: "Harvard University",
    country: "United States",
    city: "Cambridge",
    ranking: 1,
    tuitionFee: 54000,
    gpaRequirement: "3.9",
    programs: ["Business", "Medicine", "Law", "Engineering", "Computer Science"],
    website: "https://harvard.edu",
    description: "Premier Ivy League university with world-class education"
  },
  {
    id: 2,
    name: "University of Toronto",
    country: "Canada", 
    city: "Toronto",
    ranking: 25,
    tuitionFee: 35000,
    gpaRequirement: "3.7",
    programs: ["Engineering", "Computer Science", "Business", "Medicine"],
    website: "https://utoronto.ca",
    description: "Top Canadian university with strong research programs"
  },
  {
    id: 3,
    name: "University of Cambridge",
    country: "United Kingdom",
    city: "Cambridge", 
    ranking: 3,
    tuitionFee: 45000,
    gpaRequirement: "3.8",
    programs: ["Engineering", "Computer Science", "Natural Sciences", "Medicine"],
    website: "https://cam.ac.uk",
    description: "Historic British university known for academic excellence"
  },
  {
    id: 4,
    name: "University of Melbourne",
    country: "Australia",
    city: "Melbourne",
    ranking: 33,
    tuitionFee: 42000,
    gpaRequirement: "3.6",
    programs: ["Engineering", "Business", "Arts", "Science"],
    website: "https://unimelb.edu.au", 
    description: "Leading Australian university with diverse programs"
  },
  {
    id: 5,
    name: "Technical University of Munich",
    country: "Germany",
    city: "Munich",
    ranking: 50,
    tuitionFee: 0,
    gpaRequirement: "3.6",
    programs: ["Engineering", "Computer Science", "Natural Sciences"],
    website: "https://tum.de",
    description: "Top German technical university with no tuition fees"
  },
  {
    id: 6,
    name: "University of Amsterdam",
    country: "Netherlands",
    city: "Amsterdam",
    ranking: 61,
    tuitionFee: 12000,
    gpaRequirement: "3.4",
    programs: ["Business", "Psychology", "Computer Science", "Economics"],
    website: "https://uva.nl",
    description: "Leading Dutch university with affordable tuition"
  }
];

function calculateMatchScore(userPrefs: any, university: any): number {
  let score = 70; // Base score
  
  // Country preference bonus
  if (userPrefs.preferredCountries?.includes(university.country)) {
    score += 15;
  }
  
  // Budget compatibility
  const budgetRanges: Record<string, number> = {
    'under_20k': 20000,
    '20k_40k': 40000, 
    '40k_60k': 60000,
    'above_60k': 100000
  };
  
  const maxBudget = budgetRanges[userPrefs.budgetRange] || 100000;
  if (university.tuitionFee <= maxBudget) {
    score += 10;
  }
  
  // Field of study match
  const fieldPrograms: Record<string, string[]> = {
    'engineering': ['Engineering'],
    'business': ['Business'],
    'computer_science': ['Computer Science'],
    'medicine': ['Medicine'],
    'arts': ['Arts', 'Liberal Arts'],
    'science': ['Natural Sciences', 'Science']
  };
  
  const relevantPrograms = fieldPrograms[userPrefs.fieldOfStudy] || [];
  if (relevantPrograms.some(prog => university.programs.includes(prog))) {
    score += 15;
  }
  
  // GPA compatibility (simplified)
  const userGpa = parseFloat(userPrefs.gpa) || 0;
  const requiredGpa = parseFloat(university.gpaRequirement) || 0;
  if (userGpa >= requiredGpa) {
    score += 10;
  }
  
  return Math.min(score, 98);
}

function generateMatchReasons(userPrefs: any, university: any): string[] {
  const reasons = [];
  
  if (userPrefs.preferredCountries?.includes(university.country)) {
    reasons.push(`Located in your preferred country: ${university.country}`);
  }
  
  const budgetRanges: Record<string, number> = {
    'under_20k': 20000,
    '20k_40k': 40000,
    '40k_60k': 60000, 
    'above_60k': 100000
  };
  
  const maxBudget = budgetRanges[userPrefs.budgetRange] || 100000;
  if (university.tuitionFee <= maxBudget) {
    if (university.tuitionFee === 0) {
      reasons.push('No tuition fees - excellent value');
    } else {
      reasons.push('Fits within your budget range');
    }
  }
  
  const fieldPrograms: Record<string, string[]> = {
    'engineering': ['Engineering'],
    'business': ['Business'],
    'computer_science': ['Computer Science'],
    'medicine': ['Medicine'],
    'arts': ['Arts', 'Liberal Arts'],
    'science': ['Natural Sciences', 'Science']
  };
  
  const relevantPrograms = fieldPrograms[userPrefs.fieldOfStudy] || [];
  if (relevantPrograms.some(prog => university.programs.includes(prog))) {
    reasons.push(`Strong programs in ${userPrefs.fieldOfStudy.replace('_', ' ')}`);
  }
  
  if (university.ranking <= 50) {
    reasons.push('Highly ranked globally');
  }
  
  const userGpa = parseFloat(userPrefs.gpa) || 0;
  const requiredGpa = parseFloat(university.gpaRequirement) || 0;
  if (userGpa >= requiredGpa + 0.2) {
    reasons.push('Your GPA exceeds requirements');
  } else if (userGpa >= requiredGpa) {
    reasons.push('Meets GPA requirements');
  }
  
  return reasons;
}

router.post('/generate-recommendations', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const assessmentData = req.body;
    
    // Filter and score universities
    let recommendations = sampleUniversities
      .map(uni => ({
        ...uni,
        matchScore: calculateMatchScore(assessmentData, uni),
        matchReasons: generateMatchReasons(assessmentData, uni)
      }))
      .filter(uni => {
        // Only include universities in preferred countries if specified
        if (assessmentData.preferredCountries?.length > 0) {
          return assessmentData.preferredCountries.includes(uni.country);
        }
        return true;
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5); // Top 5 recommendations

    // Generate summary
    const avgMatch = Math.round(recommendations.reduce((sum, uni) => sum + uni.matchScore, 0) / recommendations.length);
    const topCountries = Array.from(new Set(recommendations.map(uni => uni.country)));
    
    const summary = `Based on your ${assessmentData.fieldOfStudy.replace('_', ' ')} background and preferences, we found ${recommendations.length} excellent matches with an average compatibility of ${avgMatch}%. Your top recommendations span ${topCountries.join(', ')}, offering diverse opportunities within your budget range.`;

    const result = {
      universities: recommendations,
      summary,
      assessmentData,
      generatedAt: new Date().toISOString()
    };

    res.json(result);
    
  } catch (error) {
    console.error('Assessment error:', error);
    res.status(500).json({ 
      error: 'Assessment failed', 
      message: 'Please try again or contact support' 
    });
  }
});

export default router;