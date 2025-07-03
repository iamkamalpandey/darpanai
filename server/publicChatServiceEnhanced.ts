// Enhanced Public Chat Service with International Standards for Lead Generation
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { countryWorkflowStorage } from './countryWorkflowStorage';
import { scholarshipStorage } from './scholarshipStorage';
import { getCachedResponse, cacheResponse, isSimpleQuery, getSimpleResponse } from './responseCache';

// Initialize AI clients with triple fallback
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1'
});

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

interface PublicChatRequest {
  message: string;
  conversationId: string;
}

interface PublicChatResponse {
  response: string;
  actionButtons?: Array<{
    type: string;
    label: string;
    description: string;
  }>;
  requiresRegistration?: boolean;
  leadData?: any;
}

// Enhanced user context with international standards compliance
interface EnhancedUserContext {
  messageCount: number;
  informationCollected: boolean;
  registrationPrompted: boolean;
  lastInteractionTime: number;
  dailyQueryCount: number;
  interactionStage: 'greeting' | 'info_collection' | 'limited_guidance' | 'registration_required';
  userInfo: {
    name?: string;
    email?: string;
    phone?: string;
    field?: string;
    level?: string;
    country?: string;
    budget?: string;
    timeline?: string;
  };
  resourceUsage: {
    aiQueriesUsed: number;
    databaseQueriesUsed: number;
    detailedResponsesGiven: number;
  };
}

const publicConversations = new Map<string, Array<{ role: string; content: string }>>();
const userContexts = new Map<string, EnhancedUserContext>();

export async function handleEnhancedPublicChat(request: PublicChatRequest): Promise<PublicChatResponse> {
  const { message, conversationId } = request;
  console.log(`📥 Enhanced public chat request: ${message.substring(0, 50)}...`);

  try {
    // Initialize or get user context with enhanced tracking
    let conversationHistory = publicConversations.get(conversationId) || [];
    let userContext = userContexts.get(conversationId) || {
      messageCount: 0,
      informationCollected: false,
      registrationPrompted: false,
      lastInteractionTime: Date.now(),
      dailyQueryCount: 0,
      interactionStage: 'greeting',
      userInfo: {},
      resourceUsage: {
        aiQueriesUsed: 0,
        databaseQueriesUsed: 0,
        detailedResponsesGiven: 0
      }
    };

    // Update interaction tracking
    const now = Date.now();
    const timeGap = now - userContext.lastInteractionTime;
    
    // Reset daily limits if it's a new day
    if (timeGap > 24 * 60 * 60 * 1000) {
      userContext.dailyQueryCount = 0;
      userContext.resourceUsage = {
        aiQueriesUsed: 0,
        databaseQueriesUsed: 0,
        detailedResponsesGiven: 0
      };
    }
    
    userContext.lastInteractionTime = now;
    userContext.messageCount++;
    userContext.dailyQueryCount++;

    // INTERNATIONAL STANDARD: Rate limiting for resource protection
    if (userContext.dailyQueryCount > 10) {
      return {
        response: "You've reached the daily limit for guest users. Create a free account to continue receiving unlimited personalized study abroad guidance.",
        actionButtons: [
          {
            type: "register",
            label: "Create Free Account",
            description: "Get unlimited access to personalized guidance"
          }
        ],
        requiresRegistration: true
      };
    }

    // INTERNATIONAL STANDARD: Limit AI queries for guests
    if (userContext.resourceUsage.aiQueriesUsed > 5) {
      return {
        response: "You've used your guest AI consultation limit. Register for unlimited AI-powered guidance and personalized recommendations.",
        actionButtons: [
          {
            type: "register",
            label: "Register for Full Access",
            description: "Unlimited AI guidance + document analysis"
          }
        ],
        requiresRegistration: true
      };
    }

    // Add user message to conversation
    conversationHistory.push({ role: 'user', content: message });

    // INTERNATIONAL STANDARD: Progressive information collection
    if (userContext.interactionStage === 'greeting' || userContext.messageCount <= 2) {
      const infoCollectionResponse = await handleInformationCollection(message, userContext);
      if (infoCollectionResponse) {
        // Store updated context
        userContexts.set(conversationId, userContext);
        publicConversations.set(conversationId, conversationHistory);
        return infoCollectionResponse;
      }
    }

    // Check if basic information has been collected
    if (!userContext.informationCollected && userContext.messageCount >= 3) {
      return {
        response: "To provide you with the most relevant study abroad guidance, I'd like to know more about your background. What field would you like to study, and which countries interest you most?",
        actionButtons: [
          {
            type: "info_collection",
            label: "Share My Details",
            description: "Get personalized recommendations"
          },
          {
            type: "register",
            label: "Create Account Instead",
            description: "Full access to all features"
          }
        ]
      };
    }

    // INTERNATIONAL STANDARD: Limited responses for non-registered users
    if (userContext.resourceUsage.detailedResponsesGiven >= 3 && !userContext.registrationPrompted) {
      userContext.registrationPrompted = true;
      return {
        response: "I've provided initial guidance based on your interests. For detailed university recommendations, scholarship matching, and document analysis, creating a free account will unlock our full AI-powered platform.",
        actionButtons: [
          {
            type: "register",
            label: "Create Free Account",
            description: "Access full AI guidance platform"
          }
        ],
        requiresRegistration: true,
        leadData: userContext.userInfo
      };
    }

    // Generate AI response with resource tracking
    userContext.resourceUsage.aiQueriesUsed++;
    const aiResponse = await generateEnhancedAIResponse(message, userContext, conversationHistory);
    
    if (aiResponse.includes('universities') || aiResponse.includes('scholarships') || aiResponse.length > 200) {
      userContext.resourceUsage.detailedResponsesGiven++;
    }

    // Add AI response to conversation
    conversationHistory.push({ role: 'assistant', content: aiResponse });

    // Generate contextual action buttons
    const actionButtons = generateLeadGenerationButtons(message, userContext);

    // Store updated context
    userContexts.set(conversationId, userContext);
    publicConversations.set(conversationId, conversationHistory.slice(-10)); // Keep last 10 messages

    return {
      response: aiResponse,
      actionButtons,
      leadData: userContext.userInfo
    };

  } catch (error) {
    console.error('💥 Enhanced public chat error:', error);
    return {
      response: "I'm experiencing technical difficulties. For immediate assistance, please create a free account to access our full study abroad guidance platform.",
      actionButtons: [
        {
          type: "register",
          label: "Create Free Account",
          description: "Get reliable AI guidance"
        }
      ]
    };
  }
}

