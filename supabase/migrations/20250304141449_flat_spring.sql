/*
  # Add ratings to datapoints

  1. Changes
    - Add `ratings` JSONB column to datapoints table to store parameter ratings
    - Each rating will be stored as a key-value pair where:
      - Key: parameter code (e.g., "Z1", "Z2", etc.)
      - Value: rating value (integer between -12 and 12)

  2. Security
    - Maintain existing RLS policies
*/

-- Add ratings column as JSONB to store parameter-specific ratings
ALTER TABLE datapoints
ADD COLUMN IF NOT EXISTS ratings JSONB DEFAULT '{}'::jsonb;

-- Add constraint to ensure rating values are within valid range (-12 to 12)
ALTER TABLE datapoints
ADD CONSTRAINT ratings_values_check 
CHECK (
  (ratings IS NULL) OR
  (
    -- Check that all values in the JSONB are integers between -12 and 12
    NOT EXISTS (
      SELECT value 
      FROM jsonb_each_text(ratings) 
      WHERE value::integer < -12 OR value::integer > 12
    )
  )
);