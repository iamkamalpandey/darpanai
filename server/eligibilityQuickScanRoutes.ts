import { Router, Request, Response } from 'express';
import { eligibilityQuickScanService } from './eligibilityQuickScanService';

const router = Router();

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

// POST /api/eligibility/quick-scan
router.post('/quick-scan', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log(`[Eligibility Quick Scan] Starting scan for user ${userId}`);
    
    const scanResult = await eligibilityQuickScanService.performQuickScan(userId);
    
    console.log(`[Eligibility Quick Scan] Completed scan for user ${userId}: ${scanResult.eligibleScholarships}/${scanResult.totalScholarships} eligible scholarships`);
    
    res.status(200).json(scanResult);
  } catch (error) {
    console.error('[Eligibility Quick Scan] Error:', error);
    res.status(500).json({ 
      error: 'Failed to perform eligibility quick scan',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;