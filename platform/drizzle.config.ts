import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local (dev) or .env (fallback)
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// Enhance connection string with timeout parameters for schema operations
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl.includes('connect_timeout')) {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  // Add connection timeout (30 seconds) and statement timeout (60 seconds) for long schema operations
  databaseUrl = `${databaseUrl}${separator}connect_timeout=30&statement_timeout=60000`;
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  // Increase timeout settings for schema operations
  verbose: true,
  strict: true,
});
