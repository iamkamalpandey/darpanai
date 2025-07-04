// Simple User Profile API Routes - Basic functionality only
import express from 'express';
import { simpleUserProfileService } from './simpleUserProfileService';
import type { Request, Response, NextFunction } from 'express';

// Simple auth middleware
const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.isAuthenticated() || !req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
};

const router = express.Router();

// Get user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const profile = await simpleUserProfileService.getUserProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch profile' });
  }
});

// Create or update user profile
router.post('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const profileData = { ...req.body, userId };
    
    const existing = await simpleUserProfileService.getUserProfile(userId);
    
    if (existing) {
      // Update existing profile
      const updated = await simpleUserProfileService.updateUserProfile(userId, profileData);
      res.json(updated);
    } else {
      // Create new profile
      const created = await simpleUserProfileService.createUserProfile(profileData);
      res.status(201).json(created);
    }
  } catch (error: any) {
    console.error('Error creating/updating profile:', error);
    res.status(500).json({ error: error.message || 'Failed to save profile' });
  }
});

// Update user profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const profileData = { ...req.body, userId };
    
    const updated = await simpleUserProfileService.updateUserProfile(userId, profileData);
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

// Get profile completion status
router.get('/profile/completion', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const profile = await simpleUserProfileService.getUserProfile(userId);
    
    if (!profile) {
      return res.json({ 
        completionPercentage: 0, 
        isComplete: false,
        message: 'Profile not found' 
      });
    }
    
    const completionPercentage = simpleUserProfileService.calculateProfileCompletion(profile);
    
    res.json({
      completionPercentage,
      isComplete: completionPercentage === 100,
      message: completionPercentage === 100 ? 'Profile complete' : 'Profile incomplete'
    });
  } catch (error: any) {
    console.error('Error fetching profile completion:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch profile completion' });
  }
});

export default router;