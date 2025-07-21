import { db } from './db';
import { users, analyses, appointments } from '@shared/schema';
import { coeInformation } from '@shared/coeSchema';
import { offerLetterInfo } from '@shared/schema';
import { eq, count, desc, and } from 'drizzle-orm';

interface UnifiedDashboardData {
  studentJourney: {
    currentStage: string;
    completionPercentage: number;
    nextActions: string[];
    milestones: {
      name: string;
      completed: boolean;
      date?: string;
    }[];
  };
  aiInsights: {
    personalizedRecommendations: string[];
    admissionProbability: number;
    scholarshipMatches: number;
    actionableAlerts: string[];
  };
  collaboration: {
    assignedExpert?: {
      name: string;
      specialization: string;
      avatar?: string;
    };
    upcomingConsultations: {
      date: string;
      time: string;
      type: string;
    }[];
    sharedDocuments: number;
    unreadMessages: number;
  };
  analytics: {
    documentsAnalyzed: number;
    applicationsInProgress: number;
    scholarshipsFound: number;
    timeToGoal: string;
  };
}

export async function generateUnifiedDashboard(userId: number): Promise<UnifiedDashboardData> {
  try {
    // Get user profile
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error('User not found');
    }

    // Calculate profile completion
    const profileCompletion = calculateProfileCompletion(user);
    
    // Determine current stage based on profile completion and activities
    const currentStage = determineCurrentStage(profileCompletion, user);
    
    // Get analytics data
    const [documentCount] = await db
      .select({ count: count() })
      .from(analyses)
      .where(eq(analyses.userId, userId));

    const [coeCount] = await db
      .select({ count: count() })
      .from(coeInformation)
      .where(eq(coeInformation.userId, userId));

    const [offerLetterCount] = await db
      .select({ count: count() })
      .from(offerLetterInfo)
      .where(eq(offerLetterInfo.userId, userId));

    const totalDocuments = documentCount.count + coeCount.count + offerLetterCount.count;

    // Get upcoming appointments
    const upcomingAppointments = await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, userId))
      .orderBy(desc(appointments.createdAt))
      .limit(3);

    // Generate AI insights based on user profile
    const aiInsights = generateAIInsights(user, totalDocuments);
    
    // Generate personalized recommendations
    const personalizedRecommendations = generatePersonalizedRecommendations(user, profileCompletion);
    
    // Generate next actions based on current stage
    const nextActions = generateNextActions(currentStage, user, profileCompletion);
    
    // Calculate admission probability (simplified algorithm)
    const admissionProbability = calculateAdmissionProbability(user, totalDocuments);

    const unifiedData: UnifiedDashboardData = {
      studentJourney: {
        currentStage,
        completionPercentage: Math.round(profileCompletion * 100),
        nextActions,
        milestones: [
          { name: 'Profile Created', completed: true, date: user.createdAt?.toISOString().split('T')[0] },
          { name: 'Academic Documents Uploaded', completed: totalDocuments > 0, date: totalDocuments > 0 ? new Date().toISOString().split('T')[0] : undefined },
          { name: 'Expert Consultation Scheduled', completed: upcomingAppointments.length > 0 },
          { name: 'Applications Started', completed: false },
          { name: 'Acceptance Received', completed: false }
        ]
      },
      aiInsights: {
        personalizedRecommendations,
        admissionProbability: Math.round(admissionProbability),
        scholarshipMatches: Math.floor(Math.random() * 15) + 5, // Placeholder - integrate with actual scholarship matching
        actionableAlerts: generateActionableAlerts(user, upcomingAppointments)
      },
      collaboration: {
        assignedExpert: user.role === 'user' ? {
          name: 'Dr. Sarah Johnson',
          specialization: 'Computer Science & Engineering',
          avatar: undefined
        } : undefined,
        upcomingConsultations: upcomingAppointments.map(apt => ({
          date: apt.requestedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          time: '10:00 AM', // Placeholder - integrate with actual scheduling system
          type: apt.subject || 'General Consultation'
        })),
        sharedDocuments: totalDocuments,
        unreadMessages: Math.floor(Math.random() * 3) // Placeholder - integrate with messaging system
      },
      analytics: {
        documentsAnalyzed: totalDocuments,
        applicationsInProgress: Math.floor(Math.random() * 3) + 1, // Placeholder - integrate with application tracking
        scholarshipsFound: Math.floor(Math.random() * 8) + 3, // Placeholder - integrate with scholarship system
        timeToGoal: estimateTimeToGoal(currentStage, profileCompletion)
      }
    };

    return unifiedData;
  } catch (error) {
    console.error('Error generating unified dashboard:', error);
    throw error;
  }
}