// Information collection handler following international standards
async function handleInformationCollection(message: string, userContext: EnhancedUserContext): Promise<PublicChatResponse | null> {
  const lowerMessage = message.toLowerCase();

  // First interaction - welcome and collect basic info
  if (userContext.messageCount === 1) {
    return {
      response: "Welcome to Darpan Intelligence! I'm here to help you explore study abroad opportunities. To provide personalized guidance, could you tell me your name and what field you're interested in studying?",
      actionButtons: [
        {
          type: "info_collection",
          label: "Share My Details",
          description: "Get personalized guidance"
        }
      ]
    };
  }

  // Extract information from user response
  extractUserInformation(message, userContext);

  // Second interaction - collect more details
  if (userContext.messageCount === 2 && !userContext.userInfo.level) {
    return {
      response: `Thanks for sharing that information! To better assist you with ${userContext.userInfo.field || 'your studies'}, what level of study are you planning? (Bachelor's, Master's, PhD, or other)`,
      actionButtons: [
        {
          type: "study_level",
          label: "Bachelor's Degree",
          description: "Undergraduate programs"
        },
        {
          type: "study_level", 
          label: "Master's Degree",
          description: "Graduate programs"
        }
      ]
    };
  }

  // Mark information as collected if we have basic details
  if (userContext.userInfo.name || userContext.userInfo.field || userContext.userInfo.level) {
    userContext.informationCollected = true;
    userContext.interactionStage = 'limited_guidance';
  }

  return null;
}

// Enhanced AI response generation with resource optimization
async function generateEnhancedAIResponse(message: string, userContext: EnhancedUserContext, history: any[]): Promise<string> {
  // Check for cached response first
  const cacheKey = `enhanced_${message.toLowerCase().trim()}`;
  const cachedResponse = getCachedResponse(cacheKey);
  
  if (cachedResponse) {
    console.log('💾 Using cached response');
    return cachedResponse;
  }

  // Handle simple queries without AI
  if (isSimpleQuery(message)) {
    const simpleResponse = getSimpleResponse(message);
    return simpleResponse || "Hello! I'm here to help with your study abroad questions.";
  }

  // Create system prompt with strict limitations for guests
  const systemPrompt = createGuestSystemPrompt(userContext);

  let aiResponse = '';

  try {
    // Try DeepSeek first (most cost-effective)
    console.log('🎯 Attempting DeepSeek for guest...');
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.slice(-4).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ],
      max_tokens: 80, // Strict limit for guests
      temperature: 0.7
    });

    aiResponse = response.choices[0]?.message?.content || '';
    console.log('✅ DeepSeek response for guest');
  } catch (error) {
    console.log('⚠️ DeepSeek failed, using fallback...');
    
    // Simple fallback for guests to protect resources
    aiResponse = "I can provide basic study abroad information. For detailed guidance, university recommendations, and scholarship matching, please create a free account to access our full AI-powered platform.";
  }

  // Cache successful responses
  if (aiResponse && !aiResponse.includes('technical difficulties')) {
    cacheResponse(cacheKey, aiResponse, 1800); // 30 minutes cache
  }

  return aiResponse;
}

