// Load environment variables first
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") }); // Fallback to .env

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Configure Neon connection settings for better timeout handling
neonConfig.pipelineConnect = false;
neonConfig.pipelineTLS = false;
neonConfig.useSecureWebSocket = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Validate that DATABASE_URL is not empty and is a valid URL format
const rawConnectionString = process.env.DATABASE_URL.trim();
if (!rawConnectionString) {
  throw new Error(
    "DATABASE_URL is set but is empty. Please provide a valid database connection string.",
  );
}

// Validate URL format before passing to Neon client
try {
  // Try to parse as URL to validate format (postgres:// or postgresql://)
  new URL(rawConnectionString);
} catch (error) {
  throw new Error(
    `DATABASE_URL is not a valid URL format: "${rawConnectionString.substring(0, 20)}...". Please check your database connection string.`,
  );
}

// Enhance connection string with timeout parameters if not already present
let connectionString = rawConnectionString;
if (!connectionString.includes('connect_timeout')) {
  const separator = connectionString.includes('?') ? '&' : '?';
  // Add connection timeout (30 seconds) and statement timeout (60 seconds) for schema operations
  connectionString = `${connectionString}${separator}connect_timeout=30&statement_timeout=60000`;
}

// Create pool with increased timeout settings
export const pool = new Pool({ 
  connectionString,
  // Connection timeout: 30 seconds (30000ms)
  connectionTimeoutMillis: 30000,
  // Idle timeout: 30 seconds (increased for serverless to handle cold starts)
  idleTimeoutMillis: 30000,
  // Maximum number of clients in the pool
  max: 20,
});

export const db = drizzle({ client: pool, schema });
