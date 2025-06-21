import { Request, Response } from 'express';
import multer from 'multer';
import { offerLetterInfoStorage } from './offerLetterInfoStorage';
import { extractTextFromPdf } from './fileProcessing';
import { extractOfferLetterInfo } from './offerLetterExtractor';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  }
});

export function setupOfferLetterInfoRoutes(app: any) {
  
  // Upload and extract offer letter information
  app.post('/api/offer-letter-info', upload.single('document'), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const user = req.user as any;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      console.log(`Processing offer letter: ${file.originalname}`);

      // Extract text from document
      const documentText = await extractTextFromPdf(file.buffer);
      console.log(`Extracted ${documentText.length} characters from document`);

      if (documentText.length < 100) {
        return res.status(400).json({ error: 'Document appears to be empty or unreadable' });
      }

      // Extract information using OpenAI
      const startTime = Date.now();
      const { extractedInfo, tokensUsed } = await extractOfferLetterInfo(documentText);
      const processingTime = Date.now() - startTime;

      if (extractedInfo.error) {
        return res.status(500).json({ error: extractedInfo.error });
      }

      // Save to database
      const savedInfo = await offerLetterInfoStorage.saveOfferLetterInfo({
        userId: user.id,
        fileName: file.originalname,
        fileSize: file.size,
        extractedText: documentText,
        tokensUsed,
        processingTime,
        ...extractedInfo
      });

      console.log(`Successfully saved offer letter info with ID: ${savedInfo.id}`);

      res.status(201).json({
        id: savedInfo.id,
        message: 'Offer letter information extracted and saved successfully'
      });

    } catch (error) {
      console.error('Error processing offer letter:', error);
      res.status(500).json({ 
        error: 'Failed to process offer letter',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get all offer letter information for current user
  app.get('/api/offer-letter-info', async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const offerLetters = await offerLetterInfoStorage.getOfferLetterInfoByUserId(user.id);
      
      res.json(offerLetters.map(info => ({
        id: info.id,
        fileName: info.fileName,
        institutionName: info.institutionName,
        programName: info.programName,
        createdAt: info.createdAt
      })));

    } catch (error) {
      console.error('Error fetching offer letter info:', error);
      res.status(500).json({ error: 'Failed to fetch offer letter information' });
    }
  });

  // Get specific offer letter information by ID
  app.get('/api/offer-letter-info/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user as any;

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const info = await offerLetterInfoStorage.getOfferLetterInfoById(id);

      if (!info) {
        return res.status(404).json({ error: 'Offer letter information not found' });
      }

      // Check if user owns this record or is admin
      if (info.userId !== user.id && user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(info);

    } catch (error) {
      console.error('Error fetching offer letter info:', error);
      res.status(500).json({ error: 'Failed to fetch offer letter information' });
    }
  });

  // Admin route - get all offer letter information
  app.get('/api/admin/offer-letter-info', async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const allInfo = await offerLetterInfoStorage.getAllOfferLetterInfo();
      res.json(allInfo);

    } catch (error) {
      console.error('Error fetching all offer letter info:', error);
      res.status(500).json({ error: 'Failed to fetch offer letter information' });
    }
  });

  // Admin route - get specific offer letter information by ID
  app.get('/api/admin/offer-letter-info/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user as any;

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid offer letter ID' });
      }

      const info = await offerLetterInfoStorage.getOfferLetterInfoById(id);

      if (!info) {
        return res.status(404).json({ error: 'Offer letter information not found' });
      }

      res.json(info);

    } catch (error) {
      console.error('Error fetching admin offer letter info:', error);
      res.status(500).json({ error: 'Failed to fetch offer letter information' });
    }
  });

  // Admin route - upload and process offer letter
  app.post('/api/admin/offer-letter-info', upload.single('document'), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const user = req.user as any;

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log(`Admin processing offer letter: ${file.originalname}`);

      // Extract text from document
      const documentText = await extractTextFromPdf(file.buffer);
      console.log(`Extracted ${documentText.length} characters from document`);

      if (documentText.length < 100) {
        return res.status(400).json({ error: 'Document appears to be empty or unreadable' });
      }

      // Extract information using OpenAI
      const startTime = Date.now();
      const { extractedInfo, tokensUsed } = await extractOfferLetterInfo(documentText);
      const processingTime = Date.now() - startTime;

      if (extractedInfo.error) {
        return res.status(500).json({ error: extractedInfo.error });
      }

      // Save to database with admin user ID
      const savedInfo = await offerLetterInfoStorage.saveOfferLetterInfo({
        userId: user.id,
        fileName: file.originalname,
        fileSize: file.size,
        extractedText: documentText,
        tokensUsed,
        processingTime,
        ...extractedInfo
      });

      console.log(`Admin successfully saved offer letter info with ID: ${savedInfo.id}`);

      res.status(201).json({
        id: savedInfo.id,
        message: 'Offer letter information extracted and saved successfully by admin'
      });

    } catch (error) {
      console.error('Error processing admin offer letter:', error);
      res.status(500).json({ 
        error: 'Failed to process offer letter',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}