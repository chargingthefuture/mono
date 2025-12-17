#!/usr/bin/env tsx
/**
 * Migration script to create OTP codes and auth tokens tables
 * 
 * Usage:
 *   npm run migrate:otp
 *   or
 *   tsx scripts/migrate-otp-tables.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { pool } from '../server/db';
import { readFileSync } from 'fs';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });

const migrationSQL = `
-- OTP codes table - stores OTP codes for Android app authentication
CREATE TABLE IF NOT EXISTS otp_codes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IDX_otp_codes_user_id ON otp_codes(user_id);
CREATE INDEX IF NOT EXISTS IDX_otp_codes_code ON otp_codes(code);
CREATE INDEX IF NOT EXISTS IDX_otp_codes_expires_at ON otp_codes(expires_at);

-- Auth tokens table - stores OTP-based auth tokens for Android app
CREATE TABLE IF NOT EXISTS auth_tokens (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(64) NOT NULL UNIQUE,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IDX_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS IDX_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS IDX_auth_tokens_expires_at ON auth_tokens(expires_at);
`;

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    console.error('Please set DATABASE_URL in your .env file or environment');
    process.exit(1);
  }

  console.log('Running OTP tables migration...');
  console.log('Database:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password

  try {
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // Execute the migration SQL using the pool directly
    console.log('Executing migration SQL...');
    await pool.query(migrationSQL);

    console.log('✓ Migration completed successfully!');
    console.log('✓ Created otp_codes table');
    console.log('✓ Created auth_tokens table');
    console.log('✓ Created all indexes');
    
    process.exit(0);
  } catch (error: any) {
    console.error('✗ Migration failed:', error.message);
    if (error.code === '42P07') {
      console.error('  Note: Table already exists (this is OK)');
    } else if (error.code === '42P01') {
      console.error('  Note: Referenced table (users) does not exist');
      console.error('  Please ensure the users table exists first');
    }
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

