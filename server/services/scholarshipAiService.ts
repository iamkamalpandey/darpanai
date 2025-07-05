import OpenAI from 'openai';

// DeepSeek AI configuration (primary)
const deepSeekConfig = {
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY, // Fallback to OpenAI key if DeepSeek not available
  baseURL: 'https://api.deepseek.com/v1', // DeepSeek API endpoint
};

// OpenAI configuration (secondary fallback)
const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
};

export interface ScholarshipAnalysisRequest {
  scholarshipDescription: string;
  userProfile: {
    fieldOfStudy?: string;
    academicLevel?: string;
    gpa?: number;
    financialNeed?: boolean;
    interests?: string[];
    achievements?: string[];
    background?: string;
  };
  requirements: string[];
}

export interface ScholarshipAnalysisResult {
  matchScore: number;
  matchReasons: string[];
  eligibilityAnalysis: {
    meetsRequirements: boolean;
    missingRequirements: string[];
    strengthAreas: string[];
  };
  recommendations: string[];
  applicationTips: string[];
}

export class ScholarshipAiService {
  private deepSeekClient: OpenAI;
  private openaiClient: OpenAI;

  constructor() {
    // Initialize DeepSeek client (primary)
    this.deepSeekClient = new OpenAI({
      apiKey: deepSeekConfig.apiKey,
      baseURL: deepSeekConfig.baseURL,
    });

    // Initialize OpenAI client (secondary fallback)
    this.openaiClient = new OpenAI({
      apiKey: openaiConfig.apiKey,
    });
  }

  async analyzeScholarshipMatch(request: ScholarshipAnalysisRequest): Promise<ScholarshipAnalysisResult> {
    try {
      // Try DeepSeek first (primary AI)
      return await this.analyzeWithDeepSeek(request);
    } catch (error) {
      console.warn('DeepSeek API failed, falling back to OpenAI:', error);
      try {
        // Fallback to OpenAI
        return await this.analyzeWithOpenAI(request);
      } catch (fallbackError) {
        console.error('Both AI services failed:', fallbackError);
        // Return basic analysis if both fail
        return this.generateBasicAnalysis(request);
      }
    }
  }

  private async analyzeWithDeepSeek(request: ScholarshipAnalysisRequest): Promise<ScholarshipAnalysisResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.getUserPrompt(request);

    const response = await this.deepSeekClient.chat.completions.create({
      model: 'deepseek-chat', // DeepSeek's main model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    return this.parseAiResponse(response.choices[0].message.content);
  }

  private async analyzeWithOpenAI(request: ScholarshipAnalysisRequest): Promise<ScholarshipAnalysisResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.getUserPrompt(request);

    const response = await this.openaiClient.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective OpenAI model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    return this.parseAiResponse(response.choices[0].message.content);
  }

  private getSystemPrompt(): string {
    return `You are an expert scholarship advisor and matching analyst. Your role is to analyze scholarship opportunities against student profiles and provide comprehensive, actionable insights.

Your analysis should be:
1. Accurate and evidence-based
2. Encouraging but realistic
3. Actionable with specific recommendations
4. Focused on maximizing student success

Always return your analysis in the following JSON format:
{
  "matchScore": <number between 0-100>,
  "matchReasons": ["reason 1", "reason 2", ...],
  "eligibilityAnalysis": {
    "meetsRequirements": <boolean>,
    "missingRequirements": ["requirement 1", ...],
    "strengthAreas": ["strength 1", ...]
  },
  "recommendations": ["recommendation 1", ...],
  "applicationTips": ["tip 1", ...]
}`;
  }

