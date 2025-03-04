/*
  # Fix Datapoint Names

  1. Changes
    - Ensures sequential_id is properly set as default name
    - Updates existing datapoints to have correct names
    - Improves name handling trigger

  2. Security
    - No changes to RLS policies
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS handle_datapoint_name_trigger ON datapoints;
DROP FUNCTION IF EXISTS handle_datapoint_name();

-- Create improved function to handle datapoint name
CREATE OR REPLACE FUNCTION handle_datapoint_name()
RETURNS trigger AS $$
BEGIN
  -- If name is NULL or empty string, use sequential_id
  IF NEW.name IS NULL OR TRIM(NEW.name) = '' THEN
    NEW.name := NEW.sequential_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle name updates
CREATE TRIGGER handle_datapoint_name_trigger
  BEFORE INSERT OR UPDATE ON datapoints
  FOR EACH ROW
  EXECUTE FUNCTION handle_datapoint_name();

-- Update existing datapoints to ensure names are set
UPDATE datapoints
SET name = sequential_id
WHERE name IS NULL OR TRIM(name) = '';