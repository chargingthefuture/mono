-- Migration: add_login_events_table
-- Purpose: Track successful webapp logins for DAU/MAU analytics

BEGIN;

-- User table must exist before creating login_events (mirrors schema.sql order)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  quora_profile_url VARCHAR,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  pricing_tier DECIMAL(10, 2) NOT NULL DEFAULT '1.00',
  subscription_status VARCHAR(20) NOT NULL DEFAULT 'active',
  terms_accepted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Login events table - tracks successful webapp logins for DAU/MAU analytics
CREATE TABLE IF NOT EXISTS login_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  source VARCHAR(50) NOT NULL DEFAULT 'webapp',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IDX_login_events_user_created_at ON login_events(user_id, created_at);

COMMIT;



