import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { countryWorkflowStorage } from './countryWorkflowStorage';

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
      response: `**Which country interests you most?**\n\nChoose from our supported countries with structured application workflows:`,
      actionButtons: [{
        type: 'complete_profile',
        label: 'Select Country',
        description: 'Choose your preferred destination'
      }],
      requiresSelection: {
        type: 'country',
        options: [
          'Australia',
          'United Kingdom', 
          'Canada',
          'United States',
          'Germany',
          'Other Country (Book Consultation)'
        ],
        question: 'Which country would you like to study in?'
      }
    };
  }
  
  // Check for country-specific workflow support
  const targetCountry = mentionedCountry || userProfile.preferredCountries?.[0] || '';
  const studyLevel = userProfile.studyLevel?.toLowerCase() || 'bachelor';
  
  return await checkCountryWorkflowSupport(targetCountry, studyLevel, userProfile);
}

/**
 * Check country workflow support and route accordingly
 */
async function checkCountryWorkflowSupport(country: string, studyLevel: string, userProfile: UserProfile): Promise<EduCounselResponse> {
  try {
    // Normalize country name to country code
    const countryMap: Record<string, string> = {
      'australia': 'AU',
      'canada': 'CA', 
      'usa': 'US',
      'united states': 'US',
      'uk': 'GB',
      'united kingdom': 'GB',
      'germany': 'DE'
    };
    
    const countryCode = countryMap[country.toLowerCase()];
    
    if (!countryCode) {
      // Unsupported country - redirect to consultation
      return {
        response: `I understand you're interested in studying in ${country}. Since this country requires specialized guidance beyond our AI capabilities, I'd recommend booking a consultation with our education experts.\n\nOur consultants have extensive experience with ${country}'s specific requirements and can provide personalized guidance.`,
        actionButtons: [{
          type: 'book_consultation',
          label: 'Book Expert Consultation',
          description: `Get specialized guidance for ${country}`
        }]
      };
    }
    
    // Check if we have a workflow for this country and study level
    const workflow = await countryWorkflowStorage.getWorkflowByCountry(countryCode, studyLevel);
    
    if (workflow) {
      // Supported country with structured workflow
      return {
        response: `Perfect! I can guide you through ${workflow.countryName}'s ${studyLevel} application process step-by-step.\n\n**${workflow.workflowTitle}**\n${workflow.workflowDescription || 'Complete application workflow'}\n\nLet's start with your structured application workflow. I'll collect all required information and documents systematically.`,
        actionButtons: [{
          type: 'apply_now',
          label: `Start ${workflow.countryName} Application`,
          description: workflow.workflowDescription || workflow.workflowTitle,
          url: `/country-workflow/${countryCode}/${studyLevel}`
        }]
      };
    } else {
      // Country supported but no specific workflow yet
      return {
        response: `${countryCode === 'AU' ? 'Australia' : countryCode === 'CA' ? 'Canada' : countryCode === 'US' ? 'United States' : countryCode === 'GB' ? 'United Kingdom' : 'Germany'} is one of our supported destinations! While I'm setting up the structured workflow for ${studyLevel} programs, let me connect you with our expert consultants who can provide immediate guidance.\n\nThey'll help you with:\n• Application requirements\n• Document preparation\n• Timeline planning\n• Visa guidance`,
        actionButtons: [{
          type: 'book_consultation',
          label: 'Book Expert Consultation',
          description: `Get immediate guidance for ${countryCode === 'AU' ? 'Australia' : countryCode === 'CA' ? 'Canada' : countryCode === 'US' ? 'United States' : countryCode === 'GB' ? 'United Kingdom' : 'Germany'}`
        }]
      };
    }
  } catch (error) {
    console.error('Error checking country workflow support:', error);
    return {
      response: 'Let me connect you with our education consultants who can provide expert guidance for your study abroad journey.',
      actionButtons: [{
        type: 'book_consultation',
        label: 'Book Consultation',
        description: 'Get expert guidance'
      }]
    };
  }
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