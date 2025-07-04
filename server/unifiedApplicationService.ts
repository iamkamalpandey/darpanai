import { db } from "./db";
import { 
  institutions, 
  courses, 
  requiredDocuments, 
  applications, 
  applicationDocuments,
  scholarships,
  users,
  type Institution,
  type Course,
  type RequiredDocument,
  type Application,
  type ApplicationDocument,
  type InsertApplication,
  type InsertApplicationDocument
} from "@shared/schema";
import { eq, and, desc, asc, count, sql } from "drizzle-orm";

export class UnifiedApplicationService {
  // Institution and Course Management
  async getInstitutions(country?: string, search?: string) {
    try {
      let query = db.select().from(institutions).where(eq(institutions.isActive, true));
      
      if (country) {
        query = query.where(eq(institutions.country, country));
      }
      
      if (search) {
        query = query.where(sql`${institutions.name} ILIKE ${`%${search}%`}`);
      }
      
      return await query.orderBy(asc(institutions.ranking));
    } catch (error) {
      console.error('Error fetching institutions:', error);
      throw new Error('Failed to fetch institutions');
    }
  }

  async getInstitutionById(id: number): Promise<Institution | null> {
    try {
      const [institution] = await db.select().from(institutions).where(eq(institutions.id, id));
      return institution || null;
    } catch (error) {
      console.error('Error fetching institution:', error);
      throw new Error('Failed to fetch institution');
    }
  }

