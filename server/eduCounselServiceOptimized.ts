import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Import types
interface EduCounselRequest {
  message: string;
  conversationHistory: ChatMessage[];
  userProfile: UserProfile;
}

interface EduCounselResponse {
  response: string;
  actionButtons: ActionButton[];
  requiresSelection?: {
    type: 'study_level' | 'field_of_study' | 'country';
    options: string[];
    question: string;
  };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UserProfile {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  studyLevel?: string | null;
  fieldOfStudy?: string | null;
  preferredCountries?: string[] | null;
  budgetRange?: string | null;
}

interface ActionButton {
  type: 'apply_now' | 'book_consultation' | 'complete_profile';
  label: string;
  description: string;
  url?: string;
}

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Optimized EduCounsel chat processing with immediate application flow detection
 */
export async function processEduCounselChatOptimized(request: EduCounselRequest): Promise<EduCounselResponse> {
  try {
    const { message, userProfile } = request;
    const messageLower = message.toLowerCase();
    
    console.log('🤖 Processing optimized EduCounsel chat for user', userProfile.id);
    
    // IMMEDIATE APPLICATION INTENT DETECTION
    const studyKeywords = [
      'want to study', 'study in', 'apply', 'application', 'university', 'college',
      'admission', 'masters', 'bachelor', 'degree', 'course', 'program'
    ];
    
    const hasStudyIntent = studyKeywords.some(keyword => messageLower.includes(keyword));
    
    if (hasStudyIntent) {
      console.log('🎯 Study intent detected - starting immediate application workflow');
      
      // Extract country and field mentions
      const countries = ['australia', 'canada', 'usa', 'uk', 'united kingdom', 'germany', 'netherlands'];
      const mentionedCountry = countries.find(country => messageLower.includes(country));
      
      const fields = ['information technology', 'computer science', 'engineering', 'business', 'it', 'cs'];
      const mentionedField = fields.find(field => messageLower.includes(field));
      
      return await startStructuredApplicationFlow(userProfile, mentionedCountry, mentionedField);
    }
    
    // Handle simple greetings with short responses
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    if (greetings.some(greeting => messageLower.includes(greeting))) {
      return {
        response: `Hi ${userProfile.firstName || 'there'}! I'm here to help with your study abroad plans. What would you like to explore today?`,
        actionButtons: [{
          type: 'apply_now',
          label: 'Start Application',
          description: 'Begin your university application process'
        }]
      };
    }
    
    // Handle thanks
    if (messageLower.includes('thank') || messageLower.includes('thanks')) {
      return {
        response: `You're welcome! Let me know if you need any help with your study abroad journey.`,
        actionButtons: []
      };
    }
    
    // For other queries, provide minimal AI response
    return await generateMinimalAIResponse(message, userProfile);
    
  } catch (error) {
    console.error('❌ Error in optimized EduCounsel processing:', error);
    return {
      response: 'I apologize for the technical issue. Could you please rephrase your question about studying abroad?',
      actionButtons: []
    };
  }
}

/**
 * Start structured application flow with step-by-step data collection
 */
async function startStructuredApplicationFlow(
  userProfile: UserProfile, 
  mentionedCountry?: string, 
  mentionedField?: string
): Promise<EduCounselResponse> {
  
  // Check what information we're missing
  const missingInfo: string[] = [];
  
  if (!userProfile.firstName || !userProfile.lastName) {
    return {
      response: `Great! I'll help you start your application${mentionedCountry ? ` to study in ${mentionedCountry}` : ''}.\n\n**What's your full name?** (First and Last name)`,
      actionButtons: [{
        type: 'complete_profile',
        label: 'Complete Application',
        description: 'Fill in your personal information'
      }]
    };
  }
  
  if (!userProfile.studyLevel) {
    return {
      response: `Perfect, ${userProfile.firstName}!\n\nI need to know what level of study you're applying for to recommend the best universities and programs.`,
      actionButtons: [{
        type: 'complete_profile',
        label: 'Continue',
        description: 'Complete your application'
      }],
      requiresSelection: {
        type: 'study_level',
        options: [
          'Bachelor\'s Degree',
          'Master\'s Degree',
          'PhD/Doctorate',
          'Diploma/Certificate',
          'Foundation/Pathway Program'
        ],
        question: 'What level of study are you applying for?'
      }
    };
  }
  
  if (!userProfile.fieldOfStudy) {
    return {
      response: `Great choice on ${userProfile.studyLevel}!\n\nNow I need to know what field you want to study to find the best programs and universities.`,
      actionButtons: [{
        type: 'complete_profile',
        label: 'Continue',
        description: 'Complete your application'
      }],
      requiresSelection: {
        type: 'field_of_study',
        options: [
          'Information Technology',
          'Computer Science',
          'Engineering',
          'Business Administration',
          'Data Science',
          'Cybersecurity',
          'Medicine',
          'Other (please specify)'
        ],
        question: 'What field would you like to study?'
      }
    };
  }
  
  if (!userProfile.preferredCountries?.length && !mentionedCountry) {
    return {
      response: `**Which country interests you most?**\n\n• Australia\n• United Kingdom\n• Canada\n• United States\n• Germany`,
      actionButtons: [{
        type: 'complete_profile',
        label: 'Select Country',
        description: 'Choose your preferred destination'
      }]
    };
  }
  
  // If we have basic info, get institution recommendations
  try {
    const { institutionRecommendationService } = await import('./institutionRecommendationService');
    const searchCriteria = {
      preferredCountries: mentionedCountry ? [mentionedCountry] : (userProfile.preferredCountries || []),
      fieldOfStudy: mentionedField || userProfile.fieldOfStudy || 'Information Technology',
      studyLevel: userProfile.studyLevel || 'Masters',
      budgetRange: userProfile.budgetRange || 'medium'
    };
    
    const recommendations = await institutionRecommendationService.getRecommendationsForUser(searchCriteria);
    if (recommendations.length > 0) {
      const inst = recommendations[0];
      const program = inst.matchingPrograms[0];
      
      return {
        response: `Excellent! Here's your top match:\n\n🏛️ **${inst.institutionName}** (${inst.country})\n📚 ${program?.programName}\n💰 Annual Fees: ${inst.averageFees.currency} ${inst.averageFees.totalEstimated.toLocaleString()}\n📊 Match Score: ${inst.matchScore}/100\n\n**Ready to upload your academic transcripts?**`,
        actionButtons: [{
          type: 'apply_now',
          label: 'Upload Documents',
          description: 'Start document verification process'
        }]
      };
    }
  } catch (error) {
    console.error('Error getting recommendations:', error);
  }
  
  return {
    response: `Perfect! You're ready to start your application. Let's begin with uploading your academic transcripts.\n\n**Progress:** Ready to submit`,
    actionButtons: [{
      type: 'apply_now',
      label: 'Upload Documents',
      description: 'Start your application'
    }]
  };
}

/**
 * Generate minimal AI response for other queries
 */
async function generateMinimalAIResponse(message: string, userProfile: UserProfile): Promise<EduCounselResponse> {
  try {
    // Try OpenAI for faster, more concise responses
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 200,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are a study abroad counselor. Provide concise, helpful answers about education. Keep responses under 100 words. If the user shows study intent, encourage them to start their application.`
        },
        {
          role: "user",
          content: message
        }
      ]
    });
    
    const content = response.choices[0]?.message?.content || 'How can I help with your study abroad plans?';
    
    return {
      response: content,
      actionButtons: [{
        type: 'apply_now',
        label: 'Start Application',
        description: 'Begin your university application'
      }]
    };
    
  } catch (error) {
    console.error('Error in minimal AI response:', error);
    return {
      response: 'I can help you with university applications, test preparation, scholarships, and study abroad planning. What would you like to know?',
      actionButtons: [{
        type: 'apply_now',
        label: 'Start Application',
        description: 'Begin your application process'
      }]
    };
  }
}