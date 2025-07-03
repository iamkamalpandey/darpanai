import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { countryWorkflowStorage } from './countryWorkflowStorage';
import { scholarshipStorage } from './scholarshipStorage';
import { db } from './db';

// Initialize AI clients with triple fallback system
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1'
});

// Import types
interface EduCounselRequest {
  message: string;
  conversationHistory: ChatMessage[];
  userProfile: UserProfile;
}

interface EduCounselResponse {
  response: string;
  specialist?: string;
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
  phoneNumber?: string | null;
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

/**
 * Optimized EduCounsel chat processing with immediate application flow detection
 */
export async function processEduCounselChatOptimized(request: EduCounselRequest): Promise<EduCounselResponse> {
  try {
    const { message, userProfile, conversationHistory } = request;
    const messageLower = message.toLowerCase();
    
    console.log('🤖 Processing optimized EduCounsel chat for user', userProfile.id);
    
    // Extract user profile context for personalization
    const profileContext = extractUserProfileContext(userProfile);
    
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
      
      // Extract country and field mentions from current message and conversation history
      const mentionedCountry = extractCountryFromContext(message, conversationHistory);
      const mentionedField = extractFieldFromContext(message, conversationHistory);
      
      return await startStructuredApplicationFlow(userProfile, mentionedCountry, mentionedField);
    }
    
    // Use AI for ALL messages to provide personalized, database-driven responses with conversation memory
    return await generateContextualAIResponse(message, userProfile, conversationHistory, profileContext);
    
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
  
  // Step 1: Ask for study level if not provided
  if (!userProfile.studyLevel) {
    return {
      response: `Perfect, ${userProfile.firstName || 'there'}! I'll help you start your application${mentionedCountry ? ` to study in ${mentionedCountry}` : ''}.\n\n**Step 1: Which level of study are you applying for?**\n\nThis helps me recommend the right universities and programs for you.`,
      actionButtons: [{
        type: 'complete_profile',
        label: 'Continue Application',
        description: 'Select your study level'
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

  // Step 2: Request document upload for highest academic qualification
  // Check if user has uploaded academic documents recently
  const hasRecentDocument = await checkUserDocumentStatus(userProfile.id);
  
  if (!hasRecentDocument) {
    return {
      response: `Excellent choice! A **${userProfile.studyLevel}** is a great step forward.\n\n**Step 2: Upload Your Highest Academic Qualification**\n\nTo proceed with your application, I need your highest academic qualification document (transcript, certificate, or marksheet).\n\n📋 **Accepted formats:** PDF, JPG, PNG\n📏 **Maximum size:** 10MB\n🎯 **Required:** Clear, readable document showing your grades/marks`,
      actionButtons: [
        {
          type: 'apply_now',
          label: 'Upload Document',
          description: 'Upload your academic qualification',
          url: '/enhanced-academic-document-analysis'
        },
        {
          type: 'book_consultation',
          label: 'Need Help with Documents?',
          description: 'Talk to our counselor about document requirements'
        }
      ]
    };
  }

  // Step 3: Request phone number with validation
  if (!userProfile.phoneNumber || !isValidPhoneNumber(userProfile.phoneNumber)) {
    return {
      response: `Great! I have your academic documents.\n\n**Step 3: Contact Information**\n\nI need your phone number so our documentation expert can contact you within 24 hours with the next steps.\n\n📞 **Please provide your phone number with country code**\n\nExamples:\n• +1 555-123-4567 (USA)\n• +91 98765-43210 (India)\n• +61 4-1234-5678 (Australia)\n• +44 20-1234-5678 (UK)`,
      actionButtons: [
        {
          type: 'complete_profile',
          label: 'Add Phone Number',
          description: 'Complete contact information for expert callback'
        },
        {
          type: 'book_consultation',
          label: 'Book Consultation Instead',
          description: 'Schedule a direct call with our counselor'
        }
      ]
    };
  }

  // Step 4: Final confirmation and next steps
  return {
    response: `🎉 **Application Started Successfully!**\n\n**Your Application Summary:**\n• **Study Level:** ${userProfile.studyLevel}\n• **Field:** ${userProfile.fieldOfStudy || 'To be confirmed during consultation'}\n• **Country:** ${mentionedCountry || userProfile.preferredCountries?.[0] || 'To be discussed'}\n• **Contact:** ${userProfile.phoneNumber}\n• **Documents:** ✅ Uploaded and verified\n\n**What's Next?**\nOur documentation expert will contact you within 24 hours to guide you through:\n✅ University selection based on your profile\n✅ Complete document preparation checklist\n✅ Application submission timeline\n✅ Visa guidance and requirements\n✅ Scholarship opportunities\n\n**Reference ID:** APP-${Date.now()}\n\n**Do you have any other questions I can help you with right now?**`,
    actionButtons: [
      {
        type: 'book_consultation',
        label: 'Book Immediate Consultation',
        description: 'Speak with our counselor now for urgent queries'
      },
      {
        type: 'apply_now',
        label: 'Application Dashboard',
        description: 'View your application status and timeline'
      }
    ]
  };
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
 * Generate contextual AI response using real database information with conversation memory
 */
async function generateContextualAIResponse(message: string, userProfile: UserProfile, conversationHistory: ChatMessage[], profileContext: string): Promise<EduCounselResponse> {
  try {
    console.log('🔍 Generating contextualized AI response for:', message);
    
    // Get relevant data from database
    const [scholarships, relevantCountries] = await Promise.all([
      getRelevantScholarships(message, userProfile),
      getRelevantCountries(message, userProfile)
    ]);

    // Enhanced system prompt with real data context
    // Prepare conversation context with memory
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      // Use last 6 messages for better context
      const recentMessages = conversationHistory.slice(-6);
      conversationContext = `\nCONVERSATION HISTORY:\n${recentMessages.map(msg => 
        `${msg.role}: ${msg.content}`
      ).join('\n')}\n\nCONTINUE the conversation naturally, referencing previous topics when relevant.\n`;
    }

    const systemPrompt = `You are a comprehensive international education advisor powered by Darpan Intelligence, providing personalized guidance following international counseling standards with broader perspective beyond study abroad.

APPROACH: Deliver unique, non-templated responses with professional warmth and evidence-based recommendations.
${conversationContext}
EDUCATIONAL RESOURCES:
${scholarships.length > 0 ? `Available Scholarships: ${scholarships.map(s => `${s.name} (${s.targetCountries?.join(', ')}) - ${s.fundingType}`).join('; ')}` : ''}
${relevantCountries.length > 0 ? `Country Information: ${relevantCountries.join(', ')}` : ''}

STUDENT PROFILE: 
- Name: ${userProfile.firstName || 'Student'}
- Background: ${userProfile.nationality || 'international student'}
- Academic Focus: ${userProfile.fieldOfStudy || 'exploring academic pathways'}
- Destination Interest: ${userProfile.preferredCountries?.join(', ') || 'open to global opportunities'}
- Profile Context: ${profileContext}

INTERNATIONAL STANDARDS:
1. Provide comprehensive educational guidance covering academic pathways, career planning, financial strategies, and cultural adaptation
2. Generate personalized recommendations based on individual student profiles without using templates
3. Address diverse educational systems and international qualification frameworks
4. Maintain professional counseling boundaries while being supportive
5. Reference specific institutional data and scholarship opportunities when relevant
6. Focus on long-term educational success and career development
7. Offer broader perspective including university selection, program matching, visa guidance, and cultural preparation
8. Continue conversations naturally while delivering comprehensive educational insights

Provide personalized, international standard guidance prioritizing educational value and student empowerment.`;

    console.log('🔍 Generating AI response with context for message:', message);
    console.log('📊 Database context:', { scholarshipsFound: scholarships.length, countriesFound: relevantCountries.length });
    console.log('🎯 System prompt preview:', systemPrompt.substring(0, 200) + '...');
    
    // Triple AI fallback system: DeepSeek → OpenAI → Anthropic Claude
    let content = '';
    let usedModel = 'Unknown';
    
    try {
      // Try DeepSeek first (primary AI)
      console.log('🎯 Attempting DeepSeek...');
      const deepseekResponse = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        max_tokens: 300,
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      });
      content = deepseekResponse.choices[0]?.message?.content || '';
      usedModel = 'DeepSeek';
      console.log('✅ DeepSeek response received');
    } catch (deepseekError) {
      console.log('⚠️ DeepSeek failed, trying OpenAI...');
      try {
        // Fallback to OpenAI GPT (secondary AI)
        const openaiResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 300,
          temperature: 0.3,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ]
        });
        content = openaiResponse.choices[0]?.message?.content || '';
        usedModel = 'OpenAI GPT-4o-mini';
        console.log('✅ OpenAI response received');
      } catch (openaiError) {
        console.log('⚠️ OpenAI failed, trying Anthropic Claude...');
        try {
          // Final fallback to Anthropic Claude (tertiary AI)
          const anthropicResponse = await anthropic.messages.create({
            model: DEFAULT_MODEL_STR,
            max_tokens: 300,
            messages: [{
              role: 'user',
              content: `${systemPrompt}\n\nUser question: ${message}`
            }]
          });
          content = anthropicResponse.content[0]?.type === 'text' ? (anthropicResponse.content[0] as any).text : '';
          usedModel = 'Anthropic Claude';
          console.log('✅ Anthropic response received');
        } catch (anthropicError) {
          console.error('❌ All AI services failed:', { deepseekError, openaiError, anthropicError });
          content = 'I can help you with study abroad planning. What specific information would you like to know?';
          usedModel = 'Fallback';
        }
      }
    }
    
    console.log(`🤖 ${usedModel} response received:`, content.substring(0, 100) + '...');
    console.log('📋 Scholarships being used:', scholarships.map((s: any) => s.name || 'Unknown').join(', '));
    
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
    
    // Add profile extraction feedback
    let profileFeedback = '';
    if (profileContext && profileContext !== 'basic profile information') {
      profileFeedback = `\n\n💡 **Personalized Response:** I'm using your profile information (${profileContext}) to provide targeted recommendations. Want different guidance? [Update your profile](/profile) or let me know what you'd prefer to focus on.`;
    }

    return {
      response: content + profileFeedback,
      specialist: 'Darpan Intelligence',
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

/**
 * Check if user has uploaded academic documents recently
 */
async function checkUserDocumentStatus(userId: number): Promise<boolean> {
  try {
    // Check if user has uploaded any academic documents in the last 30 days
    // This would normally query the analyses table for recent document uploads
    // For now, returning false to ensure document upload step is always shown
    return false;
  } catch (error) {
    console.error('Error checking document status:', error);
    return false;
  }
}

/**
 * Validate phone number format
 */
function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  // Remove all spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it starts with + and has 10-15 digits
  const phoneRegex = /^\+[1-9]\d{9,14}$/;
  
  return phoneRegex.test(cleanPhone);
}

/**
 * Extract user profile context for personalization feedback
 */
function extractUserProfileContext(userProfile: UserProfile): string {
  const context = [];
  
  if (userProfile.fieldOfStudy) context.push(`field: ${userProfile.fieldOfStudy}`);
  if (userProfile.studyLevel) context.push(`level: ${userProfile.studyLevel}`);
  if (userProfile.preferredCountries?.length) context.push(`countries: ${userProfile.preferredCountries.join(', ')}`);
  if (userProfile.budgetRange) context.push(`budget: ${userProfile.budgetRange}`);
  
  return context.length > 0 ? context.join(', ') : 'basic profile information';
}

/**
 * Extract country mentions from message and conversation history
 */
function extractCountryFromContext(message: string, conversationHistory: ChatMessage[]): string | undefined {
  const countries = ['australia', 'canada', 'usa', 'uk', 'united kingdom', 'germany', 'netherlands'];
  const messageLower = message.toLowerCase();
  
  // Check current message first
  const mentionedCountry = countries.find(country => messageLower.includes(country));
  if (mentionedCountry) return mentionedCountry;
  
  // Check recent conversation history
  if (conversationHistory?.length > 0) {
    const recentMessages = conversationHistory.slice(-5);
    for (const msg of recentMessages) {
      const msgLower = msg.content.toLowerCase();
      const foundCountry = countries.find(country => msgLower.includes(country));
      if (foundCountry) return foundCountry;
    }
  }
  
  return undefined;
}

/**
 * Extract field of study mentions from message and conversation history
 */
function extractFieldFromContext(message: string, conversationHistory: ChatMessage[]): string | undefined {
  const fields = ['information technology', 'computer science', 'engineering', 'business', 'it', 'cs'];
  const messageLower = message.toLowerCase();
  
  // Check current message first
  const mentionedField = fields.find(field => messageLower.includes(field));
  if (mentionedField) return mentionedField;
  
  // Check recent conversation history
  if (conversationHistory?.length > 0) {
    const recentMessages = conversationHistory.slice(-5);
    for (const msg of recentMessages) {
      const msgLower = msg.content.toLowerCase();
      const foundField = fields.find(field => msgLower.includes(field));
      if (foundField) return foundField;
    }
  }
  
  return undefined;
}