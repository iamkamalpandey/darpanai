import OpenAI from "openai";
import { AnalysisResponse } from "@shared/schema";

// Create OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

// The prompt for analyzing visa documents (both approvals and rejections)
const PROMPT_TEMPLATE = `
You are an expert visa consultant specialized in analyzing visa documents. 
Please analyze the following visa document and provide a comprehensive analysis.

For APPROVED visas, your analysis should include:
1. A brief summary of the visa approval and key terms
2. Important visa conditions, restrictions, and requirements
3. Key information about validity dates, work permissions, study conditions, etc.
4. Recommendations for compliance and maximizing opportunities

For REJECTED visas, your analysis should include:
1. A brief summary of why the visa was rejected
2. Specific reasons for rejection with their category (financial, documentation, eligibility, academic, immigration_history, ties_to_home, credibility, or general)
3. Personalized recommendations to address each rejection reason
4. Suggested next steps for reapplication

IMPORTANT: 
- Determine if this is an approval or rejection document first
- Focus only on the content of the document. Do not make assumptions beyond what is stated.
- Be specific and actionable in your recommendations.
- For rejections, categorize reasons appropriately: financial (funds/sponsorship), documentation (missing/inadequate documents), eligibility (course/institution issues), academic (qualifications), immigration_history (previous refusals/violations), ties_to_home (intention to return), credibility (truthfulness concerns), general (other issues)
- Format your response as a JSON object with the following structure:

For APPROVALS:
{
  "summary": "Brief summary of the visa approval and key information",
  "keyTerms": [
    {
      "title": "Term/Condition title",
      "description": "Detailed explanation of the visa term or condition",
      "category": "validity|work_permission|study_conditions|travel_restrictions|compliance|general"
    }
  ],
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed explanation of the recommendation for compliance/success"
    }
  ],
  "nextSteps": [
    {
      "title": "Next step title",
      "description": "Detailed explanation of what to do next"
    }
  ]
}

For REJECTIONS:
{
  "summary": "Brief summary of why the visa was rejected",
  "rejectionReasons": [
    {
      "title": "Reason title",
      "description": "Detailed explanation of the reason",
      "category": "financial|documentation|eligibility|academic|immigration_history|ties_to_home|credibility|general"
    }
  ],
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed explanation of the recommendation"
    }
  ],
  "nextSteps": [
    {
      "title": "Next step title",
      "description": "Detailed explanation of the next step"
    }
  ]
}

Visa Document:
"""
{{LETTER_TEXT}}
"""
`;

/**
 * Analyzes a visa document (approval or rejection) using OpenAI's API
 * @param letterText The text content of the visa document
 * @returns Analysis results
 */
export async function analyzeRejectionLetter(letterText: string): Promise<AnalysisResponse> {
  try {
    const prompt = PROMPT_TEMPLATE.replace("{{LETTER_TEXT}}", letterText);

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a visa consultant specialized in analyzing visa rejection letters." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more deterministic responses
    });

    const analysisText = response.choices[0].message.content;
    
    if (!analysisText) {
      throw new Error('No analysis content received from OpenAI');
    }
    
    // Parse the JSON response
    const analysis: AnalysisResponse = JSON.parse(analysisText);
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing rejection letter:', error);
    throw new Error('Failed to analyze the rejection letter');
  }
}
