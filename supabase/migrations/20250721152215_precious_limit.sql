/*
  # Add SQL-specific fields to code_reviews table

  1. New Columns
    - `table_structures` (text) - Store table structure information for SQL queries
    - `data_volume` (text) - Store data volume information for SQL queries

  2. Changes
    - Add optional fields for SQL query context
    - Maintain backward compatibility with existing code reviews
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'code_reviews' AND column_name = 'table_structures'
  ) THEN
    ALTER TABLE code_reviews ADD COLUMN table_structures text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'code_reviews' AND column_name = 'data_volume'
  ) THEN
    ALTER TABLE code_reviews ADD COLUMN data_volume text;
  END IF;
END $$;