// System prompt optimized for guest users with lead generation focus
function createGuestSystemPrompt(userContext: EnhancedUserContext): string {
  let prompt = `You are Darpan Intelligence, providing LIMITED study abroad guidance to guest users.

STRICT GUEST LIMITATIONS:
- Provide only GENERAL information (max 80 tokens)
- NO specific university recommendations 
- NO detailed scholarship information
- NO consultant recommendations
- Focus on encouraging registration for detailed guidance
- Be helpful but encourage account creation for specifics

USER CONTEXT:`;

  if (userContext.userInfo.name) prompt += `\n- Name: ${userContext.userInfo.name}`;
  if (userContext.userInfo.field) prompt += `\n- Field: ${userContext.userInfo.field}`;
  if (userContext.userInfo.level) prompt += `\n- Level: ${userContext.userInfo.level}`;
  if (userContext.userInfo.country) prompt += `\n- Country Interest: ${userContext.userInfo.country}`;

  prompt += `\n\nProvide encouraging but limited guidance. For detailed questions, mention "Create a free account for comprehensive guidance."`;

  return prompt;
}

// Extract user information from messages
function extractUserInformation(message: string, userContext: EnhancedUserContext): void {
  const lowerMessage = message.toLowerCase();
  
  // Extract name (simple patterns)
  if (!userContext.userInfo.name && (lowerMessage.includes('my name is') || lowerMessage.includes("i'm ") || lowerMessage.includes('i am '))) {
    const nameMatch = message.match(/(?:my name is|i'm|i am)\s+([a-zA-Z]+)/i);
    if (nameMatch) {
      userContext.userInfo.name = nameMatch[1];
    }
  }

  // Extract field of study
  if (lowerMessage.includes('computer science') || lowerMessage.includes('cs') || lowerMessage.includes('software')) {
    userContext.userInfo.field = 'Computer Science';
  } else if (lowerMessage.includes('business') || lowerMessage.includes('mba')) {
    userContext.userInfo.field = 'Business';
  } else if (lowerMessage.includes('engineering')) {
    userContext.userInfo.field = 'Engineering';
  } else if (lowerMessage.includes('medicine') || lowerMessage.includes('medical')) {
    userContext.userInfo.field = 'Medicine';
  }

  // Extract study level
  if (lowerMessage.includes('bachelor') || lowerMessage.includes('undergraduate')) {
    userContext.userInfo.level = "Bachelor's";
  } else if (lowerMessage.includes('master') || lowerMessage.includes('graduate')) {
    userContext.userInfo.level = "Master's";
  } else if (lowerMessage.includes('phd') || lowerMessage.includes('doctorate')) {
    userContext.userInfo.level = 'PhD';
  }

  // Extract country preferences
  if (lowerMessage.includes('usa') || lowerMessage.includes('america') || lowerMessage.includes('united states')) {
    userContext.userInfo.country = 'USA';
  } else if (lowerMessage.includes('canada')) {
    userContext.userInfo.country = 'Canada';
  } else if (lowerMessage.includes('uk') || lowerMessage.includes('britain') || lowerMessage.includes('england')) {
    userContext.userInfo.country = 'UK';
  } else if (lowerMessage.includes('australia')) {
    userContext.userInfo.country = 'Australia';
  }
}

// Generate lead generation focused action buttons
function generateLeadGenerationButtons(message: string, userContext: EnhancedUserContext): Array<{ type: string; label: string; description: string }> {
  const buttons = [];

  // Always prioritize registration
  if (!userContext.registrationPrompted && userContext.messageCount >= 2) {
    buttons.push({
      type: "register",
      label: "Create Free Account",
      description: "Get unlimited personalized guidance"
    });
  }

  // Context-specific buttons
  if (message.toLowerCase().includes('scholarship') || message.toLowerCase().includes('funding')) {
    buttons.push({
      type: "scholarship_info",
      label: "Find Scholarships",
      description: "Requires free account for personalized matching"
    });
  }

  if (message.toLowerCase().includes('university') || message.toLowerCase().includes('college')) {
    buttons.push({
      type: "university_search",
      label: "University Recommendations",
      description: "Create account for AI-powered matching"
    });
  }

  if (message.toLowerCase().includes('visa') || message.toLowerCase().includes('application')) {
    buttons.push({
      type: "application_guide",
      label: "Application Guidance",
      description: "Full support available with account"
    });
  }

  return buttons;
}