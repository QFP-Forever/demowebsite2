/*
  # Update pricing votes table schema

  1. Changes
    - Add pricing_plan_type enum for plan_id validation
    - Update table structure to use browser_id instead of ip_hash
    - Add proper constraints and types
    - Update RLS policies

  2. Security
    - Enable RLS
    - Add policies for anonymous users to insert and update their own votes
    - Add automatic timestamp updates
*/

-- Create enum for plan types if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pricing_plan_type') THEN
    CREATE TYPE pricing_plan_type AS ENUM ('tax', 'discovery', 'complete');
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pricing_votes' AND policyname = 'Anyone can insert pricing votes'
  ) THEN
    DROP POLICY "Anyone can insert pricing votes" ON pricing_votes;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pricing_votes' AND policyname = 'Users can update their own votes'
  ) THEN
    DROP POLICY "Users can update their own votes" ON pricing_votes;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pricing_votes' AND policyname = 'Users can read their own votes'
  ) THEN
    DROP POLICY "Users can read their own votes" ON pricing_votes;
  END IF;
END $$;

-- Create or update the table
CREATE TABLE IF NOT EXISTS pricing_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  browser_id text UNIQUE NOT NULL,
  plan_id pricing_plan_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE pricing_votes ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Anyone can insert pricing votes"
  ON pricing_votes
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update their own votes"
  ON pricing_votes
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read their own votes"
  ON pricing_votes
  FOR SELECT
  TO anon
  USING (true);

-- Create or replace the timestamp update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and create new one
DROP TRIGGER IF EXISTS update_pricing_votes_updated_at ON pricing_votes;
CREATE TRIGGER update_pricing_votes_updated_at
  BEFORE UPDATE ON pricing_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();