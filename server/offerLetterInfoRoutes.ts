import { Request, Response } from 'express';
import multer from 'multer';
import { offerLetterInfoStorage } from './offerLetterInfoStorage';
import { storage } from './storage';
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
  app.post('/api/offer-letter-information/extract', upload.single('document'), async (req: Request, res: Response) => {
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

      // Extract information using ChatGPT API
      const startTime = Date.now();
      console.log(`Starting ChatGPT extraction for ${file.originalname}...`);
      
      const { extractedInfo, tokensUsed } = await extractOfferLetterInfo(documentText);
      const processingTime = Date.now() - startTime;
      
      console.log(`Extraction completed in ${processingTime}ms, tokens used: ${tokensUsed}`);
      console.log('Extracted institution name:', extractedInfo.institutionName);
      console.log('Extracted course name:', extractedInfo.courseName);
      console.log('Extracted student name:', extractedInfo.studentName);

      if (extractedInfo.error) {
        console.error('Extraction error:', extractedInfo.error);
        return res.status(500).json({ error: extractedInfo.error });
      }

      // Map extracted fields to database schema - comprehensive mapping for all fields
      const mappedInfo = {
        userId: user.id,
        fileName: file.originalname,
        fileSize: file.size,
        extractedText: documentText,
        tokensUsed,
        processingTime,
        
        // Institution Information (Provider Details)
        institutionName: extractedInfo.institutionName,
        tradingAs: extractedInfo.tradingAs,
        institutionAddress: extractedInfo.institutionAddress,
        institutionPhone: extractedInfo.institutionPhone,
        institutionEmail: extractedInfo.institutionEmail,
        institutionWebsite: extractedInfo.institutionWebsite,
        providerId: extractedInfo.providerId,
        cricosProviderCode: extractedInfo.cricosProviderCode,
        abn: extractedInfo.abn,
        
        // Student Personal Information
        studentName: extractedInfo.studentName,
        studentId: extractedInfo.studentId,
        dateOfBirth: extractedInfo.dateOfBirth,
        gender: extractedInfo.gender,
        citizenship: extractedInfo.citizenship,
        maritalStatus: extractedInfo.maritalStatus,
        homeAddress: extractedInfo.homeAddress,
        contactNumber: extractedInfo.contactNumber,
        emailAddress: extractedInfo.emailAddress,
        correspondenceAddress: extractedInfo.correspondenceAddress,
        passportNumber: extractedInfo.passportNumber,
        passportExpiryDate: extractedInfo.passportExpiryDate,
        agentDetails: extractedInfo.agentDetails,
        
        // Course/Program Information
        courseName: extractedInfo.courseName,
        courseSpecialization: extractedInfo.courseSpecialization,
        courseLevel: extractedInfo.courseLevel,
        cricosCode: extractedInfo.cricosCode,
        courseDuration: extractedInfo.courseDuration,
        numberOfUnits: extractedInfo.numberOfUnits,
        creditPoints: extractedInfo.creditPoints,
        orientationDate: extractedInfo.orientationDate,
        courseStartDate: extractedInfo.courseStartDate,
        courseEndDate: extractedInfo.courseEndDate,
        studyMode: extractedInfo.studyMode,
        campusLocation: extractedInfo.campusLocation,
        intakeSchedule: extractedInfo.intakeSchedule,
        
        // Financial Information - Map to actual schema fields
        totalTuitionFees: extractedInfo.totalTuitionFees,
        materialFee: extractedInfo.materialsFee,
        enrollmentFee: extractedInfo.enrollmentFee,
        totalFeeDue: extractedInfo.totalFeesAmount,
        paymentSchedule: extractedInfo.paymentSchedule,
        paymentMethods: extractedInfo.paymentMethods,
        refundPolicy: extractedInfo.refundPolicy,
        
        // Scholarship & Financial Aid
        scholarshipAmount: extractedInfo.scholarshipAmount,
        scholarshipPercentage: extractedInfo.scholarshipPercentage,
        scholarshipConditions: extractedInfo.scholarshipConditions,
        scholarshipDuration: extractedInfo.scholarshipDuration,
        financialAidInfo: extractedInfo.financialAidInfo,
        
        // Important Dates & Deadlines
        acceptanceDeadline: extractedInfo.acceptanceDeadline,
        enrollmentDeadline: extractedInfo.enrollmentDeadline,
        feePaymentDeadline: extractedInfo.feePaymentDeadline,
        documentSubmissionDeadline: extractedInfo.documentSubmissionDeadline,
        orientationDeadline: extractedInfo.orientationDeadline,
        
        // Academic Requirements
        academicRequirements: extractedInfo.academicRequirements,
        englishRequirements: extractedInfo.englishRequirements,
        ieltsRequirement: extractedInfo.ieltsRequirement,
        toeflRequirement: extractedInfo.toeflRequirement,
        pteRequirement: extractedInfo.pteRequirement,
        documentRequirements: extractedInfo.documentRequirements,
        healthInsuranceRequirement: extractedInfo.healthInsuranceRequirement,
        visaRequirements: extractedInfo.visaRequirements,
        
        // Accommodation & Support
        accommodationInfo: extractedInfo.accommodationInfo,
        accommodationFees: extractedInfo.accommodationFees,
        mealPlanInfo: extractedInfo.mealPlanInfo,
        transportInfo: extractedInfo.transportInfo,
        
        // Contact Information
        contactPersonName: extractedInfo.contactPersonName,
        contactPersonTitle: extractedInfo.contactPersonTitle,
        contactPersonPhone: extractedInfo.contactPersonPhone,
        contactPersonEmail: extractedInfo.contactPersonEmail,
        admissionsOfficeContact: extractedInfo.admissionsOfficeContact,
        internationalOfficeContact: extractedInfo.internationalOfficeContact,
        
        // Compliance & Accreditation
        complianceInfo: extractedInfo.complianceInfo,
        accreditationInfo: extractedInfo.accreditationInfo,
        governmentRegistration: extractedInfo.governmentRegistration,
        qualityAssurance: extractedInfo.qualityAssurance,
        
        // Policies
        withdrawalPolicy: extractedInfo.withdrawalPolicy,
        transferPolicy: extractedInfo.transferPolicy,
        attendancePolicy: extractedInfo.attendancePolicy,
        academicProgressPolicy: extractedInfo.academicProgressPolicy,
        disciplinaryPolicy: extractedInfo.disciplinaryPolicy,
        
        // Services
        additionalServices: extractedInfo.additionalServices,
        studentSupportServices: extractedInfo.studentSupportServices,
        careerServices: extractedInfo.careerServices,
        libraryServices: extractedInfo.libraryServices,
        itServices: extractedInfo.itServices,
        
        // Additional Information
        termsAndConditions: extractedInfo.termsAndConditions,
        importantNotes: extractedInfo.importantNotes,
        disclaimers: extractedInfo.disclaimers,
        additionalInformation: extractedInfo.additionalInformation
      };

      // Save to database
      const savedInfo = await offerLetterInfoStorage.saveOfferLetterInfo(mappedInfo);

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
  app.get('/api/offer-letter-information', async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const offerLetters = await offerLetterInfoStorage.getOfferLetterInfoByUserId(user.id);
      
      res.json(offerLetters.map(info => ({
        id: info.id,
        fileName: info.fileName,
        fileSize: info.fileSize,
        
        // Institution Information
        institutionName: info.institutionName,
        tradingAs: info.tradingAs,
        institutionAddress: info.institutionAddress,
        institutionPhone: info.institutionPhone,
        institutionEmail: info.institutionEmail,
        institutionWebsite: info.institutionWebsite,
        cricosProviderCode: info.cricosProviderCode,
        
        // Student Information
        studentName: info.studentName,
        studentId: info.studentId,
        dateOfBirth: info.dateOfBirth,
        citizenship: info.citizenship,
        contactNumber: info.contactNumber,
        emailAddress: info.emailAddress,
        
        // Course Information
        courseName: info.courseName,
        courseLevel: info.courseLevel,
        courseDuration: info.courseDuration,
        courseStartDate: info.courseStartDate,
        courseEndDate: info.courseEndDate,
        studyMode: info.studyMode,
        campusLocation: info.campusLocation,
        cricosCode: info.cricosCode,
        
        // Financial Information
        totalTuitionFees: info.totalTuitionFees,
        totalFeeDue: info.totalFeeDue,
        enrollmentFee: info.enrollmentFee,
        scholarshipAmount: info.scholarshipAmount,
        scholarshipDetails: info.scholarshipDetails,
        
        // Important Dates
        acceptanceDeadline: info.acceptanceDeadline,
        orientationDate: info.orientationDate,
        
        // Requirements
        minimumEntryRequirements: info.minimumEntryRequirements,
        englishLanguageRequirements: info.englishLanguageRequirements,
        documentationRequired: info.documentationRequired,
        
        // Additional Information
        accommodationAssistance: info.accommodationAssistance,
        studentSupportServices: info.studentSupportServices,
        visaAdvice: info.visaAdvice,
        
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

  // Admin route - get all offer letter information for admin dashboard
  app.get('/api/admin/offer-letter-information', async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const allInfo = await offerLetterInfoStorage.getAllOfferLetterInfo();
      res.json(allInfo);

    } catch (error) {
      console.error('Error fetching all offer letter info for admin:', error);
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

  // Delete offer letter information
  app.delete('/api/offer-letter-information/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user as any;

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid offer letter ID' });
      }

      // Check if offer letter exists and belongs to user (unless admin)
      const existingInfo = await offerLetterInfoStorage.getOfferLetterInfoById(id);
      if (!existingInfo) {
        return res.status(404).json({ error: 'Offer letter information not found' });
      }

      if (user.role !== 'admin' && existingInfo.userId !== user.id) {
        return res.status(403).json({ error: 'Not authorized to delete this offer letter' });
      }

      // Delete the offer letter information
      await offerLetterInfoStorage.deleteOfferLetterInfo(id);

      res.json({ success: true, message: 'Offer letter information deleted successfully' });

    } catch (error) {
      console.error('Error deleting offer letter information:', error);
      res.status(500).json({ 
        error: 'Failed to delete offer letter information',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Admin route - get all COE information for admin dashboard
  app.get('/api/admin/coe-information', async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const allCoeInfo = await storage.getAllCoeInfo();
      res.json(allCoeInfo);

    } catch (error) {
      console.error('Error fetching all COE info for admin:', error);
      res.status(500).json({ error: 'Failed to fetch COE information' });
    }
  });

  console.log('✓ Separated offer letter architecture routes registered successfully');
}