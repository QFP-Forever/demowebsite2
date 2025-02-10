/*
  # Add composite unique constraint for feature ratings

  1. Changes
    - Add composite unique constraint for visitor_id, browser_fingerprint, and cta_source
    - This enables upsert operations to work correctly

  2. Indexes
    - Add index to improve query performance on these columns
*/

-- Add composite unique constraint
ALTER TABLE feature_ratings
ADD CONSTRAINT feature_ratings_visitor_browser_cta_key 
UNIQUE (visitor_id, browser_fingerprint, cta_source);

-- Add supporting index
CREATE INDEX idx_feature_ratings_composite 
ON feature_ratings(visitor_id, browser_fingerprint, cta_source);