-- Migration: Add sectors and job_titles columns to directory_profiles table
-- These columns store arrays of sector IDs and job title IDs from the skills database
-- The arrays link Directory profiles to the skills database
-- Date: 2024-01-XX

-- Add sectors column if it doesn't exist
-- This is idempotent - safe to run multiple times
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'directory_profiles' 
        AND column_name = 'sectors'
    ) THEN
        ALTER TABLE directory_profiles 
        ADD COLUMN sectors TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
        
        RAISE NOTICE '✅ Added sectors column to directory_profiles table';
    ELSE
        RAISE NOTICE 'ℹ️  sectors column already exists in directory_profiles table';
    END IF;
END $$;

-- Add job_titles column if it doesn't exist
-- This is idempotent - safe to run multiple times
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'directory_profiles' 
        AND column_name = 'job_titles'
    ) THEN
        ALTER TABLE directory_profiles 
        ADD COLUMN job_titles TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
        
        RAISE NOTICE '✅ Added job_titles column to directory_profiles table';
    ELSE
        RAISE NOTICE 'ℹ️  job_titles column already exists in directory_profiles table';
    END IF;
END $$;

