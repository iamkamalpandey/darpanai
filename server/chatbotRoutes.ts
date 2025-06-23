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

// Analyze conversation context for personalized responses
function analyzeConversationContext(conversationHistory: any[], userProfile: UserProfile) {
  const recentMessages = conversationHistory.slice(-10);
  const userMessages = recentMessages.filter(msg => msg.type === 'user');
  const botMessages = recentMessages.filter(msg => msg.type === 'bot');
  
  const discussedTopics = [];
  const userContent = userMessages.map(msg => msg.content.toLowerCase()).join(' ');
  
  if (userContent.includes('scholarship')) discussedTopics.push('scholarships');
  if (userContent.includes('engineering') || userContent.includes('computer')) discussedTopics.push('engineering');
  if (userContent.includes('business') || userContent.includes('management')) discussedTopics.push('business');
  if (userContent.includes('medicine') || userContent.includes('health')) discussedTopics.push('medicine');
  if (userContent.includes('country') || userContent.includes('australia') || userContent.includes('canada')) discussedTopics.push('countries');
  if (userContent.includes('funding') || userContent.includes('cost') || userContent.includes('financial')) discussedTopics.push('financial');
  
  return {
    discussedTopics,
    isFollowUp: conversationHistory.length > 4,
    conversationLength: recentMessages.length,
    hasProfileData: !!(userProfile.fieldOfStudy || userProfile.interestedCourse || userProfile.preferredCountries?.length),
    lastUserQuery: userMessages[userMessages.length - 1]?.content || '',
    recentContext: userMessages.slice(-3).map(msg => msg.content).join(' ')
  };
}

// Enhanced response generation with conversation context
function generateContextualResponse(
  message: string, 
  userProfile: UserProfile, 
  scholarships: ScholarshipMatch[], 
  analysis: any,
  conversationContext?: any
): string {
  const hasScholarships = scholarships.length > 0;
  const topMatch = scholarships[0];
  
  // Context-aware opening
  let response = "";
  
  if (conversationContext?.isFollowUp && conversationContext.discussedTopics.includes('scholarships')) {
    response = "Based on our conversation, here are more scholarship opportunities that match your interests:\n\n";
  } else if (userProfile.fieldOfStudy || userProfile.interestedCourse) {
    const field = userProfile.fieldOfStudy || userProfile.interestedCourse;
    response = `Great! I found ${scholarships.length} scholarship${scholarships.length !== 1 ? 's' : ''} relevant to ${field}:\n\n`;
  } else {
    response = `I found ${scholarships.length} scholarship${scholarships.length !== 1 ? 's' : ''} that match your query:\n\n`;
  }
  
  if (hasScholarships) {
    scholarships.slice(0, 3).forEach((scholarship, index) => {
      response += `${index + 1}. **${scholarship.name}** (${scholarship.matchScore}% match)\n`;
      response += `   • Provider: ${scholarship.providerName}, ${scholarship.providerCountry}\n`;
      response += `   • Funding: ${scholarship.fundingType} - ${scholarship.totalValueMax}\n`;
      response += `   • Deadline: ${scholarship.applicationDeadline}\n`;
      if (scholarship.matchReasons.length > 0) {
        response += `   • Why it matches: ${scholarship.matchReasons[0]}\n`;
      }
      response += `\n`;
    });
    
    // Context-aware follow-up suggestions
    if (conversationContext?.discussedTopics.includes('countries') && userProfile.preferredCountries?.length) {
      response += `\nI notice you're interested in ${userProfile.preferredCountries.slice(0, 2).join(' and ')}. Would you like me to find more opportunities specifically in these countries?`;
    } else if (conversationContext?.discussedTopics.includes('engineering') || conversationContext?.discussedTopics.includes('business')) {
      response += `\nWould you like me to find more specialized opportunities in your field, or do you need information about application processes?`;
    } else {
      response += `\nWould you like more details about any of these scholarships, or shall I search for opportunities with different criteria?`;
    }
  }
  
  return response;
}

