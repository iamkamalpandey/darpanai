// Public chat service for non-authenticated users
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Initialize AI clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

// Enhanced conversation store with user context tracking
interface UserContext {
  messageCount: number;
  detailsCollected: boolean;
  userInfo: {
    name?: string;
    field?: string;
    level?: string;
    country?: string;
    budget?: string;
  };
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

    // Extract user details from conversation if not collected yet
    if (shouldCollectDetails) {
      extractUserDetails(message, userContext);
    }

    // Create dynamic system prompt based on context
    const systemPrompt = createContextualSystemPrompt(userContext, shouldCollectDetails);

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

Provide helpful, accurate information about:
- University recommendations and program matching
- Cost estimates and budgeting guidance  
- Scholarship opportunities and funding
- Visa requirements and application processes
- Academic pathway planning
- Country comparisons for study abroad

Guidelines:
- Be encouraging and supportive
- Provide specific, actionable advice
- Keep responses concise but informative (max 120 tokens)
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