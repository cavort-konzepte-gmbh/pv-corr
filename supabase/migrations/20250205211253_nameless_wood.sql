/*
  # Add short name field to parameters

  1. Changes
    - Add short_name column to parameters table
    - Make it nullable since it's optional
*/

-- Add short_name column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parameters' AND column_name = 'short_name'
  ) THEN
    ALTER TABLE parameters ADD COLUMN short_name text;
  END IF;
END $$;