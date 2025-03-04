-- Add name column to datapoints table
ALTER TABLE datapoints
ADD COLUMN IF NOT EXISTS name text;

-- Add function to handle datapoint name updates
CREATE OR REPLACE FUNCTION handle_datapoint_name()
RETURNS trigger AS $$
BEGIN
  -- If name is provided, use it
  -- If not, use sequential_id
  NEW.name := COALESCE(NEW.name, NEW.sequential_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle name updates
DROP TRIGGER IF EXISTS handle_datapoint_name_trigger ON datapoints;
CREATE TRIGGER handle_datapoint_name_trigger
  BEFORE INSERT OR UPDATE ON datapoints
  FOR EACH ROW
  EXECUTE FUNCTION handle_datapoint_name();