import { db } from './db';
import { studentApplications, institutions, programs, programDocumentRequirements } from '@shared/institutionSchema';
import { eq, and, desc } from 'drizzle-orm';

export interface ApplicationProcessStep {
  step: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  requirements?: string[];
}

export interface ApplicationStatus {
  id: number;
  applicationReference: string;
  status: string;
  currentStep: string;
  completionPercentage: number;
  institution: string;
  program: string;
  steps: ApplicationProcessStep[];
  missingDocuments: string[];
  nextActions: string[];
}

export interface EligibilityCheck {
  meets_requirements: boolean;
  eligibility_score: number;
  gaps: {
    academic: string[];
    language: string[];
    financial: string[];
    documents: string[];
  };
  recommendations: string[];
}

export class ApplicationService {
  
  /**
   * Start new application process for user
   */
  async startApplication(userId: number, institutionId: number, programId: number): Promise<{ applicationId: number, reference: string }> {
    const reference = await this.generateApplicationReference();
    
    // Get program requirements
    const programRequirements = await this.getProgramRequirements(programId);
    
    const [application] = await db
      .insert(studentApplications)
      .values({
        userId,
        institutionId,
        programId,
        applicationReference: reference,
        applicationStatus: 'draft',
        currentStep: 'personal_info',
        completionPercentage: 0,
        stepsCompleted: [],
        requiredDocuments: programRequirements,
        source: 'chat'
      })
      .returning({ id: studentApplications.id });
    
    return { 
      applicationId: application.id, 
      reference 
    };
  }
  
  /**
   * Get user's application status and next steps
   */
  async getApplicationStatus(userId: number, applicationId?: number): Promise<ApplicationStatus[]> {
    let query = db
      .select({
        id: studentApplications.id,
        applicationReference: studentApplications.applicationReference,
        status: studentApplications.applicationStatus,
        currentStep: studentApplications.currentStep,
        completionPercentage: studentApplications.completionPercentage,
        stepsCompleted: studentApplications.stepsCompleted,
        missingDocuments: studentApplications.missingDocuments,
        institutionName: institutions.name,
        programName: programs.name,
        personalInfo: studentApplications.personalInfo,
        academicBackground: studentApplications.academicBackground,
        uploadedDocuments: studentApplications.uploadedDocuments,
        termsAccepted: studentApplications.termsAccepted
      })
      .from(studentApplications)
      .innerJoin(institutions, eq(studentApplications.institutionId, institutions.id))
      .innerJoin(programs, eq(studentApplications.programId, programs.id))
      .where(eq(studentApplications.userId, userId));
    
    if (applicationId) {
      query = query.where(and(
        eq(studentApplications.userId, userId),
        eq(studentApplications.id, applicationId)
      ));
    }
    
    const applications = await query.orderBy(desc(studentApplications.createdAt));
    
    return applications.map(app => ({
      id: app.id,
      applicationReference: app.applicationReference || `APP-${app.id}`,
      status: app.status,
      currentStep: app.currentStep || 'personal_info',
      completionPercentage: app.completionPercentage || 0,
      institution: app.institutionName,
      program: app.programName,
      steps: this.generateApplicationSteps(app),
      missingDocuments: (app.missingDocuments as string[]) || [],
      nextActions: this.generateNextActions(app)
    }));
  }
  
  /**
   * Update application step with user data
   */
  async updateApplicationStep(
    applicationId: number, 
    step: string, 
    data: any
  ): Promise<{ success: boolean, nextStep?: string, completionPercentage?: number }> {
    
    const stepUpdates: any = {
      currentStep: step,
      lastUserActivity: new Date()
    };
    
    // Update specific step data
    switch (step) {
      case 'personal_info':
        stepUpdates.personalInfo = data;
        stepUpdates.currentStep = 'academic_info';
        break;
      case 'academic_info':
        stepUpdates.academicBackground = data;
        stepUpdates.currentStep = 'documents';
        break;
      case 'documents':
        stepUpdates.uploadedDocuments = data;
        stepUpdates.currentStep = 'eligibility';
        break;
      case 'eligibility':
        stepUpdates.eligibilityCheck = data;
        stepUpdates.currentStep = 'review';
        break;
      case 'terms':
        stepUpdates.termsAccepted = data.termsAccepted;
        stepUpdates.termsAcceptedAt = new Date();
        stepUpdates.privacyPolicyAccepted = data.privacyPolicyAccepted;
        stepUpdates.dataProcessingConsent = data.dataProcessingConsent;
        stepUpdates.currentStep = 'submit';
        break;
    }
    
    // Calculate completion percentage
    const completionPercentage = this.calculateStepCompletion(stepUpdates);
    stepUpdates.completionPercentage = completionPercentage;
    
    await db
      .update(studentApplications)
      .set(stepUpdates)
      .where(eq(studentApplications.id, applicationId));
    
    return {
      success: true,
      nextStep: stepUpdates.currentStep,
      completionPercentage
    };
  }
  
