/*
  # Update feature ratings table

  1. Changes
    - Add feature_type enum for better type safety
    - Add check constraint to validate feature types
    - Add index for faster lookups

  2. Security
    - Maintain existing RLS policies
*/

-- Create enum for feature types
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feature_type') THEN
    CREATE TYPE feature_type AS ENUM ('tax_declaration', 'budget', 'wealth');
  END IF;
END $$;

-- Add check constraint for cta_source
ALTER TABLE feature_ratings
ADD CONSTRAINT feature_ratings_cta_source_check
CHECK (
  cta_source IN (
    'taxDeclaration.cta',
    'budget.cta',
    'wealth.cta'
  )
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS feature_ratings_browser_cta_idx 
ON feature_ratings(browser_id, cta_source);