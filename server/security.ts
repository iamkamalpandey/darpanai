import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Application } from 'express';
import multer from 'multer';
import path from 'path';
import { z } from 'zod';

// Security middleware configuration
export const configureSecurityMiddleware = (app: Application) => {
  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.openai.com", "https://api.anthropic.com"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // Rate limiting configurations
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true,
  });

  const analysisLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 analysis requests per hour
    message: 'Too many analysis requests, please try again later.',
  });

  const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each IP to 20 uploads per hour
    message: 'Too many file uploads, please try again later.',
  });

  // Apply rate limiting
  app.use(globalLimiter);
  app.use('/api/login', authLimiter);
  app.use('/api/register', authLimiter);
  app.use('/api/analyze', analysisLimiter);
  app.use('/api/upload', uploadLimiter);
  app.use('/api/documents/upload', uploadLimiter);
  app.use('/api/coe-analysis', analysisLimiter);
  app.use('/api/offer-letter-analysis', analysisLimiter);
  app.use('/api/visa-analysis', analysisLimiter);
};

// Secure file upload configuration
export const createSecureUpload = () => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];

  return multer({
    dest: 'uploads/',
    limits: { 
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 1,
      fieldSize: 1024 * 1024 // 1MB field size
    },
    fileFilter: (req, file, cb) => {
      // Check MIME type
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only PDF, JPG, PNG, DOC, and DOCX files are allowed.'));
      }
      
      // Check file extension
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        return cb(new Error('Invalid file extension. Only .pdf, .jpg, .jpeg, .png, .doc, and .docx files are allowed.'));
      }
      
      // Additional filename validation
      if (file.originalname.length > 255) {
        return cb(new Error('Filename too long. Maximum 255 characters allowed.'));
      }
      
      // Check for suspicious filenames
      const suspiciousPatterns = [
        /\.\./,  // Directory traversal
        /[<>:"|?*]/,  // Invalid characters
        /^\./,  // Hidden files
        /\.exe$|\.bat$|\.com$|\.scr$|\.vbs$|\.js$/i  // Executable files
      ];
      
      if (suspiciousPatterns.some(pattern => pattern.test(file.originalname))) {
        return cb(new Error('Invalid filename. Please use a different filename.'));
      }
      
      cb(null, true);
    }
  });
};

// Input validation schemas
export const loginSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(8).max(128)
});

export const registerSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  ),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100)
});

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  phoneNumber: z.string().max(20).optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().max(100).optional(),
  currentCountry: z.string().max(100).optional(),
  preferredCountries: z.array(z.string()).optional(),
  fieldOfStudy: z.string().max(100).optional(),
  studyLevel: z.string().max(50).optional(),
  budgetRange: z.string().max(50).optional(),
  fundingSource: z.string().max(100).optional(),
  englishProficiency: z.string().max(50).optional()
});

// Validation middleware
export const validateInput = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid input data', 
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      return res.status(400).json({ error: 'Invalid input data' });
    }
  };
};

// Session configuration
export const sessionConfig = {
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' as const
  },
  name: 'darpan.sid' // Don't use default session name
};

// Security utilities
export const sanitizeFilename = (filename: string): string => {
  // Remove path traversal attempts
  const sanitized = filename.replace(/\.\./g, '').replace(/\//g, '').replace(/\\/g, '');
  
  // Remove or replace dangerous characters
  return sanitized.replace(/[<>:"|?*]/g, '_').substring(0, 255);
};

export const validateApiKey = (apiKey: string): boolean => {
  if (!apiKey) return false;
  
  // Basic validation for OpenAI API key format
  if (apiKey.startsWith('sk-') && apiKey.length >= 48) {
    return true;
  }
  
  // Basic validation for Anthropic API key format
  if (apiKey.startsWith('sk-ant-') && apiKey.length >= 40) {
    return true;
  }
  
  return false;
};

// Error handling middleware
export const errorHandler = (err: any, req: any, res: any, next: any) => {
  console.error('Error:', err.stack);
  
  // Don't leak internal errors in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    });
  }
  
  // In development, provide more details
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    stack: err.stack
  });
};

// Database connection security
export const isDatabaseSecure = (): boolean => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return false;
  
  // Check if using SSL
  return dbUrl.includes('sslmode=require') || dbUrl.includes('ssl=true');
};

// Environment validation
export const validateEnvironment = (): void => {
  const requiredEnvVars = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'OPENAI_API_KEY'
  ];
  
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    process.exit(1);
  }
  
  // Validate session secret strength
  const sessionSecret = process.env.SESSION_SECRET;
  if (sessionSecret && sessionSecret.length < 32) {
    console.warn('WARNING: SESSION_SECRET should be at least 32 characters long');
  }
  
  // Validate API keys
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && !validateApiKey(openaiKey)) {
    console.warn('WARNING: OPENAI_API_KEY format appears invalid');
  }
};