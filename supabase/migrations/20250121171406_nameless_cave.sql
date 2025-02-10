/*
  # Add user associations to pricing_votes

  1. Changes
    - Add user_id column to pricing_votes table
    - Create foreign key constraint to auth.users
    - Add index for performance optimization
    - Update RLS policies to respect user ownership

  2. Security
    - Maintain existing RLS
    - Add policy for users to read their own votes
    - Ensure data integrity with foreign key constraint
    - Handle both authenticated and anonymous users

  Note: The user_id column is nullable to maintain compatibility with existing records
*/

-- Add user_id column to pricing_votes
ALTER TABLE pricing_votes
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS pricing_votes_user_id_idx ON pricing_votes(user_id);

-- Drop existing policies
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

-- Create new policies that handle both authenticated and anonymous users
CREATE POLICY "Insert pricing votes with user_id"
  ON pricing_votes
  FOR INSERT
  TO anon
  WITH CHECK (
    CASE 
      WHEN auth.role() = 'authenticated' THEN user_id = auth.uid()
      ELSE user_id IS NULL
    END
  );

CREATE POLICY "Update own pricing votes"
  ON pricing_votes
  FOR UPDATE
  TO anon
  USING (
    CASE 
      WHEN auth.role() = 'authenticated' THEN user_id = auth.uid()
      ELSE browser_id = current_setting('request.headers')::json->>'cf-connecting-ip'
    END
  )
  WITH CHECK (
    CASE 
      WHEN auth.role() = 'authenticated' THEN user_id = auth.uid()
      ELSE browser_id = current_setting('request.headers')::json->>'cf-connecting-ip'
    END
  );

CREATE POLICY "Read own pricing votes"
  ON pricing_votes
  FOR SELECT
  TO anon
  USING (
    CASE 
      WHEN auth.role() = 'authenticated' THEN user_id = auth.uid()
      ELSE browser_id = current_setting('request.headers')::json->>'cf-connecting-ip'
    END
  );