-- Migration: Add missing user profile columns to users table
-- Purpose: Ensure production DB matches the latest users table definition in shared/schema.ts
-- Safe to run multiple times (idempotent).
-- Date: 2025-12-15

-- Add first_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = 'first_name'
    ) THEN
        ALTER TABLE users
        ADD COLUMN first_name VARCHAR;

        RAISE NOTICE '✅ Added first_name column to users table';
    ELSE
        RAISE NOTICE 'ℹ️  first_name column already exists in users table';
    END IF;
END $$;

-- Add last_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = 'last_name'
    ) THEN
        ALTER TABLE users
        ADD COLUMN last_name VARCHAR;

        RAISE NOTICE '✅ Added last_name column to users table';
    ELSE
        RAISE NOTICE 'ℹ️  last_name column already exists in users table';
    END IF;
END $$;

-- Add profile_image_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = 'profile_image_url'
    ) THEN
        ALTER TABLE users
        ADD COLUMN profile_image_url VARCHAR;

        RAISE NOTICE '✅ Added profile_image_url column to users table';
    ELSE
        RAISE NOTICE 'ℹ️  profile_image_url column already exists in users table';
    END IF;
END $$;

-- Add quora_profile_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = 'quora_profile_url'
    ) THEN
        ALTER TABLE users
        ADD COLUMN quora_profile_url VARCHAR;

        RAISE NOTICE '✅ Added quora_profile_url column to users table';
    ELSE
        RAISE NOTICE 'ℹ️  quora_profile_url column already exists in users table';
    END IF;
END $$;

-- Add is_admin column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE users
        ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;

        RAISE NOTICE '✅ Added is_admin column to users table';
    ELSE
        RAISE NOTICE 'ℹ️  is_admin column already exists in users table';
    END IF;
END $$;

-- Add is_verified column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE users
        ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false;

        RAISE NOTICE '✅ Added is_verified column to users table';
    ELSE
        RAISE NOTICE 'ℹ️  is_verified column already exists in users table';
    END IF;
END $$;

-- Add is_approved column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = 'is_approved'
    ) THEN
        ALTER TABLE users
        ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT false;

        RAISE NOTICE '✅ Added is_approved column to users table';
    ELSE
        RAISE NOTICE 'ℹ️  is_approved column already exists in users table';
    END IF;
END $$;

-- Add pricing_tier column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = 'pricing_tier'
    ) THEN
        ALTER TABLE users
        ADD COLUMN pricing_tier DECIMAL(10, 2) NOT NULL DEFAULT '1.00';

        RAISE NOTICE '✅ Added pricing_tier column to users table';
    ELSE
        RAISE NOTICE 'ℹ️  pricing_tier column already exists in users table';
    END IF;
END $$;

-- Add subscription_status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = 'subscription_status'
    ) THEN
        ALTER TABLE users
        ADD COLUMN subscription_status VARCHAR(20) NOT NULL DEFAULT 'active';

        RAISE NOTICE '✅ Added subscription_status column to users table';
    ELSE
        RAISE NOTICE 'ℹ️  subscription_status column already exists in users table';
    END IF;
END $$;

-- Add terms_accepted_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = 'terms_accepted_at'
    ) THEN
        ALTER TABLE users
        ADD COLUMN terms_accepted_at TIMESTAMP;

        RAISE NOTICE '✅ Added terms_accepted_at column to users table';
    ELSE
        RAISE NOTICE 'ℹ️  terms_accepted_at column already exists in users table';
    END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = 'created_at'
    ) THEN
        ALTER TABLE users
        ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();

        RAISE NOTICE '✅ Added created_at column to users table';
    ELSE
        RAISE NOTICE 'ℹ️  created_at column already exists in users table';
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE users
        ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

        RAISE NOTICE '✅ Added updated_at column to users table';
    ELSE
        RAISE NOTICE 'ℹ️  updated_at column already exists in users table';
    END IF;
END $$;


