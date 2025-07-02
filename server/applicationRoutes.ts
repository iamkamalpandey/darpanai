import { Router, Request, Response } from 'express';
import { applicationService } from './applicationService';
import { institutionRecommendationService } from './institutionRecommendationService';
import { z } from 'zod';

const router = Router();

// Start new application
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId, programId } = req.body;
    
    if (!userId || !institutionId || !programId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await applicationService.startApplication(userId, institutionId, programId);
    res.json(result);
  } catch (error) {
    console.error('Error starting application:', error);
    res.status(500).json({ error: 'Failed to start application' });
  }
});

// Get user applications status
router.get('/status/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const applicationId = req.query.applicationId ? parseInt(req.query.applicationId as string) : undefined;
    
    const applications = await applicationService.getApplicationStatus(userId, applicationId);
    res.json(applications);
  } catch (error) {
    console.error('Error getting application status:', error);
    res.status(500).json({ error: 'Failed to get application status' });
  }
});

// Update application step
router.patch('/:applicationId/step', async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.applicationId);
    const { step, data } = req.body;
    
    const result = await applicationService.updateApplicationStep(applicationId, step, data);
    res.json(result);
  } catch (error) {
    console.error('Error updating application step:', error);
    res.status(500).json({ error: 'Failed to update application step' });
  }
});

// Check eligibility
router.get('/:applicationId/eligibility', async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.applicationId);
    
    const eligibility = await applicationService.checkEligibility(applicationId);
    res.json(eligibility);
  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
});

// Submit application
router.post('/:applicationId/submit', async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.applicationId);
    
    const result = await applicationService.submitApplication(applicationId);
    res.json(result);
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: error.message || 'Failed to submit application' });
  }
});

// Get recommended programs for application
router.get('/recommendations/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get user profile from request body or fetch from database
    const { userProfile } = req.body;
    
    if (!userProfile) {
      return res.status(400).json({ error: 'User profile required for recommendations' });
    }
    
    const recommendations = await institutionRecommendationService.getRecommendationsForUser(userProfile);
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

export default router;