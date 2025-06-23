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

const router = Router();

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
      if ((scholarship as any).studyLevels && Array.isArray((scholarship as any).studyLevels) && userProfile.highestQualification) {
        const userLevel = userProfile.highestQualification.toLowerCase();
        const scholarshipLevels = (scholarship as any).studyLevels.map((l: string) => l.toLowerCase());
        
        if (scholarshipLevels.some((level: string) => userLevel.includes(level) || level.includes(userLevel))) {
          matchScore += 20;
          matchReasons.push('Academic level match');
        }
      }
      
      // Field of study matching
      if ((scholarship as any).fieldCategories && Array.isArray((scholarship as any).fieldCategories) && userProfile.interestedCourse) {
        const userField = userProfile.interestedCourse.toLowerCase();
        const scholarshipFields = (scholarship as any).fieldCategories.map((f: string) => f.toLowerCase());
        
        if (scholarshipFields.some((field: string) => userField.includes(field) || field.includes(userField))) {
          matchScore += 25;
          matchReasons.push('Field of study match');
        }
      }
      
      // Country preference matching
      if ((scholarship as any).hostCountries && Array.isArray((scholarship as any).hostCountries) && userProfile.preferredCountries) {
        const commonCountries = (scholarship as any).hostCountries.filter((country: string) => 
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

// Generate natural language response based on scholarship database
async function generateDarpanResponse(
  userMessage: string, 
  userProfile: UserProfile, 
  scholarships: ScholarshipMatch[],
  conversationHistory: ChatMessage[]
): Promise<{ message: string; metadata: any }> {
  
  const analysis = analyzeUserMessage(userMessage);
  
  // Natural language processing to generate database-driven responses
  let responseMessage = "";
  let emotion = 'supportive';
  let intent = 'guidance';
  
  // Greeting responses
  if (analysis.intent === 'general' && (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi') || userMessage.toLowerCase().includes('hey'))) {
    responseMessage = "Hello! I'm Darpan AI, your scholarship guidance assistant. I'm here to help you discover scholarship opportunities from our comprehensive database. What field of study are you interested in?";
    emotion = 'supportive';
    intent = 'greeting';
  }
  
  // Scholarship search responses
  else if (analysis.intent === 'scholarship_search' || scholarships.length > 0) {
    if (scholarships.length > 0) {
      responseMessage = `Great news! I found ${scholarships.length} scholarship${scholarships.length > 1 ? 's' : ''} in our database that match your criteria:\n\n`;
      
      scholarships.forEach((scholarship, index) => {
        responseMessage += `${index + 1}. **${scholarship.name}**\n`;
        responseMessage += `   • Provider: ${scholarship.providerName} (${scholarship.providerCountry})\n`;
        responseMessage += `   • Funding: ${scholarship.fundingType}\n`;
        if (scholarship.totalValueMax) {
          responseMessage += `   • Value: Up to ${scholarship.totalValueMax}\n`;
        }
        if (scholarship.applicationDeadline) {
          const deadline = new Date(scholarship.applicationDeadline);
          responseMessage += `   • Deadline: ${deadline.toLocaleDateString()}\n`;
        }
        responseMessage += `   • Match Score: ${scholarship.matchScore}%\n\n`;
      });
      
      responseMessage += "Would you like more details about any of these scholarships, or shall I search for additional opportunities?";
      emotion = 'encouraging';
      intent = 'matching';
    } else {
      responseMessage = "I searched our scholarship database but didn't find specific matches for your current criteria. ";
      
      if (!userProfile.interestedCourse) {
        responseMessage += "Could you tell me your field of study? ";
      }
      if (!userProfile.preferredCountries || userProfile.preferredCountries.length === 0) {
        responseMessage += "Which countries are you considering for your studies? ";
      }
      if (!userProfile.highestQualification) {
        responseMessage += "What's your academic level (Bachelor's, Master's, PhD)? ";
      }
      
      responseMessage += "This information will help me find better matches in our database.";
      emotion = 'supportive';
      intent = 'guidance';
    }
  }
  
  // Academic information requests
  else if (analysis.intent === 'academic_info') {
    responseMessage = "I can help you find scholarships based on your academic background. Our database includes opportunities for various fields of study and academic levels. ";
    
    if (analysis.keywords.length > 0) {
      responseMessage += `I noticed you mentioned ${analysis.keywords.join(', ')}. `;
    }
    
    responseMessage += "What specific field are you studying or planning to study? Also, what's your current academic level?";
    emotion = 'supportive';
    intent = 'guidance';
  }
  
  // Destination information
  else if (analysis.intent === 'destination_info') {
    responseMessage = "Our scholarship database includes opportunities across many countries. ";
    
    if (analysis.keywords.some(k => ['usa', 'canada', 'uk', 'australia', 'germany'].includes(k))) {
      const mentionedCountries = analysis.keywords.filter(k => ['usa', 'canada', 'uk', 'australia', 'germany'].includes(k));
      responseMessage += `I see you're interested in ${mentionedCountries.join(', ')}. `;
    }
    
    responseMessage += "Which countries are you most interested in for your studies? I can search for scholarships specifically available in those regions.";
    emotion = 'supportive';
    intent = 'guidance';
  }
  
  // Help and guidance requests
  else if (analysis.intent === 'guidance_needed') {
    if (analysis.emotion === 'concerned') {
      responseMessage = "I understand that searching for scholarships can feel overwhelming, but you're taking the right step by seeking help. ";
      emotion = 'empathetic';
    } else {
      responseMessage = "I'm here to guide you through finding the right scholarships. ";
      emotion = 'supportive';
    }
    
    responseMessage += "Let's start with the basics: What field are you studying? What's your academic level? And which countries interest you? With this information, I can search our database for the best matches.";
    intent = 'guidance';
  }
  
  // Default response for unclear messages
  else {
    responseMessage = "I'm Darpan AI, and I'm here to help you find scholarships from our comprehensive database. To provide you with the most relevant opportunities, could you tell me:\n\n";
    responseMessage += "• Your field of study\n";
    responseMessage += "• Your academic level (Bachelor's, Master's, PhD)\n";
    responseMessage += "• Your preferred study destinations\n\n";
    responseMessage += "The more specific you are, the better I can match you with suitable scholarships!";
    emotion = 'supportive';
    intent = 'guidance';
  }
  
  return {
    message: responseMessage,
    metadata: { emotion, intent }
  };
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
    
    // Generate natural language response based on database
    const aiResponse = await generateDarpanResponse(
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