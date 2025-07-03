// Public EduCounsel AI Service with Paywall Implementation (Newspaper-style)
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Initialize AI clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1'
});

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

interface PublicEduCounselRequest {
  message: string;
  conversationId: string;
}

interface PublicEduCounselResponse {
  response: string;
  specialist: string;
  remainingResponses: number;
  paywallTriggered: boolean;
  actionButtons?: Array<{
    type: string;
    label: string;
    description: string;
  }>;
}

// Track public user sessions with paywall limits
const publicSessions = new Map<string, {
  responseCount: number;
  messages: Array<{ role: string; content: string }>;
  userInfo: any;
  lastActivity: number;
}>();

export async function handlePublicEduCounsel(request: PublicEduCounselRequest): Promise<PublicEduCounselResponse> {
  const { message, conversationId } = request;
  console.log(`📥 Public EduCounsel request: ${message.substring(0, 50)}...`);

  try {
    // Get or create session
    let session = publicSessions.get(conversationId) || {
      responseCount: 0,
      messages: [],
      userInfo: {},
      lastActivity: Date.now()
    };

    // Clean up old sessions (24 hour cleanup)
    const now = Date.now();
    if (now - session.lastActivity > 24 * 60 * 60 * 1000) {
      session = {
        responseCount: 0,
        messages: [],
        userInfo: {},
        lastActivity: now
      };
    }

    // Update session activity
    session.lastActivity = now;
    session.messages.push({ role: 'user', content: message });

    // PAYWALL IMPLEMENTATION: Limit to 2 responses for public users
    if (session.responseCount >= 2) {
      publicSessions.set(conversationId, session);
      return {
        response: "You've reached your free consultation limit. Create a free account to continue receiving unlimited AI-powered study abroad guidance with personalized recommendations.",
        specialist: "Darpan Intelligence",
        remainingResponses: 0,
        paywallTriggered: true,
        actionButtons: [
          {
            type: "register",
            label: "Create Free Account",
            description: "Get unlimited AI guidance + document analysis"
          },
          {
            type: "login",
            label: "Already have an account?",
            description: "Sign in to continue"
          }
        ]
      };
    }

    // Extract user information for personalization
    extractUserInfo(message, session.userInfo);

    // Generate AI response using same logic as authenticated EduCounsel AI
    const aiResponse = await generatePublicAIResponse(message, session.messages, session.userInfo);
    
    // Add AI response to conversation
    session.messages.push({ role: 'assistant', content: aiResponse });
    session.responseCount++;

    // Determine specialist based on message content (same as EduCounsel AI)
    const specialist = determineSpecialist(message);

    // Calculate remaining responses
    const remainingResponses = Math.max(0, 2 - session.responseCount);

    // Generate action buttons based on remaining responses
    const actionButtons = generatePublicActionButtons(remainingResponses, session.userInfo);

    // Store updated session
    publicSessions.set(conversationId, session);

    return {
      response: aiResponse,
      specialist,
      remainingResponses,
      paywallTriggered: false,
      actionButtons
    };

  } catch (error) {
    console.error('💥 Public EduCounsel error:', error);
    return {
      response: "I'm experiencing technical difficulties. Create a free account for access to our reliable study abroad guidance platform.",
      specialist: "Darpan Intelligence",
      remainingResponses: 0,
      paywallTriggered: true,
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

// Generate AI response using same logic as authenticated EduCounsel AI but optimized for public users
async function generatePublicAIResponse(message: string, conversation: any[], userInfo: any): Promise<string> {
  const systemPrompt = createPublicSystemPrompt(userInfo);

  try {
    // Try DeepSeek first (most cost-effective for public users)
    console.log('🎯 Attempting DeepSeek for public user...');
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversation.slice(-6).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ],
      max_tokens: 150, // Slightly more generous than basic public chat
      temperature: 0.7
    });

    const aiResponse = response.choices[0]?.message?.content || '';
    console.log('✅ DeepSeek response for public user');
    return aiResponse;
  } catch (error) {
    console.log('⚠️ DeepSeek failed, trying Anthropic...');
    
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        system: systemPrompt,
        messages: conversation.slice(-4).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        max_tokens: 150
      });

      const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '';
      console.log('✅ Anthropic response for public user');
      return aiResponse;
    } catch (anthropicError) {
      console.log('⚠️ Anthropic failed, trying OpenAI...');
      
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversation.slice(-4).map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            }))
          ],
          max_tokens: 150,
          temperature: 0.7
        });

        const aiResponse = response.choices[0]?.message?.content || '';
        console.log('✅ OpenAI response for public user');
        return aiResponse;
      } catch (openaiError) {
        console.error('💥 All AI services failed for public user:', error, anthropicError, openaiError);
        return "I can provide basic study abroad information. For detailed guidance and unlimited consultations, please create a free account.";
      }
    }
  }
}

