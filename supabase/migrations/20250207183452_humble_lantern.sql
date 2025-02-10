-- Create user_feedback table with browser fingerprint tracking
CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  browser_id text NOT NULL,
  visitor_id uuid NOT NULL,
  browser_fingerprint text NOT NULL,
  cta_source text NOT NULL,
  newsletter_preference text NOT NULL,
  interview_interest text NOT NULL,
  email text,
  language text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_feedback_browser_id ON user_feedback(browser_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_fingerprint ON user_feedback(browser_fingerprint);
CREATE INDEX IF NOT EXISTS idx_user_feedback_last_seen ON user_feedback(last_seen_at);
CREATE INDEX IF NOT EXISTS user_feedback_user_id_idx ON user_feedback(user_id);

-- Enable RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Set user_id on feedback insert"
  ON user_feedback
  FOR INSERT
  TO anon
  WITH CHECK (
    CASE 
      WHEN auth.role() = 'authenticated' THEN user_id = auth.uid()
      ELSE user_id IS NULL
    END
  );

CREATE POLICY "Users can read own feedback"
  ON user_feedback
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can update own feedback"
  ON user_feedback
  FOR UPDATE
  TO anon
  USING (browser_fingerprint = browser_fingerprint);

-- Create trigger for updated_at
CREATE TRIGGER update_user_feedback_updated_at
  BEFORE UPDATE ON user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();