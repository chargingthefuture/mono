-- Migration: Drop unused name-related columns from directory_profiles
-- Target: nickname, display_name_type (legacy, unused)
-- This migration is written to be idempotent and safe to run multiple times.
-- Date: 2025-12-15

DO $$
BEGIN
    -- Drop nickname column if it exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'directory_profiles'
          AND column_name = 'nickname'
    ) THEN
        ALTER TABLE directory_profiles
        DROP COLUMN nickname;

        RAISE NOTICE '✅ Dropped nickname column from directory_profiles table';
    ELSE
        RAISE NOTICE 'ℹ️ nickname column does not exist on directory_profiles table, skipping';
    END IF;
END $$;

DO $$
BEGIN
    -- Drop display_name_type column if it exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'directory_profiles'
          AND column_name = 'display_name_type'
    ) THEN
        ALTER TABLE directory_profiles
        DROP COLUMN display_name_type;

        RAISE NOTICE '✅ Dropped display_name_type column from directory_profiles table';
    ELSE
        RAISE NOTICE 'ℹ️ display_name_type column does not exist on directory_profiles table, skipping';
    END IF;
END $$;


