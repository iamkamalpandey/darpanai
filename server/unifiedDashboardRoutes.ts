import { Router, type Response } from 'express';
import { requireAuth, AuthRequest } from './authMiddleware';
import { generateUnifiedDashboard } from './unifiedDashboardService';

const router = Router();

// Get unified dashboard data for authenticated user
router.get('/api/unified-dashboard', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    
    console.log(`🔍 Generating unified dashboard data for user ${userId}`);
    
    const dashboardData = await generateUnifiedDashboard(userId);
    
    console.log(`✅ Unified dashboard data generated successfully for user ${userId}`);
    
    res.json(dashboardData);
  } catch (error) {
    console.error('❌ Error generating unified dashboard:', error);
    res.status(500).json({ 
      error: 'Failed to generate unified dashboard data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Register the router with the app
export function setupUnifiedDashboardRoutes(app: any) {
  app.use(router);
  console.log('[INFO] [express] ✓ Unified Dashboard routes registered successfully');
}

export default router;