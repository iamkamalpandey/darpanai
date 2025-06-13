import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { storage } from "./storage";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import type { User as SchemaUser } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Extend Express.User interface to match database schema
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      studyDestination: string;
      startDate: string;
      city: string;
      country: string;
      counsellingMode: string;
      fundingSource: string;
      studyLevel: string;
      agreeToTerms: boolean;
      allowContact: boolean;
      receiveUpdates: boolean;
      role: string;
      status: string;
      analysisCount: number;
      maxAnalyses: number;
      createdAt: Date;
    }
  }
}

const PostgresSessionStore = connectPg(session);

export function setupAuth(app: Express): (req: Request, res: Response, next: NextFunction) => void {
  // Create the session store
  const sessionStore = new PostgresSessionStore({
    pool,
    tableName: 'user_sessions',
    createTableIfMissing: true,
  });

  // Session middleware configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'visa-analyzer-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  // Set up middleware
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport local strategy setup
  passport.use(
    new LocalStrategy(async (username: string, password: string, done) => {
      try {
        const loginResult = loginUserSchema.safeParse({ username, password });
        if (!loginResult.success) {
          return done(null, false, { message: 'Invalid username or password format' });
        }

        const user = await storage.authenticateUser(loginResult.data);
        
        if (!user) {
          return done(null, false, { message: 'Invalid username or password' });
        }
        
        // Transform user data to match Express.User interface
        const expressUser: Express.User = {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          studyDestination: user.studyDestination,
          startDate: user.startDate,
          city: user.city,
          country: user.country,
          counsellingMode: user.counsellingMode,
          fundingSource: user.fundingSource,
          studyLevel: user.studyLevel,
          agreeToTerms: user.agreeToTerms,
          allowContact: user.allowContact,
          receiveUpdates: user.receiveUpdates,
          role: user.role,
          status: user.status,
          analysisCount: user.analysisCount,
          maxAnalyses: user.maxAnalyses,
          createdAt: user.createdAt,
        };
        
        return done(null, expressUser);
      } catch (error) {
        return done(error);
      }
    })
  );

  // User serialization/deserialization for sessions
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, null);
      }
      
      // Transform user data to match Express.User interface
      const expressUser: Express.User = {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        qualification: user.qualification,
        graduationYear: user.graduationYear,
        phoneNumber: user.phoneNumber,
        role: user.role,
        analysisCount: user.analysisCount,
        maxAnalyses: user.maxAnalyses,
        createdAt: user.createdAt,
      };
      
      done(null, expressUser);
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware for protected routes
  const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    next();
  };

  // User authentication routes
  app.post("/api/register", async (req, res, next) => {
    try {
      const userValidation = insertUserSchema.safeParse(req.body);
      
      if (!userValidation.success) {
        return res.status(400).json({ 
          error: 'Invalid user data', 
          details: userValidation.error.format() 
        });
      }
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(req.body.username);
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Create user
      const user = await storage.createUser(userValidation.data);
      
      // Log user in automatically
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Create a safe user object without password
        const safeUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          qualification: user.qualification,
          graduationYear: user.graduationYear,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt
        };
        
        res.status(201).json(safeUser);
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate('local', (err: Error | null, user: Express.User | false, info: { message: string }) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ error: info.message || 'Authentication failed' });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        // Create a safe user object without password
        const safeUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          qualification: user.qualification,
          graduationYear: user.graduationYear,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt
        };
        
        return res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Send user info without password
    res.json(req.user);
  });

  // Return the auth middleware
  return requireAuth;
}