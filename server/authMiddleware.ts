import { Request, Response, NextFunction } from 'express';

// Authentication middleware for protected routes
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
};

// Extend Request type to include user
export interface AuthRequest extends Request {
  user: {
    id: number;
    username: string;
    role: string;
  };
}