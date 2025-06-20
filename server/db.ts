import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for serverless environment with proper WebSocket handling
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;
neonConfig.pipelineTLS = false;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool with optimized configuration for Replit/Neon environment
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 3, // Increase pool size slightly for better performance
  idleTimeoutMillis: 20000, // Reduce idle timeout
  connectionTimeoutMillis: 15000, // Increase connection timeout
  maxUses: 7500, // Add connection reuse limit
  allowExitOnIdle: false, // Keep pool alive
});

// Handle pool errors gracefully
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

export const db = drizzle({ client: pool, schema });