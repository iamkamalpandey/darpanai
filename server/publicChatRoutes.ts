import { Router } from 'express';
import { handlePublicChat } from './publicChatService';
import { handleEnhancedPublicChat } from './publicChatServiceEnhanced';

const router = Router();

// Enhanced public chat endpoint with international standards and lead generation
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId, conversationId } = req.body;

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

    console.log('🌐 Enhanced public chat request:', message.substring(0, 50) + '...');

    // Use enhanced chat service with lead generation
    const chatResponse = await handleEnhancedPublicChat({
      message: message.trim(),
      conversationId: conversationId || sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // Log lead data for CRM integration (following international standards)
    if (chatResponse.leadData && Object.keys(chatResponse.leadData).length > 0) {
      console.log('🎯 Lead captured:', {
        conversationId: conversationId || sessionId,
        leadData: chatResponse.leadData,
        timestamp: new Date().toISOString(),
        requiresRegistration: chatResponse.requiresRegistration
      });
    }

    res.json(chatResponse);

  } catch (error) {
    console.error('💥 Enhanced public chat API error:', error);
    res.status(500).json({
      response: 'I am experiencing technical difficulties. Create a free account for access to our reliable study abroad guidance platform.',
      actionButtons: [
        {
          type: 'register',
          label: 'Create Free Account',
          description: 'Get reliable AI guidance'
        }
      ]
    });
  }
});

// Legacy public chat endpoint (fallback for existing integrations)
router.post('/chat-legacy', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string'
      });
    }

    console.log('🌐 Legacy public chat request:', message.substring(0, 50) + '...');

    const chatResponse = await handlePublicChat({
      message: message.trim(),
      sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    res.json(chatResponse);

  } catch (error) {
    console.error('💥 Legacy public chat API error:', error);
    res.status(500).json({
      response: 'I apologize for the technical issue. Please create an account for full access to our study abroad guidance platform.',
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

// Lead capture endpoint for public users (International Standards Compliance)
router.post('/capture-lead', async (req, res) => {
  console.log('🎯 Lead capture request:', req.body);
  
  try {
    const { conversationId, userInfo, source = 'public_chat' } = req.body;
    
    // Validate required lead data
    if (!conversationId || !userInfo) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID and user info are required'
      });
    }
    
    // Log lead for CRM integration (international standards)
    const leadData = {
      conversationId,
      userInfo,
      source,
      timestamp: new Date().toISOString(),
      status: 'new_lead'
    };
    
    console.log('📋 Lead captured successfully:', leadData);
    
    // In production, this would integrate with CRM system
    // await crmService.createLead(leadData);
    
    res.json({ 
      success: true, 
      message: 'Lead captured successfully',
      leadId: `lead_${Date.now()}`
    });
  } catch (error) {
    console.error('💥 Lead capture error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to capture lead' 
    });
  }
});

export { router as publicChatRoutes };