// Public chat service for non-authenticated users - Enhanced with EduCounsel AI functionality
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { countryWorkflowStorage } from './countryWorkflowStorage';
import { scholarshipStorage } from './scholarshipStorage';
import { getCachedResponse, cacheResponse, isSimpleQuery, getSimpleResponse } from './responseCache';

// Initialize AI clients with triple fallback (same as EduCounsel AI)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1'
});

// The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
// If the user doesn't specify a model, always prefer using "claude-sonnet-4-20250514" as it is the latest model.
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

interface PublicChatRequest {
  message: string;
  sessionId?: string; // Optional session tracking for non-authenticated users
}

interface PublicChatResponse {
  response: string;
  actionButtons?: Array<{
    type: string;
    label: string;
    description: string;
  }>;
}

// Enhanced conversation store with user context tracking and resource protection
interface UserContext {
  messageCount: number;
  detailsCollected: boolean;
  informationProvided: boolean;
  registrationPrompted: boolean;
  lastInteractionTime: number;
  dailyQueryCount: number;
  userInfo: {
    name?: string;
    email?: string;
    field?: string;
    level?: string;
    country?: string;
    budget?: string;
    phone?: string;
  };
  restrictedQueriesAsked: number; // Track resource-heavy queries
}

const publicConversations = new Map<string, Array<{ role: string; content: string }>>();
const userContexts = new Map<string, UserContext>();

export async function handlePublicChat(request: PublicChatRequest): Promise<PublicChatResponse> {
  try {
    const { message, sessionId = 'default' } = request;
    
    console.log('🌐 Processing public chat message:', message.substring(0, 50) + '...');

    // Get or create conversation history for this session
    let conversationHistory = publicConversations.get(sessionId) || [];
    let userContext = userContexts.get(sessionId) || {
      messageCount: 0,
      detailsCollected: false,
      userInfo: {}
    };

    // Increment message count
    userContext.messageCount++;
    
    // Add user message to history
    conversationHistory.push({ role: 'user', content: message });

    // Keep conversation history limited for performance
    if (conversationHistory.length > 12) {
      conversationHistory = conversationHistory.slice(-12);
    }

    // Check if we should collect user details (after 2-3 interactions)
    const shouldCollectDetails = userContext.messageCount >= 2 && !userContext.detailsCollected;

    // Check for cached response first (same as EduCounsel AI optimization)
    const cacheKey = `public_${message.toLowerCase().trim()}`;
    const cachedResponse = getCachedResponse(cacheKey);
    
    if (cachedResponse) {
      console.log('💾 Using cached response');
      const actionButtons = generateContextualActionButtons(message, cachedResponse, userContext);
      return { response: cachedResponse, actionButtons };
    }

    // Handle simple queries without AI processing
    if (isSimpleQuery(message)) {
      const simpleResponse = getSimpleResponse(message);
      const actionButtons = generateContextualActionButtons(message, simpleResponse, userContext);
      return { response: simpleResponse, actionButtons };
    }

    // Extract user details from conversation if not collected yet
    if (shouldCollectDetails) {
      extractUserDetails(message, userContext);
    }

    // Get database context for better AI responses (same as EduCounsel AI)
    const dbContext = await getDatabaseContextForAI(message, userContext);

    // Create enhanced system prompt with database context
    const systemPrompt = createEnhancedSystemPrompt(userContext, shouldCollectDetails, dbContext);

    let aiResponse = '';

    try {
      // Try Anthropic Claude first
      console.log('🎯 Attempting Anthropic Claude...');
      const claudeResponse = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        system: systemPrompt,
        messages: conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        max_tokens: 150
      });

      aiResponse = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';
      console.log('✅ Anthropic Claude response received');
    } catch (claudeError) {
      console.log('⚠️ Anthropic Claude failed, trying OpenAI...');
      
      try {
        // Fallback to OpenAI
        const openaiResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            }))
          ],
          max_tokens: 150,
          temperature: 0.7
        });

        aiResponse = openaiResponse.choices[0]?.message?.content || '';
        console.log('✅ OpenAI response received');
      } catch (openaiError) {
        console.error('❌ All AI services failed:', openaiError);
        aiResponse = "I'm experiencing technical difficulties. Please try again in a moment, or create an account for access to our full platform with personalized guidance.";
      }
    }

    // Add AI response to conversation history
    conversationHistory.push({ role: 'assistant', content: aiResponse });
    publicConversations.set(sessionId, conversationHistory);
    userContexts.set(sessionId, userContext);

    // Generate appropriate action buttons based on content and context
    const actionButtons = generateContextualActionButtons(message, aiResponse, userContext);

    return {
      response: aiResponse,
      actionButtons
    };

  } catch (error) {
    console.error('💥 Public chat service error:', error);
    return {
      response: "I apologize for the technical issue. Please try again or create an account for full access to our study abroad guidance platform.",
      actionButtons: [
        {
          type: 'create_account',
          label: 'Create Free Account',
          description: 'Get personalized guidance and full platform access'
        }
      ]
    };
  }
}

