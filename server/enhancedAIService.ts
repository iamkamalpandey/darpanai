import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';

// Enhanced AI Service with DeepSeek primary and ChatGPT secondary
export class EnhancedAIService {
  private openai: OpenAI;
  private anthropic: Anthropic;

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1",
    });
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  // Enhanced application analysis using primary AI (DeepSeek) with ChatGPT fallback
  async analyzeApplicationDocument(
    documentText: string,
    documentType: 'transcript' | 'certificate' | 'passport' | 'financial' | 'other',
    userProfile?: any
  ): Promise<{
    extractedData: any;
    recommendations: string[];
    missingRequirements: string[];
    confidence: number;
    nextSteps: string[];
  }> {
    const systemPrompt = this.getDocumentAnalysisPrompt(documentType);
    const userPrompt = this.buildAnalysisPrompt(documentText, documentType, userProfile);

    try {
      // Try DeepSeek API first (configured as primary)
      const response = await this.openai.chat.completions.create({
        model: "deepseek-chat", // DeepSeek model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      console.log('✅ DeepSeek API successful for document analysis');
      return this.validateAnalysisResult(result);
      
    } catch (error) {
      console.log('⚠️ DeepSeek API failed, falling back to ChatGPT:', error);
      
      try {
        // Fallback to regular ChatGPT
        const fallbackOpenai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await fallbackOpenai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        console.log('✅ ChatGPT fallback successful for document analysis');
        return this.validateAnalysisResult(result);
        
      } catch (fallbackError) {
        console.error('❌ Both DeepSeek and ChatGPT failed:', fallbackError);
        throw new Error('AI analysis temporarily unavailable');
      }
    }
  }

  // Enhanced educational guidance using AI
  async generateEducationalGuidance(
    query: string,
    userProfile: any,
    conversationHistory?: any[]
  ): Promise<{
    response: string;
    actionButtons: Array<{
      text: string;
      action: string;
      variant: 'primary' | 'secondary';
    }>;
    intent: string;
    confidence: number;
  }> {
    const systemPrompt = this.getEducationalGuidancePrompt();
    const contextualPrompt = this.buildGuidancePrompt(query, userProfile, conversationHistory);

    try {
      // Try DeepSeek first
      const response = await this.openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: contextualPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      console.log('✅ DeepSeek educational guidance successful');
      return this.validateGuidanceResult(result);
      
    } catch (error) {
      console.log('⚠️ DeepSeek failed, using ChatGPT for educational guidance');
      
      try {
        const fallbackOpenai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await fallbackOpenai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: contextualPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        console.log('✅ ChatGPT educational guidance successful');
        return this.validateGuidanceResult(result);
        
      } catch (fallbackError) {
        console.error('❌ Both AI services failed for educational guidance');
        
        // Provide helpful fallback response
        return {
          response: "I'm here to help with your study abroad questions. Please try rephrasing your question or contact our support team for immediate assistance.",
          actionButtons: [
            { text: "Contact Support", action: "contact_support", variant: "primary" },
            { text: "View FAQ", action: "view_faq", variant: "secondary" }
          ],
          intent: "help_request",
          confidence: 0.5
        };
      }
    }
  }

  // Application intent detection
  async detectApplicationIntent(message: string, userProfile: any): Promise<{
    hasApplicationIntent: boolean;
    confidence: number;
    suggestedAction: string;
    extractedDetails: any;
  }> {
    const prompt = `
    Analyze this message to detect if the user wants to start a study abroad application:
    
    Message: "${message}"
    User Profile: ${JSON.stringify(userProfile, null, 2)}
    
    Look for explicit application intent signals like:
    - "I want to apply"
    - "Start application"
    - "Apply now"
    - "Begin application process"
    - "I'm ready to apply"
    
    Respond in JSON format:
    {
      "hasApplicationIntent": boolean,
      "confidence": number (0-1),
      "suggestedAction": "start_application" | "provide_info" | "schedule_consultation",
      "extractedDetails": {
        "country": "extracted country or null",
        "studyLevel": "extracted level or null",
        "fieldOfStudy": "extracted field or null"
      }
    }
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      // Fallback to simple keyword detection
      const hasKeywords = /\b(apply|application|start|begin|ready)\b/i.test(message);
      return {
        hasApplicationIntent: hasKeywords,
        confidence: hasKeywords ? 0.6 : 0.1,
        suggestedAction: hasKeywords ? "start_application" : "provide_info",
        extractedDetails: { country: null, studyLevel: null, fieldOfStudy: null }
      };
    }
  }

  // Get document analysis prompt
  private getDocumentAnalysisPrompt(documentType: string): string {
    return `
    You are an expert document analyzer for international education applications.
    
    For ${documentType} documents, extract all relevant information and provide analysis.
    
    Always respond in this JSON format:
    {
      "extractedData": {
        // Document-specific fields based on type
      },
      "recommendations": ["list of recommendations"],
      "missingRequirements": ["list of missing items"],
      "confidence": 0.95,
      "nextSteps": ["actionable next steps"]
    }
    
    Focus on accuracy and completeness. If information is unclear, note it in missingRequirements.
    `;
  }

  // Build analysis prompt
  private buildAnalysisPrompt(documentText: string, documentType: string, userProfile?: any): string {
    return `
    Document Type: ${documentType}
    User Profile Context: ${userProfile ? JSON.stringify(userProfile, null, 2) : 'Not provided'}
    
    Document Text:
    ${documentText}
    
    Please analyze this document thoroughly and extract all relevant information.
    `;
  }

  // Get educational guidance prompt
  private getEducationalGuidancePrompt(): string {
    return `
    You are Alex, a professional international education counselor with expertise in study abroad applications.
    
    Guidelines:
    - Provide helpful, accurate information about studying abroad
    - Ask relevant follow-up questions when needed
    - Suggest appropriate actions based on user needs
    - Be encouraging and supportive
    - Only suggest starting an application when the user explicitly expresses readiness
    
    Respond in JSON format:
    {
      "response": "Your helpful response text",
      "actionButtons": [
        {"text": "Button text", "action": "action_name", "variant": "primary|secondary"}
      ],
      "intent": "detected intent category",
      "confidence": 0.95
    }
    `;
  }

  // Build guidance prompt
  private buildGuidancePrompt(query: string, userProfile: any, conversationHistory?: any[]): string {
    const context = conversationHistory ? 
      `Recent conversation:\n${conversationHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}\n\n` : '';
    
    return `
    ${context}User Profile: ${JSON.stringify(userProfile, null, 2)}
    
    Current Question: ${query}
    
    Please provide helpful guidance based on the user's profile and question.
    `;
  }

  // Validate analysis result
  private validateAnalysisResult(result: any) {
    return {
      extractedData: result.extractedData || {},
      recommendations: result.recommendations || [],
      missingRequirements: result.missingRequirements || [],
      confidence: result.confidence || 0.8,
      nextSteps: result.nextSteps || []
    };
  }

  // Validate guidance result
  private validateGuidanceResult(result: any) {
    return {
      response: result.response || "I'm here to help with your study abroad questions.",
      actionButtons: result.actionButtons || [],
      intent: result.intent || "general_inquiry",
      confidence: result.confidence || 0.8
    };
  }
}

// Export singleton instance
export const enhancedAIService = new EnhancedAIService();