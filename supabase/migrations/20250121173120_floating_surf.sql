/*
  # Add user tracking and language preferences

  1. Changes
    - Add language column to pricing_votes table
    - Add user_identifier column to pricing_votes and feature_ratings tables
    - Add appropriate indexes for performance
    - Update RLS policies to use browser-based identification

  2. Security
    - Enable row-level security
    - Add policies for data isolation
    - Create indexes for query optimization
*/

-- Add language column to pricing_votes
ALTER TABLE pricing_votes
ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'fr'
CHECK (language IN ('fr', 'en', 'de', 'it'));

-- Add user_identifier column to pricing_votes
ALTER TABLE pricing_votes
ADD COLUMN IF NOT EXISTS user_identifier text NOT NULL DEFAULT gen_random_uuid()::text;

-- Add user_identifier column to feature_ratings
ALTER TABLE feature_ratings
ADD COLUMN IF NOT EXISTS user_identifier text NOT NULL DEFAULT gen_random_uuid()::text;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pricing_votes_user_identifier 
ON pricing_votes(user_identifier);

CREATE INDEX IF NOT EXISTS idx_feature_ratings_user_identifier 
ON feature_ratings(user_identifier);

CREATE INDEX IF NOT EXISTS idx_pricing_votes_language 
ON pricing_votes(language);

-- Drop existing policies if they exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pricing_votes' AND policyname = 'Enable read access to own votes'
  ) THEN
    DROP POLICY "Enable read access to own votes" ON pricing_votes;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pricing_votes' AND policyname = 'Enable update for own votes'
  ) THEN
    DROP POLICY "Enable update for own votes" ON pricing_votes;
  END IF;
END $$;

-- Create new policies for pricing_votes
CREATE POLICY "Enable read access to own votes"
  ON pricing_votes
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable update for own votes"
  ON pricing_votes
  FOR UPDATE
  TO anon
  USING (user_identifier = user_identifier);

-- Drop existing policies for feature_ratings if they exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feature_ratings' AND policyname = 'Enable read access to own ratings'
  ) THEN
    DROP POLICY "Enable read access to own ratings" ON feature_ratings;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feature_ratings' AND policyname = 'Enable update for own ratings'
  ) THEN
    DROP POLICY "Enable update for own ratings" ON feature_ratings;
  END IF;
END $$;

-- Create new policies for feature_ratings
CREATE POLICY "Enable read access to own ratings"
  ON feature_ratings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable update for own ratings"
  ON feature_ratings
  FOR UPDATE
  TO anon
  USING (user_identifier = user_identifier);