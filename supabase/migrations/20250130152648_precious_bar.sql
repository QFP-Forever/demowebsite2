/*
  # Force schema refresh for feature ratings table

  1. Changes
    - Backup existing data
    - Drop and recreate table with all columns
    - Restore data
    - Recreate constraints and indexes
    - Force schema cache refresh
*/

-- Create backup table
CREATE TABLE IF NOT EXISTS feature_ratings_backup AS 
SELECT * FROM feature_ratings;

-- Drop existing table and related objects
DROP TABLE IF EXISTS feature_ratings CASCADE;

-- Recreate table with all columns
CREATE TABLE feature_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  browser_id text NOT NULL,
  visitor_id uuid NOT NULL,
  browser_fingerprint text NOT NULL,
  cta_source text NOT NULL,
  rating text NOT NULL,
  language text NOT NULL,
  device_type text NOT NULL DEFAULT 'desktop'::text,
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

-- Restore data
INSERT INTO feature_ratings (
  id,
  browser_id,
  visitor_id,
  browser_fingerprint,
  cta_source,
  rating,
  language,
  device_type,
  created_at,
  updated_at,
  last_seen_at
)
SELECT 
  id,
  browser_id,
  visitor_id,
  browser_fingerprint,
  cta_source,
  rating,
  language,
  COALESCE(device_type, 'desktop')::text,
  created_at,
  updated_at,
  last_seen_at
FROM feature_ratings_backup;

-- Recreate indexes
CREATE INDEX idx_feature_ratings_browser_id ON feature_ratings(browser_id);
CREATE INDEX idx_feature_ratings_fingerprint_cta ON feature_ratings(browser_fingerprint, cta_source);
CREATE INDEX idx_feature_ratings_last_seen ON feature_ratings(last_seen_at);
CREATE INDEX idx_feature_ratings_device_type ON feature_ratings(device_type);

-- Enable RLS
ALTER TABLE feature_ratings ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
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

-- Drop backup table
DROP TABLE feature_ratings_backup;

-- Force PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';