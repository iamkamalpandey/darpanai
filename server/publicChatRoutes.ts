import { Router } from 'express';
import { handlePublicChat } from './publicChatService';

const router = Router();

// Public chat endpoint - no authentication required
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string'
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        error: 'Message too long. Please keep messages under 1000 characters.'
      });
    }

    console.log('🌐 Public chat request:', message.substring(0, 50) + '...');

    const chatResponse = await handlePublicChat({
      message: message.trim(),
      sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    res.json(chatResponse);

  } catch (error) {
    console.error('💥 Public chat API error:', error);
    res.status(500).json({
      response: 'I apologize for the technical issue. Please try again or create an account for full access to our study abroad guidance platform.',
      actionButtons: [
        {
          type: 'create_account',
          label: 'Create Free Account',
          description: 'Get personalized guidance and full platform access'
        }
      ]
    });
  }
});

export { router as publicChatRoutes };