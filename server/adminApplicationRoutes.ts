import { Router, Request, Response } from "express";
import { db } from "./db";
import { studentApplications, users } from "@shared/schema";
import { eq, desc, like, and } from "drizzle-orm";

const router = Router();

// Simple auth middleware
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

// Admin check middleware
const requireAdmin = (req: Request, res: Response, next: any) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Apply auth middleware to all routes
router.use(requireAuth);
router.use(requireAdmin);

// Get all applications for admin
router.get("/applications", async (req: Request, res: Response) => {
  try {
    const { status, priority, search } = req.query;
    
    let query = db
      .select({
        id: studentApplications.id,
        userId: studentApplications.userId,
        applicationNumber: studentApplications.applicationNumber,
        studyLevel: studentApplications.studyLevel,
        fieldOfStudy: studentApplications.fieldOfStudy,
        targetCountry: studentApplications.targetCountry,
        preferredIntake: studentApplications.preferredIntake,
        budgetRange: studentApplications.budgetRange,
        fundingSource: studentApplications.fundingSource,
        status: studentApplications.status,
        priority: studentApplications.priority,
        submittedAt: studentApplications.submittedAt,
        lastUpdated: studentApplications.updatedAt,
        personalDetails: studentApplications.personalDetails,
        documents: studentApplications.documents,
        notes: studentApplications.notes,
        // User details
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
        userPhone: users.phoneNumber
      })
      .from(studentApplications)
      .leftJoin(users, eq(studentApplications.userId, users.id))
      .orderBy(desc(studentApplications.updatedAt));

    // Apply filters
    const conditions = [];
    
    if (status && status !== 'all') {
      conditions.push(eq(studentApplications.status, status as string));
    }
    
    if (priority && priority !== 'all') {
      conditions.push(eq(studentApplications.priority, priority as string));
    }
    
    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        like(studentApplications.applicationNumber, searchTerm)
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const rawApplications = await query;
    
    // Transform data to match frontend interface
    const applications = rawApplications.map(app => ({
      id: app.id,
      userId: app.userId,
      applicationNumber: app.applicationNumber,
      studyLevel: app.studyLevel,
      fieldOfStudy: app.fieldOfStudy,
      targetCountry: app.targetCountry,
      preferredIntake: app.preferredIntake,
      budgetRange: app.budgetRange,
      fundingSource: app.fundingSource,
      status: app.status,
      priority: app.priority,
      submittedAt: app.submittedAt,
      lastUpdated: app.lastUpdated,
      personalDetails: {
        firstName: app.userFirstName || 'Unknown',
        lastName: app.userLastName || 'Unknown',
        email: app.userEmail || 'No email',
        phoneNumber: app.userPhone || 'No phone',
        dateOfBirth: app.personalDetails?.dateOfBirth || 'Not provided',
        nationality: app.personalDetails?.nationality || 'Not provided',
        passportNumber: app.personalDetails?.passportNumber || 'Not provided'
      },
      documents: app.documents || [],
      notes: app.notes || []
    }));

    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ 
      error: "Failed to fetch applications",
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Get specific application details
router.get("/applications/:id", async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id);
    
    const application = await db
      .select({
        id: studentApplications.id,
        userId: studentApplications.userId,
        applicationNumber: studentApplications.applicationNumber,
        studyLevel: studentApplications.studyLevel,
        fieldOfStudy: studentApplications.fieldOfStudy,
        targetCountry: studentApplications.targetCountry,
        preferredIntake: studentApplications.preferredIntake,
        budgetRange: studentApplications.budgetRange,
        fundingSource: studentApplications.fundingSource,
        status: studentApplications.status,
        priority: studentApplications.priority,
        submittedAt: studentApplications.submittedAt,
        lastUpdated: studentApplications.updatedAt,
        personalDetails: studentApplications.personalDetails,
        documents: studentApplications.documents,
        notes: studentApplications.notes,
        // User details
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
        userPhone: users.phoneNumber
      })
      .from(studentApplications)
      .leftJoin(users, eq(studentApplications.userId, users.id))
      .where(eq(studentApplications.id, applicationId));

    if (application.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    const app = application[0];
    
    const formattedApplication = {
      id: app.id,
      userId: app.userId,
      applicationNumber: app.applicationNumber,
      studyLevel: app.studyLevel,
      fieldOfStudy: app.fieldOfStudy,
      targetCountry: app.targetCountry,
      preferredIntake: app.preferredIntake,
      budgetRange: app.budgetRange,
      fundingSource: app.fundingSource,
      status: app.status,
      priority: app.priority,
      submittedAt: app.submittedAt,
      lastUpdated: app.lastUpdated,
      personalDetails: {
        firstName: app.userFirstName || 'Unknown',
        lastName: app.userLastName || 'Unknown',
        email: app.userEmail || 'No email',
        phoneNumber: app.userPhone || 'No phone',
        dateOfBirth: app.personalDetails?.dateOfBirth || 'Not provided',
        nationality: app.personalDetails?.nationality || 'Not provided',
        passportNumber: app.personalDetails?.passportNumber || 'Not provided'
      },
      documents: app.documents || [],
      notes: app.notes || []
    };

    res.json(formattedApplication);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ 
      error: "Failed to fetch application",
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Add note to application
router.post("/applications/:id/notes", async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { message, type } = req.body;
    
    if (!message || !type) {
      return res.status(400).json({ error: "Message and type are required" });
    }

    // Get current application
    const [application] = await db
      .select()
      .from(studentApplications)
      .where(eq(studentApplications.id, applicationId));

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Create new note
    const newNote = {
      id: Date.now(), // Simple ID generation
      message,
      type,
      createdAt: new Date().toISOString(),
      createdBy: req.user?.username || 'Admin'
    };

    // Update notes array
    const currentNotes = application.notes || [];
    const updatedNotes = [...currentNotes, newNote];

    // Update database
    await db
      .update(studentApplications)
      .set({ 
        notes: updatedNotes,
        updatedAt: new Date()
      })
      .where(eq(studentApplications.id, applicationId));

    res.json({ 
      success: true, 
      message: "Note added successfully",
      note: newNote 
    });
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({ 
      error: "Failed to add note",
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Update application status
router.patch("/applications/:id/status", async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { status, message } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    // Valid statuses
    const validStatuses = ['draft', 'submitted', 'under_review', 'documents_requested', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Get current application
    const [application] = await db
      .select()
      .from(studentApplications)
      .where(eq(studentApplications.id, applicationId));

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Create status update note if message provided
    let updatedNotes = application.notes || [];
    if (message) {
      const statusNote = {
        id: Date.now(),
        message: `Status updated to ${status.replace('_', ' ').toUpperCase()}: ${message}`,
        type: 'student_visible' as const,
        createdAt: new Date().toISOString(),
        createdBy: req.user?.username || 'Admin'
      };
      updatedNotes = [...updatedNotes, statusNote];
    }

    // Update database
    await db
      .update(studentApplications)
      .set({ 
        status: status as any,
        notes: updatedNotes,
        updatedAt: new Date()
      })
      .where(eq(studentApplications.id, applicationId));

    res.json({ 
      success: true, 
      message: "Status updated successfully" 
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ 
      error: "Failed to update status",
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Request additional documents
router.post("/applications/:id/request-documents", async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { documents, message } = req.body;
    
    if (!documents || !message) {
      return res.status(400).json({ error: "Documents list and message are required" });
    }

    // Get current application
    const [application] = await db
      .select()
      .from(studentApplications)
      .where(eq(studentApplications.id, applicationId));

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Create document request note
    const documentNote = {
      id: Date.now(),
      message: `Document Request: ${message}`,
      type: 'student_visible' as const,
      createdAt: new Date().toISOString(),
      createdBy: req.user?.username || 'Admin'
    };

    // Update notes array
    const currentNotes = application.notes || [];
    const updatedNotes = [...currentNotes, documentNote];

    // Update database with status and note
    await db
      .update(studentApplications)
      .set({ 
        status: 'documents_requested',
        notes: updatedNotes,
        updatedAt: new Date()
      })
      .where(eq(studentApplications.id, applicationId));

    res.json({ 
      success: true, 
      message: "Document request sent successfully" 
    });
  } catch (error) {
    console.error("Error requesting documents:", error);
    res.status(500).json({ 
      error: "Failed to request documents",
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Get application statistics
router.get("/applications/stats", async (req: Request, res: Response) => {
  try {
    const applications = await db.select().from(studentApplications);
    
    const stats = {
      total: applications.length,
      submitted: applications.filter(app => app.status === 'submitted').length,
      underReview: applications.filter(app => app.status === 'under_review').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      documentsRequested: applications.filter(app => app.status === 'documents_requested').length,
      highPriority: applications.filter(app => app.priority === 'high').length,
      mediumPriority: applications.filter(app => app.priority === 'medium').length,
      lowPriority: applications.filter(app => app.priority === 'low').length
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ 
      error: "Failed to fetch statistics",
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

export default router;