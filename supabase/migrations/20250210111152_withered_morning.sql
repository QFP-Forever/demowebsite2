-- First, drop existing RLS policies
DROP POLICY IF EXISTS "Enable read access to own feedback" ON user_feedback;
DROP POLICY IF EXISTS "Enable update for own feedback" ON user_feedback;
DROP POLICY IF EXISTS "Enable insert for all feedback" ON user_feedback;

-- Create new, more permissive RLS policies
CREATE POLICY "Enable read access to own feedback"
  ON user_feedback
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable update for own feedback"
  ON user_feedback
  FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Enable insert for anon users"
  ON user_feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Ensure proper grants are in place
GRANT ALL ON TABLE user_feedback TO postgres;
GRANT SELECT, INSERT, UPDATE ON TABLE user_feedback TO anon;
GRANT SELECT, INSERT, UPDATE ON TABLE user_feedback TO authenticated;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';