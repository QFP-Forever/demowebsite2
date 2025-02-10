/*
  # Fix Schema Cache Issue
  
  1. Changes
    - Drop and recreate feature_ratings table to force schema refresh
    - Ensure device_type column is properly registered
    - Maintain all existing constraints and policies
*/

-- Temporarily disable RLS to avoid policy conflicts during recreation
ALTER TABLE feature_ratings DISABLE ROW LEVEL SECURITY;

-- Drop and recreate the table to force schema refresh
DROP TABLE IF EXISTS feature_ratings CASCADE;

CREATE TABLE feature_ratings (
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

-- Recreate indexes
CREATE INDEX idx_feature_ratings_browser_id ON feature_ratings(browser_id);
CREATE INDEX idx_feature_ratings_fingerprint_cta ON feature_ratings(browser_fingerprint, cta_source);
CREATE INDEX idx_feature_ratings_last_seen ON feature_ratings(last_seen_at);
CREATE INDEX idx_feature_ratings_device_type ON feature_ratings(device_type);

-- Re-enable RLS
ALTER TABLE feature_ratings ENABLE ROW LEVEL SECURITY;

-- Recreate policies
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

-- Recreate trigger
CREATE TRIGGER update_feature_ratings_updated_at
  BEFORE UPDATE ON feature_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Force PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';

-- Additional commands to ensure schema refresh
SELECT pg_notify('pgrst', 'reload schema');
SELECT pg_notify('pgrst', 'reload config');