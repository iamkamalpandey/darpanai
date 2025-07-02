import { Router, Request, Response } from 'express';
import { applicationService } from './applicationService';
import { institutionRecommendationService } from './institutionRecommendationService';
import { z } from 'zod';

const router = Router();

// Start new application
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId, programId } = req.body;
    
    if (!userId || !institutionId || !programId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await applicationService.startApplication(userId, institutionId, programId);
    res.json(result);
  } catch (error) {
    console.error('Error starting application:', error);
    res.status(500).json({ error: 'Failed to start application' });
  }
});

// Get user applications status
router.get('/status/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const applicationId = req.query.applicationId ? parseInt(req.query.applicationId as string) : undefined;
    
    const applications = await applicationService.getApplicationStatus(userId, applicationId);
    res.json(applications);
  } catch (error) {
    console.error('Error getting application status:', error);
    res.status(500).json({ error: 'Failed to get application status' });
  }
});

// Update application step
router.patch('/:applicationId/step', async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.applicationId);
    const { step, data } = req.body;
    
    const result = await applicationService.updateApplicationStep(applicationId, step, data);
    res.json(result);
  } catch (error) {
    console.error('Error updating application step:', error);
    res.status(500).json({ error: 'Failed to update application step' });
  }
});

// Check eligibility
router.get('/:applicationId/eligibility', async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.applicationId);
    
    const eligibility = await applicationService.checkEligibility(applicationId);
    res.json(eligibility);
  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
});

// Submit application
router.post('/:applicationId/submit', async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.applicationId);
    
    const result = await applicationService.submitApplication(applicationId);
    res.json(result);
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: error.message || 'Failed to submit application' });
  }
});

