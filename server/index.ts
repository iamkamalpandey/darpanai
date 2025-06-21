import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupOfferLetterRoutes } from "./offerLetterRoutesNew";
import coeRoutes from "./coeRoutes";
import { setupVite, serveStatic, log } from "./vite";
import { pool } from "./db";

// Enhanced logging function with error level support
function logWithLevel(message: string, level: 'info' | 'error' = 'info', source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  if (level === "error") {
    console.error(`${formattedTime} [ERROR] [${source}] ${message}`);
  } else {
    console.log(`${formattedTime} [INFO] [${source}] ${message}`);
  }
}

const app = express();

// Enable compression for all responses to reduce bandwidth
app.use(compression({
  level: 9, // Maximum compression for better performance
  threshold: 512, // Compress responses larger than 512 bytes
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Validate required environment variables at startup
function validateEnvironmentVariables() {
  const requiredEnvVars = ['DATABASE_URL'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  logWithLevel('Environment variables validated successfully');
}

// Test database connection with timeout and retry logic
async function testDatabaseConnection() {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      // Set a reasonable timeout for the connection test
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database connection timeout')), 8000);
      });
      
      const connectionPromise = (async () => {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        return true;
      })();
      
      await Promise.race([connectionPromise, timeoutPromise]);
      logWithLevel('Database connection test successful');
      return;
    } catch (error) {
      retryCount++;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logWithLevel(`Database connection attempt ${retryCount}/${maxRetries} failed: ${errorMsg}`, 'error');
      
      if (retryCount < maxRetries) {
        logWithLevel(`Retrying database connection in 2 seconds...`, 'info');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        logWithLevel('Max database connection retries reached. Continuing startup...', 'error');
      }
    }
  }
}

// Health check endpoint
function setupHealthCheck(app: express.Application) {
  app.get('/api/health', async (_req: Request, res: Response) => {
    try {
      // Test database connection
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.NODE_ENV || 'development'
      });
    }
  });
}

// Graceful shutdown handler
function setupGracefulShutdown(server: any) {
  const shutdown = async (signal: string) => {
    logWithLevel(`Received ${signal}. Starting graceful shutdown...`);
    
    server.close(async () => {
      logWithLevel('HTTP server closed');
      
      try {
        await pool.end();
        logWithLevel('Database pool closed');
      } catch (error) {
        logWithLevel(`Error closing database pool: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      }
      
      logWithLevel('Graceful shutdown completed');
      process.exit(0);
    });
    
    // Force close after 30 seconds
    setTimeout(() => {
      logWithLevel('Forced shutdown after timeout', 'error');
      process.exit(1);
    }, 30000);
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Main application startup with comprehensive error handling
(async () => {
  try {
    logWithLevel('Starting application initialization...');
    
    // Step 1: Validate environment variables
    validateEnvironmentVariables();
    
    // Step 2: Test database connection
    await testDatabaseConnection();
    
    // Step 3: Setup health check endpoint first
    setupHealthCheck(app);
    
    // Step 4: Register all routes
    logWithLevel('Registering application routes...');
    const server = await registerRoutes(app);
    
    // Import and register offer letter routes BEFORE Vite setup
    const { setupOfferLetterRoutesSimplified } = await import('./offerLetterRoutesSimplified');
    setupOfferLetterRoutesSimplified(app);
    
    // Register new offer letter information routes
    const { setupOfferLetterInfoRoutes } = await import('./offerLetterInfoRoutes');
    setupOfferLetterInfoRoutes(app);
    
    // Register scholarship research routes
    const { scholarshipRoutes } = await import('./scholarshipRoutes');
    app.use('/api/scholarships', scholarshipRoutes);
    logWithLevel('✓ Scholarship research routes registered successfully');
    
    // Register COE information routes
    app.use('/api/coe-info', coeRoutes);
    logWithLevel('✓ COE information routes registered successfully');
    
    // Step 5: Setup error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      logWithLevel(`Error: ${status} - ${message}`, 'error');
      res.status(status).json({ message });
    });
    
    // Step 6: Setup Vite in development or static serving in production
    logWithLevel('Setting up client serving...');
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    
    // Step 7: Setup graceful shutdown
    setupGracefulShutdown(server);
    
    // Step 8: Start the server
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      logWithLevel(`Application successfully started on port ${port}`);
      logWithLevel(`Health check available at: http://localhost:${port}/api/health`);
    });
    
    // Handle server startup errors
    server.on('error', (error: any) => {
      logWithLevel(`Server startup error: ${error.message}`, 'error');
      process.exit(1);
    });
    
  } catch (error) {
    logWithLevel(`Application startup failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    logWithLevel('Stack trace:', 'error');
    if (error instanceof Error && error.stack) {
      logWithLevel(error.stack, 'error');
    }
    process.exit(1);
  }
})();
