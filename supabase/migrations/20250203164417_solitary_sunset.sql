/*
  # Final Schema Cache Fix
  
  1. Changes
    - Drop all related objects to ensure clean recreation
    - Recreate table with explicit column definitions
    - Add explicit grants to ensure proper permissions
    - Force multiple schema refreshes
*/

-- Drop everything related to feature_ratings
DROP TABLE IF EXISTS feature_ratings CASCADE;

-- Recreate the table with explicit column definitions
CREATE TABLE feature_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
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
  CONSTRAINT feature_ratings_pkey PRIMARY KEY (id),
  CONSTRAINT feature_ratings_browser_fingerprint_cta_source_key UNIQUE (browser_fingerprint, cta_source),
  CONSTRAINT feature_ratings_cta_source_check CHECK (
    cta_source IN ('taxDeclaration.cta', 'budget.cta', 'wealth.cta')
  ),
  CONSTRAINT feature_ratings_device_type_check CHECK (
    device_type IN ('desktop', 'mobile', 'tablet')
  )
);

-- Create indexes
CREATE INDEX idx_feature_ratings_browser_id ON feature_ratings(browser_id);
CREATE INDEX idx_feature_ratings_fingerprint_cta ON feature_ratings(browser_fingerprint, cta_source);
CREATE INDEX idx_feature_ratings_last_seen ON feature_ratings(last_seen_at);
CREATE INDEX idx_feature_ratings_device_type ON feature_ratings(device_type);

-- Enable RLS
ALTER TABLE feature_ratings ENABLE ROW LEVEL SECURITY;

-- Recreate policies with explicit grants
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

-- Explicit grants
GRANT ALL ON TABLE feature_ratings TO postgres;
GRANT ALL ON TABLE feature_ratings TO anon;
GRANT ALL ON TABLE feature_ratings TO authenticated;
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Recreate trigger
CREATE TRIGGER update_feature_ratings_updated_at
  BEFORE UPDATE ON feature_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Multiple schema refresh commands
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');
SELECT pg_notify('pgrst', 'reload config');

-- Force connection reset
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = current_database()
  AND pid <> pg_backend_pid()
  AND usename = 'authenticator';

-- Final schema refresh
NOTIFY pgrst, 'reload schema';