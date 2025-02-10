/*
  # Update feature ratings schema

  1. Changes
    - Drop old columns and constraints
    - Add new standardized columns
    - Update policies
  
  2. Security
    - Maintain RLS policies
    - Ensure proper access control
*/

-- First, drop existing policies to remove dependencies
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feature_ratings'
  ) THEN
    DROP POLICY IF EXISTS "Enable read access to own ratings" ON feature_ratings;
    DROP POLICY IF EXISTS "Enable update for own ratings" ON feature_ratings;
    DROP POLICY IF EXISTS "Enable insert for all ratings" ON feature_ratings;
  END IF;
END $$;

-- Drop old columns and constraints
ALTER TABLE feature_ratings
DROP CONSTRAINT IF EXISTS feature_ratings_visitor_browser_key,
DROP CONSTRAINT IF EXISTS feature_ratings_visitor_browser_cta_key;

-- Add new standardized columns
ALTER TABLE feature_ratings
DROP COLUMN IF EXISTS browser_id,
DROP COLUMN IF EXISTS user_identifier,
ADD COLUMN IF NOT EXISTS browser_id text NOT NULL DEFAULT gen_random_uuid()::text,
ADD COLUMN IF NOT EXISTS visitor_id uuid NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS browser_fingerprint text NOT NULL DEFAULT gen_random_uuid()::text,
ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NOT NULL DEFAULT now();

-- Add constraints and indexes
ALTER TABLE feature_ratings
ADD CONSTRAINT feature_ratings_visitor_browser_cta_key 
UNIQUE (visitor_id, browser_fingerprint, cta_source);

-- Create supporting indexes
CREATE INDEX IF NOT EXISTS idx_feature_ratings_browser_id 
ON feature_ratings(browser_id);

CREATE INDEX IF NOT EXISTS idx_feature_ratings_visitor_browser_cta 
ON feature_ratings(visitor_id, browser_fingerprint, cta_source);

CREATE INDEX IF NOT EXISTS idx_feature_ratings_last_seen 
ON feature_ratings(last_seen_at);

-- Create new policies
CREATE POLICY "Enable read access to own ratings"
  ON feature_ratings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable update for own ratings"
  ON feature_ratings
  FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Enable insert for all ratings"
  ON feature_ratings
  FOR INSERT
  TO anon
  WITH CHECK (true);