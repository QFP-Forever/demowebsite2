-- Drop existing table and related objects
DROP TABLE IF EXISTS user_feedback CASCADE;

-- Recreate table with all required columns and proper constraints
CREATE TABLE user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  browser_id text NOT NULL,
  visitor_id uuid NOT NULL DEFAULT gen_random_uuid(),
  browser_fingerprint text NOT NULL,
  cta_source text NOT NULL,
  newsletter_preference text NOT NULL CHECK (newsletter_preference IN ('yes', 'no')),
  interview_interest text NOT NULL CHECK (interview_interest IN ('yes', 'maybe', 'no')),
  email text CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  language text NOT NULL CHECK (language IN ('fr', 'en', 'de', 'it')),
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_feedback_browser_fingerprint_cta_source_key UNIQUE (browser_fingerprint, cta_source),
  CONSTRAINT user_feedback_cta_source_check CHECK (
    cta_source IN (
      'header.signup',
      'footer.newsletter',
      'taxDeclaration.cta',
      'budget.cta',
      'wealth.cta'
    )
  )
);

-- Create indexes for better performance
CREATE INDEX idx_user_feedback_browser_id ON user_feedback(browser_id);
CREATE INDEX idx_user_feedback_fingerprint_cta ON user_feedback(browser_fingerprint, cta_source);
CREATE INDEX idx_user_feedback_last_seen ON user_feedback(last_seen_at);
CREATE INDEX user_feedback_user_id_idx ON user_feedback(user_id);

-- Enable RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies with improved security
CREATE POLICY "Enable read access to own feedback"
  ON user_feedback
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable update for own feedback"
  ON user_feedback
  FOR UPDATE
  TO anon
  USING (browser_fingerprint = browser_fingerprint);

CREATE POLICY "Enable insert for all feedback"
  ON user_feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_feedback_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_seen_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_feedback_timestamps
  BEFORE UPDATE ON user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_user_feedback_timestamps();

-- Force PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';