/*
  # Create user feedback table

  1. New Tables
    - `user_feedback`
      - `id` (uuid, primary key)
      - `cta_source` (text) - stores which CTA triggered the popup
      - `newsletter_preference` (text) - answer to question 1
      - `interview_interest` (text) - answer to question 2
      - `email` (text, nullable)
      - `language` (text) - user's selected language
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `user_feedback` table
    - Add policy for anonymous users to insert feedback
*/

CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cta_source text NOT NULL,
  newsletter_preference text NOT NULL,
  interview_interest text NOT NULL,
  email text,
  language text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert user feedback"
  ON user_feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);