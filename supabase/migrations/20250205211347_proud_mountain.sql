/*
  # Add short name field to parameters

  1. Changes
    - Add short_name column to parameters table if it doesn't exist
    - Make it nullable since existing records won't have this value
    - Add index for better query performance
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

-- Create index for short_name lookups
CREATE INDEX IF NOT EXISTS idx_parameters_short_name ON parameters(short_name);