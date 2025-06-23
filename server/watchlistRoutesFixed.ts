import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import { scholarshipWatchlist, users } from '@shared/schema';
import { scholarships } from '@shared/scholarshipSchema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// Watchlist entry validation schema
const addToWatchlistSchema = z.object({
  scholarshipId: z.number().int().positive(),
  notes: z.string().optional().default(''),
  priorityLevel: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  applicationStatus: z.enum(['not_started', 'in_progress', 'submitted', 'completed']).optional().default('not_started')
});

// Add scholarship to watchlist (POST /api/watchlist/add)
router.post('/add', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const userId = req.user.id;
    const validatedData = addToWatchlistSchema.parse(req.body);
    const { scholarshipId, notes, priorityLevel, applicationStatus } = validatedData;

    console.log('[Watchlist] Adding scholarship to watchlist:', { userId, scholarshipId });

    // Check if scholarship exists and get full details
    const scholarship = await db.select()
      .from(scholarships)
      .where(eq(scholarships.id, scholarshipId))
      .limit(1);

    if (!scholarship.length) {
      console.log('[Watchlist] Scholarship not found:', scholarshipId);
      return res.status(404).json({ success: false, error: 'Scholarship not found' });
    }

    // Check if already in watchlist
    const existing = await db.select({ id: scholarshipWatchlist.id })
      .from(scholarshipWatchlist)
      .where(and(
        eq(scholarshipWatchlist.userId, userId),
        eq(scholarshipWatchlist.scholarshipId, scholarshipId)
      ))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'Scholarship already in watchlist' });
    }

    // Add to watchlist
    const [watchlistEntry] = await db.insert(scholarshipWatchlist)
      .values({
        userId: userId,
        scholarshipId: scholarshipId,
        scholarshipName: scholarship[0].name || 'Unknown Scholarship',
        providerName: scholarship[0].providerName || 'Unknown Provider',
        hostCountries: scholarship[0].hostCountries || [],
        fundingType: scholarship[0].fundingType || null,
        totalValueMax: scholarship[0].totalValueMax || null,
        applicationDeadline: scholarship[0].applicationDeadline || null,
        tags: scholarship[0].tags || [],
        notes,
        priority: priorityLevel,
        status: applicationStatus
      })
      .returning();

    console.log('[Watchlist] Successfully added to watchlist:', watchlistEntry.id);

    res.status(201).json({
      success: true,
      message: 'Scholarship added to watchlist',
      watchlistEntry
    });

  } catch (error) {
    console.error('[Watchlist] Error adding scholarship:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid data',
        details: error.errors
      });
    }
    
    res.status(500).json({ success: false, error: 'Failed to add scholarship to watchlist' });
  }
});

// Remove scholarship from watchlist (DELETE /api/watchlist/remove/:scholarshipId)
router.delete('/remove/:scholarshipId', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const userId = req.user.id;
    const scholarshipId = parseInt(req.params.scholarshipId);

    if (isNaN(scholarshipId)) {
      return res.status(400).json({ success: false, error: 'Invalid scholarship ID' });
    }

    console.log('[Watchlist] Removing scholarship from watchlist:', { userId, scholarshipId });

    const deleted = await db.delete(scholarshipWatchlist)
      .where(and(
        eq(scholarshipWatchlist.userId, userId),
        eq(scholarshipWatchlist.scholarshipId, scholarshipId)
      ));

    console.log('[Watchlist] Successfully removed from watchlist');

    res.json({
      success: true,
      message: 'Scholarship removed from watchlist'
    });

  } catch (error) {
    console.error('[Watchlist] Error removing scholarship:', error);
    res.status(500).json({ success: false, error: 'Failed to remove scholarship from watchlist' });
  }
});

// Get user's watchlist (GET /api/watchlist)
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const userId = req.user.id;
    console.log('[Watchlist] Fetching watchlist for user:', userId);

    const watchlistItems = await db.select({
      id: scholarship_watchlist.id,
      scholarshipId: scholarship_watchlist.scholarship_id,
      addedDate: scholarship_watchlist.added_date,
      notes: scholarship_watchlist.notes,
      priorityLevel: scholarship_watchlist.priority_level,
      applicationStatus: scholarship_watchlist.application_status,
      scholarship: {
        id: scholarships.id,
        name: scholarships.name,
        providerName: scholarships.providerName,
        providerCountry: scholarships.providerCountry,
        fundingType: scholarships.fundingType,
        totalValueMax: scholarships.totalValueMax,
        applicationDeadline: scholarships.applicationDeadline,
        studyLevels: scholarships.studyLevels,
        fieldCategories: scholarships.fieldCategories,
        description: scholarships.description
      }
    })
    .from(scholarship_watchlist)
    .leftJoin(scholarships, eq(scholarship_watchlist.scholarship_id, scholarships.id))
    .where(eq(scholarship_watchlist.user_id, userId))
    .orderBy(desc(scholarship_watchlist.added_date));

    console.log('[Watchlist] Found', watchlistItems.length, 'watchlist items');

    res.json({
      success: true,
      watchlist: watchlistItems || [],
      totalItems: watchlistItems?.length || 0
    });

  } catch (error) {
    console.error('[Watchlist] Error fetching watchlist:', error);
    // Return empty watchlist on error to prevent UI breaking
    res.json({ 
      success: true,
      watchlist: [],
      totalItems: 0
    });
  }
});

// Check if scholarship is in watchlist (GET /api/watchlist/check/:scholarshipId)
router.get('/check/:scholarshipId', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const userId = req.user.id;
    const scholarshipId = parseInt(req.params.scholarshipId);

    if (isNaN(scholarshipId)) {
      return res.status(400).json({ success: false, error: 'Invalid scholarship ID' });
    }

    const watchlistEntry = await db.select({ id: scholarship_watchlist.id })
      .from(scholarship_watchlist)
      .where(and(
        eq(scholarship_watchlist.user_id, userId),
        eq(scholarship_watchlist.scholarship_id, scholarshipId)
      ))
      .limit(1);

    res.json({
      success: true,
      inWatchlist: watchlistEntry.length > 0
    });

  } catch (error) {
    console.error('[Watchlist] Error checking watchlist:', error);
    res.status(500).json({ success: false, error: 'Failed to check watchlist status' });
  }
});

// Update watchlist entry (PATCH /api/watchlist/update/:id)
router.patch('/update/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const watchlistId = parseInt(req.params.id);
    const userId = req.user.id;
    
    if (isNaN(watchlistId)) {
      return res.status(400).json({ success: false, error: 'Invalid watchlist ID' });
    }

    const { notes, priorityLevel, applicationStatus } = req.body;

    const updateData: any = {};
    if (notes !== undefined) updateData.notes = notes;
    if (priorityLevel !== undefined) updateData.priority_level = priorityLevel;
    if (applicationStatus !== undefined) updateData.application_status = applicationStatus;

    const [updated] = await db.update(scholarship_watchlist)
      .set(updateData)
      .where(and(
        eq(scholarship_watchlist.id, watchlistId),
        eq(scholarship_watchlist.user_id, userId)
      ))
      .returning();

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Watchlist entry not found' });
    }

    res.json({
      success: true,
      message: 'Watchlist entry updated',
      entry: updated
    });

  } catch (error) {
    console.error('[Watchlist] Error updating watchlist entry:', error);
    res.status(500).json({ success: false, error: 'Failed to update watchlist entry' });
  }
});

export default router;