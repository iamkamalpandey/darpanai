import { Router } from 'express';
import multer from 'multer';
import { db } from './db';
import { coeInformation } from '@shared/coeSchema';
import { extractCoeInformation } from './coeExtractor';
import { eq } from 'drizzle-orm';
import * as pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'));
    }
  },
});

// Helper function to extract text from files
async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  if (file.mimetype === 'application/pdf') {
    const pdfData = await pdfParse(file.buffer);
    return pdfData.text;
  } else if (file.mimetype.startsWith('image/')) {
    const result = await Tesseract.recognize(file.buffer, 'eng');
    return result.data.text;
  } else {
    throw new Error('Unsupported file type');
  }
}

// Upload and process COE document
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`[COE Upload] Processing file: ${req.file.originalname} (${req.file.size} bytes)`);

    // Extract text from the uploaded file
    const documentText = await extractTextFromFile(req.file);
    console.log(`[COE Upload] Extracted ${documentText.length} characters from document`);

    // Extract COE information using OpenAI
    const extractedInfo = await extractCoeInformation(documentText);
    console.log(`[COE Upload] Successfully extracted COE information`);

    // Save to database
    const [savedCoe] = await db.insert(coeInformation).values({
      userId: req.user.id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      documentText,
      ...extractedInfo,
    }).returning();

    console.log(`[COE Upload] Saved COE information with ID: ${savedCoe.id}`);

    res.json({
      success: true,
      coeId: savedCoe.id,
      message: 'COE information extracted and saved successfully',
    });

  } catch (error) {
    console.error('[COE Upload] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process COE document',
    });
  }
});

// Get all COE documents for the authenticated user
router.get('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const coeDocuments = await db
      .select({
        id: coeInformation.id,
        fileName: coeInformation.fileName,
        institutionName: coeInformation.institutionName,
        courseName: coeInformation.courseName,
        studentName: coeInformation.studentName,
        commencementDate: coeInformation.commencementDate,
        createdAt: coeInformation.createdAt,
      })
      .from(coeInformation)
      .where(eq(coeInformation.userId, req.user.id))
      .orderBy(coeInformation.createdAt);

    res.json(coeDocuments);
  } catch (error) {
    console.error('[COE List] Error:', error);
    res.status(500).json({ error: 'Failed to fetch COE documents' });
  }
});

// Get specific COE document details
router.get('/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const coeId = parseInt(req.params.id);
    if (isNaN(coeId)) {
      return res.status(400).json({ error: 'Invalid COE ID' });
    }

    const [coeDoc] = await db
      .select()
      .from(coeInformation)
      .where(eq(coeInformation.id, coeId));

    if (!coeDoc) {
      return res.status(404).json({ error: 'COE document not found' });
    }

    // Ensure user can only access their own documents
    if (coeDoc.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(coeDoc);
  } catch (error) {
    console.error('[COE Details] Error:', error);
    res.status(500).json({ error: 'Failed to fetch COE document' });
  }
});

// Delete COE document
router.delete('/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const coeId = parseInt(req.params.id);
    if (isNaN(coeId)) {
      return res.status(400).json({ error: 'Invalid COE ID' });
    }

    // Check if document exists and belongs to user
    const [coeDoc] = await db
      .select({ userId: coeInformation.userId })
      .from(coeInformation)
      .where(eq(coeInformation.id, coeId));

    if (!coeDoc) {
      return res.status(404).json({ error: 'COE document not found' });
    }

    if (coeDoc.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete the document
    await db.delete(coeInformation).where(eq(coeInformation.id, coeId));

    res.json({ success: true, message: 'COE document deleted successfully' });
  } catch (error) {
    console.error('[COE Delete] Error:', error);
    res.status(500).json({ error: 'Failed to delete COE document' });
  }
});

export default router;