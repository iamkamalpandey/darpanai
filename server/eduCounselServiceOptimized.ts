import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { countryWorkflowStorage } from './countryWorkflowStorage';
import { scholarshipStorage } from './scholarshipStorage';
import { db } from './db';

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
    
    // EXPLICIT APPLICATION INTENT DETECTION - Only trigger when user clearly wants to apply
    const explicitApplicationKeywords = [
      'i want to apply', 'start application', 'apply now', 'begin application', 
      'ready to apply', 'apply for', 'start my application', 'let me apply'
    ];
    
    const hasExplicitApplicationIntent = explicitApplicationKeywords.some(keyword => 
      messageLower.includes(keyword)
    );
    
    if (hasExplicitApplicationIntent) {
      console.log('🎯 Explicit application intent detected - starting application workflow');
      
      // Extract country and field mentions
      const countries = ['australia', 'canada', 'usa', 'uk', 'united kingdom', 'germany', 'netherlands'];
      const mentionedCountry = countries.find(country => messageLower.includes(country));
      
      const fields = ['information technology', 'computer science', 'engineering', 'business', 'it', 'cs'];
      const mentionedField = fields.find(field => messageLower.includes(field));
      
      return await startStructuredApplicationFlow(userProfile, mentionedCountry, mentionedField);
    }
    
    // Use AI for ALL messages to provide personalized, database-driven responses
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
 * Generate contextual AI response using real database information
 */
async function generateMinimalAIResponse(message: string, userProfile: UserProfile): Promise<EduCounselResponse> {
  try {
    console.log('🔍 Generating contextualized AI response for:', message);
    
    // Get relevant data from database
    const [scholarships, relevantCountries] = await Promise.all([
      getRelevantScholarships(message, userProfile),
      getRelevantCountries(message, userProfile)
    ]);

    // Enhanced system prompt with real data context
    const systemPrompt = `You are Alex, a professional study abroad counselor with access to real institutional data.

PERSONALITY: Be warm, knowledgeable, and genuinely helpful like Apple's customer service approach.

AVAILABLE DATA:
${scholarships.length > 0 ? `Relevant Scholarships: ${scholarships.map(s => `${s.name} (${s.targetCountries?.join(', ')}) - ${s.fundingType}`).join('; ')}` : ''}
${countries.length > 0 ? `Countries info available: ${countries.join(', ')}` : ''}

USER CONTEXT:
- Name: ${userProfile.firstName || 'Student'}
- From: ${userProfile.nationality || 'international'}
- Field: ${userProfile.fieldOfStudy || 'exploring options'}
- Interested countries: ${userProfile.preferredCountries?.join(', ') || 'open to suggestions'}

GUIDELINES:
1. Use the available data to give specific, helpful answers
2. If scholarships match their query, mention 2-3 specific ones with key details
3. Provide realistic cost ranges and requirements
4. Be conversational and encouraging, not sales-y
5. After helpful info, ask if they want to explore applications or need guidance
6. Keep under 200 words but be comprehensive

Focus on being genuinely helpful first, then offer next steps naturally.`;

    console.log('🔍 Generating AI response with context for message:', message);
    console.log('📊 Database context:', { scholarshipsFound: scholarships.length, countriesFound: countries.length });
    console.log('🎯 System prompt preview:', systemPrompt.substring(0, 200) + '...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 300,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ]
    });
    
    console.log('🤖 OpenAI response received:', response.choices[0]?.message?.content?.substring(0, 100) + '...');
    console.log('📋 Scholarships being used:', scholarships.map((s: any) => s.name || 'Unknown').join(', '));
    
    const content = response.choices[0]?.message?.content || 'I can help you with study abroad planning. What specific information would you like to know?';
    
    // Determine appropriate action buttons based on context and message content
    const actionButtons: ActionButton[] = [];
    const messageLower = message.toLowerCase();
    
    // Check if user is showing interest in applying or ready to proceed
    const showingApplicationInterest = messageLower.includes('ready') || 
                                       messageLower.includes('want to') || 
                                       messageLower.includes('should i apply') ||
                                       messageLower.includes('apply') ||
                                       messageLower.includes('interested') ||
                                       scholarships.length > 0; // If we found relevant scholarships
    
    if (showingApplicationInterest) {
      actionButtons.push({
        type: 'apply_now',
        label: 'Start Application',
        description: 'Begin your university application process'
      });
    }
    
    // Always offer consultation as an option
    actionButtons.push({
      type: 'book_consultation',
      label: 'Speak with Counselor',
      description: 'Get personalized guidance from education expert'
    });
    
    return {
      response: content,
      actionButtons
    };
    
  } catch (error: any) {
    console.error('❌ Error in AI response generation:', error);
    console.error('Error details:', error?.message || 'Unknown error');
    
    // Try Anthropic as fallback
    try {
      console.log('🔄 Trying Anthropic fallback...');
      const anthropicResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 250,
        temperature: 0.4,
        messages: [
          {
            role: "user",
            content: `You are Alex, a friendly study abroad counselor. Answer this question helpfully and conversationally: "${message}". Keep response under 150 words. Focus on being helpful, not pushy.`
          }
        ]
      });
      
      const anthropicContent = (anthropicResponse.content[0] as any)?.text || 'I can help with study abroad planning. What specific information would you like?';
      console.log('✅ Anthropic fallback successful');
      
      return {
        response: anthropicContent,
        actionButtons: [{
          type: 'book_consultation',
          label: 'Speak with Counselor',
          description: 'Get expert guidance from our education team'
        }]
      };
    } catch (anthropicError) {
      console.error('❌ Anthropic fallback also failed:', anthropicError);
      
      return {
        response: `I can help you with studying abroad! Whether you're looking for information about universities, application requirements, costs, or visa processes - just ask me anything.\n\nWhat would you like to know about studying internationally?`,
        actionButtons: [{
          type: 'book_consultation',
          label: 'Speak with Counselor',
          description: 'Get expert guidance from our education team'
        }]
      };
    }
  }
}