function calculateProfileCompletion(user: any): number {
  let completed = 0;
  const total = 10;

  if (user.firstName && user.lastName) completed += 1;
  if (user.email) completed += 1;
  if (user.phoneNumber) completed += 1;
  if (user.dateOfBirth) completed += 1;
  if (user.nationality) completed += 1;
  if (user.studyLevel) completed += 1;
  if (user.fieldOfStudy) completed += 1;
  if (user.preferredCountries && user.preferredCountries.length > 0) completed += 1;
  if (user.budgetRange) completed += 1;
  if (user.englishProficiency) completed += 1;

  return completed / total;
}

function determineCurrentStage(profileCompletion: number, user: any): string {
  if (profileCompletion < 0.5) return 'discovery';
  if (profileCompletion < 0.8) return 'profile';
  if (!user.preferredCountries || user.preferredCountries.length === 0) return 'profile';
  return 'matching';
}

function generateAIInsights(user: any, documentCount: number): string[] {
  const insights = [];
  
  if (user.fieldOfStudy === 'Computer Science') {
    insights.push('STEM programs in Canada offer excellent post-graduation work opportunities');
    insights.push('Your computer science background makes you eligible for tech-focused scholarships');
  }
  
  if (user.budgetRange === '50000-75000') {
    insights.push('Consider Australian universities for better value with quality education');
    insights.push('Look into merit-based scholarships to reduce financial burden');
  }
  
  if (documentCount === 0) {
    insights.push('Upload your academic transcripts to get personalized university recommendations');
  }
  
  return insights.length > 0 ? insights : [
    'Complete your profile to receive personalized AI recommendations',
    'Upload academic documents for detailed analysis and insights',
    'Schedule a consultation with our study abroad experts'
  ];
}

function generatePersonalizedRecommendations(user: any, profileCompletion: number): string[] {
  const recommendations = [];
  
  if (profileCompletion < 1.0) {
    recommendations.push('Complete your profile to unlock advanced AI matching');
  }
  
  if (!user.englishProficiency) {
    recommendations.push('Add your English test scores for accurate university matching');
  }
  
  if (user.fieldOfStudy && user.preferredCountries) {
    recommendations.push(`Explore ${user.fieldOfStudy} programs in ${user.preferredCountries[0]}`);
  }
  
  if (user.budgetRange) {
    recommendations.push('Review scholarship opportunities that match your budget range');
  }
  
  return recommendations.length > 0 ? recommendations : [
    'Upload academic documents for AI-powered analysis',
    'Schedule consultation with study abroad experts',
    'Explore scholarship opportunities in your field'
  ];
}

function generateNextActions(currentStage: string, user: any, profileCompletion: number): string[] {
  switch (currentStage) {
    case 'discovery':
      return ['Complete your profile setup', 'Take the AI Study Abroad Navigator', 'Upload academic documents'];
    case 'profile':
      return ['Add missing profile information', 'Upload transcripts and certificates', 'Schedule expert consultation'];
    case 'matching':
      return ['Review AI-matched programs', 'Apply to shortlisted universities', 'Prepare application documents'];
    case 'application':
      return ['Submit pending applications', 'Track application status', 'Prepare for interviews'];
    case 'success':
      return ['Accept university offer', 'Apply for student visa', 'Plan accommodation'];
    default:
      return ['Complete your profile', 'Upload documents', 'Schedule consultation'];
  }
}

function generateActionableAlerts(user: any, appointments: any[]): string[] {
  const alerts = [];
  
  if (appointments.length > 0) {
    const nextAppointment = appointments[0];
    const appointmentDate = nextAppointment.requestedDate?.toISOString().split('T')[0] || 'TBD';
    alerts.push(`Upcoming consultation on ${appointmentDate} - ${nextAppointment.subject}`);
  }
  
  if (!user.phoneNumber) {
    alerts.push('Add phone number to enable expert consultation booking');
  }
  
  if (!user.englishProficiency) {
    alerts.push('Upload English test scores to improve university matching accuracy');
  }
  
  return alerts;
}

function calculateAdmissionProbability(user: any, documentCount: number): number {
  let probability = 50; // Base probability
  
  // Profile completeness bonus
  const profileFields = [user.firstName, user.studyLevel, user.fieldOfStudy, user.preferredCountries];
  const completedFields = profileFields.filter(field => field).length;
  probability += (completedFields * 5);
  
  // Document bonus
  probability += Math.min(documentCount * 10, 30);
  
  // Field-specific adjustments
  if (user.fieldOfStudy === 'Computer Science' || user.fieldOfStudy === 'Engineering') {
    probability += 10;
  }
  
  // Budget realistic adjustment
  if (user.budgetRange && (user.budgetRange.includes('75000') || user.budgetRange.includes('100000'))) {
    probability += 15;
  }
  
  return Math.min(probability, 95);
}

function estimateTimeToGoal(currentStage: string, profileCompletion: number): string {
  switch (currentStage) {
    case 'discovery':
      return '6-8 months';
    case 'profile':
      return '4-6 months';
    case 'matching':
      return '3-4 months';
    case 'application':
      return '2-3 months';
    case 'success':
      return '1-2 months';
    default:
      return '6 months';
  }
}