// Extract user details from conversation context
function extractUserDetails(message: string, userContext: UserContext): void {
  const lowerMessage = message.toLowerCase();

  // Extract field of study
  if (!userContext.userInfo.field) {
    if (lowerMessage.includes('computer') || lowerMessage.includes('software') || lowerMessage.includes('it')) {
      userContext.userInfo.field = 'Computer Science';
    } else if (lowerMessage.includes('business') || lowerMessage.includes('mba') || lowerMessage.includes('management')) {
      userContext.userInfo.field = 'Business';
    } else if (lowerMessage.includes('engineering') || lowerMessage.includes('mechanical') || lowerMessage.includes('electrical')) {
      userContext.userInfo.field = 'Engineering';
    } else if (lowerMessage.includes('medicine') || lowerMessage.includes('medical') || lowerMessage.includes('health')) {
      userContext.userInfo.field = 'Medicine';
    }
  }

  // Extract study level
  if (!userContext.userInfo.level) {
    if (lowerMessage.includes('master') || lowerMessage.includes('msc') || lowerMessage.includes('graduate')) {
      userContext.userInfo.level = 'Masters';
    } else if (lowerMessage.includes('bachelor') || lowerMessage.includes('undergraduate') || lowerMessage.includes('bsc')) {
      userContext.userInfo.level = 'Bachelors';
    } else if (lowerMessage.includes('phd') || lowerMessage.includes('doctorate') || lowerMessage.includes('research')) {
      userContext.userInfo.level = 'PhD';
    }
  }

  // Extract preferred countries
  if (!userContext.userInfo.country) {
    if (lowerMessage.includes('usa') || lowerMessage.includes('america') || lowerMessage.includes('united states')) {
      userContext.userInfo.country = 'USA';
    } else if (lowerMessage.includes('canada')) {
      userContext.userInfo.country = 'Canada';
    } else if (lowerMessage.includes('uk') || lowerMessage.includes('britain') || lowerMessage.includes('england')) {
      userContext.userInfo.country = 'UK';
    } else if (lowerMessage.includes('australia')) {
      userContext.userInfo.country = 'Australia';
    } else if (lowerMessage.includes('germany')) {
      userContext.userInfo.country = 'Germany';
    }
  }

  // Extract budget information
  if (!userContext.userInfo.budget) {
    if (lowerMessage.includes('$') || lowerMessage.includes('cost') || lowerMessage.includes('budget') || lowerMessage.includes('affordable')) {
      if (lowerMessage.includes('low') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable')) {
        userContext.userInfo.budget = 'Low Budget';
      } else if (lowerMessage.includes('high') || lowerMessage.includes('expensive') || lowerMessage.includes('premium')) {
        userContext.userInfo.budget = 'High Budget';
      } else {
        userContext.userInfo.budget = 'Medium Budget';
      }
    }
  }

  // Mark details as collected if we have enough information
  if (userContext.userInfo.field && userContext.userInfo.level) {
    userContext.detailsCollected = true;
  }
}