function generateNoResultsResponse(
  message: string, 
  userProfile: UserProfile, 
  analysis: any,
  conversationContext?: any
): string {
  let response = "I couldn't find scholarships matching your exact criteria, but let me help you in other ways:\n\n";
  
  // Context-aware suggestions
  if (conversationContext?.discussedTopics.includes('scholarships')) {
    response += "Since we've been discussing scholarships, here are some suggestions:\n";
    response += "• Try broadening your search criteria\n";
    response += "• Consider related fields of study\n";
    response += "• Look at different study levels\n\n";
  }
  
  if (userProfile.fieldOfStudy || userProfile.interestedCourse) {
    const field = userProfile.fieldOfStudy || userProfile.interestedCourse;
    response += `For ${field} students, I recommend:\n`;
    response += "• Checking government scholarships in your target countries\n";
    response += "• Looking at university-specific funding opportunities\n";
    response += "• Considering partial funding options\n\n";
  }
  
  response += "Could you provide more details about your preferred study level, countries, or field of study? This will help me find better matches.";
  
  return response;
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

// Intelligent analysis of user intent to determine what data is needed
function analyzeUserIntent(message: string): {
  intent: string;
  needsUserProfile: boolean;
  needsScholarshipData: boolean;
  needsAnalysisData: boolean;
  emotion: string;
  responseType: string;
} {
  const lowerMessage = message.toLowerCase().trim();
  
  // Simple greetings - no data needed
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)$/)) {
    return {
      intent: 'greeting',
      needsUserProfile: false,
      needsScholarshipData: false,
      needsAnalysisData: false,
      emotion: 'neutral',
      responseType: 'greeting'
    };
  }
  
  // Help requests - minimal data needed
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do') || lowerMessage.includes('how do you work')) {
    return {
      intent: 'help_request',
      needsUserProfile: false,
      needsScholarshipData: false,
      needsAnalysisData: false,
      emotion: 'neutral',
      responseType: 'help'
    };
  }
  
  // General questions - no specific data needed
  if (lowerMessage.startsWith('what is') || lowerMessage.startsWith('tell me about') || lowerMessage.startsWith('explain')) {
    return {
      intent: 'general_info',
      needsUserProfile: false,
      needsScholarshipData: false,
      needsAnalysisData: false,
      emotion: 'neutral',
      responseType: 'information'
    };
  }
  
  // Personalized requests - needs analysis data
  if (lowerMessage.includes('my analysis') || lowerMessage.includes('personalized') || lowerMessage.includes('my documents') || lowerMessage.includes('based on my profile')) {
    return {
      intent: 'personalized_request',
      needsUserProfile: true,
      needsScholarshipData: true,
      needsAnalysisData: true,
      emotion: 'neutral',
      responseType: 'personalized'
    };
  }
  
  // Scholarship searches - needs scholarship database and user profile
  if (lowerMessage.includes('scholarship') || lowerMessage.includes('funding') || lowerMessage.includes('grant') || lowerMessage.includes('financial aid')) {
    return {
      intent: 'scholarship_search',
      needsUserProfile: true,
      needsScholarshipData: true,
      needsAnalysisData: false,
      emotion: 'neutral',
      responseType: 'search'
    };
  }
  
  // Academic/study queries - needs user profile and possibly scholarships
  if (lowerMessage.includes('study') || lowerMessage.includes('degree') || lowerMessage.includes('course') || lowerMessage.includes('program')) {
    const needsScholarships = lowerMessage.includes('scholarship') || lowerMessage.includes('funding');
    return {
      intent: 'academic_info',
      needsUserProfile: true,
      needsScholarshipData: needsScholarships,
      needsAnalysisData: false,
      emotion: 'neutral',
      responseType: 'academic'
    };
  }
  
  // Country/destination queries
  if (lowerMessage.includes('country') || lowerMessage.includes('destination') || lowerMessage.includes('where to study')) {
    return {
      intent: 'destination_info',
      needsUserProfile: true,
      needsScholarshipData: true,
      needsAnalysisData: false,
      emotion: 'neutral',
      responseType: 'destination'
    };
  }
  
  // Emotional support needed
  if (lowerMessage.includes('confused') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('lost') || lowerMessage.includes('stressed')) {
    return {
      intent: 'guidance_needed',
      needsUserProfile: true,
      needsScholarshipData: false,
      needsAnalysisData: false,
      emotion: 'concerned',
      responseType: 'support'
    };
  }
  
  // Default for other queries - minimal data access
  return {
    intent: 'general_query',
    needsUserProfile: false,
    needsScholarshipData: false,
    needsAnalysisData: false,
    emotion: 'neutral',
    responseType: 'general'
  };
}

