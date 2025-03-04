/*
  # Fix output configuration constraint

  1. Changes
    - Remove complex constraint that used subquery
    - Add simpler JSONB validation for output_config
    - Keep RLS policies unchanged
*/

-- Drop existing constraint if it exists
ALTER TABLE norms DROP CONSTRAINT IF EXISTS output_config_check;

-- Add simpler constraint
ALTER TABLE norms 
ADD CONSTRAINT output_config_array_check 
CHECK (jsonb_typeof(output_config) = 'array');

-- Add trigger function to validate output config structure
CREATE OR REPLACE FUNCTION validate_output_config()
RETURNS trigger AS $$
BEGIN
  -- Skip validation if output_config is null
  IF NEW.output_config IS NULL THEN
    RETURN NEW;
  END IF;

  -- Validate array structure
  IF jsonb_typeof(NEW.output_config) != 'array' THEN
    RAISE EXCEPTION 'output_config must be an array';
  END IF;

  -- Validate each output object
  FOR i IN 0..jsonb_array_length(NEW.output_config) - 1 LOOP
    IF NOT (
      (NEW.output_config->i) ? 'id' AND
      (NEW.output_config->i) ? 'name' AND
      (NEW.output_config->i) ? 'formula' AND
      (NEW.output_config->i) ? 'description'
    ) THEN
      RAISE EXCEPTION 'Each output must have id, name, formula and description fields';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS validate_output_config_trigger ON norms;
CREATE TRIGGER validate_output_config_trigger
  BEFORE INSERT OR UPDATE ON norms
  FOR EACH ROW
  EXECUTE FUNCTION validate_output_config();