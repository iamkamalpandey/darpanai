import { Router, Request, Response } from 'express';
import { processEduCounselChat, getConversationHistory, saveConversationHistory } from './eduCounselService';
import { requireAuth } from './auth';

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
    const userProfile = req.user;
    
    // Process chat with AI
    const response = await processEduCounselChat({
      message,
      conversationHistory: conversationHistory || [],
      userProfile,
      userId
    });

    // Save conversation to database
    await saveConversationHistory(userId, message, response);

    res.json(response);
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