-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS handle_datapoint_name_trigger ON datapoints;
DROP FUNCTION IF EXISTS handle_datapoint_name();

-- Create improved function to handle datapoint name
CREATE OR REPLACE FUNCTION handle_datapoint_name()
RETURNS trigger AS $$
BEGIN
  -- Only set name to sequential_id if name is NULL or empty string
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