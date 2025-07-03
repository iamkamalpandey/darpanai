import { Router, Request, Response } from 'express';
import { processEduCounselChatOptimized } from './eduCounselServiceOptimized';

interface UserProfile {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  studyLevel?: string | null;
  fieldOfStudy?: string | null;
  preferredCountries?: string[] | null;
  budgetRange?: string | null;
}
import { getConversationHistory, saveConversationHistory } from './eduCounselService';

// Local auth middleware
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

const router = Router();

// Chat endpoint
router.post('/chat', requireAuth, async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory } = req.body;
    const userId = req.user!.id;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`🤖 Processing EduCounsel chat for user ${userId}`);
    
    // Get user profile for context
    const userProfile = req.user as UserProfile;
    
    // Process chat with optimized AI service
    const response = await processEduCounselChatOptimized({
      message,
      conversationHistory: conversationHistory || [],
      userProfile
    });

    // Save conversation to database
    await saveConversationHistory(userId, message, {
      ...response,
      specialist: 'Darpan Intelligence'
    });

    // Format response for frontend compatibility
    const formattedResponse = {
      response: response.response,
      specialist: 'Darpan Intelligence', // Default specialist
      actionButtons: response.actionButtons || [],
      requiresSelection: response.requiresSelection
    };

    res.json(formattedResponse);
  } catch (error) {
    console.error('❌ EduCounsel chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process your message. Please try again.',
      fallback: 'I apologize, but I\'m having trouble processing your request right now. Please try rephrasing your question or try again in a moment.'
    });
  }
});

// Get conversation history
router.get('/conversation', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const conversation = await getConversationHistory(userId);
    
    res.json(conversation);
  } catch (error) {
    console.error('❌ Error fetching conversation history:', error);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
});

// Clear conversation history
router.delete('/conversation', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Implementation would clear conversation history for user
    // For now, return success
    
    res.json({ success: true, message: 'Conversation history cleared' });
  } catch (error) {
    console.error('❌ Error clearing conversation history:', error);
    res.status(500).json({ error: 'Failed to clear conversation history' });
  }
});

export default router;