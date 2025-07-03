import { Router, Request, Response } from 'express';
import { db } from './db';
import { 
  conversations, 
  conversationParticipants, 
  messages, 
  users, 
  insertConversationSchema,
  insertParticipantSchema,
  insertMessageSchema
} from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

const router = Router();

// Get all conversations for current user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    // Get conversations where user is a participant
    const userConversations = await db
      .select({
        conversation: conversations,
        participant: conversationParticipants,
        lastMessage: {
          id: messages.id,
          content: messages.content,
          senderId: messages.senderId,
          senderName: sql<string>`sender.first_name || ' ' || sender.last_name`,
          createdAt: messages.createdAt,
        }
      })
      .from(conversations)
      .innerJoin(conversationParticipants, eq(conversationParticipants.conversationId, conversations.id))
      .leftJoin(messages, eq(messages.conversationId, conversations.id))
      .leftJoin(users, eq(users.id, messages.senderId))
      .where(and(
        eq(conversationParticipants.userId, userId),
        eq(conversationParticipants.isActive, true)
      ))
      .orderBy(desc(conversations.updatedAt));

    // Group by conversation and get participants
    const conversationsMap = new Map();
    
    for (const row of userConversations) {
      const convId = row.conversation.id;
      
      if (!conversationsMap.has(convId)) {
        // Get all participants for this conversation
        const participants = await db
          .select({
            id: users.id,
            name: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
            type: conversationParticipants.userType,
            avatar: sql<string>`NULL`, // No avatar field in current schema
            isOnline: sql<boolean>`true`, // Simplified - in real app, track online status
          })
          .from(conversationParticipants)
          .innerJoin(users, eq(users.id, conversationParticipants.userId))
          .where(and(
            eq(conversationParticipants.conversationId, convId),
            eq(conversationParticipants.isActive, true)
          ));

        // Get unread message count
        const unreadCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(messages)
          .where(and(
            eq(messages.conversationId, convId),
            eq(messages.isRead, false),
            sql`${messages.senderId} != ${userId}`
          ));

        conversationsMap.set(convId, {
          ...row.conversation,
          participants,
          lastMessage: row.lastMessage,
          unreadCount: unreadCount[0]?.count || 0,
        });
      }
    }

    const result = Array.from(conversationsMap.values());
    res.json(result);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
  }
});

// Get messages for a specific conversation
router.get('/:id/messages', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const conversationId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    // Verify user is participant in this conversation
    const participation = await db
      .select()
      .from(conversationParticipants)
      .where(and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId),
        eq(conversationParticipants.isActive, true)
      ));

    if (!participation.length) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Get messages with sender information
    const conversationMessages = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        senderName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        senderType: conversationParticipants.userType,
        content: messages.content,
        messageType: messages.messageType,
        attachments: messages.attachments,
        isRead: messages.isRead,
        timestamp: messages.createdAt,
      })
      .from(messages)
      .innerJoin(users, eq(users.id, messages.senderId))
      .innerJoin(conversationParticipants, and(
        eq(conversationParticipants.conversationId, messages.conversationId),
        eq(conversationParticipants.userId, messages.senderId)
      ))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    res.json(conversationMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// Send a new message
router.post('/:id/messages', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const conversationId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    // Verify user is participant
    const participation = await db
      .select()
      .from(conversationParticipants)
      .where(and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId),
        eq(conversationParticipants.isActive, true)
      ));

    if (!participation.length) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Validate message data
    const messageData = insertMessageSchema.parse({
      conversationId,
      senderId: userId,
      content: req.body.content,
      messageType: req.body.messageType || 'text',
      attachments: req.body.attachments || null,
    });

    // Insert message
    const [newMessage] = await db
      .insert(messages)
      .values(messageData)
      .returning();

    // Update conversation's updatedAt
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));

    // Get sender info for response
    const [sender] = await db
      .select({
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.id, userId));

    const response = {
      ...newMessage,
      senderName: `${sender.firstName} ${sender.lastName}`,
      senderType: participation[0].userType,
      timestamp: newMessage.createdAt,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// Create a new conversation
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    // Validate conversation data
    const conversationData = insertConversationSchema.parse({
      ...req.body,
      createdBy: userId,
    });

    // Create conversation
    const [newConversation] = await db
      .insert(conversations)
      .values(conversationData)
      .returning();

    // Add creator as participant
    await db.insert(conversationParticipants).values({
      conversationId: newConversation.id,
      userId: userId,
      userType: req.body.creatorType || 'student',
    });

    // Add other participants if specified
    if (req.body.participants && Array.isArray(req.body.participants)) {
      for (const participant of req.body.participants) {
        await db.insert(conversationParticipants).values({
          conversationId: newConversation.id,
          userId: participant.userId,
          userType: participant.userType,
        });
      }
    }

    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ success: false, error: 'Failed to create conversation' });
  }
});

// Mark conversation as read
router.post('/:id/mark-read', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const conversationId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    // Mark all unread messages as read for this user
    await db
      .update(messages)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(and(
        eq(messages.conversationId, conversationId),
        eq(messages.isRead, false),
        sql`${messages.senderId} != ${userId}`
      ));

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark messages as read' });
  }
});

// Get available users for starting conversations (admins and experts)
router.get('/available-contacts', async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    // Get admins and experts
    const contacts = await db
      .select({
        id: users.id,
        name: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        email: users.email,
        role: users.role,
        avatar: sql<string>`NULL`, // No avatar field in current schema
      })
      .from(users)
      .where(sql`${users.role} IN ('admin', 'expert')`)
      .orderBy(users.firstName);

    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch contacts' });
  }
});

export default router;