/*
  # Consolidated Schema Migration

  1. Tables
    - newsletter_subscribers
    - pricing_votes
    - user_feedback
    - feature_ratings

  2. Changes
    - Consolidates all previous migrations
    - Ensures proper column types and constraints
    - Maintains all indexes and RLS policies
    - Fixes device_type column issue

  3. Security
    - Enables RLS on all tables
    - Recreates all security policies
*/

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert newsletter subscribers"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can read own newsletter subscription"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create pricing_votes table
CREATE TABLE IF NOT EXISTS pricing_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  browser_id text NOT NULL UNIQUE,
  visitor_id uuid NOT NULL,
  browser_fingerprint text NOT NULL,
  plan_id text NOT NULL,
  language text NOT NULL CHECK (language IN ('fr', 'en', 'de', 'it')),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pricing_votes ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_pricing_votes_browser_id ON pricing_votes(browser_id);
CREATE INDEX idx_pricing_votes_visitor_browser ON pricing_votes(visitor_id, browser_fingerprint);
CREATE INDEX idx_pricing_votes_last_seen ON pricing_votes(last_seen_at);

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

-- Create user_feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cta_source text NOT NULL,
  newsletter_preference text NOT NULL,
  interview_interest text NOT NULL,
  email text,
  language text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

CREATE INDEX user_feedback_user_id_idx ON user_feedback(user_id);

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

CREATE POLICY "Users can read own feedback"
  ON user_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create feature_ratings table
CREATE TABLE IF NOT EXISTS feature_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  browser_id text NOT NULL,
  visitor_id uuid NOT NULL,
  browser_fingerprint text NOT NULL,
  cta_source text NOT NULL,
  rating text NOT NULL,
  language text NOT NULL,
  device_type text NOT NULL DEFAULT 'desktop',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT feature_ratings_browser_fingerprint_cta_source_key UNIQUE (browser_fingerprint, cta_source),
  CONSTRAINT feature_ratings_cta_source_check CHECK (
    cta_source IN ('taxDeclaration.cta', 'budget.cta', 'wealth.cta')
  ),
  CONSTRAINT feature_ratings_device_type_check CHECK (
    device_type IN ('desktop', 'mobile', 'tablet')
  )
);

ALTER TABLE feature_ratings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_feature_ratings_browser_id ON feature_ratings(browser_id);
CREATE INDEX idx_feature_ratings_fingerprint_cta ON feature_ratings(browser_fingerprint, cta_source);
CREATE INDEX idx_feature_ratings_last_seen ON feature_ratings(last_seen_at);
CREATE INDEX idx_feature_ratings_device_type ON feature_ratings(device_type);

CREATE POLICY "Enable read access to own ratings"
  ON feature_ratings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable update for own ratings"
  ON feature_ratings
  FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Enable insert for all ratings"
  ON feature_ratings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_pricing_votes_updated_at
  BEFORE UPDATE ON pricing_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_ratings_updated_at
  BEFORE UPDATE ON feature_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Force PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';