import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { documentAnalysisService } from './documentAnalysisService';
import { db } from './db';
import { countryDocumentRequirements, requiredDocuments, userDocuments } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'));
    }
  }
});

// Upload and analyze document
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { documentCategory, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!documentCategory) {
      return res.status(400).json({ error: 'Document category is required' });
    }

    // Process document with AI analysis
    const result = await documentAnalysisService.processDocument(
      userId,
      req.file.path,
      req.file.filename,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      documentCategory,
      description
    );

    res.json({
      success: true,
      document: result.document,
      analysis: result.analysisData,
      validationIssues: result.validationIssues,
      profileUpdate: result.profileUpdate
    });

  } catch (error: any) {
    console.error('Error uploading document:', error);
    res.status(500).json({ 
      error: 'Failed to upload and analyze document',
      details: error.message 
    });
  }
});

// Get user documents (My Documents page)
router.get('/my-documents', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { category } = req.query;
    const documents = await documentAnalysisService.getUserDocuments(
      userId, 
      category as string
    );

    res.json(documents);

  } catch (error: any) {
    console.error('Error fetching user documents:', error);
    res.status(500).json({ 
      error: 'Failed to fetch documents',
      details: error.message 
    });
  }
});

// Get document by ID
router.get('/documents/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const documentId = parseInt(req.params.id);
    const documents = await documentAnalysisService.getUserDocuments(userId);
    const document = documents.find(doc => doc.id === documentId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);

  } catch (error: any) {
    console.error('Error fetching document:', error);
    res.status(500).json({ 
      error: 'Failed to fetch document',
      details: error.message 
    });
  }
});

// Update document metadata
router.patch('/documents/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const documentId = parseInt(req.params.id);
    const { description, tags } = req.body;

    // Verify document belongs to user
    const documents = await documentAnalysisService.getUserDocuments(userId);
    const document = documents.find(doc => doc.id === documentId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Update document
    const updates: any = {};
    if (description !== undefined) updates.description = description;
    if (tags !== undefined) updates.tags = tags;

    if (Object.keys(updates).length === 0) {
      return res.json({ message: 'No updates provided' });
    }

    await db.update(userDocuments)
      .set(updates)
      .where(eq(userDocuments.id, documentId));

    res.json({ message: 'Document updated successfully' });

  } catch (error: any) {
    console.error('Error updating document:', error);
    res.status(500).json({ 
      error: 'Failed to update document',
      details: error.message 
    });
  }
});

// Delete document
router.delete('/documents/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const documentId = parseInt(req.params.id);

    // Verify document belongs to user
    const documents = await documentAnalysisService.getUserDocuments(userId);
    const document = documents.find(doc => doc.id === documentId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from disk
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete from database
    await db.delete(userDocuments).where(eq(userDocuments.id, documentId));

    res.json({ message: 'Document deleted successfully' });

  } catch (error: any) {
    console.error('Error deleting document:', error);
    res.status(500).json({ 
      error: 'Failed to delete document',
      details: error.message 
    });
  }
});

// Get country-specific document requirements
router.get('/requirements/:countryCode', async (req, res) => {
  try {
    const { countryCode } = req.params;
    const { studyLevel } = req.query;

    let query = db.select({
      id: countryDocumentRequirements.id,
      countryCode: countryDocumentRequirements.countryCode,
      countryName: countryDocumentRequirements.countryName,
      documentId: countryDocumentRequirements.documentId,
      isRequired: countryDocumentRequirements.isRequired,
      specificInstructions: countryDocumentRequirements.specificInstructions,
      order: countryDocumentRequirements.order,
      documentName: requiredDocuments.name,
      documentDescription: requiredDocuments.description,
      documentCategory: requiredDocuments.category,
      fileTypes: requiredDocuments.fileTypes,
      maxSize: requiredDocuments.maxSize,
      instructions: requiredDocuments.instructions
    })
    .from(countryDocumentRequirements)
    .innerJoin(requiredDocuments, eq(countryDocumentRequirements.documentId, requiredDocuments.id))
    .where(eq(countryDocumentRequirements.countryCode, countryCode.toUpperCase()));

    if (studyLevel) {
      // Add study level filter if provided
      // This would need additional schema modifications for study level specific requirements
    }

    const requirements = await query.orderBy(countryDocumentRequirements.order);

    res.json({
      countryCode: countryCode.toUpperCase(),
      requirements: requirements.map(req => ({
        id: req.id,
        documentId: req.documentId,
        name: req.documentName,
        description: req.documentDescription,
        category: req.documentCategory,
        isRequired: req.isRequired,
        specificInstructions: req.specificInstructions,
        fileTypes: req.fileTypes,
        maxSize: req.maxSize,
        instructions: req.instructions,
        order: req.order
      }))
    });

  } catch (error: any) {
    console.error('Error fetching country requirements:', error);
    res.status(500).json({ 
      error: 'Failed to fetch country requirements',
      details: error.message 
    });
  }
});

