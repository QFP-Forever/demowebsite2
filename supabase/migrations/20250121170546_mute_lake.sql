/*
  # Add user_id to user_feedback table

  1. Changes
    - Add user_id column to user_feedback table
    - Create foreign key constraint to auth.users
    - Add index for performance
    - Update RLS policies to respect user ownership

  2. Security
    - Maintain existing RLS
    - Add policy for users to read their own feedback
    - Ensure data integrity with foreign key constraint

  Note: The user_id column is nullable to maintain compatibility with existing records
*/

-- Add user_id column
ALTER TABLE user_feedback
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS user_feedback_user_id_idx ON user_feedback(user_id);

-- Add policy for users to read their own feedback
CREATE POLICY "Users can read own feedback"
  ON user_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Update insert policy to set user_id for authenticated users
DROP POLICY IF EXISTS "Anyone can insert user feedback" ON user_feedback;

CREATE POLICY "Set user_id on feedback insert"
  ON user_feedback
  FOR INSERT
  TO anon
  WITH CHECK (
    CASE 
      WHEN auth.role() = 'authenticated' THEN user_id = auth.uid()
      ELSE user_id IS NULL
    END
  );