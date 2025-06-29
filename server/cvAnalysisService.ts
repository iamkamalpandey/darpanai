import OpenAI from "openai";
import { CvAnalysisResults } from "@shared/cvAnalysisSchema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeCvContent(extractedText: string): Promise<{
  analysisResults: CvAnalysisResults;
  tokensUsed: number;
  processingTime: number;
}> {
  const startTime = Date.now();
  
  const prompt = `
You are an expert CV/Resume analyst. Analyze the following CV text and extract comprehensive information to populate a student profile for international education consultation. 

Extract the following information and provide confidence scores (0-100) for each section:

CV TEXT:
${extractedText}

Respond with a JSON object containing:

{
  "personalInfo": {
    "fullName": "extracted full name",
    "email": "extracted email",
    "phone": "extracted phone number",
    "address": "full address",
    "city": "city name",
    "country": "country name",
    "nationality": "nationality if mentioned",
    "dateOfBirth": "date of birth if mentioned (YYYY-MM-DD format)",
    "linkedIn": "LinkedIn profile URL if mentioned"
  },
  "education": {
    "highestQualification": "Bachelor's/Master's/PhD/Diploma/Certificate",
    "institution": "name of highest education institution",
    "graduationYear": "graduation year (YYYY format)",
    "gpa": "GPA/grade if mentioned",
    "fieldOfStudy": "major/field of study",
    "additionalQualifications": ["array of other qualifications/certifications"]
  },
  "workExperience": {
    "currentEmploymentStatus": "Employed/Unemployed/Student/Self-employed",
    "totalExperienceYears": number_of_years,
    "currentJobTitle": "current job title",
    "currentOrganization": "current company name",
    "workHistory": [
      {
        "title": "job title",
        "company": "company name",
        "duration": "duration (e.g., Jan 2020 - Dec 2022)",
        "description": "brief job description"
      }
    ]
  },
  "skills": {
    "technicalSkills": ["array of technical skills"],
    "languages": [
      {
        "language": "language name",
        "proficiency": "Native/Fluent/Advanced/Intermediate/Basic"
      }
    ],
    "certifications": ["array of certifications"]
  },
  "preferences": {
    "interestedCourse": "inferred course interest based on background",
    "preferredCountries": ["inferred preferred study countries"],
    "careerGoals": "inferred career goals from CV"
  },
  "confidence": {
    "personalInfo": confidence_score_0_to_100,
    "education": confidence_score_0_to_100,
    "workExperience": confidence_score_0_to_100,
    "skills": confidence_score_0_to_100,
    "overall": overall_confidence_score_0_to_100
  }
}

Guidelines:
- Extract only information that is explicitly mentioned or can be reasonably inferred
- Use null for fields that cannot be determined
- Provide realistic confidence scores based on information clarity
- For dates, use standard formats (YYYY-MM-DD for dates, YYYY for years)
- Infer study preferences based on educational background and career trajectory
- Be conservative with confidence scores - only high scores for clearly stated information
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert CV analyst specializing in international education consultation. Provide accurate, structured analysis of CV content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000
    });

    const processingTime = Date.now() - startTime;
    const tokensUsed = response.usage?.total_tokens || 0;

    let analysisResults: CvAnalysisResults;
    try {
      analysisResults = JSON.parse(response.choices[0].message.content || '{}');
    } catch (parseError) {
      console.error('Error parsing CV analysis response:', parseError);
      throw new Error('Failed to parse CV analysis results');
    }

    // Validate and sanitize the results
    const sanitizedResults: CvAnalysisResults = {
      personalInfo: {
        fullName: analysisResults.personalInfo?.fullName || null,
        email: analysisResults.personalInfo?.email || null,
        phone: analysisResults.personalInfo?.phone || null,
        address: analysisResults.personalInfo?.address || null,
        city: analysisResults.personalInfo?.city || null,
        country: analysisResults.personalInfo?.country || null,
        nationality: analysisResults.personalInfo?.nationality || null,
        dateOfBirth: analysisResults.personalInfo?.dateOfBirth || null,
        linkedIn: analysisResults.personalInfo?.linkedIn || null,
      },
      education: {
        highestQualification: analysisResults.education?.highestQualification || null,
        institution: analysisResults.education?.institution || null,
        graduationYear: analysisResults.education?.graduationYear || null,
        gpa: analysisResults.education?.gpa || null,
        fieldOfStudy: analysisResults.education?.fieldOfStudy || null,
        additionalQualifications: analysisResults.education?.additionalQualifications || [],
      },
      workExperience: {
        currentEmploymentStatus: analysisResults.workExperience?.currentEmploymentStatus || null,
        totalExperienceYears: analysisResults.workExperience?.totalExperienceYears || 0,
        currentJobTitle: analysisResults.workExperience?.currentJobTitle || null,
        currentOrganization: analysisResults.workExperience?.currentOrganization || null,
        workHistory: analysisResults.workExperience?.workHistory || [],
      },
      skills: {
        technicalSkills: analysisResults.skills?.technicalSkills || [],
        languages: analysisResults.skills?.languages || [],
        certifications: analysisResults.skills?.certifications || [],
      },
      preferences: {
        interestedCourse: analysisResults.preferences?.interestedCourse || null,
        preferredCountries: analysisResults.preferences?.preferredCountries || [],
        careerGoals: analysisResults.preferences?.careerGoals || null,
      },
      confidence: {
        personalInfo: Math.min(100, Math.max(0, analysisResults.confidence?.personalInfo || 0)),
        education: Math.min(100, Math.max(0, analysisResults.confidence?.education || 0)),
        workExperience: Math.min(100, Math.max(0, analysisResults.confidence?.workExperience || 0)),
        skills: Math.min(100, Math.max(0, analysisResults.confidence?.skills || 0)),
        overall: Math.min(100, Math.max(0, analysisResults.confidence?.overall || 0)),
      }
    };

    return {
      analysisResults: sanitizedResults,
      tokensUsed,
      processingTime
    };

  } catch (error) {
    console.error('Error in CV analysis:', error);
    throw new Error(`CV analysis failed: ${error.message}`);
  }
}