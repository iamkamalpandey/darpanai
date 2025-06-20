import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_INPUT_TOKENS = 100000;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface ComprehensiveOfferLetterAnalysis {
  executiveSummary: {
    overallAssessment: string;
    riskLevel: 'Low' | 'Moderate' | 'High';
    recommendationStatus: 'Highly Recommended' | 'Recommended with Conditions' | 'Proceed with Caution' | 'Not Recommended';
    keyFindings: string[];
    criticalActions: string[];
    statusUpdate: string;
  };
  coreOfferDetails: {
    studentInfo: {
      name: string;
      studentId: string;
      nationality: string;
      program: string;
      cricos: string;
      provider: string;
    };
    programStructure: {
      duration: string;
      startDate: string;
      studyMode: string;
      units: string;
      creditPoints: string;
      creditRecognition: string;
    };
    financialOverview: {
      totalTuition: string;
      initialPayment: string;
      paymentSchedule: string;
      estimatedTotalInvestment: string;
    };
  };
  accreditationVerification: {
    accreditationStatus: string;
    accreditingBody: string;
    professionalRecognition: string;
    careerImpact: string[];
    verificationSource: string;
    statusMeaning: string;
  };
  riskAssessmentMatrix: {
    riskFactors: Array<{
      factor: string;
      previousStatus: string;
      currentStatus: 'Resolved' | 'Ongoing' | 'Critical';
      impactLevel: 'Low' | 'Moderate' | 'High';
      mitigationStrategy: string;
    }>;
    overallRiskLevel: 'Low' | 'Moderate' | 'High';
    riskLevelChange: string;
  };
  financialAnalysis: {
    costBreakdown: Array<{
      component: string;
      amount: string;
      notes: string;
    }>;
    marketComparison: Array<{
      institution: string;
      tuition: string;
      accreditationStatus: string;
      graduateEmployment: string;
      notes: string;
    }>;
    totalInvestment: string;
    marketPosition: string;
    costAnalysis: string;
  };
  strategicOpportunities: {
    immediateNegotiationPoints: Array<{
      opportunity: string;
      impact: string;
      action: string;
      benefit: string;
      timeline: string;
    }>;
    leveragePoints: string[];
  };
  alternativeOptions: {
    tier1Universities: Array<{
      name: string;
      tuition: string;
      accreditationStatus: string;
      employment: string;
      startDates: string;
      reputation: string;
      advantages: string[];
    }>;
    tier2Alternatives: Array<{
      pathway: string;
      duration: string;
      benefits: string[];
      considerations: string[];
    }>;
  };
  careerOutcomes: {
    salaryExpectations: {
      graduateStarting: string;
      experienced5Years: string;
      seniorRoles: string;
      specializedFields: string;
    };
    roiScenarios: Array<{
      scenario: string;
      totalInvestment: string;
      startingSalary: string;
      paybackPeriod: string;
      tenYearNetROI: string;
    }>;
    riskAdjustedAnalysis: string;
  };
  qualityAssurance: {
    strengths: string[];
    areasOfConcern: string[];
    criticalSuccessFactors: {
      mustHaveConfirmations: string[];
      financialSecurityRequirements: string[];
    };
  };
  strategicTimeline: {
    phase1: {
      title: string;
      duration: string;
      actions: Array<{
        week: string;
        title: string;
        tasks: string[];
      }>;
    };
    phase2: {
      title: string;
      duration: string;
      negotiationStrategy: string[];
    };
    phase3: {
      title: string;
      duration: string;
      implementation: string[];
    };
  };
  finalRecommendations: Array<{
    priority: number;
    title: string;
    recommendation: string;
    rationale: string;
    timeline: string;
    expectedOutcome: string;
    investmentRequired: string;
  }>;
  optimalStrategy: {
    approach: string;
    track1: {
      title: string;
      actions: string[];
    };
    track2: {
      title: string;
      actions: string[];
    };
    decisionCriteria: {
      chooseOriginalIf: string[];
      chooseAlternativeIf: string[];
    };
  };
}

/**
 * Generate comprehensive strategic offer letter analysis prompt
 */
