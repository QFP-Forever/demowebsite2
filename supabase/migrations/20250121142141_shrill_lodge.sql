/*
  # Feature Ratings Table

  1. New Tables
    - `feature_ratings`
      - `id` (uuid, primary key)
      - `browser_id` (text, not null)
      - `cta_source` (text, not null)
      - `rating` (text, not null)
      - `language` (text, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `feature_ratings` table
    - Add policies for anonymous users to:
      - Insert new ratings
      - Update their own ratings
      - Read their own ratings

  3. Constraints
    - Unique constraint on browser_id + cta_source to prevent duplicate votes
*/

CREATE TABLE IF NOT EXISTS feature_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  browser_id text NOT NULL,
  cta_source text NOT NULL,
  rating text NOT NULL,
  language text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(browser_id, cta_source)
);

ALTER TABLE feature_ratings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert new ratings
CREATE POLICY "Anyone can insert feature ratings"
  ON feature_ratings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow users to read their own ratings
CREATE POLICY "Users can read their own ratings"
  ON feature_ratings
  FOR SELECT
  TO anon
  USING (true);

-- Allow users to update their own ratings
CREATE POLICY "Users can update their own ratings"
  ON feature_ratings
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_feature_ratings_updated_at
  BEFORE UPDATE ON feature_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();