  /**
   * Perform eligibility check for application
   */
  async checkEligibility(applicationId: number): Promise<EligibilityCheck> {
    const [application] = await db
      .select()
      .from(studentApplications)
      .innerJoin(programs, eq(studentApplications.programId, programs.id))
      .where(eq(studentApplications.id, applicationId));
    
    if (!application) {
      throw new Error('Application not found');
    }
    
    const personalInfo = application.student_applications.personalInfo as any;
    const academicInfo = application.student_applications.academicBackground as any;
    const englishProficiency = application.student_applications.englishProficiency as any;
    const programRequirements = application.programs.prerequisites as any;
    
    const gaps = {
      academic: [],
      language: [],
      financial: [],
      documents: []
    };
    
    let score = 100;
    
    // Check GPA requirements
    if (programRequirements?.minimumGPA && academicInfo?.gpa) {
      if (parseFloat(academicInfo.gpa) < parseFloat(programRequirements.minimumGPA)) {
        gaps.academic.push(`GPA ${programRequirements.minimumGPA} required (current: ${academicInfo.gpa})`);
        score -= 20;
      }
    }
    
    // Check English proficiency
    if (programRequirements?.englishRequirements) {
      const requirements = programRequirements.englishRequirements;
      if (requirements.ielts && englishProficiency?.ielts) {
        if (parseFloat(englishProficiency.ielts.overall) < parseFloat(requirements.ielts.overall)) {
          gaps.language.push(`IELTS ${requirements.ielts.overall} required (current: ${englishProficiency.ielts.overall})`);
          score -= 15;
        }
      }
    }
    
    // Check document completeness
    const uploadedDocs = application.student_applications.uploadedDocuments as any;
    const requiredDocs = application.student_applications.requiredDocuments as any;
    
    if (requiredDocs && Array.isArray(requiredDocs)) {
      const missing = requiredDocs.filter(doc => 
        !uploadedDocs || !uploadedDocs[doc.type] || !uploadedDocs[doc.type].verified
      );
      
      if (missing.length > 0) {
        gaps.documents = missing.map(doc => doc.description);
        score -= missing.length * 5;
      }
    }
    
    const meets_requirements = score >= 80;
    
    return {
      meets_requirements,
      eligibility_score: Math.max(0, score),
      gaps,
      recommendations: this.generateEligibilityRecommendations(gaps, score)
    };
  }
  
  /**
   * Submit application for institutional review
   */
  async submitApplication(applicationId: number): Promise<{ success: boolean, reference: string }> {
    const eligibility = await this.checkEligibility(applicationId);
    
    if (!eligibility.meets_requirements) {
      throw new Error('Application does not meet minimum requirements');
    }
    
    const [application] = await db
      .update(studentApplications)
      .set({
        applicationStatus: 'submitted',
        submittedAt: new Date(),
        currentStep: 'completed',
        completionPercentage: 100,
        statusHistory: [{
          status: 'submitted',
          timestamp: new Date(),
          note: 'Application submitted for institutional review'
        }]
      })
      .where(eq(studentApplications.id, applicationId))
      .returning({ reference: studentApplications.applicationReference });
    
    return {
      success: true,
      reference: application.reference || `APP-${applicationId}`
    };
  }
  
  // Helper methods
  private async generateApplicationReference(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await db
      .select({ count: studentApplications.id })
      .from(studentApplications);
    
    return `APP-${year}-${String(count.length + 1).padStart(4, '0')}`;
  }
  