// Generate intelligent response based on user intent and available data
async function generateIntelligentResponse(
  userMessage: string,
  messageAnalysis: any,
  userPersonalContext: any,
  scholarships: any[],
  analysisContext: any,
  includeAnalysisData: boolean = false
): Promise<{ message: string; metadata: any; suggestAnalysisAccess?: boolean }> {
  
  let responseMessage = "";
  let emotion = messageAnalysis.emotion || 'supportive';
  let intent = messageAnalysis.intent;
  let suggestAnalysisAccess = false;
  
  switch (messageAnalysis.responseType) {
    case 'greeting':
      responseMessage = "Hello! I'm Darpan AI, your scholarship guidance assistant. I help you find scholarship opportunities from our comprehensive database. What would you like to know about scholarships or study abroad opportunities?";
      if (analysisContext.totalAnalyses > 0) {
        responseMessage += ` I can also provide personalized recommendations based on your ${analysisContext.totalAnalyses} document analysis${analysisContext.totalAnalyses > 1 ? 'es' : ''}.`;
        suggestAnalysisAccess = true;
      }
      break;
      
    case 'help':
      responseMessage = "I can help you with:\n\n• Finding scholarships from our database\n• Academic guidance for study abroad\n• Country recommendations\n• Personalized suggestions based on your profile\n\nJust ask me about any of these topics! For example, try 'Show me scholarships for engineering' or 'Which countries are good for computer science?'";
      break;
      
    case 'search':
      if (scholarships.length > 0) {
        responseMessage = `I found ${scholarships.length} scholarship${scholarships.length > 1 ? 's' : ''} matching your query:\n\n`;
        scholarships.forEach((scholarship, index) => {
          responseMessage += `${index + 1}. **${scholarship.name}**\n`;
          responseMessage += `   • Provider: ${scholarship.providerName} (${scholarship.providerCountry})\n`;
          responseMessage += `   • Funding: ${scholarship.fundingType}\n`;
          if (scholarship.totalValueMax) {
            responseMessage += `   • Value: Up to ${scholarship.totalValueMax}\n`;
          }
          responseMessage += `   • Match Score: ${scholarship.matchScore}%\n\n`;
        });
        responseMessage += "Would you like more details about any of these scholarships?";
      } else {
        responseMessage = "I searched our scholarship database but didn't find matches for your specific criteria. Could you provide more details about your field of study, academic level, or preferred countries? This will help me find better matches.";
      }
      break;
      
    case 'personalized':
      if (includeAnalysisData && analysisContext.totalAnalyses > 0) {
        responseMessage = `Using your ${analysisContext.recentAnalysisTypes.join(', ')} analysis data for personalized recommendations:\n\n`;
        if (scholarships.length > 0) {
          scholarships.forEach((scholarship, index) => {
            responseMessage += `${index + 1}. ${scholarship.name} - ${scholarship.matchScore}% match\n`;
          });
        } else {
          responseMessage += "Based on your documents, I'm searching for the most suitable scholarships. Let me know your specific interests for targeted results.";
        }
      } else if (analysisContext.totalAnalyses > 0) {
        responseMessage = `I see you have ${analysisContext.totalAnalyses} document analysis available. Would you like me to use this data for personalized scholarship recommendations?`;
        suggestAnalysisAccess = true;
      } else {
        responseMessage = "For personalized recommendations, you can upload your documents for analysis first. This helps me understand your academic background and provide targeted scholarship suggestions.";
      }
      break;
      
    case 'support':
      responseMessage = "I understand that searching for scholarships and planning study abroad can feel overwhelming. You're taking the right step by seeking guidance. Let's break this down into manageable steps:\n\n";
      responseMessage += "1. First, tell me your field of study\n";
      responseMessage += "2. Share your preferred countries or regions\n";
      responseMessage += "3. Let me know your academic level\n\n";
      responseMessage += "With this information, I can search our database for suitable opportunities and guide you through the process step by step.";
      emotion = 'empathetic';
      break;
      
    default:
      responseMessage = "I'm Darpan AI, and I specialize in helping you find scholarships and study abroad opportunities. To provide you with the most relevant information, could you tell me what specific aspect you'd like help with? I can search scholarships, provide academic guidance, or offer country recommendations.";
  }
  
  return {
    message: responseMessage,
    metadata: { emotion, intent },
    suggestAnalysisAccess
  };
}

