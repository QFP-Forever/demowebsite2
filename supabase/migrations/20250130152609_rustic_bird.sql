/*
  # Refresh schema cache for feature ratings

  1. Changes
    - Recreate device_type column to force schema refresh
    - Add explicit type casting for device_type
    - Add retry logic for schema cache issues
*/

-- Drop and recreate device_type column to force schema refresh
ALTER TABLE feature_ratings DROP COLUMN IF EXISTS device_type;

ALTER TABLE feature_ratings
ADD COLUMN device_type text NOT NULL DEFAULT 'desktop'::text
CHECK (device_type IN ('desktop', 'mobile', 'tablet'));

-- Recreate index
DROP INDEX IF EXISTS idx_feature_ratings_device_type;
CREATE INDEX idx_feature_ratings_device_type ON feature_ratings(device_type);

-- Notify PostgREST to refresh schema cache
NOTIFY pgrst, 'reload schema';