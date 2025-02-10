/*
  # Standardize User Identification

  1. Changes
    - Add new standardized columns for user identification
    - Update data structure
    - Create new policies with updated column references

  2. Security
    - Maintain RLS
    - Update policies to use new identification system
*/

-- First, drop existing policies to remove dependencies
DO $$ 
BEGIN
  -- Drop pricing_votes policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pricing_votes'
  ) THEN
    DROP POLICY IF EXISTS "Enable read access to own votes" ON pricing_votes;
    DROP POLICY IF EXISTS "Enable update for own votes" ON pricing_votes;
    DROP POLICY IF EXISTS "Enable insert for all users" ON pricing_votes;
  END IF;

  -- Drop feature_ratings policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feature_ratings'
  ) THEN
    DROP POLICY IF EXISTS "Enable read access to own ratings" ON feature_ratings;
    DROP POLICY IF EXISTS "Enable update for own ratings" ON feature_ratings;
    DROP POLICY IF EXISTS "Anyone can insert feature ratings" ON feature_ratings;
  END IF;
END $$;

-- Add new standardized columns
ALTER TABLE pricing_votes
ADD COLUMN IF NOT EXISTS visitor_id uuid,
ADD COLUMN IF NOT EXISTS browser_fingerprint text,
ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now();

ALTER TABLE feature_ratings
ADD COLUMN IF NOT EXISTS visitor_id uuid,
ADD COLUMN IF NOT EXISTS browser_fingerprint text,
ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now();

-- Update existing data
UPDATE pricing_votes
SET 
  visitor_id = COALESCE(
    browser_id::uuid,
    gen_random_uuid()
  ),
  browser_fingerprint = user_identifier,
  last_seen_at = now()
WHERE visitor_id IS NULL;

UPDATE feature_ratings
SET 
  visitor_id = COALESCE(
    browser_id::uuid,
    gen_random_uuid()
  ),
  browser_fingerprint = user_identifier,
  last_seen_at = now()
WHERE visitor_id IS NULL;

-- Make columns NOT NULL after data migration
ALTER TABLE pricing_votes
ALTER COLUMN visitor_id SET NOT NULL,
ALTER COLUMN browser_fingerprint SET NOT NULL,
ALTER COLUMN last_seen_at SET NOT NULL;

ALTER TABLE feature_ratings
ALTER COLUMN visitor_id SET NOT NULL,
ALTER COLUMN browser_fingerprint SET NOT NULL,
ALTER COLUMN last_seen_at SET NOT NULL;

-- Add constraints and indexes
ALTER TABLE pricing_votes
ADD CONSTRAINT pricing_votes_visitor_browser_key UNIQUE (visitor_id, browser_fingerprint);

ALTER TABLE feature_ratings
ADD CONSTRAINT feature_ratings_visitor_browser_key UNIQUE (visitor_id, browser_fingerprint);

CREATE INDEX IF NOT EXISTS idx_pricing_votes_visitor_id ON pricing_votes(visitor_id);
CREATE INDEX IF NOT EXISTS idx_pricing_votes_last_seen ON pricing_votes(last_seen_at);

CREATE INDEX IF NOT EXISTS idx_feature_ratings_visitor_id ON feature_ratings(visitor_id);
CREATE INDEX IF NOT EXISTS idx_feature_ratings_last_seen ON feature_ratings(last_seen_at);

-- Create new policies with updated column references
CREATE POLICY "Enable read access to own votes"
  ON pricing_votes
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable update for own votes"
  ON pricing_votes
  FOR UPDATE
  TO anon
  USING (browser_fingerprint = current_setting('app.browser_fingerprint', true));

CREATE POLICY "Enable insert for all users"
  ON pricing_votes
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enable read access to own ratings"
  ON feature_ratings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable update for own ratings"
  ON feature_ratings
  FOR UPDATE
  TO anon
  USING (browser_fingerprint = current_setting('app.browser_fingerprint', true));

CREATE POLICY "Enable insert for all ratings"
  ON feature_ratings
  FOR INSERT
  TO anon
  WITH CHECK (true);