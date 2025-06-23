import { Router, Request, Response } from "express";
import { scholarshipStorage } from "./scholarshipStorage";
// Auth middleware
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required"
    });
  }
  next();
};
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229"
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface UserProfile {
  academicLevel?: string;
  fieldOfStudy?: string;
  gpa?: number;
  preferredCountries?: string[];
  budgetRange?: string;
  nationality?: string;
  highestQualification?: string;
  interestedCourse?: string;
}

interface ScholarshipMatch {
  id: number;
  name: string;
  providerName: string;
  providerCountry: string;
  fundingType: string;
  totalValueMax: string;
  applicationDeadline: string;
  matchScore: number;
  matchReasons: string[];
}

// Helper function to extract user intent and emotions
function analyzeUserMessage(message: string): { intent: string; emotion: string; keywords: string[] } {
  const lowerMessage = message.toLowerCase();
  
  // Detect intent
  let intent = 'general';
  if (lowerMessage.includes('scholarship') || lowerMessage.includes('funding') || lowerMessage.includes('financial aid')) {
    intent = 'scholarship_search';
  } else if (lowerMessage.includes('study') || lowerMessage.includes('major') || lowerMessage.includes('degree')) {
    intent = 'academic_info';
  } else if (lowerMessage.includes('country') || lowerMessage.includes('abroad') || lowerMessage.includes('international')) {
    intent = 'destination_info';
  } else if (lowerMessage.includes('help') || lowerMessage.includes('confused') || lowerMessage.includes('lost')) {
    intent = 'guidance_needed';
  }
  
  // Detect emotion/tone
  let emotion = 'neutral';
  if (lowerMessage.includes('worried') || lowerMessage.includes('stressed') || lowerMessage.includes('difficult')) {
    emotion = 'concerned';
  } else if (lowerMessage.includes('excited') || lowerMessage.includes('amazing') || lowerMessage.includes('great')) {
    emotion = 'positive';
  } else if (lowerMessage.includes('confused') || lowerMessage.includes('unsure') || lowerMessage.includes('don\'t know')) {
    emotion = 'uncertain';
  }
  
  // Extract keywords
  const keywords: string[] = [];
  const academicKeywords = ['computer science', 'engineering', 'medicine', 'business', 'arts', 'science', 'phd', 'master', 'bachelor'];
  const countryKeywords = ['usa', 'canada', 'uk', 'australia', 'germany', 'france', 'netherlands'];
  
  academicKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) keywords.push(keyword);
  });
  
  countryKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) keywords.push(keyword);
  });
  
  return { intent, emotion, keywords };
}

// Helper function to find matching scholarships
async function findMatchingScholarships(userMessage: string, userProfile: UserProfile): Promise<ScholarshipMatch[]> {
  try {
    const analysis = analyzeUserMessage(userMessage);
    const searchParams: any = {
      limit: 5,
      offset: 0
    };
    
    // Build search parameters based on user message and profile
    if (analysis.keywords.some(k => k.includes('phd'))) {
      searchParams.studyLevels = ['PhD', 'Doctorate'];
    } else if (analysis.keywords.some(k => k.includes('master'))) {
      searchParams.studyLevels = ['Masters', 'Graduate'];
    } else if (analysis.keywords.some(k => k.includes('bachelor'))) {
      searchParams.studyLevels = ['Bachelor', 'Undergraduate'];
    }
    
    // Add field-based matching
    if (analysis.keywords.some(k => k.includes('computer science') || k.includes('engineering'))) {
      searchParams.fieldCategories = ['Engineering', 'Technology', 'Computer Science'];
    } else if (analysis.keywords.some(k => k.includes('business'))) {
      searchParams.fieldCategories = ['Business', 'Management'];
    } else if (analysis.keywords.some(k => k.includes('medicine'))) {
      searchParams.fieldCategories = ['Medicine', 'Health Sciences'];
    }
    
    // Add country preferences
    if (userProfile.preferredCountries && userProfile.preferredCountries.length > 0) {
      searchParams.hostCountries = userProfile.preferredCountries;
    }
    
    const result = await scholarshipStorage.searchScholarships(searchParams);
    
    // Calculate match scores and reasons
    const matches: ScholarshipMatch[] = result.scholarships.map(scholarship => {
      let matchScore = 50; // Base score
      const matchReasons: string[] = [];
      
      // Academic level matching
      if (scholarship.studyLevels && Array.isArray(scholarship.studyLevels) && userProfile.highestQualification) {
        const userLevel = userProfile.highestQualification.toLowerCase();
        const scholarshipLevels = scholarship.studyLevels.map((l: any) => l.toLowerCase());
        
        if (scholarshipLevels.some((level: any) => userLevel.includes(level) || level.includes(userLevel))) {
          matchScore += 20;
          matchReasons.push('Academic level match');
        }
      }
      
      // Field of study matching
      if (scholarship.fieldCategories && Array.isArray(scholarship.fieldCategories) && userProfile.interestedCourse) {
        const userField = userProfile.interestedCourse.toLowerCase();
        const scholarshipFields = scholarship.fieldCategories.map((f: any) => f.toLowerCase());
        
        if (scholarshipFields.some((field: any) => userField.includes(field) || field.includes(userField))) {
          matchScore += 25;
          matchReasons.push('Field of study match');
        }
      }
      
      // Country preference matching
      if (scholarship.hostCountries && Array.isArray(scholarship.hostCountries) && userProfile.preferredCountries) {
        const commonCountries = scholarship.hostCountries.filter((country: any) => 
          userProfile.preferredCountries!.includes(country)
        );
        if (commonCountries.length > 0) {
          matchScore += 15;
          matchReasons.push('Preferred country');
        }
      }
      
      // Funding type preference
      if (scholarship.fundingType === 'full') {
        matchScore += 10;
        matchReasons.push('Full funding available');
      }
      
      // Deadline urgency
      if (scholarship.applicationDeadline) {
        const deadlineDate = new Date(scholarship.applicationDeadline);
        const now = new Date();
        const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDeadline > 30 && daysUntilDeadline < 180) {
          matchScore += 5;
          matchReasons.push('Good application timeline');
        }
      }
      
      // Cap at 100%
      matchScore = Math.min(matchScore, 100);
      
      return {
        id: scholarship.id,
        name: scholarship.name,
        providerName: scholarship.providerName,
        providerCountry: scholarship.providerCountry,
        fundingType: scholarship.fundingType,
        totalValueMax: scholarship.totalValueMax || '',
        applicationDeadline: scholarship.applicationDeadline || '',
        matchScore,
        matchReasons
      };
    });
    
    // Sort by match score and return top matches
    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
    
  } catch (error) {
    console.error('[Scholarship Matching] Error:', error);
    return [];
  }
}

