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

// Simple in-memory conversation store for public users (session-based)
const publicConversations = new Map<string, Array<{ role: string; content: string }>>();

export async function handlePublicChat(request: PublicChatRequest): Promise<PublicChatResponse> {
  try {
    const { message, sessionId = 'default' } = request;
    
    console.log('🌐 Processing public chat message:', message.substring(0, 50) + '...');

    // Get or create conversation history for this session
    let conversationHistory = publicConversations.get(sessionId) || [];
    
    // Add user message to history
    conversationHistory.push({ role: 'user', content: message });

    // Keep conversation history limited for performance
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    // System prompt for public users - non-personalized but helpful
    const systemPrompt = `You are Darpan Intelligence, an AI study abroad advisor helping students explore international education opportunities.

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
- Keep responses concise but informative (max 150 tokens)
- Always suggest next steps or offer additional help
- For personalized recommendations, encourage users to create an account
- Include relevant action buttons when appropriate

Respond professionally with practical guidance.`;

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

    // Generate appropriate action buttons based on content
    const actionButtons = generateActionButtons(message, aiResponse);

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

function generateActionButtons(userMessage: string, aiResponse: string): Array<{ type: string; label: string; description: string }> {
  const message = userMessage.toLowerCase();
  const response = aiResponse.toLowerCase();
  const buttons: Array<{ type: string; label: string; description: string }> = [];

  // University-related queries
  if (message.includes('university') || message.includes('college') || message.includes('school')) {
    buttons.push({
      type: 'explore_universities',
      label: 'Find Universities',
      description: 'Get personalized university recommendations'
    });
  }

  // Cost-related queries
  if (message.includes('cost') || message.includes('fee') || message.includes('expense') || message.includes('budget')) {
    buttons.push({
      type: 'cost_calculator',
      label: 'Calculate Costs',
      description: 'Get detailed cost estimates for studying abroad'
    });
  }

  // Scholarship-related queries
  if (message.includes('scholarship') || message.includes('funding') || message.includes('financial aid')) {
    buttons.push({
      type: 'find_scholarships',
      label: 'Find Scholarships',
      description: 'Discover scholarship opportunities'
    });
  }

  // Visa-related queries
  if (message.includes('visa') || message.includes('immigration') || message.includes('permit')) {
    buttons.push({
      type: 'visa_guidance',
      label: 'Visa Guidance',
      description: 'Get visa requirements and application help'
    });
  }

  // Application-related queries
  if (message.includes('apply') || message.includes('application') || message.includes('admission')) {
    buttons.push({
      type: 'application_help',
      label: 'Application Support',
      description: 'Get help with your applications'
    });
  }

  // Always offer account creation for personalized help
  if (buttons.length === 0 || Math.random() > 0.7) {
    buttons.push({
      type: 'create_account',
      label: 'Get Personalized Help',
      description: 'Create account for tailored recommendations'
    });
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