// Create contextual system prompt based on user context
function createContextualSystemPrompt(userContext: UserContext, shouldCollectDetails: boolean): string {
  let basePrompt = `You are Darpan Intelligence, an AI study abroad advisor helping students explore international education opportunities.

STRICT COMPLIANCE GUIDELINES:
- NEVER recommend specific education consultancies, agencies, or service providers
- NEVER compare or rank consultancies as "best" or "worst"
- ONLY provide general study abroad guidance and educational information
- NEVER share business confidential information, technical details, or company strategies
- Focus exclusively on educational guidance, requirements, and processes

Provide helpful, accurate information about:
- University admission requirements and processes
- Cost estimates and budgeting guidance  
- Scholarship opportunities and funding options
- Visa requirements and application timelines
- Academic pathway planning and course selection
- Country-specific education systems and requirements

Guidelines:
- Be encouraging and supportive
- Provide specific, actionable educational advice
- Keep responses concise but informative (max 120 tokens)
- For consultancy questions, redirect to general guidance: "I focus on educational guidance rather than recommending specific service providers"
- Always suggest next steps or offer additional help`;

  // Add personalization if we have user context
  if (userContext.userInfo.field || userContext.userInfo.level || userContext.userInfo.country) {
    basePrompt += `\n\nUser Context:`;
    if (userContext.userInfo.field) basePrompt += `\n- Field of Interest: ${userContext.userInfo.field}`;
    if (userContext.userInfo.level) basePrompt += `\n- Study Level: ${userContext.userInfo.level}`;
    if (userContext.userInfo.country) basePrompt += `\n- Preferred Country: ${userContext.userInfo.country}`;
    if (userContext.userInfo.budget) basePrompt += `\n- Budget Range: ${userContext.userInfo.budget}`;
    basePrompt += `\n\nUse this context to provide more targeted advice.`;
  }

  // Add detail collection guidance
  if (shouldCollectDetails && userContext.messageCount >= 2) {
    basePrompt += `\n\nAfter answering their question, gently ask for their field of study and study level to provide better recommendations. Keep it natural and helpful.`;
  }

  // Encourage account creation for personalization
  if (userContext.messageCount >= 3) {
    basePrompt += `\n\nFor detailed personalized guidance, suggest creating a free account.`;
  }

  return basePrompt;
}

// Enhanced system prompt with database context (same as EduCounsel AI)
function createEnhancedSystemPrompt(userContext: UserContext, shouldCollectDetails: boolean, dbContext: any): string {
  let basePrompt = `You are Darpan Intelligence, an AI study abroad advisor helping students explore international education opportunities.

STRICT COMPLIANCE GUIDELINES:
- NEVER recommend specific education consultancies, agencies, or service providers
- NEVER compare or rank consultancies as "best" or "worst"
- ONLY provide general study abroad guidance and educational information
- NEVER share business confidential information, technical details, or company strategies
- Focus exclusively on educational guidance, requirements, and processes

Provide helpful, accurate information about:
- University admission requirements and processes
- Cost estimates and budgeting guidance  
- Scholarship opportunities and funding options
- Visa requirements and application timelines
- Academic pathway planning and course selection
- Country-specific education systems and requirements

Guidelines:
- Be encouraging and supportive
- Provide specific, actionable educational advice
- Keep responses concise but informative (max 100 tokens)
- For consultancy questions, redirect to general guidance: "I focus on educational guidance rather than recommending specific service providers"
- Always suggest next steps or offer additional help`;

  // Add database context for more informed responses
  if (dbContext.scholarshipsFound > 0) {
    basePrompt += `\n\nAvailable scholarships in database: ${dbContext.scholarshipsFound} relevant opportunities found.`;
  }

  if (dbContext.countriesFound > 0) {
    basePrompt += `\n\nCountry information available for ${dbContext.countriesFound} destinations.`;
  }

  // Add personalization if we have user context
  if (userContext.userInfo.field || userContext.userInfo.level || userContext.userInfo.country) {
    basePrompt += `\n\nUser Context:`;
    if (userContext.userInfo.field) basePrompt += `\n- Field of Interest: ${userContext.userInfo.field}`;
    if (userContext.userInfo.level) basePrompt += `\n- Study Level: ${userContext.userInfo.level}`;
    if (userContext.userInfo.country) basePrompt += `\n- Preferred Country: ${userContext.userInfo.country}`;
    if (userContext.userInfo.budget) basePrompt += `\n- Budget Range: ${userContext.userInfo.budget}`;
    basePrompt += `\n\nUse this context to provide more targeted advice.`;
  }

  // Add detail collection guidance
  if (shouldCollectDetails && userContext.messageCount >= 2) {
    basePrompt += `\n\nAfter answering their question, gently ask for their field of study and study level to provide better recommendations. Keep it natural and helpful.`;
  }

  // Encourage account creation for personalization
  if (userContext.messageCount >= 3) {
    basePrompt += `\n\nFor detailed personalized guidance, suggest creating a free account.`;
  }

  return basePrompt;
}