// Generate empathetic AI response
async function generateEmphatheticResponse(
  userMessage: string, 
  userProfile: UserProfile, 
  scholarships: ScholarshipMatch[],
  conversationHistory: ChatMessage[]
): Promise<{ message: string; metadata: any }> {
  
  const analysis = analyzeUserMessage(userMessage);
  
  try {
    const contextPrompt = `You are an empathetic scholarship counselor AI assistant helping students find educational funding opportunities. Your role is to provide supportive, encouraging, and practical guidance.

User Profile Context:
- Academic Level: ${userProfile.highestQualification || 'Not specified'}
- Field of Interest: ${userProfile.interestedCourse || 'Not specified'}
- Preferred Countries: ${userProfile.preferredCountries?.join(', ') || 'Not specified'}
- Budget Range: ${userProfile.budgetRange || 'Not specified'}

User's Current Message: "${userMessage}"
Detected Intent: ${analysis.intent}
Detected Emotion: ${analysis.emotion}
Keywords: ${analysis.keywords.join(', ')}

${scholarships.length > 0 ? `Found ${scholarships.length} matching scholarships:
${scholarships.map(s => `- ${s.name} (${s.matchScore}% match): ${s.providerName}, ${s.providerCountry}`).join('\n')}` : 'No specific scholarships found for this query.'}

Instructions:
1. Be empathetic and supportive, especially if the user seems worried or uncertain
2. Provide practical advice and encouragement
3. If scholarships were found, briefly highlight why they're good matches
4. If no scholarships found, provide guidance on how to improve their search or profile
5. Ask follow-up questions to better understand their needs
6. Keep response conversational and warm, under 200 words
7. Use encouraging language and acknowledge their goals

Respond in a supportive, friendly tone as if you're a caring counselor who genuinely wants to help them succeed.`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 300,
      messages: [{ role: 'user', content: contextPrompt }],
    });

    const aiMessage = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Determine response metadata
    let emotion = 'supportive';
    let intent = 'guidance';
    
    if (analysis.emotion === 'concerned') {
      emotion = 'empathetic';
    } else if (scholarships.length > 0) {
      emotion = 'encouraging';
      intent = 'matching';
    } else if (analysis.intent === 'scholarship_search') {
      emotion = 'supportive';
      intent = 'guidance';
    }
    
    return {
      message: aiMessage,
      metadata: { emotion, intent }
    };
    
  } catch (error) {
    console.error('[AI Response] Error:', error);
    
    // Fallback empathetic response
    let fallbackMessage = "I understand you're looking for scholarship opportunities, and I'm here to help you every step of the way! ";
    
    if (scholarships.length > 0) {
      fallbackMessage += `I found ${scholarships.length} scholarships that could be perfect for you. Each one has been selected based on your background and goals. `;
    } else {
      fallbackMessage += "While I didn't find specific matches right now, don't worry - there are thousands of opportunities out there! ";
    }
    
    fallbackMessage += "Could you tell me more about your field of study or preferred study destination? This will help me find even better matches for you! 🌟";
    
    return {
      message: fallbackMessage,
      metadata: { emotion: 'supportive', intent: 'guidance' }
    };
  }
}

// Main chatbot endpoint
router.post("/scholarship-match", requireAuth, async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [], userProfile = {} } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Message is required"
      });
    }
    
    console.log(`[Scholarship Chatbot] Processing message: "${message.substring(0, 100)}..."`);
    
    // Find matching scholarships
    const scholarships = await findMatchingScholarships(message, userProfile);
    
    // Generate empathetic AI response
    const aiResponse = await generateEmphatheticResponse(
      message, 
      userProfile, 
      scholarships, 
      conversationHistory
    );
    
    res.json({
      success: true,
      message: aiResponse.message,
      scholarships: scholarships,
      metadata: aiResponse.metadata,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('[Scholarship Chatbot] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to process chat message"
    });
  }
});

// Get conversation starters
router.get("/conversation-starters", async (req: Request, res: Response) => {
  try {
    const starters = [
      {
        text: "I'm studying computer science and looking for scholarships",
        category: "Academic Field"
      },
      {
        text: "What scholarships are available for international students?",
        category: "International"
      },
      {
        text: "I need full funding for my PhD program",
        category: "PhD Funding"
      },
      {
        text: "Show me scholarships for studying in Europe",
        category: "Destination"
      },
      {
        text: "I'm worried about finding funding for my studies",
        category: "Support"
      },
      {
        text: "What are the best scholarships for STEM fields?",
        category: "STEM"
      }
    ];
    
    res.json({
      success: true,
      data: starters
    });
    
  } catch (error) {
    console.error('[Conversation Starters] Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to get conversation starters"
    });
  }
});

export default router;