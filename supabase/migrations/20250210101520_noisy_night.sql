-- First, drop everything related to user_feedback
DROP TABLE IF EXISTS user_feedback CASCADE;
DROP FUNCTION IF EXISTS update_user_feedback_timestamps CASCADE;

-- Recreate the table with explicit column definitions
CREATE TABLE user_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  browser_id text NOT NULL,
  visitor_id uuid NOT NULL DEFAULT gen_random_uuid(),
  browser_fingerprint text NOT NULL,
  cta_source text NOT NULL,
  newsletter_preference text NOT NULL,
  interview_interest text NOT NULL,
  email text,
  language text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_feedback_pkey PRIMARY KEY (id),
  CONSTRAINT user_feedback_browser_fingerprint_cta_source_key UNIQUE (browser_fingerprint, cta_source),
  CONSTRAINT user_feedback_newsletter_preference_check CHECK (newsletter_preference IN ('yes', 'no')),
  CONSTRAINT user_feedback_interview_interest_check CHECK (interview_interest IN ('yes', 'maybe', 'no')),
  CONSTRAINT user_feedback_language_check CHECK (language IN ('fr', 'en', 'de', 'it')),
  CONSTRAINT user_feedback_cta_source_check CHECK (
    cta_source IN (
      'header.signup',
      'footer.newsletter',
      'taxDeclaration.cta',
      'budget.cta',
      'wealth.cta'
    )
  ),
  CONSTRAINT user_feedback_email_check CHECK (
    email IS NULL OR 
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  )
);

-- Create indexes
CREATE INDEX idx_user_feedback_browser_id ON user_feedback(browser_id);
CREATE INDEX idx_user_feedback_fingerprint_cta ON user_feedback(browser_fingerprint, cta_source);
CREATE INDEX idx_user_feedback_last_seen ON user_feedback(last_seen_at);
CREATE INDEX user_feedback_user_id_idx ON user_feedback(user_id);

-- Enable RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create timestamp update function
CREATE OR REPLACE FUNCTION update_user_feedback_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_seen_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_user_feedback_timestamps
  BEFORE UPDATE ON user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_user_feedback_timestamps();

-- Explicit grants
GRANT ALL ON TABLE user_feedback TO postgres;
GRANT ALL ON TABLE user_feedback TO anon;
GRANT ALL ON TABLE user_feedback TO authenticated;
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Multiple schema refresh commands to ensure cache is updated
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');
SELECT pg_notify('pgrst', 'reload config');

-- Force connection reset for schema cache
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = current_database()
  AND pid <> pg_backend_pid()
  AND usename = 'authenticator';

-- Final schema refresh
NOTIFY pgrst, 'reload schema';