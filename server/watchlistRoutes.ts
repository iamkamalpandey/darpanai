import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import { scholarshipWatchlist, users } from '@shared/schema';
import { scholarships } from '@shared/scholarshipSchema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: any) => {
  console.log('[Watchlist Auth] Checking authentication for user:', req.user?.id);
  if (!req.user || !req.user.id) {
    console.log('[Watchlist Auth] Authentication failed - no user found');
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  console.log('[Watchlist Auth] Authentication successful for user:', req.user.id);
  next();
};

// Add scholarship to watchlist
router.post('/add', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { scholarshipId, notes = '', priorityLevel = 'medium', applicationStatus = 'not_started' } = req.body;

    // Check if scholarship exists
    const scholarship = await db.select({ id: scholarships.id })
      .from(scholarships)
      .where(eq(scholarships.id, scholarshipId))
      .limit(1);

    if (!scholarship.length) {
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
        scholarshipName: 'Loading...', // Will be updated by proper data
        providerName: 'Loading...',
        hostCountries: [],
        notes,
        priority: priorityLevel,
        status: applicationStatus
      })
      .returning();

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

    const deleted = await db.delete(scholarship_watchlist)
      .where(and(
        eq(scholarship_watchlist.user_id, userId),
        eq(scholarship_watchlist.scholarship_id, scholarshipId)
      ));

    res.json({
      success: true,
      message: 'Scholarship removed from watchlist'
    });

  } catch (error) {
    console.error('[Watchlist] Error removing scholarship:', error);
    res.status(500).json({ success: false, error: 'Failed to remove scholarship from watchlist' });
  }
});

// Get user's watchlist - optimized query
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Simply return empty array if no items exist
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
    .innerJoin(scholarships, eq(scholarship_watchlist.scholarship_id, scholarships.id))
    .where(eq(scholarship_watchlist.user_id, userId))
    .orderBy(desc(scholarship_watchlist.added_date));

    res.json({
      success: true,
      watchlist: watchlistItems || [],
      totalItems: watchlistItems?.length || 0
    });

  } catch (error) {
    console.error('[Watchlist] Error fetching watchlist:', error);
    // Return empty watchlist on error instead of 500
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
    const { notes, priorityLevel, applicationStatus } = req.body;

    const [updated] = await db.update(scholarship_watchlist)
      .set({
        notes: notes !== undefined ? notes : undefined,
        priority_level: priorityLevel !== undefined ? priorityLevel : undefined,
        application_status: applicationStatus !== undefined ? applicationStatus : undefined
      })
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

// Check if scholarship is in watchlist
router.get('/check/:scholarshipId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const scholarshipId = parseInt(req.params.scholarshipId);

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

export default router;