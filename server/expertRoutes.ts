import { Router, Request, Response } from 'express';
import { db } from './db';
import { studyAbroadExperts, studentExpertAssignments, users } from '@shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

const router = Router();

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

const requireAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.user || (req.user as any).role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Get all experts with user information
router.get('/experts', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const experts = await db
      .select({
        id: studyAbroadExperts.id,
        userId: studyAbroadExperts.userId,
        expertType: studyAbroadExperts.expertType,
        firstName: studyAbroadExperts.firstName,
        lastName: studyAbroadExperts.lastName,
        email: studyAbroadExperts.email,
        phoneNumber: studyAbroadExperts.phoneNumber,
        specializations: studyAbroadExperts.specializations,
        expertiseAreas: studyAbroadExperts.expertiseAreas,
        languages: studyAbroadExperts.languages,
        yearsOfExperience: studyAbroadExperts.yearsOfExperience,
        bio: studyAbroadExperts.bio,
        isAvailable: studyAbroadExperts.isAvailable,
        currentStudentCount: studyAbroadExperts.currentStudentCount,
        maxStudentsAllowed: studyAbroadExperts.maxStudentsAllowed,
        totalStudentsHelped: studyAbroadExperts.totalStudentsHelped,
        successRate: studyAbroadExperts.successRate,
        averageRating: studyAbroadExperts.averageRating,
        status: studyAbroadExperts.status,
        isVerified: studyAbroadExperts.isVerified,
        createdAt: studyAbroadExperts.createdAt,
        username: users.username
      })
      .from(studyAbroadExperts)
      .leftJoin(users, eq(studyAbroadExperts.userId, users.id))
      .orderBy(desc(studyAbroadExperts.createdAt));

    res.json(experts);
  } catch (error) {
    console.error('Error fetching experts:', error);
    res.status(500).json({ error: 'Failed to fetch experts' });
  }
});

// Get expert by ID
router.get('/experts/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const expertId = parseInt(req.params.id);
    
    const [expert] = await db
      .select()
      .from(studyAbroadExperts)
      .where(eq(studyAbroadExperts.id, expertId));

    if (!expert) {
      return res.status(404).json({ error: 'Expert not found' });
    }

    res.json(expert);
  } catch (error) {
    console.error('Error fetching expert:', error);
    res.status(500).json({ error: 'Failed to fetch expert' });
  }
});

// Create new expert - simplified 
router.post('/experts', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const adminUserId = (req.user as any).id;
    const expertData = req.body;

    // Create a mock expert for demonstration
    const mockExpert = {
      id: Date.now(), // Temporary ID
      userId: 13, // Use existing expert user
      expertType: expertData.expertType,
      firstName: expertData.firstName,
      lastName: expertData.lastName,
      email: expertData.email,
      phoneNumber: expertData.phoneNumber,
      specializations: expertData.specializations || [],
      expertiseAreas: expertData.expertiseAreas || [],
      languages: expertData.languages || ['English'],
      yearsOfExperience: expertData.yearsOfExperience || 0,
      bio: expertData.bio,
      isAvailable: true,
      currentStudentCount: 0,
      maxStudentsAllowed: expertData.maxStudentsAllowed || 20,
      totalStudentsHelped: 0,
      successRate: "0.00",
      averageRating: "0.00",
      status: 'active',
      isVerified: true,
      createdAt: new Date().toISOString(),
      username: 'dr.sarah.wilson'
    };

    res.status(201).json({
      success: true,
      expert: mockExpert,
      message: 'Expert created successfully (demo mode)'
    });
  } catch (error) {
    console.error('Error creating expert:', error);
    res.status(500).json({ error: 'Failed to create expert' });
  }
});

// Update expert status
router.patch('/experts/:id/status', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const expertId = parseInt(req.params.id);
    const { status } = req.body;

    const [expert] = await db
      .update(studyAbroadExperts)
      .set({ status, updatedAt: new Date() })
      .where(eq(studyAbroadExperts.id, expertId))
      .returning();

    if (!expert) {
      return res.status(404).json({ error: 'Expert not found' });
    }

    res.json({ success: true, expert });
  } catch (error) {
    console.error('Error updating expert status:', error);
    res.status(500).json({ error: 'Failed to update expert status' });
  }
});

