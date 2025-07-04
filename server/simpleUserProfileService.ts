// Simple User Profile Service - Basic fields only
import { db } from './db';
import { userProfiles } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Simple profile interface matching the basic frontend schema
interface SimpleUserProfile {
  id?: number;
  userId: number;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  nationality?: string | null;
  currentEducationLevel?: string | null;
  fieldOfStudy?: string | null;
  interestedCourse?: string | null;
  studyLevel?: string | null;
  budgetRange?: string | null;
  ieltsOverallScore?: string | null;
  workExperienceYears?: number | null;
  currentJobTitle?: string | null;
  employmentStatus?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export class SimpleUserProfileService {
  
  async getUserProfile(userId: number): Promise<SimpleUserProfile | undefined> {
    try {
      // Query only basic fields that definitely exist
      const result = await db.select({
        id: userProfiles.id,
        userId: userProfiles.userId,
        firstName: userProfiles.firstName,
        lastName: userProfiles.lastName,
        phoneNumber: userProfiles.phoneNumber,
        dateOfBirth: userProfiles.dateOfBirth,
        gender: userProfiles.gender,
        address: userProfiles.address,
        city: userProfiles.city,
        state: userProfiles.state,
        country: userProfiles.country,
        nationality: userProfiles.nationality,
        currentEducationLevel: userProfiles.currentEducationLevel,
        fieldOfStudy: userProfiles.fieldOfStudy,
        interestedCourse: userProfiles.interestedCourse,
        studyLevel: userProfiles.studyLevel,
        budgetRange: userProfiles.budgetRange,
        ieltsOverallScore: userProfiles.ieltsOverallScore,
        workExperienceYears: userProfiles.workExperienceYears,
        currentJobTitle: userProfiles.currentJobTitle,
        employmentStatus: userProfiles.employmentStatus,
        createdAt: userProfiles.createdAt,
        updatedAt: userProfiles.updatedAt,
      }).from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
      
      const profile = result[0];
      if (!profile) return undefined;
      
      // Convert null values to undefined for consistency
      const cleanProfile: SimpleUserProfile = {
        ...profile,
        firstName: profile.firstName || undefined,
        lastName: profile.lastName || undefined,
        phoneNumber: profile.phoneNumber || undefined,
        dateOfBirth: profile.dateOfBirth || undefined,
        gender: profile.gender || undefined,
        address: profile.address || undefined,
        city: profile.city || undefined,
        state: profile.state || undefined,
        country: profile.country || undefined,
        nationality: profile.nationality || undefined,
        currentEducationLevel: profile.currentEducationLevel || undefined,
        fieldOfStudy: profile.fieldOfStudy || undefined,
        interestedCourse: profile.interestedCourse || undefined,
        studyLevel: profile.studyLevel || undefined,
        budgetRange: profile.budgetRange || undefined,
        ieltsOverallScore: profile.ieltsOverallScore || undefined,
        workExperienceYears: profile.workExperienceYears || undefined,
        currentJobTitle: profile.currentJobTitle || undefined,
        employmentStatus: profile.employmentStatus || undefined,
      };
      
      return cleanProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }
  
  async createUserProfile(data: Omit<SimpleUserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<SimpleUserProfile> {
    try {
      // Check if profile already exists
      const existing = await this.getUserProfile(data.userId);
      if (existing) {
        throw new Error('User profile already exists');
      }
      
      const profileData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [created] = await db.insert(userProfiles).values(profileData).returning({
        id: userProfiles.id,
        userId: userProfiles.userId,
        firstName: userProfiles.firstName,
        lastName: userProfiles.lastName,
        phoneNumber: userProfiles.phoneNumber,
        dateOfBirth: userProfiles.dateOfBirth,
        gender: userProfiles.gender,
        address: userProfiles.address,
        city: userProfiles.city,
        state: userProfiles.state,
        country: userProfiles.country,
        nationality: userProfiles.nationality,
        currentEducationLevel: userProfiles.currentEducationLevel,
        fieldOfStudy: userProfiles.fieldOfStudy,
        interestedCourse: userProfiles.interestedCourse,
        studyLevel: userProfiles.studyLevel,
        budgetRange: userProfiles.budgetRange,
        ieltsOverallScore: userProfiles.ieltsOverallScore,
        workExperienceYears: userProfiles.workExperienceYears,
        currentJobTitle: userProfiles.currentJobTitle,
        employmentStatus: userProfiles.employmentStatus,
        createdAt: userProfiles.createdAt,
        updatedAt: userProfiles.updatedAt,
      });
      
      // Convert null values to undefined for consistency
      const cleanProfile: SimpleUserProfile = {
        ...created,
        firstName: created.firstName || undefined,
        lastName: created.lastName || undefined,
        phoneNumber: created.phoneNumber || undefined,
        dateOfBirth: created.dateOfBirth || undefined,
        gender: created.gender || undefined,
        address: created.address || undefined,
        city: created.city || undefined,
        state: created.state || undefined,
        country: created.country || undefined,
        nationality: created.nationality || undefined,
        currentEducationLevel: created.currentEducationLevel || undefined,
        fieldOfStudy: created.fieldOfStudy || undefined,
        interestedCourse: created.interestedCourse || undefined,
        studyLevel: created.studyLevel || undefined,
        budgetRange: created.budgetRange || undefined,
        ieltsOverallScore: created.ieltsOverallScore || undefined,
        workExperienceYears: created.workExperienceYears || undefined,
        currentJobTitle: created.currentJobTitle || undefined,
        employmentStatus: created.employmentStatus || undefined,
      };
      
      return cleanProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }
  
  async updateUserProfile(userId: number, data: Partial<SimpleUserProfile>): Promise<SimpleUserProfile> {
    try {
      const existing = await this.getUserProfile(userId);
      if (!existing) {
        throw new Error('User profile not found');
      }
      
      const updateData = {
        ...data,
        updatedAt: new Date()
      };
      
      const [updated] = await db.update(userProfiles)
        .set(updateData)
        .where(eq(userProfiles.userId, userId))
        .returning({
          id: userProfiles.id,
          userId: userProfiles.userId,
          firstName: userProfiles.firstName,
          lastName: userProfiles.lastName,
          phoneNumber: userProfiles.phoneNumber,
          dateOfBirth: userProfiles.dateOfBirth,
          gender: userProfiles.gender,
          address: userProfiles.address,
          city: userProfiles.city,
          state: userProfiles.state,
          country: userProfiles.country,
          nationality: userProfiles.nationality,
          currentEducationLevel: userProfiles.currentEducationLevel,
          fieldOfStudy: userProfiles.fieldOfStudy,
          interestedCourse: userProfiles.interestedCourse,
          studyLevel: userProfiles.studyLevel,
          budgetRange: userProfiles.budgetRange,
          ieltsOverallScore: userProfiles.ieltsOverallScore,
          workExperienceYears: userProfiles.workExperienceYears,
          currentJobTitle: userProfiles.currentJobTitle,
          employmentStatus: userProfiles.employmentStatus,
          createdAt: userProfiles.createdAt,
          updatedAt: userProfiles.updatedAt,
        });
      
      // Convert null values to undefined for consistency
      const cleanProfile: SimpleUserProfile = {
        ...updated,
        firstName: updated.firstName || undefined,
        lastName: updated.lastName || undefined,
        phoneNumber: updated.phoneNumber || undefined,
        dateOfBirth: updated.dateOfBirth || undefined,
        gender: updated.gender || undefined,
        address: updated.address || undefined,
        city: updated.city || undefined,
        state: updated.state || undefined,
        country: updated.country || undefined,
        nationality: updated.nationality || undefined,
        currentEducationLevel: updated.currentEducationLevel || undefined,
        fieldOfStudy: updated.fieldOfStudy || undefined,
        interestedCourse: updated.interestedCourse || undefined,
        studyLevel: updated.studyLevel || undefined,
        budgetRange: updated.budgetRange || undefined,
        ieltsOverallScore: updated.ieltsOverallScore || undefined,
        workExperienceYears: updated.workExperienceYears || undefined,
        currentJobTitle: updated.currentJobTitle || undefined,
        employmentStatus: updated.employmentStatus || undefined,
      };
      
      return cleanProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }
  
  calculateProfileCompletion(profile: SimpleUserProfile): number {
    const requiredFields = [
      'firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'gender', 
      'nationality', 'currentEducationLevel', 'fieldOfStudy'
    ];
    
    const filledFields = requiredFields.filter(field => {
      const value = profile[field as keyof SimpleUserProfile];
      return value !== null && value !== undefined && value !== '';
    });
    
    return Math.round((filledFields.length / requiredFields.length) * 100);
  }
}

export const simpleUserProfileService = new SimpleUserProfileService();