/**
 * Get relevant scholarships based on message content and user profile
 */
async function getRelevantScholarships(message: string, userProfile: UserProfile): Promise<any[]> {
  try {
    const messageLower = message.toLowerCase();
    console.log('🔍 Searching scholarships for message:', message);
    
    // Extract countries mentioned in message
    const countryKeywords = ['australia', 'usa', 'canada', 'uk', 'germany', 'netherlands', 'europe'];
    const mentionedCountries = countryKeywords.filter(country => messageLower.includes(country));
    
    // Use user preferred countries if no countries mentioned
    const searchCountries = mentionedCountries.length > 0 ? mentionedCountries : userProfile.preferredCountries || [];
    console.log('🌍 Search countries:', searchCountries);
    
    // If scholarship storage is available, use it
    if (scholarshipStorage && scholarshipStorage.searchScholarships) {
      const searchParams = {
        limit: 3,
        offset: 0,
        search: searchCountries.join(' '),
        studyLevel: userProfile.studyLevel || '',
        providerCountry: searchCountries.length > 0 ? searchCountries[0] : undefined,
        fieldCategory: userProfile.fieldOfStudy || ''
      };
      
      console.log('📝 Search params:', searchParams);
      const result = await scholarshipStorage.searchScholarships(searchParams);
      console.log('🎯 Scholarship results:', result);
      return result.scholarships || [];
    }
    
    // Fallback: return sample scholarships based on mentioned countries
    if (mentionedCountries.includes('australia')) {
      return [
        { name: 'Australia Awards Scholarship', fundingType: 'Full funding', targetCountries: ['Australia'] },
        { name: 'Endeavour Scholarship', fundingType: 'Partial funding', targetCountries: ['Australia'] }
      ];
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error fetching scholarships:', error);
    return [];
  }
}

/**
 * Get relevant country information
 */
async function getRelevantCountries(message: string, userProfile: UserProfile): Promise<string[]> {
  try {
    const messageLower = message.toLowerCase();
    
    // Extract countries mentioned in message
    const countryKeywords = ['australia', 'usa', 'canada', 'uk', 'germany', 'netherlands'];
    const mentionedCountries = countryKeywords.filter(country => messageLower.includes(country));
    
    if (mentionedCountries.length > 0) {
      return mentionedCountries;
    }
    
    // Return user's preferred countries
    return userProfile.preferredCountries || [];
  } catch (error) {
    console.error('Error processing countries:', error);
    return [];
  }
}