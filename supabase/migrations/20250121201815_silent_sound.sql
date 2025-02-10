/*
  # Fix feature ratings data cleanup and constraints

  1. Changes
    - Clean up duplicate entries by keeping only the most recent one
    - Add unique constraint for browser_fingerprint and cta_source
    - Update indexes for better performance

  2. Security
    - Maintain existing RLS policies
*/

-- First, create a temporary table to store the most recent entries
CREATE TEMP TABLE temp_feature_ratings AS
SELECT DISTINCT ON (browser_fingerprint, cta_source)
  id,
  browser_id,
  visitor_id,
  browser_fingerprint,
  cta_source,
  rating,
  language,
  created_at::timestamptz,
  updated_at::timestamptz,
  last_seen_at::timestamptz
FROM feature_ratings
ORDER BY browser_fingerprint, cta_source, last_seen_at DESC;

-- Delete all rows from the original table
DELETE FROM feature_ratings;

-- Insert back only the most recent entries with proper type casting
INSERT INTO feature_ratings (
  id,
  browser_id,
  visitor_id,
  browser_fingerprint,
  cta_source,
  rating,
  language,
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
  created_at,
  updated_at,
  last_seen_at
FROM temp_feature_ratings;

-- Drop the temporary table
DROP TABLE temp_feature_ratings;

-- Now we can safely add the unique constraint
ALTER TABLE feature_ratings
ADD CONSTRAINT feature_ratings_browser_fingerprint_cta_source_key 
UNIQUE (browser_fingerprint, cta_source);

-- Create supporting index for the constraint
CREATE INDEX IF NOT EXISTS idx_feature_ratings_fingerprint_cta 
ON feature_ratings(browser_fingerprint, cta_source);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_feature_ratings_last_seen 
ON feature_ratings(last_seen_at);