// Fallback response generator for when main system fails
function generateFallbackResponse(messageAnalysis: any, message: string): string {
  switch (messageAnalysis.responseType) {
    case 'greeting':
      return "Hello! I'm Darpan AI, your scholarship guidance assistant. How can I help you find scholarship opportunities today?";
    
    case 'help':
      return "I can help you with:\n• Finding scholarships from our database\n• Academic guidance for study abroad\n• Country recommendations\n• Personalized suggestions\n\nWhat would you like to know about?";
    
    case 'search':
      return "I'd be happy to help you find scholarships! Could you tell me more about your field of study, academic level, or preferred countries?";
    
    case 'support':
      return "I understand that planning for study abroad can feel overwhelming. Let's take it step by step. What specific area would you like guidance on?";
    
    default:
      return "I'm Darpan AI, and I'm here to help you find scholarship opportunities. What would you like to know about scholarships or study abroad?";
  }
}

// Legacy function for backward compatibility
async function generatePrivacyFocusedResponse(
  userMessage: string, 
  userProfile: UserProfile, 
  scholarships: ScholarshipMatch[],
  analysisContext: any,
  includeAnalysisData: boolean = false
): Promise<{ message: string; metadata: any; suggestAnalysisAccess?: boolean }> {
  
  const analysis = analyzeUserMessage(userMessage);
  let responseMessage = "";
  let emotion = 'supportive';
  let intent = 'guidance';
  let suggestAnalysisAccess = false;
  
  // Check if user wants to use their document analysis
  if (userMessage.toLowerCase().includes('use my analysis') || 
      userMessage.toLowerCase().includes('personalized') ||
      userMessage.toLowerCase().includes('my documents') ||
      userMessage.toLowerCase().includes('yes') && analysisContext.totalAnalyses > 0) {
    includeAnalysisData = true;
    responseMessage = "I'll now use your document analysis data for more personalized recommendations. ";
  }
  
  // Greeting responses with analysis suggestion
  if (analysis.intent === 'general' && (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi') || userMessage.toLowerCase().includes('hey'))) {
    responseMessage = "Hello! I'm Darpan AI, your scholarship guidance assistant. I help you find scholarships from our database using only your personal information. ";
    
    if (analysisContext.totalAnalyses > 0) {
      responseMessage += `I see you have ${analysisContext.totalAnalyses} document analysis in your account. Would you like me to use this for more personalized recommendations? `;
      suggestAnalysisAccess = true;
    }
    
    responseMessage += "What field of study are you interested in?";
    emotion = 'supportive';
    intent = 'greeting';
  }
  
  // Scholarship search with privacy focus
  else if (analysis.intent === 'scholarship_search' || scholarships.length > 0) {
    if (scholarships.length > 0) {
      responseMessage = `I found ${scholarships.length} scholarship matches in our database based on your profile:\n\n`;
      
      scholarships.forEach((scholarship, index) => {
        responseMessage += `${index + 1}. ${scholarship.name}\n`;
        responseMessage += `   Provider: ${scholarship.providerName} (${scholarship.providerCountry})\n`;
        responseMessage += `   Funding: ${scholarship.fundingType}\n`;
        if (scholarship.totalValueMax) {
          responseMessage += `   Value: Up to ${scholarship.totalValueMax}\n`;
        }
        if (scholarship.applicationDeadline) {
          const deadline = new Date(scholarship.applicationDeadline);
          responseMessage += `   Deadline: ${deadline.toLocaleDateString()}\n`;
        }
        responseMessage += `   Match Score: ${scholarship.matchScore}%\n\n`;
      });
      
      if (includeAnalysisData && analysisContext.totalAnalyses > 0) {
        responseMessage += `These matches consider your ${analysisContext.recentAnalysisTypes.join(', ')} analysis data. `;
      } else if (analysisContext.totalAnalyses > 0 && !includeAnalysisData) {
        responseMessage += "I can provide more targeted matches using your document analysis. Would you like me to access that? ";
        suggestAnalysisAccess = true;
      }
      
      responseMessage += "Need details about any scholarship?";
      emotion = 'encouraging';
      intent = 'matching';
    } else {
      responseMessage = "No matches found in our database for your current criteria. ";
      
      if (!userProfile.interestedCourse) {
        responseMessage += "What's your field of study? ";
      }
      if (!userProfile.preferredCountries || userProfile.preferredCountries.length === 0) {
        responseMessage += "Which countries interest you? ";
      }
      if (!userProfile.highestQualification) {
        responseMessage += "What's your academic level? ";
      }
      
      if (analysisContext.totalAnalyses > 0 && !includeAnalysisData) {
        responseMessage += "I can also use your document analysis for better matching. Should I access that? ";
        suggestAnalysisAccess = true;
      }
      
      emotion = 'supportive';
      intent = 'guidance';
    }
  }
  
  // Default response
  else {
    responseMessage = "I'm Darpan AI. I find scholarships using only your personal data - never accessing other users' information. ";
    
    if (analysisContext.totalAnalyses > 0) {
      responseMessage += `You have ${analysisContext.totalAnalyses} document analysis available for personalized matching. `;
      suggestAnalysisAccess = true;
    }
    
    responseMessage += "To help you, please share:\n• Your field of study\n• Academic level\n• Preferred countries\n\nI'll search our database for matching scholarships.";
    emotion = 'supportive';
    intent = 'guidance';
  }
  
  return {
    message: responseMessage,
    metadata: { emotion, intent },
    suggestAnalysisAccess
  };
}

// Get user's cached personal data for chatbot context
async function getUserPersonalContext(userId: number): Promise<any> {
  try {
    // Get user's basic profile data only - never access other users' data
    const { db } = await import('./db');
    const { users } = await import('../shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) return {};
    
    // Return only this user's personal data
    return {
      academicLevel: user.highestQualification,
      fieldOfStudy: user.interestedCourse,
      preferredCountries: user.preferredCountries || [],
      budgetRange: user.budgetRange,
      nationality: user.nationality,
      highestQualification: user.highestQualification
    };
  } catch (error) {
    console.error('[User Context] Error:', error);
    return {};
  }
}

// Get user's analysis data for enhanced personalization (only their own data)
async function getUserAnalysisContext(userId: number): Promise<any> {
  try {
    const { db } = await import('./db');
    const { analyses, offerLetterAnalyses } = await import('../shared/schema');
    const { eq } = await import('drizzle-orm');
    
    // Get only this user's analyses - never access other users' data
    const userAnalyses = await db.select().from(analyses).where(eq(analyses.userId, userId));
    const userOfferLetters = await db.select().from(offerLetterAnalyses).where(eq(offerLetterAnalyses.userId, userId));
    
    return {
      hasVisaAnalysis: userAnalyses.length > 0,
      hasOfferLetterAnalysis: userOfferLetters.length > 0,
      hasCoeAnalysis: false, // Simplified for now
      totalAnalyses: userAnalyses.length + userOfferLetters.length,
      recentAnalysisTypes: [
        ...(userAnalyses.length > 0 ? ['visa'] : []),
        ...(userOfferLetters.length > 0 ? ['offer_letter'] : [])
      ]
    };
  } catch (error) {
    console.error('[Analysis Context] Error:', error);
    return {
      hasVisaAnalysis: false,
      hasOfferLetterAnalysis: false,
      hasCoeAnalysis: false,
      totalAnalyses: 0,
      recentAnalysisTypes: []
    };
  }
}

// Enhanced response generator with optional analysis context
async function generateEnhancedDarpanResponse(
  userMessage: string,
  userProfile: UserProfile,
  scholarships: ScholarshipMatch[],
  analysisContext: any,
  includeAnalysisData: boolean = false
): Promise<{ message: string; metadata: any; suggestAnalysisAccess?: boolean }> {
  
  const analysis = analyzeUserMessage(userMessage);
  let responseMessage = "";
  let emotion = 'supportive';
  let intent = 'guidance';
  let suggestAnalysisAccess = false;
  
  // Check if user wants to access their analysis data for personalization
  if (userMessage.toLowerCase().includes('use my analysis') || 
      userMessage.toLowerCase().includes('personalized') ||
      userMessage.toLowerCase().includes('my documents')) {
    if (analysisContext.totalAnalyses > 0) {
      includeAnalysisData = true;
      responseMessage = "I can now access your document analysis data to provide more personalized scholarship recommendations. ";
    } else {
      responseMessage = "I don't see any document analyses in your account yet. You can upload documents for analysis to get more personalized recommendations. ";
    }
  }
  
  // Greeting responses
  if (analysis.intent === 'general' && (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi') || userMessage.toLowerCase().includes('hey'))) {
    responseMessage = "Hello! I'm Darpan AI, your scholarship guidance assistant. I'm here to help you discover scholarship opportunities from our comprehensive database. ";
    
    if (analysisContext.totalAnalyses > 0) {
      responseMessage += `I see you have ${analysisContext.totalAnalyses} document analysis${analysisContext.totalAnalyses > 1 ? 'es' : ''} in your account. Would you like me to use this data for more personalized scholarship recommendations? `;
      suggestAnalysisAccess = true;
    }
    
    responseMessage += "What field of study are you interested in?";
    emotion = 'supportive';
    intent = 'greeting';
  }
  
  // Enhanced scholarship search with analysis context
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
      
      // Suggest using analysis data for better matching
      if (includeAnalysisData && analysisContext.totalAnalyses > 0) {
        responseMessage += `Based on your ${analysisContext.recentAnalysisTypes.join(', ')} document analysis, I can provide more targeted recommendations. `;
      } else if (analysisContext.totalAnalyses > 0 && !includeAnalysisData) {
        responseMessage += "Would you like me to use your document analysis data for more personalized matching? ";
        suggestAnalysisAccess = true;
      }
      
      responseMessage += "Would you like more details about any of these scholarships?";
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
      
      if (analysisContext.totalAnalyses > 0 && !includeAnalysisData) {
        responseMessage += "I can also use your document analysis data for more accurate matching. Would you like me to access that information? ";
        suggestAnalysisAccess = true;
      }
      
      responseMessage += "This information will help me find better matches in our database.";
      emotion = 'supportive';
      intent = 'guidance';
    }
  }
  
  // Academic information with analysis enhancement
  else if (analysis.intent === 'academic_info') {
    responseMessage = "I can help you find scholarships based on your academic background. Our database includes opportunities for various fields of study and academic levels. ";
    
    if (includeAnalysisData && analysisContext.hasCoeAnalysis) {
      responseMessage += "I can see from your COE analysis that you have specific academic requirements. ";
    }
    
    if (analysis.keywords.length > 0) {
      responseMessage += `I noticed you mentioned ${analysis.keywords.join(', ')}. `;
    }
    
    responseMessage += "What specific field are you studying or planning to study? Also, what's your current academic level?";
    emotion = 'supportive';
    intent = 'guidance';
  }
  
  // Default response
  else {
    responseMessage = "I'm Darpan AI, and I'm here to help you find scholarships from our comprehensive database. ";
    
    if (analysisContext.totalAnalyses > 0) {
      responseMessage += `I see you have ${analysisContext.totalAnalyses} document analysis${analysisContext.totalAnalyses > 1 ? 'es' : ''} that could help me provide more personalized recommendations. `;
      suggestAnalysisAccess = true;
    }
    
    responseMessage += "To provide you with the most relevant opportunities, could you tell me:\n\n";
    responseMessage += "• Your field of study\n";
    responseMessage += "• Your academic level (Bachelor's, Master's, PhD)\n";
    responseMessage += "• Your preferred study destinations\n\n";
    responseMessage += "The more specific you are, the better I can match you with suitable scholarships!";
    emotion = 'supportive';
    intent = 'guidance';
  }
  
  return {
    message: responseMessage,
    metadata: { emotion, intent },
    suggestAnalysisAccess
  };
}

// Main chatbot endpoint
router.post("/scholarship-match", requireAuth, async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [], includeAnalysisData = false } = req.body;
    const userId = (req.user as any).id;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Message is required"
      });
    }
    
    console.log(`[Scholarship Chatbot] Processing message for user ${userId}: "${message.substring(0, 100)}..."`);
    
    // First, analyze what the user is asking to determine data needs
    const messageAnalysis = analyzeUserIntent(message);
    
    // Only fetch data that's actually needed based on user intent
    let userPersonalContext: any = {};
    let analysisContext: any = { totalAnalyses: 0, recentAnalysisTypes: [] };
    let scholarships: any[] = [];
    
    // Get user profile only if needed for the query
    if (messageAnalysis.needsUserProfile) {
      userPersonalContext = await getUserPersonalContext(userId);
    }
    
    // Get analysis context only if personalization is requested
    if (messageAnalysis.needsAnalysisData || includeAnalysisData) {
      analysisContext = await getUserAnalysisContext(userId);
    }
    
    // Search scholarships only if the query is scholarship-related
    if (messageAnalysis.needsScholarshipData) {
      scholarships = await findMatchingScholarships(message, userPersonalContext);
    }
    
    // Generate intelligent response based on user intent and available data
    let aiResponse;
    try {
      aiResponse = await generateIntelligentResponse(
        message, 
        messageAnalysis,
        userPersonalContext, 
        scholarships, 
        analysisContext,
        includeAnalysisData
      );
    } catch (responseError) {
      console.error('[Response Generation] Error:', responseError);
      // Fallback response generation
      aiResponse = {
        message: generateFallbackResponse(messageAnalysis, message),
        metadata: { emotion: 'supportive', intent: messageAnalysis.intent },
        suggestAnalysisAccess: false
      };
    }
    
    res.json({
      success: true,
      message: aiResponse.message || "Hello! I'm Darpan AI. How can I help you find scholarships today?",
      scholarships: scholarships,
      metadata: aiResponse.metadata || { emotion: 'supportive', intent: 'guidance' },
      suggestAnalysisAccess: aiResponse.suggestAnalysisAccess || false,
      analysisContext: {
        hasData: analysisContext.totalAnalyses > 0,
        types: analysisContext.recentAnalysisTypes || []
      },
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