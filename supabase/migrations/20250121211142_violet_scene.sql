/*
  # Fix feature ratings table constraints and indexes

  1. Changes
    - Add unique constraint for browser_fingerprint and cta_source
    - Add supporting indexes for performance optimization
    - Add check constraint for valid cta_source values
    - Ensure proper column types and constraints

  2. Data Integrity
    - Preserves existing data
    - Maintains referential integrity
    - Ensures data consistency
*/

-- Create supporting indexes for performance
CREATE INDEX IF NOT EXISTS idx_feature_ratings_fingerprint_cta 
ON feature_ratings(browser_fingerprint, cta_source);

CREATE INDEX IF NOT EXISTS idx_feature_ratings_last_seen 
ON feature_ratings(last_seen_at);

-- Add check constraint for valid cta_source values
ALTER TABLE feature_ratings
DROP CONSTRAINT IF EXISTS feature_ratings_cta_source_check;

ALTER TABLE feature_ratings
ADD CONSTRAINT feature_ratings_cta_source_check
CHECK (
  cta_source IN (
    'taxDeclaration.cta',
    'budget.cta',
    'wealth.cta'
  )
);

-- Add unique constraint for browser_fingerprint and cta_source
ALTER TABLE feature_ratings
DROP CONSTRAINT IF EXISTS feature_ratings_browser_fingerprint_cta_source_key;

ALTER TABLE feature_ratings
ADD CONSTRAINT feature_ratings_browser_fingerprint_cta_source_key 
UNIQUE (browser_fingerprint, cta_source);