// Get database context for AI responses (same as EduCounsel AI)
async function getDatabaseContextForAI(message: string, userContext: UserContext): Promise<any> {
  const lowerMessage = message.toLowerCase();
  let scholarshipsFound = 0;
  let countriesFound = 0;

  // Check for scholarship-related queries
  if (lowerMessage.includes('scholarship') || lowerMessage.includes('funding') || lowerMessage.includes('financial aid')) {
    try {
      const scholarships = await scholarshipStorage.getAllScholarships();
      scholarshipsFound = scholarships.length;
    } catch (error) {
      console.error('Error fetching scholarships for context:', error);
    }
  }

  // Check for country-related queries
  if (lowerMessage.includes('country') || lowerMessage.includes('usa') || lowerMessage.includes('canada') || 
      lowerMessage.includes('uk') || lowerMessage.includes('australia') || lowerMessage.includes('germany')) {
    try {
      const countries = await countryWorkflowStorage.getAllCountries();
      countriesFound = countries.length;
    } catch (error) {
      console.error('Error fetching countries for context:', error);
    }
  }

  return {
    scholarshipsFound,
    countriesFound
  };
}

// Enhanced action button generation based on context
function generateContextualActionButtons(userMessage: string, aiResponse: string, userContext: UserContext): Array<{ type: string; label: string; description: string }> {
  const message = userMessage.toLowerCase();
  const response = aiResponse.toLowerCase();
  const buttons: Array<{ type: string; label: string; description: string }> = [];

  // Contextual buttons based on user progress and information
  
  // If we have collected some user info, offer more personalized actions
  if (userContext.detailsCollected && userContext.userInfo.field && userContext.userInfo.level) {
    buttons.push({
      type: 'personalized_universities',
      label: `Find ${userContext.userInfo.level} Programs`,
      description: `Discover ${userContext.userInfo.field} programs that match your profile`
    });

    if (userContext.userInfo.country) {
      buttons.push({
        type: 'country_specific_info',
        label: `Study in ${userContext.userInfo.country}`,
        description: `Get detailed information about studying in ${userContext.userInfo.country}`
      });
    }
  } else {
    // Standard buttons for early conversations
    if (message.includes('university') || message.includes('college') || message.includes('school')) {
      buttons.push({
        type: 'explore_universities',
        label: 'Find Universities',
        description: 'Get personalized university recommendations'
      });
    }

    if (message.includes('cost') || message.includes('fee') || message.includes('expense') || message.includes('budget')) {
      buttons.push({
        type: 'cost_calculator',
        label: 'Calculate Costs',
        description: 'Get detailed cost estimates for studying abroad'
      });
    }

    if (message.includes('scholarship') || message.includes('funding') || message.includes('financial aid')) {
      buttons.push({
        type: 'find_scholarships',
        label: 'Find Scholarships',
        description: 'Discover scholarship opportunities'
      });
    }
  }

  // After 2-3 messages, encourage account creation for full features
  if (userContext.messageCount >= 3) {
    buttons.push({
      type: 'create_account',
      label: 'Get Full Access',
      description: 'Create free account for unlimited personalized guidance'
    });
  }

  // If we need more details, add collection buttons
  if (!userContext.detailsCollected && userContext.messageCount >= 2) {
    if (!userContext.userInfo.field) {
      buttons.push({
        type: 'select_field',
        label: 'Tell Us Your Field',
        description: 'What subject would you like to study?'
      });
    }
    if (!userContext.userInfo.level) {
      buttons.push({
        type: 'select_level',
        label: 'Choose Study Level',
        description: 'Bachelors, Masters, or PhD?'
      });
    }
  }

  // Limit to 3 buttons maximum for better UX
  return buttons.slice(0, 3);
}

// Cleanup old conversations periodically (run this with a scheduler)
export function cleanupOldConversations() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  // Simple cleanup - in production, you'd want to track timestamps
  if (publicConversations.size > 1000) {
    publicConversations.clear();
    console.log('🧹 Cleaned up old public conversations');
  }
}