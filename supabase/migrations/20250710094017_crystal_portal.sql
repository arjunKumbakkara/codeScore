/*
  # Create code reviews table

  1. New Tables
    - `code_reviews`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `code_content` (text)
      - `review_result` (text)
      - `language` (text)
      - `filename` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `code_reviews` table
    - Add policy for users to read/write their own reviews
*/

CREATE TABLE IF NOT EXISTS code_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code_content text NOT NULL,
  review_result text NOT NULL,
  language text NOT NULL DEFAULT 'javascript',
  filename text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE code_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own code reviews"
  ON code_reviews
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own code reviews"
  ON code_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own code reviews"
  ON code_reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own code reviews"
  ON code_reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_code_reviews_user_id ON code_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_code_reviews_created_at ON code_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_code_reviews_language ON code_reviews(language);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_code_reviews_updated_at
  BEFORE UPDATE ON code_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();