/*
  # Add device type tracking to feature ratings

  1. Changes
    - Add device_type column to feature_ratings table
    - Add check constraint for valid device types
    - Create index for performance

  2. Security
    - No changes to RLS policies needed
*/

-- Add device_type column with constraint
ALTER TABLE feature_ratings
ADD COLUMN IF NOT EXISTS device_type text NOT NULL DEFAULT 'desktop'
CHECK (device_type IN ('desktop', 'mobile', 'tablet'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_feature_ratings_device_type 
ON feature_ratings(device_type);