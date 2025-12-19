import { config } from 'dotenv';
import { resolve } from 'path';
import { Pool } from 'pg';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const migrationSQL = `
-- Alter otp_codes.code column to support 8-character codes
ALTER TABLE otp_codes ALTER COLUMN code TYPE VARCHAR(8);
`;

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    console.error('Please set DATABASE_URL in your .env file or environment');
    process.exit(1);
  }

  console.log('Running OTP code length migration...');
  console.log('Database:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password

  try {
    console.log('Executing migration SQL...');
    await pool.query(migrationSQL);

    console.log('✓ Migration completed successfully!');
    console.log('✓ Updated otp_codes.code column to VARCHAR(8)');
    
    process.exit(0);
  } catch (error: any) {
    console.error('✗ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

