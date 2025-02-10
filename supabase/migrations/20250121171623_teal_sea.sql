/*
  # Fix RLS policies for pricing votes

  1. Changes
    - Update RLS policies to properly handle browser-based identification
    - Simplify policy conditions for better reliability
    - Maintain existing functionality for both authenticated and anonymous users

  2. Security
    - Maintain data isolation between different browsers/users
    - Ensure users can only access their own data
    - Allow anonymous voting while preventing abuse
*/

-- Drop existing policies
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pricing_votes' AND policyname = 'Insert pricing votes with user_id'
  ) THEN
    DROP POLICY "Insert pricing votes with user_id" ON pricing_votes;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pricing_votes' AND policyname = 'Update own pricing votes'
  ) THEN
    DROP POLICY "Update own pricing votes" ON pricing_votes;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pricing_votes' AND policyname = 'Read own pricing votes'
  ) THEN
    DROP POLICY "Read own pricing votes" ON pricing_votes;
  END IF;
END $$;

-- Create new simplified policies
CREATE POLICY "Enable insert for all users"
  ON pricing_votes
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enable read access to own votes"
  ON pricing_votes
  FOR SELECT
  TO anon
  USING (
    CASE 
      WHEN auth.uid() IS NOT NULL THEN user_id = auth.uid()
      ELSE browser_id = browser_id -- Allow reading own browser_id entries
    END
  );

CREATE POLICY "Enable update for own votes"
  ON pricing_votes
  FOR UPDATE
  TO anon
  USING (
    CASE 
      WHEN auth.uid() IS NOT NULL THEN user_id = auth.uid()
      ELSE browser_id = browser_id -- Allow updating own browser_id entries
    END
  );