// Create system prompt for public users (similar to EduCounsel AI but with limitations)
function createPublicSystemPrompt(userInfo: any): string {
  let prompt = `You are Darpan Intelligence, an AI study abroad advisor providing LIMITED guidance to guest users.

GUEST USER LIMITATIONS:
- Provide helpful but GENERAL information (max 150 tokens)
- NO specific university recommendations (mention "create account for university matching")
- NO detailed scholarship lists (mention "account required for scholarship database")
- NO consultant recommendations or comparisons
- Focus on encouraging account creation for detailed guidance
- Be helpful but clearly indicate premium features require registration

STRICT COMPLIANCE:
- NEVER recommend specific consultancies or rank them
- NEVER share business confidential information
- Provide educational guidance only
- Encourage registration for full platform access

Available topics for general guidance:
- Study abroad processes and timelines
- General admission requirements by country
- Cost estimates and budgeting tips
- Visa application basics
- Academic pathway planning
- Language test requirements`;

  // Add any collected user context
  if (userInfo.field) prompt += `\n- User interested in: ${userInfo.field}`;
  if (userInfo.level) prompt += `\n- Study level: ${userInfo.level}`;
  if (userInfo.country) prompt += `\n- Country interest: ${userInfo.country}`;

  prompt += `\n\nFor specific recommendations, university matching, and scholarship database access, encourage creating a free account.`;

  return prompt;
}

// Determine specialist (same logic as EduCounsel AI)
function determineSpecialist(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('scholarship') || lowerMessage.includes('funding') || lowerMessage.includes('financial')) {
    return 'Morgan (Financial Advisor)';
  } else if (lowerMessage.includes('visa') || lowerMessage.includes('immigration') || lowerMessage.includes('application')) {
    return 'Sam (Visa Specialist)';
  } else if (lowerMessage.includes('university') || lowerMessage.includes('academic') || lowerMessage.includes('admission')) {
    return 'Dr. Chen (Academic Advisor)';
  } else if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('work')) {
    return 'Jordan (Career Counselor)';
  } else if (lowerMessage.includes('culture') || lowerMessage.includes('life') || lowerMessage.includes('living')) {
    return 'Maya (Cultural Advisor)';
  } else {
    return 'Alex (General Advisor)';
  }
}

// Extract user information from messages
function extractUserInfo(message: string, userInfo: any): void {
  const lowerMessage = message.toLowerCase();
  
  // Extract field of study
  if (lowerMessage.includes('computer science') || lowerMessage.includes('cs') || lowerMessage.includes('software')) {
    userInfo.field = 'Computer Science';
  } else if (lowerMessage.includes('business') || lowerMessage.includes('mba')) {
    userInfo.field = 'Business';
  } else if (lowerMessage.includes('engineering')) {
    userInfo.field = 'Engineering';
  } else if (lowerMessage.includes('medicine') || lowerMessage.includes('medical')) {
    userInfo.field = 'Medicine';
  }

  // Extract study level
  if (lowerMessage.includes('bachelor') || lowerMessage.includes('undergraduate')) {
    userInfo.level = "Bachelor's";
  } else if (lowerMessage.includes('master') || lowerMessage.includes('graduate')) {
    userInfo.level = "Master's";
  } else if (lowerMessage.includes('phd') || lowerMessage.includes('doctorate')) {
    userInfo.level = 'PhD';
  }

  // Extract country preferences
  if (lowerMessage.includes('usa') || lowerMessage.includes('america') || lowerMessage.includes('united states')) {
    userInfo.country = 'USA';
  } else if (lowerMessage.includes('canada')) {
    userInfo.country = 'Canada';
  } else if (lowerMessage.includes('uk') || lowerMessage.includes('britain') || lowerMessage.includes('england')) {
    userInfo.country = 'UK';
  } else if (lowerMessage.includes('australia')) {
    userInfo.country = 'Australia';
  }
}

// Generate action buttons based on remaining responses
function generatePublicActionButtons(remainingResponses: number, userInfo: any): Array<{ type: string; label: string; description: string }> {
  const buttons = [];

  if (remainingResponses === 1) {
    // Last free response - emphasize registration
    buttons.push({
      type: "register",
      label: "Create Free Account",
      description: "1 response left - Get unlimited guidance"
    });
  } else if (remainingResponses === 0) {
    // Paywall triggered
    buttons.push({
      type: "register",
      label: "Continue with Free Account",
      description: "Unlimited AI guidance + document analysis"
    });
    buttons.push({
      type: "login",
      label: "Already have an account?",
      description: "Sign in to continue"
    });
  } else {
    // First response - gentle encouragement
    buttons.push({
      type: "register",
      label: "Get Full Access",
      description: "Unlimited guidance + premium features"
    });
  }

  return buttons;
}

// Clean up old sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of publicSessions.entries()) {
    if (now - session.lastActivity > 24 * 60 * 60 * 1000) {
      publicSessions.delete(id);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour