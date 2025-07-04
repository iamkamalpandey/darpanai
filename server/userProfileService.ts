// Enhanced User Profile Service with CRM functionality
import { db } from './db';
import { userProfiles, leadActivities, leadNotes, leadAssignments, users } from '@shared/schema';
import { eq, desc, and, or, like, sql } from 'drizzle-orm';
import type { UserProfile, InsertUserProfile, LeadActivity, InsertLeadActivity, LeadNote, InsertLeadNote } from '@shared/schema';

export class UserProfileService {
  
  // ============================================================================
  // USER PROFILE MANAGEMENT
  // ============================================================================
  
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    try {
      const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
      return profile[0] || undefined;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }
  
  async createUserProfile(data: InsertUserProfile): Promise<UserProfile> {
    try {
      // Check if profile already exists
      const existing = await this.getUserProfile(data.userId);
      if (existing) {
        throw new Error('User profile already exists');
      }
      
      // Calculate profile completion percentage
      const completionPercentage = this.calculateProfileCompletion(data);
      
      const profileData = {
        ...data,
        profileCompletionPercentage: completionPercentage,
        lastProfileUpdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [created] = await db.insert(userProfiles).values(profileData).returning();
      
      // Log activity
      await this.addActivity({
        userId: data.userId,
        activityType: 'profile_created',
        activityDescription: 'User profile created',
        performedBy: data.userId
      });
      
      return created;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }
  
  async updateUserProfile(userId: number, data: Partial<InsertUserProfile>): Promise<UserProfile> {
    try {
      // Calculate new completion percentage
      const existing = await this.getUserProfile(userId);
      if (!existing) {
        throw new Error('User profile not found');
      }
      
      const updatedData = { ...existing, ...data };
      const completionPercentage = this.calculateProfileCompletion(updatedData);
      
      const updatePayload = {
        ...data,
        profileCompletionPercentage: completionPercentage,
        lastProfileUpdate: new Date(),
        updatedAt: new Date()
      };
      
      const [updated] = await db
        .update(userProfiles)
        .set(updatePayload)
        .where(eq(userProfiles.userId, userId))
        .returning();
      
      // Log activity
      await this.addActivity({
        userId,
        activityType: 'profile_updated',
        activityDescription: 'User profile updated',
        performedBy: userId,
        activityDetails: { updatedFields: Object.keys(data) }
      });
      
      return updated;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }
  
  // Calculate profile completion percentage based on filled fields
  private calculateProfileCompletion(profile: Partial<UserProfile>): number {
    const requiredFields = [
      'firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'gender',
      'country', 'currentEducationLevel', 'fieldOfStudy', 'studyLevel',
      'preferredCountries', 'budgetRange', 'intakePreference'
    ];
    
    const optionalFields = [
      'address', 'city', 'state', 'nationality', 'interestedCourse',
      'slcInstitutionName', 'slcGrade', 'slcYear',
      'highschoolInstitutionName', 'highschoolGrade', 'highschoolYear',
      'bachelorsInstitutionName', 'bachelorsGrade', 'bachelorsYear',
      'workExperienceYears', 'currentJobTitle', 'employmentStatus'
    ];
    
    const allFields = [...requiredFields, ...optionalFields];
    let filledFields = 0;
    
    for (const field of allFields) {
      const value = profile[field as keyof UserProfile];
      if (value !== null && value !== undefined && value !== '' && 
          (Array.isArray(value) ? value.length > 0 : true)) {
        filledFields++;
      }
    }
    
    return Math.round((filledFields / allFields.length) * 100);
  }
  
  // ============================================================================
  // LEADS MANAGEMENT
  // ============================================================================
  
  async getAllLeads(filters?: {
    leadStatus?: string;
    leadPriority?: string;
    assignedCounselor?: number;
    leadSource?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const { page = 1, limit = 50, search, ...filterConditions } = filters || {};
      const offset = (page - 1) * limit;
      
      let whereClause = sql`1=1`;
      
      // Apply filters
      if (filterConditions.leadStatus) {
        whereClause = sql`${whereClause} AND ${userProfiles.leadStatus} = ${filterConditions.leadStatus}`;
      }
      if (filterConditions.leadPriority) {
        whereClause = sql`${whereClause} AND ${userProfiles.leadPriority} = ${filterConditions.leadPriority}`;
      }
      if (filterConditions.assignedCounselor) {
        whereClause = sql`${whereClause} AND ${userProfiles.assignedCounselor} = ${filterConditions.assignedCounselor}`;
      }
      if (filterConditions.leadSource) {
        whereClause = sql`${whereClause} AND ${userProfiles.leadSource} = ${filterConditions.leadSource}`;
      }
      
      // Search functionality
      if (search) {
        whereClause = sql`${whereClause} AND (
          ${userProfiles.firstName} ILIKE ${`%${search}%`} OR 
          ${userProfiles.lastName} ILIKE ${`%${search}%`} OR 
          ${userProfiles.phoneNumber} ILIKE ${`%${search}%`}
        )`;
      }
      
      const leads = await db
        .select({
          profile: userProfiles,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            role: users.role
          }
        })
        .from(userProfiles)
        .leftJoin(users, eq(userProfiles.userId, users.id))
        .where(whereClause)
        .orderBy(desc(userProfiles.createdAt))
        .limit(limit)
        .offset(offset);
      
      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(userProfiles)
        .where(whereClause);
      
      const total = totalResult[0]?.count || 0;
      
      return {
        leads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw new Error('Failed to fetch leads');
    }
  }
  
  async updateLeadStatus(userId: number, status: string, updatedBy: number) {
    try {
      const [updated] = await db
        .update(userProfiles)
        .set({ 
          leadStatus: status, 
          lastContactDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(userProfiles.userId, userId))
        .returning();
      
      // Log activity
      await this.addActivity({
        userId,
        activityType: 'status_change',
        activityDescription: `Lead status changed to ${status}`,
        performedBy: updatedBy,
        activityDetails: { newStatus: status }
      });
      
      return updated;
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw new Error('Failed to update lead status');
    }
  }
  
  async assignLead(userId: number, counselorId: number, assignedBy: number, reason?: string) {
    try {
      // Update profile with assigned counselor
      await db
        .update(userProfiles)
        .set({ 
          assignedCounselor: counselorId,
          lastContactDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(userProfiles.userId, userId));
      
      // Create assignment record
      await db.insert(leadAssignments).values({
        userId,
        assignedTo: counselorId,
        assignedBy,
        assignmentReason: reason,
        assignmentType: 'primary',
        status: 'active'
      });
      
      // Log activity
      await this.addActivity({
        userId,
        activityType: 'assignment',
        activityDescription: `Lead assigned to counselor ID ${counselorId}`,
        performedBy: assignedBy,
        activityDetails: { counselorId, reason }
      });
      
      return true;
    } catch (error) {
      console.error('Error assigning lead:', error);
      throw new Error('Failed to assign lead');
    }
  }
  
  // ============================================================================
  // ACTIVITIES MANAGEMENT
  // ============================================================================
  
  async addActivity(data: InsertLeadActivity): Promise<LeadActivity> {
    try {
      const [activity] = await db.insert(leadActivities).values({
        ...data,
        activityDate: new Date(),
        createdAt: new Date()
      }).returning();
      
      return activity;
    } catch (error) {
      console.error('Error adding activity:', error);
      throw new Error('Failed to add activity');
    }
  }
  
  async getUserActivities(userId: number, limit: number = 20): Promise<LeadActivity[]> {
    try {
      const activities = await db
        .select()
        .from(leadActivities)
        .where(eq(leadActivities.userId, userId))
        .orderBy(desc(leadActivities.activityDate))
        .limit(limit);
      
      return activities;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw new Error('Failed to fetch user activities');
    }
  }
  
  // ============================================================================
  // NOTES MANAGEMENT
  // ============================================================================
  
  async addNote(data: InsertLeadNote): Promise<LeadNote> {
    try {
      const [note] = await db.insert(leadNotes).values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      // Log activity for note addition
      await this.addActivity({
        userId: data.userId,
        activityType: 'note_added',
        activityDescription: `Note added: ${data.noteTitle || 'Untitled'}`,
        performedBy: data.addedBy,
        activityDetails: { noteId: note.id, noteType: data.noteType }
      });
      
      return note;
    } catch (error) {
      console.error('Error adding note:', error);
      throw new Error('Failed to add note');
    }
  }
  
  async getUserNotes(userId: number, includeInternal: boolean = false): Promise<LeadNote[]> {
    try {
      const conditions = [eq(leadNotes.userId, userId)];
      
      if (!includeInternal) {
        conditions.push(eq(leadNotes.isInternal, false));
      }
      
      const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];
      
      const notes = await db
        .select()
        .from(leadNotes)
        .where(whereClause)
        .orderBy(desc(leadNotes.createdAt));
      
      return notes;
    } catch (error) {
      console.error('Error fetching user notes:', error);
      throw new Error('Failed to fetch user notes');
    }
  }
  
  // ============================================================================
  // ANALYTICS AND INSIGHTS
  // ============================================================================
  
  async getLeadsAnalytics() {
    try {
      // Lead status distribution
      const statusDistribution = await db
        .select({
          status: userProfiles.leadStatus,
          count: sql<number>`count(*)`
        })
        .from(userProfiles)
        .groupBy(userProfiles.leadStatus);
      
      // Lead priority distribution
      const priorityDistribution = await db
        .select({
          priority: userProfiles.leadPriority,
          count: sql<number>`count(*)`
        })
        .from(userProfiles)
        .groupBy(userProfiles.leadPriority);
      
      // Lead source distribution
      const sourceDistribution = await db
        .select({
          source: userProfiles.leadSource,
          count: sql<number>`count(*)`
        })
        .from(userProfiles)
        .where(sql`${userProfiles.leadSource} IS NOT NULL`)
        .groupBy(userProfiles.leadSource);
      
      // Recent activity count
      const recentActivities = await db
        .select({ count: sql<number>`count(*)` })
        .from(leadActivities)
        .where(sql`${leadActivities.activityDate} >= NOW() - INTERVAL '7 days'`);
      
      // Conversion metrics
      const conversionMetrics = await db
        .select({
          totalLeads: sql<number>`count(*)`,
          convertedLeads: sql<number>`count(*) FILTER (WHERE ${userProfiles.leadStatus} = 'enrolled')`,
          averageScore: sql<number>`avg(${userProfiles.leadScore})`,
          averageCompletion: sql<number>`avg(${userProfiles.profileCompletionPercentage})`
        })
        .from(userProfiles);
      
      return {
        statusDistribution,
        priorityDistribution,
        sourceDistribution,
        recentActivitiesCount: recentActivities[0]?.count || 0,
        conversionMetrics: conversionMetrics[0] || {}
      };
    } catch (error) {
      console.error('Error fetching leads analytics:', error);
      throw new Error('Failed to fetch leads analytics');
    }
  }
  
  async getCounselorPerformance(counselorId?: number) {
    try {
      let whereClause = sql`${userProfiles.assignedCounselor} IS NOT NULL`;
      
      if (counselorId) {
        whereClause = sql`${userProfiles.assignedCounselor} = ${counselorId}`;
      }
      
      const performance = await db
        .select({
          counselorId: userProfiles.assignedCounselor,
          totalAssigned: sql<number>`count(*)`,
          enrolled: sql<number>`count(*) FILTER (WHERE ${userProfiles.leadStatus} = 'enrolled')`,
          averageScore: sql<number>`avg(${userProfiles.leadScore})`,
          averageSatisfaction: sql<number>`avg(${userProfiles.satisfactionRating})`
        })
        .from(userProfiles)
        .where(whereClause)
        .groupBy(userProfiles.assignedCounselor);
      
      return performance;
    } catch (error) {
      console.error('Error fetching counselor performance:', error);
      throw new Error('Failed to fetch counselor performance');
    }
  }
}

export const userProfileService = new UserProfileService();