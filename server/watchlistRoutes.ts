import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import { scholarships, scholarship_watchlist, users } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Add scholarship to watchlist
router.post('/add', requireAuth, async (req: Request, res: Response) => {
  try {
    const { scholarshipId, notes, priorityLevel } = req.body;
    const userId = req.user!.id;

    // Check if already in watchlist
    const existing = await db.select()
      .from(scholarship_watchlist)
      .where(and(
        eq(scholarship_watchlist.user_id, userId),
        eq(scholarship_watchlist.scholarship_id, scholarshipId)
      ))
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Scholarship already in watchlist' });
    }

    // Add to watchlist
    const [watchlistEntry] = await db.insert(scholarship_watchlist)
      .values({
        user_id: userId,
        scholarship_id: scholarshipId,
        notes: notes || null,
        priority_level: priorityLevel || 'medium'
      })
      .returning();

    res.json({
      success: true,
      watchlistEntry
    });

  } catch (error) {
    console.error('[Watchlist] Error adding scholarship:', error);
    res.status(500).json({ error: 'Failed to add scholarship to watchlist' });
  }
});

// Remove scholarship from watchlist
router.delete('/remove/:scholarshipId', requireAuth, async (req: Request, res: Response) => {
  try {
    const scholarshipId = parseInt(req.params.scholarshipId);
    const userId = req.user!.id;

    await db.delete(scholarship_watchlist)
      .where(and(
        eq(scholarship_watchlist.user_id, userId),
        eq(scholarship_watchlist.scholarship_id, scholarshipId)
      ));

    res.json({ success: true });

  } catch (error) {
    console.error('[Watchlist] Error removing scholarship:', error);
    res.status(500).json({ error: 'Failed to remove scholarship from watchlist' });
  }
});

// Get user's watchlist
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

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
      watchlist: watchlistItems
    });

  } catch (error) {
    console.error('[Watchlist] Error fetching watchlist:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
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
      return res.status(404).json({ error: 'Watchlist entry not found' });
    }

    res.json({
      success: true,
      watchlistEntry: updated
    });

  } catch (error) {
    console.error('[Watchlist] Error updating watchlist entry:', error);
    res.status(500).json({ error: 'Failed to update watchlist entry' });
  }
});

// Check if scholarship is in watchlist
router.get('/check/:scholarshipId', requireAuth, async (req: Request, res: Response) => {
  try {
    const scholarshipId = parseInt(req.params.scholarshipId);
    const userId = req.user!.id;

    const existing = await db.select()
      .from(scholarship_watchlist)
      .where(and(
        eq(scholarship_watchlist.user_id, userId),
        eq(scholarship_watchlist.scholarship_id, scholarshipId)
      ))
      .limit(1);

    res.json({
      inWatchlist: existing.length > 0,
      watchlistEntry: existing[0] || null
    });

  } catch (error) {
    console.error('[Watchlist] Error checking watchlist:', error);
    res.status(500).json({ error: 'Failed to check watchlist status' });
  }
});

export default router;