  private async getProgramRequirements(programId: number): Promise<any> {
    const requirements = await db
      .select()
      .from(programDocumentRequirements)
      .where(eq(programDocumentRequirements.programId, programId));
    
    return requirements.map(req => ({
      type: req.documentType,
      required: req.isRequired,
      description: req.description,
      minRequirement: req.minimumRequirement,
      formats: req.acceptedFormats
    }));
  }
  
  private generateApplicationSteps(application: any): ApplicationProcessStep[] {
    const steps = [
      { step: 'personal_info', title: 'Personal Information', description: 'Basic details and contact information' },
      { step: 'academic_info', title: 'Academic Background', description: 'Education history and qualifications' },
      { step: 'documents', title: 'Document Upload', description: 'Required certificates and transcripts' },
      { step: 'eligibility', title: 'Eligibility Check', description: 'Verify requirements are met' },
      { step: 'review', title: 'Review Application', description: 'Final review before submission' },
      { step: 'terms', title: 'Terms & Conditions', description: 'Accept legal terms and policies' },
      { step: 'submit', title: 'Submit Application', description: 'Submit to institution for review' }
    ];
    
    const currentStep = application.currentStep || 'personal_info';
    const stepsCompleted = (application.stepsCompleted as string[]) || [];
    
    return steps.map(step => ({
      ...step,
      isCompleted: stepsCompleted.includes(step.step),
      isCurrent: step.step === currentStep,
      requirements: this.getStepRequirements(step.step)
    }));
  }
  
  private getStepRequirements(step: string): string[] {
    const requirements = {
      personal_info: ['Full name', 'Date of birth', 'Nationality', 'Contact details'],
      academic_info: ['Previous qualifications', 'GPA/grades', 'Institution details'],
      documents: ['Official transcripts', 'Degree certificates', 'English test scores', 'Passport copy'],
      eligibility: ['Meet minimum GPA', 'English proficiency requirements', 'Complete documents'],
      review: ['Verify all information', 'Check document uploads', 'Confirm program selection'],
      terms: ['Accept terms and conditions', 'Privacy policy agreement', 'Data processing consent']
    };
    
    return requirements[step] || [];
  }
  
  private generateNextActions(application: any): string[] {
    const currentStep = application.currentStep || 'personal_info';
    
    const actions = {
      personal_info: ['Complete personal information form', 'Verify contact details'],
      academic_info: ['Upload academic transcripts', 'Provide institution details', 'Calculate GPA'],
      documents: ['Upload required documents', 'Verify document authenticity', 'Check file formats'],
      eligibility: ['Review eligibility requirements', 'Address any gaps', 'Get missing documents'],
      review: ['Review all application details', 'Make final corrections', 'Prepare for submission'],
      terms: ['Read terms and conditions', 'Accept privacy policy', 'Provide consent for data processing'],
      submit: ['Submit application', 'Pay application fee if required', 'Track application status']
    };
    
    return actions[currentStep] || ['Contact support for assistance'];
  }
  
  private calculateStepCompletion(stepData: any): number {
    let completed = 0;
    const totalSteps = 7;
    
    if (stepData.personalInfo) completed++;
    if (stepData.academicBackground) completed++;
    if (stepData.uploadedDocuments) completed++;
    if (stepData.eligibilityCheck) completed++;
    if (stepData.termsAccepted) completed += 2; // Terms and review
    
    return Math.round((completed / totalSteps) * 100);
  }
  
  private generateEligibilityRecommendations(gaps: any, score: number): string[] {
    const recommendations = [];
    
    if (gaps.academic.length > 0) {
      recommendations.push('Consider improving academic qualifications or look for foundation programs');
    }
    
    if (gaps.language.length > 0) {
      recommendations.push('Retake English proficiency test or enroll in preparation courses');
    }
    
    if (gaps.documents.length > 0) {
      recommendations.push('Complete missing document uploads and verification');
    }
    
    if (score < 60) {
      recommendations.push('Consider alternative programs or pathways that better match your profile');
    }
    
    return recommendations;
  }
}

export const applicationService = new ApplicationService();