/*
  # Fix pricing votes policies

  1. Changes
    - Drop existing policies before recreating them
    - Ensure clean policy creation
    - Maintain existing table structure and RLS

  2. Security
    - Maintain RLS on pricing_votes table
    - Recreate policies for anonymous users
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
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

-- Create policies
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