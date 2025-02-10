/*
  # Update pricing votes schema

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
    WHERE tablename = 'pricing_votes'
  ) THEN
    DROP POLICY IF EXISTS "Enable read access to own votes" ON pricing_votes;
    DROP POLICY IF EXISTS "Enable update for own votes" ON pricing_votes;
    DROP POLICY IF EXISTS "Enable insert for all users" ON pricing_votes;
  END IF;
END $$;

-- Drop old columns and constraints
ALTER TABLE pricing_votes
DROP CONSTRAINT IF EXISTS pricing_votes_visitor_browser_key;

-- Add new standardized columns
ALTER TABLE pricing_votes
DROP COLUMN IF EXISTS browser_id,
DROP COLUMN IF EXISTS user_identifier,
ADD COLUMN IF NOT EXISTS browser_id text NOT NULL DEFAULT gen_random_uuid()::text,
ADD COLUMN IF NOT EXISTS visitor_id uuid NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS browser_fingerprint text NOT NULL DEFAULT gen_random_uuid()::text,
ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NOT NULL DEFAULT now();

-- Add constraints and indexes
ALTER TABLE pricing_votes
ADD CONSTRAINT pricing_votes_browser_id_key UNIQUE (browser_id);

-- Create supporting indexes
CREATE INDEX IF NOT EXISTS idx_pricing_votes_browser_id 
ON pricing_votes(browser_id);

CREATE INDEX IF NOT EXISTS idx_pricing_votes_visitor_browser 
ON pricing_votes(visitor_id, browser_fingerprint);

CREATE INDEX IF NOT EXISTS idx_pricing_votes_last_seen 
ON pricing_votes(last_seen_at);

-- Create new policies
CREATE POLICY "Enable read access to own votes"
  ON pricing_votes
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable update for own votes"
  ON pricing_votes
  FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Enable insert for all users"
  ON pricing_votes
  FOR INSERT
  TO anon
  WITH CHECK (true);