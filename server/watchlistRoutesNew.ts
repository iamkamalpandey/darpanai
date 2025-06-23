import { Router, Request, Response } from 'express';
import { db } from './db';
import { scholarshipWatchlist, users, insertWatchlistSchema } from '@shared/schema';
import { scholarships } from '@shared/scholarshipSchema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  next();
};

// Add scholarship to watchlist with complete data caching
router.post('/add', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { scholarshipId, notes = '', priority = 'normal', status = 'saved' } = req.body;

    console.log('[Watchlist] Adding scholarship to watchlist:', { userId, scholarshipId });

    // Get complete scholarship data for caching
    const [scholarship] = await db.select()
      .from(scholarships)
      .where(eq(scholarships.id, scholarshipId))
      .limit(1);

    if (!scholarship) {
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

    // Add to watchlist with cached data
    const [watchlistEntry] = await db.insert(scholarshipWatchlist)
      .values({
        userId: userId,
        scholarshipId: scholarshipId,
        scholarshipName: scholarship.name,
        providerName: scholarship.providerName,
        hostCountries: scholarship.hostCountries || [],
        fundingType: scholarship.fundingType,
        totalValueMax: scholarship.totalValueMax,
        applicationDeadline: scholarship.applicationDeadline,
        tags: scholarship.tags || [],
        notes,
        priority,
        status
      } as any)
      .returning();

    console.log('[Watchlist] Successfully added scholarship to watchlist');

    res.status(201).json({
      success: true,
      message: 'Scholarship added to watchlist',
      watchlistEntry
    });

  } catch (error) {
    console.error('[Watchlist] Error adding scholarship:', error);
    res.status(500).json({ success: false, error: 'Failed to add scholarship to watchlist' });
  }
});

// Remove scholarship from watchlist
router.delete('/remove/:scholarshipId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const scholarshipId = parseInt(req.params.scholarshipId);

    console.log('[Watchlist] Removing scholarship from watchlist:', { userId, scholarshipId });

    const deleted = await db.delete(scholarshipWatchlist)
      .where(and(
        eq(scholarshipWatchlist.userId, userId),
        eq(scholarshipWatchlist.scholarshipId, scholarshipId)
      ));

    console.log('[Watchlist] Successfully removed scholarship from watchlist');

    res.json({
      success: true,
      message: 'Scholarship removed from watchlist'
    });

  } catch (error) {
    console.error('[Watchlist] Error removing scholarship:', error);
    res.status(500).json({ success: false, error: 'Failed to remove scholarship from watchlist' });
  }
});

// Get user's complete watchlist
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    console.log('[Watchlist] Fetching watchlist for user:', userId);

    const watchlistItems = await db.select()
      .from(scholarshipWatchlist)
      .where(eq(scholarshipWatchlist.userId, userId))
      .orderBy(desc(scholarshipWatchlist.savedAt));

    console.log('[Watchlist] Found items:', watchlistItems.length);

    res.json({
      success: true,
      watchlist: watchlistItems || [],
      totalItems: watchlistItems?.length || 0
    });

  } catch (error) {
    console.error('[Watchlist] Error fetching watchlist:', error);
    res.json({ 
      success: true,
      watchlist: [],
      totalItems: 0
    });
  }
});

// Update watchlist entry
router.patch('/update/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const watchlistId = parseInt(req.params.id);
    const userId = req.user!.id;
    const { notes, priority, status, reminderDate } = req.body;

    const [updated] = await db.update(scholarshipWatchlist)
      .set({
        notes: notes !== undefined ? notes : undefined,
        priority: priority !== undefined ? priority : undefined,
        status: status !== undefined ? status : undefined,
        reminderDate: reminderDate !== undefined ? new Date(reminderDate) : undefined,
        updatedAt: new Date()
      })
      .where(and(
        eq(scholarshipWatchlist.id, watchlistId),
        eq(scholarshipWatchlist.userId, userId)
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

// Check if scholarship is in watchlist
router.get('/check/:scholarshipId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const scholarshipId = parseInt(req.params.scholarshipId);

    const watchlistEntry = await db.select({ id: scholarshipWatchlist.id })
      .from(scholarshipWatchlist)
      .where(and(
        eq(scholarshipWatchlist.userId, userId),
        eq(scholarshipWatchlist.scholarshipId, scholarshipId)
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

export default router;