  private getUserPrompt(request: ScholarshipAnalysisRequest): string {
    const { scholarshipDescription, userProfile, requirements } = request;

    return `Analyze the match between this scholarship and student profile:

SCHOLARSHIP DETAILS:
${scholarshipDescription}

REQUIREMENTS:
${requirements.map(req => `- ${req}`).join('\n')}

STUDENT PROFILE:
- Field of Study: ${userProfile.fieldOfStudy || 'Not specified'}
- Academic Level: ${userProfile.academicLevel || 'Not specified'}
- GPA: ${userProfile.gpa || 'Not specified'}
- Financial Need: ${userProfile.financialNeed ? 'Yes' : 'No'}
- Interests: ${userProfile.interests?.join(', ') || 'Not specified'}
- Achievements: ${userProfile.achievements?.join(', ') || 'Not specified'}
- Background: ${userProfile.background || 'Not specified'}

Provide a comprehensive analysis focusing on:
1. How well the student matches the scholarship criteria
2. Specific areas where they excel or fall short
3. Actionable recommendations to improve their application
4. Strategic tips for applying

Be specific, encouraging, and practical in your recommendations.`;
  }

  private parseAiResponse(content: string | null): ScholarshipAnalysisResult {
    if (!content) {
      throw new Error('No content received from AI service');
    }

    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          matchScore: parsed.matchScore || 50,
          matchReasons: parsed.matchReasons || ['General eligibility'],
          eligibilityAnalysis: {
            meetsRequirements: parsed.eligibilityAnalysis?.meetsRequirements || false,
            missingRequirements: parsed.eligibilityAnalysis?.missingRequirements || [],
            strengthAreas: parsed.eligibilityAnalysis?.strengthAreas || [],
          },
          recommendations: parsed.recommendations || ['Complete your application thoroughly'],
          applicationTips: parsed.applicationTips || ['Submit your application before the deadline'],
        };
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }

    // Fallback parsing if JSON extraction fails
    return this.extractFromText(content);
  }

  private extractFromText(content: string): ScholarshipAnalysisResult {
    // Basic text parsing fallback
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      matchScore: 75, // Default score
      matchReasons: this.extractListItems(content, ['match', 'reason', 'because']),
      eligibilityAnalysis: {
        meetsRequirements: content.toLowerCase().includes('meets') || content.toLowerCase().includes('eligible'),
        missingRequirements: this.extractListItems(content, ['missing', 'need', 'require', 'lack']),
        strengthAreas: this.extractListItems(content, ['strength', 'strong', 'good', 'excellent']),
      },
      recommendations: this.extractListItems(content, ['recommend', 'suggest', 'should', 'advice']),
      applicationTips: this.extractListItems(content, ['tip', 'advice', 'consider', 'remember']),
    };
  }

  private extractListItems(content: string, keywords: string[]): string[] {
    const lines = content.split('\n');
    const items: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (keywords.some(keyword => trimmed.toLowerCase().includes(keyword))) {
        // Remove bullet points and clean up
        const cleaned = trimmed
          .replace(/^[-•*]\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .trim();
        if (cleaned && cleaned.length > 10) {
          items.push(cleaned);
        }
      }
    }

    return items.slice(0, 5); // Limit to 5 items
  }

  private generateBasicAnalysis(request: ScholarshipAnalysisRequest): ScholarshipAnalysisResult {
    const { userProfile, requirements } = request;
    
    // Calculate basic match score
    let matchScore = 50;
    const matchReasons: string[] = [];

    if (userProfile.fieldOfStudy) {
      matchScore += 15;
      matchReasons.push(`Studying ${userProfile.fieldOfStudy}`);
    }

    if (userProfile.gpa && userProfile.gpa >= 3.5) {
      matchScore += 20;
      matchReasons.push('Strong academic performance');
    }

    if (userProfile.financialNeed) {
      matchScore += 10;
      matchReasons.push('Demonstrates financial need');
    }

    if (userProfile.achievements && userProfile.achievements.length > 0) {
      matchScore += 15;
      matchReasons.push('Notable achievements');
    }

    return {
      matchScore: Math.min(95, matchScore),
      matchReasons: matchReasons.length > 0 ? matchReasons : ['General eligibility'],
      eligibilityAnalysis: {
        meetsRequirements: true,
        missingRequirements: [],
        strengthAreas: ['Academic background', 'Application completeness'],
      },
      recommendations: [
        'Review all scholarship requirements carefully',
        'Prepare all required documents',
        'Write a compelling personal statement',
        'Obtain strong letters of recommendation',
      ],
      applicationTips: [
        'Apply early before the deadline',
        'Proofread your application thoroughly',
        'Highlight your unique qualities',
        'Follow all application instructions precisely',
      ],
    };
  }

  // Enhanced scholarship matching with AI insights
  async generatePersonalizedScholarshipRecommendations(
    userProfile: any,
    availableScholarships: any[]
  ): Promise<any[]> {
    try {
      const prompt = `Analyze these scholarships for this student profile and rank them by match quality:

STUDENT PROFILE:
- Field: ${userProfile.fieldOfStudy || 'Not specified'}
- Level: ${userProfile.academicLevel || 'Not specified'}  
- GPA: ${userProfile.gpa || 'Not specified'}
- Financial Need: ${userProfile.financialNeed ? 'Yes' : 'No'}
- Interests: ${userProfile.interests?.join(', ') || 'Not specified'}

SCHOLARSHIPS:
${availableScholarships.map((s, i) => `${i + 1}. ${s.name} - ${s.description}`).join('\n')}

Return a JSON array ranking these scholarships by match quality (1-100 score) with reasons:
[{"scholarshipIndex": 1, "matchScore": 85, "reasons": ["reason1", "reason2"]}]`;

      let response;
      try {
        response = await this.deepSeekClient.chat.completions.create({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
          temperature: 0.3,
        });
      } catch (error) {
        // Fallback to OpenAI
        response = await this.openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
          temperature: 0.3,
        });
      }

      const content = response.choices[0].message.content;
      if (content) {
        try {
          const rankings = JSON.parse(content);
          return rankings.map((ranking: any) => ({
            ...availableScholarships[ranking.scholarshipIndex - 1],
            aiMatchScore: ranking.matchScore,
            aiMatchReasons: ranking.reasons,
          }));
        } catch (parseError) {
          console.error('Failed to parse AI recommendations:', parseError);
        }
      }
    } catch (error) {
      console.error('AI recommendation failed:', error);
    }

    // Return original scholarships with basic scoring if AI fails
    return availableScholarships.map(scholarship => ({
      ...scholarship,
      aiMatchScore: 75,
      aiMatchReasons: ['Standard eligibility match'],
    }));
  }

  // AI-powered essay assistance for scholarship applications
  async generateEssayOutline(
    scholarshipName: string,
    essayPrompt: string,
    userProfile: any
  ): Promise<{
    outline: string[];
    keyPoints: string[];
    tips: string[];
  }> {
    const prompt = `Create an essay outline for this scholarship application:

SCHOLARSHIP: ${scholarshipName}
ESSAY PROMPT: ${essayPrompt}
STUDENT BACKGROUND: ${userProfile.background || 'General student'}

Provide a structured outline with key points and writing tips in JSON format:
{
  "outline": ["Introduction point", "Body point 1", "Body point 2", "Conclusion"],
  "keyPoints": ["Key strength to highlight", "Important experience to mention"],
  "tips": ["Writing tip 1", "Writing tip 2"]
}`;

    try {
      let response;
      try {
        response = await this.deepSeekClient.chat.completions.create({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 600,
          temperature: 0.4,
        });
      } catch (error) {
        response = await this.openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 600,
          temperature: 0.4,
        });
      }

      const content = response.choices[0].message.content;
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (error) {
      console.error('Essay outline generation failed:', error);
    }

    // Fallback outline
    return {
      outline: [
        'Engaging introduction with personal hook',
        'Academic background and achievements',
        'Personal experiences and challenges overcome',
        'Future goals and how scholarship helps',
        'Compelling conclusion with call to action',
      ],
      keyPoints: [
        'Highlight unique experiences',
        'Connect goals to scholarship mission',
        'Show specific impact scholarship will have',
      ],
      tips: [
        'Be authentic and personal',
        'Use specific examples and stories',
        'Proofread carefully for errors',
        'Stay within word limits',
      ],
    };
  }
}

export const scholarshipAiService = new ScholarshipAiService();