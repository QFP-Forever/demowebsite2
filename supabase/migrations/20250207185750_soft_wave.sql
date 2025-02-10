-- Add unique constraint for browser_fingerprint and cta_source
ALTER TABLE user_feedback
ADD CONSTRAINT user_feedback_browser_fingerprint_cta_source_key 
UNIQUE (browser_fingerprint, cta_source);

-- Create index for the composite key
CREATE INDEX IF NOT EXISTS idx_user_feedback_fingerprint_cta 
ON user_feedback(browser_fingerprint, cta_source);

-- Add check constraint for valid cta_source values
ALTER TABLE user_feedback
ADD CONSTRAINT user_feedback_cta_source_check
CHECK (
  cta_source IN (
    'header.signup',
    'footer.newsletter',
    'taxDeclaration.cta',
    'budget.cta',
    'wealth.cta'
  )
);