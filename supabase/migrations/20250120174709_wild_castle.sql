/*
  # Create pricing votes table

  1. New Tables
    - `pricing_votes`
      - `id` (uuid, primary key)
      - `ip_hash` (text, unique) - Hashed IP address for privacy
      - `plan_id` (text) - Selected pricing plan
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `pricing_votes` table
    - Add policy for anonymous users to insert and update their own votes
*/

CREATE TABLE IF NOT EXISTS pricing_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text UNIQUE NOT NULL,
  plan_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pricing_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert pricing votes"
  ON pricing_votes
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update their own votes"
  ON pricing_votes
  FOR UPDATE
  TO anon
  USING (ip_hash = current_setting('request.headers')::json->>'cf-connecting-ip')
  WITH CHECK (ip_hash = current_setting('request.headers')::json->>'cf-connecting-ip');

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_pricing_votes_updated_at
  BEFORE UPDATE ON pricing_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();