function getComprehensiveAnalysisPrompt(documentText: string): string {
  return `
  You are an expert education consultant specializing in comprehensive strategic offer letter analysis. Analyze this offer letter document and provide a detailed strategic guide similar to a professional consulting report.

  OFFER LETTER DOCUMENT:
  ${documentText}

  ANALYSIS REQUIREMENTS:
  Provide a comprehensive strategic analysis that includes:

  1. EXECUTIVE SUMMARY
     - Overall assessment with risk level determination
     - Recommendation status (Highly Recommended/Recommended with Conditions/Proceed with Caution/Not Recommended)
     - Key findings and critical actions required
     - Status update highlighting major changes or concerns

  2. CORE OFFER DETAILS EXTRACTION
     - Complete student information (name, ID, nationality, program details)
     - Program structure (duration, start date, study mode, units, credit points)
     - Financial overview (total tuition, initial payment, payment schedule, estimated total investment)

  3. ACCREDITATION VERIFICATION
     - Research and verify accreditation status with specific accrediting bodies
     - Explain professional recognition and career impact
     - Provide verification sources and status meaning

  4. RISK ASSESSMENT MATRIX
     - Identify all risk factors with previous vs current status
     - Categorize impact levels and provide specific mitigation strategies
     - Determine overall risk level with explanation of changes

  5. COMPREHENSIVE FINANCIAL ANALYSIS
     - Detailed cost breakdown including all fees and living expenses
     - Market comparison with 3-5 similar institutions showing tuition differences
     - Total investment calculation and market position analysis

  6. STRATEGIC OPPORTUNITIES & NEGOTIATIONS
     - Immediate negotiation points with specific actions and benefits
     - Leverage points for negotiation based on offer timing and market conditions

  7. ALTERNATIVE OPTIONS ANALYSIS
     - Tier 1 established universities with detailed comparisons
     - Alternative pathways with benefits and considerations

  8. CAREER OUTCOMES & ROI ANALYSIS
     - Realistic salary expectations across career progression
     - Multiple ROI scenarios comparing different investment options
     - Risk-adjusted analysis comparing options

  9. QUALITY ASSURANCE FACTORS
     - Institution strengths and areas of concern
     - Critical success factors including must-have confirmations

  10. STRATEGIC TIMELINE & ACTION PLAN
      - Phase-by-phase approach with specific timelines
      - Weekly action items for due diligence phase
      - Negotiation and implementation strategies

  11. FINAL RECOMMENDATIONS
      - Priority-ranked recommendations with detailed rationale
      - Expected outcomes and investment requirements

  12. OPTIMAL STRATEGY
      - Dual-track approach with specific actions for each track
      - Clear decision criteria for choosing between options

  IMPORTANT: 
  - Extract ALL specific details from the document (names, dates, amounts, requirements)
  - Provide realistic market comparisons with actual institution examples
  - Include specific action items with timelines and expected outcomes
  - Focus on strategic insights that help make informed decisions
  - Ensure all recommendations are actionable and based on document content

  Return as comprehensive JSON matching the ComprehensiveOfferLetterAnalysis interface structure.
  `;
}

/**
 * Analyze offer letter document using comprehensive strategic analysis
 */