  async getCoursesByInstitution(institutionId: number) {
    try {
      return await db.select().from(courses)
        .where(and(eq(courses.institutionId, institutionId), eq(courses.isActive, true)))
        .orderBy(asc(courses.level), asc(courses.name));
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  async getCourseById(id: number): Promise<Course | null> {
    try {
      const [course] = await db.select().from(courses).where(eq(courses.id, id));
      return course || null;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw new Error('Failed to fetch course');
    }
  }

  async getCourseWithInstitution(courseId: number) {
    try {
      const result = await db.select({
        course: courses,
        institution: institutions
      })
      .from(courses)
      .innerJoin(institutions, eq(courses.institutionId, institutions.id))
      .where(eq(courses.id, courseId));

      return result[0] || null;
    } catch (error) {
      console.error('Error fetching course with institution:', error);
      throw new Error('Failed to fetch course details');
    }
  }

  // Required Documents Management
  async getRequiredDocumentsByCategory(category?: string) {
    try {
      let query = db.select().from(requiredDocuments);
      
      if (category) {
        query = query.where(eq(requiredDocuments.category, category));
      }
      
      return await query.orderBy(asc(requiredDocuments.category), asc(requiredDocuments.name));
    } catch (error) {
      console.error('Error fetching required documents:', error);
      throw new Error('Failed to fetch required documents');
    }
  }

  // Scholarship Integration
  async getApplicableScholarships(courseId: number, userCountry?: string) {
    try {
      // Get course details to match scholarships
      const course = await this.getCourseWithInstitution(courseId);
      if (!course) return [];

      // Find applicable scholarships based on course level, field, and country
      const applicableScholarships = await db.select().from(scholarships)
        .where(
          and(
            eq(scholarships.isActive, true),
            sql`${scholarships.academicLevelTags} && ARRAY[${course.course.level}]`,
            sql`${scholarships.countryTags} && ARRAY[${course.institution.country}]`
          )
        )
        .orderBy(desc(scholarships.fundingAmount));

      return applicableScholarships;
    } catch (error) {
      console.error('Error fetching applicable scholarships:', error);
      return [];
    }
  }

  // Application Management
  async createApplication(applicationData: InsertApplication): Promise<Application> {
    try {
      // Generate unique application number
      const timestamp = Date.now();
      const applicationNumber = `APP-${timestamp}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const [application] = await db.insert(applications).values({
        ...applicationData,
        applicationNumber
      }).returning();

      return application;
    } catch (error) {
      console.error('Error creating application:', error);
      throw new Error('Failed to create application');
    }
  }

  async updateApplication(id: number, applicationData: Partial<InsertApplication>) {
    try {
      const [application] = await db.update(applications)
        .set({
          ...applicationData,
          updatedAt: new Date()
        })
        .where(eq(applications.id, id))
        .returning();

      return application;
    } catch (error) {
      console.error('Error updating application:', error);
      throw new Error('Failed to update application');
    }
  }

  async getApplicationById(id: number): Promise<Application | null> {
    try {
      const [application] = await db.select().from(applications).where(eq(applications.id, id));
      return application || null;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw new Error('Failed to fetch application');
    }
  }

  async getApplicationWithDetails(id: number) {
    try {
      const result = await db.select({
        application: applications,
        institution: institutions,
        course: courses,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName
        }
      })
      .from(applications)
      .innerJoin(institutions, eq(applications.institutionId, institutions.id))
      .innerJoin(courses, eq(applications.courseId, courses.id))
      .innerJoin(users, eq(applications.userId, users.id))
      .where(eq(applications.id, id));

      return result[0] || null;
    } catch (error) {
      console.error('Error fetching application details:', error);
      throw new Error('Failed to fetch application details');
    }
  }

  async getUserApplications(userId: number) {
    try {
      return await db.select({
        application: applications,
        institution: institutions,
        course: courses
      })
      .from(applications)
      .innerJoin(institutions, eq(applications.institutionId, institutions.id))
      .innerJoin(courses, eq(applications.courseId, courses.id))
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.createdAt));
    } catch (error) {
      console.error('Error fetching user applications:', error);
      throw new Error('Failed to fetch user applications');
    }
  }

  async getAllApplications() {
    try {
      return await db.select({
        application: applications,
        institution: institutions,
        course: courses,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName
        }
      })
      .from(applications)
      .innerJoin(institutions, eq(applications.institutionId, institutions.id))
      .innerJoin(courses, eq(applications.courseId, courses.id))
      .innerJoin(users, eq(applications.userId, users.id))
      .orderBy(desc(applications.createdAt));
    } catch (error) {
      console.error('Error fetching all applications:', error);
      throw new Error('Failed to fetch applications');
    }
  }

  // Document Management
  async uploadApplicationDocument(documentData: InsertApplicationDocument) {
    try {
      const [document] = await db.insert(applicationDocuments).values(documentData).returning();
      return document;
    } catch (error) {
      console.error('Error uploading application document:', error);
      throw new Error('Failed to upload document');
    }
  }

  async getApplicationDocuments(applicationId: number) {
    try {
      return await db.select({
        document: applicationDocuments,
        requiredDocument: requiredDocuments
      })
      .from(applicationDocuments)
      .innerJoin(requiredDocuments, eq(applicationDocuments.documentId, requiredDocuments.id))
      .where(eq(applicationDocuments.applicationId, applicationId))
      .orderBy(asc(requiredDocuments.category), asc(requiredDocuments.name));
    } catch (error) {
      console.error('Error fetching application documents:', error);
      throw new Error('Failed to fetch application documents');
    }
  }

  async verifyDocument(documentId: number, verifiedBy: number, status: 'verified' | 'rejected', comments?: string) {
    try {
      const [document] = await db.update(applicationDocuments)
        .set({
          verificationStatus: status,
          verifiedAt: new Date(),
          verifiedBy,
          verificationComments: comments
        })
        .where(eq(applicationDocuments.id, documentId))
        .returning();

      return document;
    } catch (error) {
      console.error('Error verifying document:', error);
      throw new Error('Failed to verify document');
    }
  }

  // Statistics and Analytics
  async getApplicationStats(userId?: number) {
    try {
      let baseQuery = db.select({
        status: applications.status,
        count: count()
      }).from(applications);

      if (userId) {
        baseQuery = baseQuery.where(eq(applications.userId, userId));
      }

      const statusStats = await baseQuery.groupBy(applications.status);

      const total = statusStats.reduce((sum, stat) => sum + stat.count, 0);
      
      const stats = {
        total,
        draft: statusStats.find(s => s.status === 'draft')?.count || 0,
        submitted: statusStats.find(s => s.status === 'submitted')?.count || 0,
        under_review: statusStats.find(s => s.status === 'under_review')?.count || 0,
        approved: statusStats.find(s => s.status === 'approved')?.count || 0,
        rejected: statusStats.find(s => s.status === 'rejected')?.count || 0,
        withdrawn: statusStats.find(s => s.status === 'withdrawn')?.count || 0,
        completion_rate: total > 0 ? Math.round((statusStats.find(s => s.status === 'approved')?.count || 0) / total * 100) : 0,
        avg_processing_time: "2-4 weeks"
      };

      return stats;
    } catch (error) {
      console.error('Error fetching application stats:', error);
      throw new Error('Failed to fetch application statistics');
    }
  }

  // Fee Calculation with Scholarship Integration
  async calculateApplicationFees(courseId: number, scholarshipIds: number[] = []) {
    try {
      const course = await this.getCourseById(courseId);
      if (!course) throw new Error('Course not found');

      let totalScholarshipAmount = 0;
      
      if (scholarshipIds.length > 0) {
        const applicableScholarships = await db.select().from(scholarships)
          .where(sql`${scholarships.id} = ANY(${scholarshipIds})`);
        
        totalScholarshipAmount = applicableScholarships.reduce((sum, scholarship) => {
          return sum + (scholarship.fundingAmount ? parseFloat(scholarship.fundingAmount.toString()) : 0);
        }, 0);
      }

      const tuitionFee = parseFloat(course.tuitionFee.toString());
      const applicationFee = parseFloat(course.applicationFee.toString());
      const totalFees = tuitionFee + applicationFee;
      const netAmount = Math.max(0, totalFees - totalScholarshipAmount);

      return {
        tuitionFee,
        applicationFee,
        totalFees,
        scholarshipAmount: totalScholarshipAmount,
        netAmount,
        currency: course.currency,
        savings: totalScholarshipAmount > 0 ? Math.round((totalScholarshipAmount / totalFees) * 100) : 0
      };
    } catch (error) {
      console.error('Error calculating fees:', error);
      throw new Error('Failed to calculate application fees');
    }
  }
}

export const unifiedApplicationService = new UnifiedApplicationService();