// Get recommended programs for application
router.get('/recommendations/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get user profile from request body or fetch from database
    const { userProfile } = req.body;
    
    if (!userProfile) {
      return res.status(400).json({ error: 'User profile required for recommendations' });
    }
    
    const recommendations = await institutionRecommendationService.getRecommendationsForUser(userProfile);
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Admin route for unified application management
router.get('/admin/applications', async (req: Request, res: Response) => {
  try {
    // Sample data for testing the unified application management interface
    const sampleApplications = [
      {
        id: 1,
        userId: 101,
        applicationNumber: "APP-2025-001",
        status: "under_review",
        priority: "high",
        targetCountry: "Australia",
        studyLevel: "Master's",
        fieldOfStudy: "Computer Science",
        preferredIntake: "March 2025",
        personalDetails: {
          firstName: "Sarah",
          lastName: "Johnson",
          email: "sarah.johnson@email.com",
          phoneNumber: "+1-555-0123",
          nationality: "United States",
          passportNumber: "US123456789"
        },
        academicDetails: {
          highestQualification: "Bachelor's Degree",
          institution: "University of California",
          graduationYear: "2023",
          gpa: "3.8",
          gradingSystem: "4.0 Scale"
        },
        budgetRange: "$40,000 - $60,000",
        fundingSource: "Self-funded",
        documents: [
          {
            id: "doc1",
            type: "Transcript",
            name: "Official_Transcript.pdf",
            uploadedAt: "2025-01-15",
            verified: true,
            size: 2048000
          },
          {
            id: "doc2",
            type: "Passport",
            name: "Passport_Copy.pdf",
            uploadedAt: "2025-01-16",
            verified: false,
            size: 1024000
          }
        ],
        lastUpdated: "2025-01-20",
        createdAt: "2025-01-15",
        aiInsights: {
          completionScore: 85,
          riskLevel: "low",
          recommendedActions: ["Upload English proficiency test results", "Submit financial documents"],
          missingDocuments: ["IELTS/TOEFL Certificate", "Bank Statement"],
          estimatedProcessingTime: "2-3 weeks",
          strengthsAnalysis: ["Strong academic background", "Clear career goals", "Sufficient funding"],
          weaknessesAnalysis: ["Missing language test scores", "Limited work experience"],
          successProbability: 90,
          nextSteps: ["Schedule IELTS exam", "Prepare financial documentation", "Submit application to universities"]
        },
        counselorNotes: [
          {
            id: "note1",
            message: "Student has strong academic background. Recommend early submission.",
            createdAt: "2025-01-18",
            createdBy: "Dr. Smith",
            type: "internal"
          }
        ]
      },
      {
        id: 2,
        userId: 102,
        applicationNumber: "APP-2025-002",
        status: "documents_requested",
        priority: "urgent",
        targetCountry: "Canada",
        studyLevel: "PhD",
        fieldOfStudy: "Biomedical Engineering",
        preferredIntake: "September 2025",
        personalDetails: {
          firstName: "Ahmed",
          lastName: "Hassan",
          email: "ahmed.hassan@email.com",
          phoneNumber: "+20-123-456-789",
          nationality: "Egypt",
          passportNumber: "EG987654321"
        },
        academicDetails: {
          highestQualification: "Master's Degree",
          institution: "Cairo University",
          graduationYear: "2022",
          gpa: "3.9",
          gradingSystem: "4.0 Scale"
        },
        budgetRange: "$50,000 - $80,000",
        fundingSource: "Scholarship",
        documents: [
          {
            id: "doc3",
            type: "Transcript",
            name: "Masters_Transcript.pdf",
            uploadedAt: "2025-01-10",
            verified: true,
            size: 3072000
          }
        ],
        lastUpdated: "2025-01-22",
        createdAt: "2025-01-10",
        aiInsights: {
          completionScore: 70,
          riskLevel: "medium",
          recommendedActions: ["Submit missing documents urgently", "Prepare for potential interview"],
          missingDocuments: ["Statement of Purpose", "Research Proposal", "Reference Letters"],
          estimatedProcessingTime: "4-6 weeks",
          strengthsAnalysis: ["Excellent academic record", "Research experience", "Strong motivation"],
          weaknessesAnalysis: ["Incomplete documentation", "Tight timeline"],
          successProbability: 75,
          nextSteps: ["Submit SOP within 48 hours", "Contact referees", "Prepare research proposal"]
        }
      },
      {
        id: 3,
        userId: 103,
        applicationNumber: "APP-2025-003",
        status: "approved",
        priority: "normal",
        targetCountry: "United Kingdom",
        studyLevel: "Bachelor's",
        fieldOfStudy: "Business Administration",
        preferredIntake: "October 2025",
        personalDetails: {
          firstName: "Priya",
          lastName: "Sharma",
          email: "priya.sharma@email.com",
          phoneNumber: "+91-987-654-3210",
          nationality: "India",
          passportNumber: "IN456789123"
        },
        academicDetails: {
          highestQualification: "High School Diploma",
          institution: "Delhi Public School",
          graduationYear: "2024",
          gpa: "95%",
          gradingSystem: "Percentage"
        },
        budgetRange: "$30,000 - $50,000",
        fundingSource: "Family",
        documents: [
          {
            id: "doc4",
            type: "High School Certificate",
            name: "HSC_Certificate.pdf",
            uploadedAt: "2025-01-05",
            verified: true,
            size: 1536000
          },
          {
            id: "doc5",
            type: "IELTS",
            name: "IELTS_Results.pdf",
            uploadedAt: "2025-01-08",
            verified: true,
            size: 512000
          }
        ],
        lastUpdated: "2025-01-25",
        createdAt: "2025-01-05",
        aiInsights: {
          completionScore: 95,
          riskLevel: "low",
          recommendedActions: ["Prepare for visa application", "Book accommodation"],
          missingDocuments: [],
          estimatedProcessingTime: "Application approved",
          strengthsAnalysis: ["Excellent academic performance", "Strong English proficiency", "Complete documentation"],
          weaknessesAnalysis: ["Young age may require additional guidance"],
          successProbability: 98,
          nextSteps: ["Apply for student visa", "Arrange accommodation", "Plan arrival"]
        }
      }
    ];

    res.json({ applications: sampleApplications });
  } catch (error) {
    console.error('Error fetching admin applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// AI Insights generation route
router.post('/admin/applications/:id/generate-insights', async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id);
    
    // Simulate AI insights generation
    const insights = {
      completionScore: Math.floor(Math.random() * 30) + 70, // 70-100%
      riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      recommendedActions: [
        "Review financial documentation",
        "Update personal statement",
        "Prepare for potential interview"
      ],
      missingDocuments: ["Bank Statement", "Reference Letter"],
      estimatedProcessingTime: "2-4 weeks",
      strengthsAnalysis: ["Strong academic background", "Clear goals"],
      weaknessesAnalysis: ["Limited work experience"],
      successProbability: Math.floor(Math.random() * 20) + 75, // 75-95%
      nextSteps: ["Submit missing documents", "Schedule interview"]
    };

    res.json({ insights });
  } catch (error) {
    console.error('Error generating AI insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

export default router;