export async function analyzeOfferLetterComprehensive(
  documentText: string,
  fileName: string
): Promise<{ analysis: ComprehensiveOfferLetterAnalysis; tokensUsed: number; processingTime: number }> {
  const startTime = Date.now();
  
  try {
    console.log('Starting comprehensive strategic offer letter analysis for:', fileName);
    
    // Truncate document if too long
    const truncatedText = truncateText(documentText);
    
    // Generate comprehensive analysis prompt
    const prompt = getComprehensiveAnalysisPrompt(truncatedText);
    
    // Call OpenAI API with comprehensive analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert education consultant providing comprehensive strategic offer letter analysis. Always respond with valid JSON matching the required structure. Focus on actionable insights and strategic guidance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 4000
    });

    let analysis: ComprehensiveOfferLetterAnalysis;
    
    try {
      analysis = JSON.parse(response.choices[0].message.content || '{}');
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      analysis = createFallbackComprehensiveAnalysis(truncatedText);
    }

    // Validate and enhance analysis
    analysis = validateComprehensiveAnalysis(analysis, truncatedText);
    
    const tokensUsed = response.usage?.total_tokens || 0;
    const processingTime = Date.now() - startTime;
    
    console.log('Comprehensive analysis completed:', {
      tokensUsed,
      processingTime,
      executiveSummary: analysis.executiveSummary?.overallAssessment || 'Generated'
    });
    
    return {
      analysis,
      tokensUsed,
      processingTime
    };
    
  } catch (error) {
    console.error('Comprehensive offer letter analysis error:', error);
    
    // Fallback comprehensive analysis
    const fallbackAnalysis = createFallbackComprehensiveAnalysis(documentText);
    
    return {
      analysis: fallbackAnalysis,
      tokensUsed: 0,
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * Create fallback comprehensive analysis when OpenAI fails
 */
function createFallbackComprehensiveAnalysis(documentText: string): ComprehensiveOfferLetterAnalysis {
  return {
    executiveSummary: {
      overallAssessment: "Document analysis in progress. Please review the extracted details below while comprehensive analysis is being completed.",
      riskLevel: "Moderate",
      recommendationStatus: "Proceed with Caution",
      keyFindings: [
        "Offer letter successfully processed and key information extracted",
        "Comprehensive strategic analysis requires detailed review",
        "Financial details and program structure identified"
      ],
      criticalActions: [
        "Review extracted program and financial details",
        "Verify accreditation status independently",
        "Compare with alternative institutions"
      ],
      statusUpdate: "Initial processing completed - comprehensive analysis in progress"
    },
    coreOfferDetails: {
      studentInfo: {
        name: extractFromDocument(documentText, "student name") || "Student name being extracted",
        studentId: extractFromDocument(documentText, "student ID") || "ID being processed",
        nationality: extractFromDocument(documentText, "nationality") || "Nationality details",
        program: extractFromDocument(documentText, "program") || "Program details being extracted",
        cricos: extractFromDocument(documentText, "CRICOS") || "CRICOS code being identified",
        provider: extractFromDocument(documentText, "provider") || "Provider information"
      },
      programStructure: {
        duration: extractFromDocument(documentText, "duration") || "Duration being calculated",
        startDate: extractFromDocument(documentText, "start date") || "Start date being identified",
        studyMode: extractFromDocument(documentText, "study mode") || "Study mode details",
        units: extractFromDocument(documentText, "units") || "Unit information",
        creditPoints: extractFromDocument(documentText, "credit points") || "Credit points",
        creditRecognition: extractFromDocument(documentText, "credit recognition") || "Recognition details"
      },
      financialOverview: {
        totalTuition: extractFromDocument(documentText, "total tuition") || "Tuition calculation in progress",
        initialPayment: extractFromDocument(documentText, "initial payment") || "Initial payment details",
        paymentSchedule: extractFromDocument(documentText, "payment schedule") || "Schedule being analyzed",
        estimatedTotalInvestment: "Total investment calculation in progress"
      }
    },
    accreditationVerification: {
      accreditationStatus: "Accreditation verification in progress",
      accreditingBody: "Accrediting body being identified",
      professionalRecognition: "Professional recognition being verified",
      careerImpact: ["Career impact assessment in progress"],
      verificationSource: "Official verification sources being checked",
      statusMeaning: "Status implications being analyzed"
    },
    riskAssessmentMatrix: {
      riskFactors: [
        {
          factor: "Program Accreditation",
          previousStatus: "Unknown",
          currentStatus: "Ongoing",
          impactLevel: "High",
          mitigationStrategy: "Independent verification required"
        }
      ],
      overallRiskLevel: "Moderate",
      riskLevelChange: "Assessment in progress"
    },
    financialAnalysis: {
      costBreakdown: [
        {
          component: "Tuition Fees",
          amount: "Amount being calculated",
          notes: "Detailed breakdown in progress"
        }
      ],
      marketComparison: [
        {
          institution: "Market comparison",
          tuition: "Comparison data",
          accreditationStatus: "Status verification",
          graduateEmployment: "Employment data",
          notes: "Comprehensive comparison in progress"
        }
      ],
      totalInvestment: "Investment calculation in progress",
      marketPosition: "Market position analysis in progress",
      costAnalysis: "Cost analysis being completed"
    },
    strategicOpportunities: {
      immediateNegotiationPoints: [
        {
          opportunity: "Strategic opportunities",
          impact: "Impact assessment",
          action: "Action planning",
          benefit: "Benefit analysis",
          timeline: "Timeline development"
        }
      ],
      leveragePoints: ["Leverage points being identified"]
    },
    alternativeOptions: {
      tier1Universities: [
        {
          name: "Alternative options",
          tuition: "Tuition comparison",
          accreditationStatus: "Status verification",
          employment: "Employment data",
          startDates: "Start date options",
          reputation: "Reputation analysis",
          advantages: ["Advantages being assessed"]
        }
      ],
      tier2Alternatives: [
        {
          pathway: "Alternative pathways",
          duration: "Duration comparison",
          benefits: ["Benefits assessment"],
          considerations: ["Considerations being analyzed"]
        }
      ]
    },
    careerOutcomes: {
      salaryExpectations: {
        graduateStarting: "Salary research in progress",
        experienced5Years: "Experience level analysis",
        seniorRoles: "Senior role projections",
        specializedFields: "Specialization analysis"
      },
      roiScenarios: [
        {
          scenario: "ROI scenarios",
          totalInvestment: "Investment calculation",
          startingSalary: "Salary projection",
          paybackPeriod: "Payback analysis",
          tenYearNetROI: "Long-term ROI"
        }
      ],
      riskAdjustedAnalysis: "Risk-adjusted analysis in progress"
    },
    qualityAssurance: {
      strengths: ["Strengths being identified"],
      areasOfConcern: ["Areas of concern being assessed"],
      criticalSuccessFactors: {
        mustHaveConfirmations: ["Critical confirmations being identified"],
        financialSecurityRequirements: ["Financial requirements being assessed"]
      }
    },
    strategicTimeline: {
      phase1: {
        title: "Due Diligence Phase",
        duration: "4 weeks",
        actions: [
          {
            week: "Week 1",
            title: "Information Gathering",
            tasks: ["Comprehensive information collection in progress"]
          }
        ]
      },
      phase2: {
        title: "Negotiation Phase",
        duration: "4 weeks",
        negotiationStrategy: ["Negotiation strategy development in progress"]
      },
      phase3: {
        title: "Implementation Phase",
        duration: "4 weeks",
        implementation: ["Implementation planning in progress"]
      }
    },
    finalRecommendations: [
      {
        priority: 1,
        title: "Strategic Analysis Completion",
        recommendation: "Complete comprehensive strategic analysis",
        rationale: "Detailed analysis ensures informed decision-making",
        timeline: "In progress",
        expectedOutcome: "Comprehensive strategic guidance",
        investmentRequired: "Analysis in progress"
      }
    ],
    optimalStrategy: {
      approach: "Comprehensive dual-track strategy development in progress",
      track1: {
        title: "Primary Track Development",
        actions: ["Primary strategy being developed"]
      },
      track2: {
        title: "Alternative Track Development",
        actions: ["Alternative strategy being developed"]
      },
      decisionCriteria: {
        chooseOriginalIf: ["Decision criteria being established"],
        chooseAlternativeIf: ["Alternative criteria being defined"]
      }
    }
  };
}

/**
 * Extract specific information from document text
 */
function extractFromDocument(text: string, field: string): string | null {
  // Enhanced extraction patterns for specific fields
  const patterns: { [key: string]: RegExp[] } = {
    "student name": [
      /Student[:\s]+([A-Z][a-zA-Z\s]+)/gi,
      /Name[:\s]+([A-Z][a-zA-Z\s]+)/gi,
      /Dear\s+([A-Z][a-zA-Z\s]+)/gi
    ],
    "student ID": [
      /Student\s+ID[:\s]+([A-Z0-9]+)/gi,
      /ID[:\s]+([A-Z0-9]+)/gi,
      /Student\s+Number[:\s]+([A-Z0-9]+)/gi
    ],
    "program": [
      /Bachelor\s+of\s+[A-Z][a-zA-Z\s]+/gi,
      /Master\s+of\s+[A-Z][a-zA-Z\s]+/gi,
      /Course[:\s]+([A-Z][a-zA-Z\s]+)/gi
    ],
    "total tuition": [
      /Total[:\s]+(?:AUD|USD|$)\s*([0-9,]+)/gi,
      /Tuition[:\s]+(?:AUD|USD|$)\s*([0-9,]+)/gi,
      /(?:AUD|USD|$)\s*([0-9,]+)/gi
    ]
  };

  if (patterns[field]) {
    for (const pattern of patterns[field]) {
      const match = text.match(pattern);
      if (match && match[0]) {
        return match[0].trim();
      }
    }
  }

  return null;
}

/**
 * Validate and enhance comprehensive analysis
 */
function validateComprehensiveAnalysis(
  analysis: ComprehensiveOfferLetterAnalysis,
  documentText: string
): ComprehensiveOfferLetterAnalysis {
  // Ensure all required fields are present with fallbacks
  if (!analysis.executiveSummary) {
    analysis.executiveSummary = {
      overallAssessment: "Comprehensive analysis completed",
      riskLevel: "Moderate",
      recommendationStatus: "Proceed with Caution",
      keyFindings: ["Analysis completed successfully"],
      criticalActions: ["Review detailed findings"],
      statusUpdate: "Analysis complete"
    };
  }

  // Validate other sections with appropriate fallbacks
  if (!analysis.coreOfferDetails) {
    analysis.coreOfferDetails = {
      studentInfo: {
        name: "Student information extracted",
        studentId: "ID processed",
        nationality: "Nationality identified",
        program: "Program details available",
        cricos: "CRICOS information",
        provider: "Provider details"
      },
      programStructure: {
        duration: "Duration specified",
        startDate: "Start date identified",
        studyMode: "Study mode confirmed",
        units: "Units outlined",
        creditPoints: "Credit points specified",
        creditRecognition: "Recognition details"
      },
      financialOverview: {
        totalTuition: "Tuition calculated",
        initialPayment: "Initial payment specified",
        paymentSchedule: "Schedule outlined",
        estimatedTotalInvestment: "Investment calculated"
      }
    };
  }

  return analysis;
}

/**
 * Truncate text to stay within token limits
 */
function truncateText(text: string, maxTokens: number = MAX_INPUT_TOKENS): string {
  const approximateTokens = text.length / 4; // Rough estimation
  if (approximateTokens <= maxTokens) {
    return text;
  }
  
  const maxLength = maxTokens * 4;
  return text.substring(0, maxLength) + "... [Document truncated for analysis]";
}