// Auto-populate profile from document
router.post('/auto-populate/:documentId', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const documentId = parseInt(req.params.documentId);

    // Verify document belongs to user
    const documents = await documentAnalysisService.getUserDocuments(userId);
    const document = documents.find(doc => doc.id === documentId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (!document.isAnalyzed || !document.extractedFields) {
      return res.status(400).json({ error: 'Document not analyzed yet' });
    }

    // Auto-populate profile
    const result = await documentAnalysisService.autoPopulateProfile(
      userId,
      document.extractedFields
    );

    res.json(result);

  } catch (error: any) {
    console.error('Error auto-populating profile:', error);
    res.status(500).json({ 
      error: 'Failed to auto-populate profile',
      details: error.message 
    });
  }
});

// Cross-check data against uploaded documents
router.post('/cross-check', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { formData } = req.body;

    // Get all user documents
    const documents = await documentAnalysisService.getUserDocuments(userId);
    const analyzedDocs = documents.filter(doc => doc.isAnalyzed && doc.extractedFields);

    const discrepancies: any[] = [];

    // Check each analyzed document against form data
    for (const doc of analyzedDocs) {
      const extractedData = doc.extractedFields;

      // Check name consistency
      if (extractedData.fullName || extractedData.studentName) {
        const documentName = extractedData.fullName || extractedData.studentName;
        const formName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
        
        if (documentName && formName && documentName.toLowerCase() !== formName.toLowerCase()) {
          discrepancies.push({
            type: 'name_mismatch',
            document: doc.originalName,
            documentValue: documentName,
            formValue: formName,
            message: `Name in ${doc.originalName} doesn't match form data`
          });
        }
      }

      // Check date of birth
      if (extractedData.dateOfBirth && formData.dateOfBirth) {
        const docDate = new Date(extractedData.dateOfBirth);
        const formDate = new Date(formData.dateOfBirth);
        
        if (docDate.getTime() !== formDate.getTime()) {
          discrepancies.push({
            type: 'date_mismatch',
            document: doc.originalName,
            documentValue: extractedData.dateOfBirth,
            formValue: formData.dateOfBirth,
            message: `Date of birth in ${doc.originalName} doesn't match form data`
          });
        }
      }

      // Check nationality
      if (extractedData.nationality && formData.nationality) {
        if (extractedData.nationality.toLowerCase() !== formData.nationality.toLowerCase()) {
          discrepancies.push({
            type: 'nationality_mismatch',
            document: doc.originalName,
            documentValue: extractedData.nationality,
            formValue: formData.nationality,
            message: `Nationality in ${doc.originalName} doesn't match form data`
          });
        }
      }

      // Check academic information
      if (extractedData.gpa && formData.gpa) {
        const docGpa = parseFloat(extractedData.gpa);
        const formGpa = parseFloat(formData.gpa);
        
        if (Math.abs(docGpa - formGpa) > 0.1) {
          discrepancies.push({
            type: 'gpa_mismatch',
            document: doc.originalName,
            documentValue: extractedData.gpa,
            formValue: formData.gpa,
            message: `GPA in ${doc.originalName} doesn't match form data`
          });
        }
      }
    }

    res.json({
      discrepancies,
      documentsChecked: analyzedDocs.length,
      hasIssues: discrepancies.length > 0
    });

  } catch (error: any) {
    console.error('Error cross-checking data:', error);
    res.status(500).json({ 
      error: 'Failed to cross-check data',
      details: error.message 
    });
  }
});

export default router;