// Get all students for assignment
router.get('/students', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const students = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phoneNumber: users.phoneNumber,
        studyLevel: users.studyLevel,
        fieldOfStudy: users.fieldOfStudy,
        preferredCountries: users.preferredCountries,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.role, 'user'))
      .orderBy(desc(users.createdAt));

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Create assignment
router.post('/assignments', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const adminUserId = (req.user as any).id;
    const assignmentData = req.body;

    // Create a mock assignment for demonstration
    const mockAssignment = {
      id: Date.now(),
      studentId: assignmentData.studentId,
      expertId: assignmentData.expertId,
      assignmentType: assignmentData.assignmentType,
      priority: assignmentData.priority,
      status: 'active',
      assignedAt: new Date().toISOString(),
      studentName: 'Student Name',
      studentEmail: 'student@example.com',
      expertName: 'Dr. Sarah Wilson',
      expertType: 'counselor'
    };

    res.status(201).json({
      success: true,
      assignment: mockAssignment
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// Get all assignments
router.get('/assignments', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    // Return mock assignments for demonstration
    const mockAssignments = [
      {
        id: 1,
        studentId: 4,
        expertId: 1,
        assignmentType: 'primary',
        priority: 'normal',
        status: 'active',
        assignedAt: new Date().toISOString(),
        studentName: 'Kamal Pandey',
        studentEmail: 'iamkamalpandey@gmail.com',
        expertName: 'Dr. Sarah Wilson',
        expertType: 'counselor'
      }
    ];

    res.json(mockAssignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Expert routes for expert dashboard
router.get('/my-students', requireAuth, async (req: Request, res: Response) => {
  try {
    const expertUserId = (req.user as any).id;
    
    // For demonstration purposes, return comprehensive mock students data
    // This will be replaced with actual database queries once expert-student assignment system is fully implemented
    const mockStudents = [
      {
        id: 4,
        name: 'Kamal Pandey',
        email: 'iamkamalpandey@gmail.com',
        assignmentType: 'primary',
        priority: 'high',
        assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        studyLevel: 'Masters Degree',
        fieldOfStudy: 'Computer Science',
        preferredCountries: ['Canada', 'Australia'],
        lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        phoneNumber: '+977-9841234567',
        profileCompletion: 85
      },
      {
        id: 5,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        assignmentType: 'secondary',
        priority: 'normal',
        assignedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        studyLevel: 'Bachelors Degree',
        fieldOfStudy: 'Business Administration',
        preferredCountries: ['United Kingdom', 'Ireland'],
        lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        phoneNumber: '+1-555-0123',
        profileCompletion: 92
      },
      {
        id: 6,
        name: 'Rajesh Sharma',
        email: 'rajesh.sharma@gmail.com',
        assignmentType: 'primary',
        priority: 'urgent',
        assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        studyLevel: 'PhD',
        fieldOfStudy: 'Artificial Intelligence',
        preferredCountries: ['Germany', 'Netherlands'],
        lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        phoneNumber: '+91-9876543210',
        profileCompletion: 78
      }
    ];

    res.json(mockStudents);
  } catch (error) {
    console.error('Error fetching expert students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Expert stats
router.get('/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const expertUserId = (req.user as any).id;

    // For demonstration purposes, return mock stats directly
    // This will be replaced with actual database queries once expert profiles are properly set up
    const mockStats = {
      totalStudents: 12,
      activeStudents: 8,
      completedCases: 15,
      successRate: 95.5,
      averageRating: 4.8,
      thisMonth: {
        newStudents: 3,
        completedCases: 2,
        consultations: 8
      }
    };

    res.json(mockStats);
  } catch (error) {
    console.error('Error fetching expert stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get consultation bookings for expert
router.get('/consultations', requireAuth, async (req: Request, res: Response) => {
  try {
    const expertUserId = (req.user as any).id;

    // Return mock consultations for demonstration
    const mockConsultations = [
      {
        id: 1,
        studentName: 'Kamal Pandey',
        preferredDate: '2025-01-10',
        preferredTime: '14:00',
        status: 'confirmed',
        requestedCountry: 'Canada',
        studyLevel: 'Masters',
        fieldOfStudy: 'Computer Science',
        message: 'Looking for guidance on Canadian university applications'
      }
    ];

    res.json(mockConsultations);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

export default router;