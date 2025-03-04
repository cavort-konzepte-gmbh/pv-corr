/*
  # Add Rating Ranges and Calculation Logic

  1. Changes
    - Add rating_ranges JSONB column for storing parameter rating ranges
    - Add rating_type column for specifying rating calculation method
    - Add rating_unit and rating_code columns
    - Add validation trigger for rating_ranges structure
    - Add function to calculate parameter ratings

  2. Security
    - Maintain existing RLS policies
    - Add validation to ensure rating values are within -12 to 12 range
*/

-- Add new columns for rating calculation
ALTER TABLE parameters
ADD COLUMN IF NOT EXISTS rating_ranges JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS rating_type text CHECK (rating_type IN ('range', 'selection', 'comparison')),
ADD COLUMN IF NOT EXISTS rating_unit text,
ADD COLUMN IF NOT EXISTS rating_code text;

-- Create a function to validate rating ranges structure
CREATE OR REPLACE FUNCTION validate_rating_ranges()
RETURNS trigger AS $$
BEGIN
  -- Skip validation if rating_ranges is null
  IF NEW.rating_ranges IS NULL THEN
    RETURN NEW;
  END IF;

  -- Validate array structure
  IF jsonb_typeof(NEW.rating_ranges) != 'array' THEN
    RAISE EXCEPTION 'rating_ranges must be an array';
  END IF;

  -- Validate each range object
  FOR i IN 0..jsonb_array_length(NEW.rating_ranges) - 1 LOOP
    DECLARE
      range_obj jsonb := NEW.rating_ranges->i;
      min_val text;
      max_val text;
      rating_val int;
    BEGIN
      -- Check required fields
      IF NOT (range_obj ? 'min' AND range_obj ? 'rating') THEN
        RAISE EXCEPTION 'Each range must have min and rating fields';
      END IF;

      -- Get values
      min_val := range_obj->>'min';
      max_val := range_obj->>'max';
      rating_val := (range_obj->>'rating')::int;

      -- Validate rating value
      IF rating_val < -12 OR rating_val > 12 THEN
        RAISE EXCEPTION 'Rating must be between -12 and 12';
      END IF;

      -- Validate min value
      IF min_val NOT IN ('impurities', 'never', 'constant', 'intermittent', 'homogenous', 'heterogenous') THEN
        -- Try to parse as number
        BEGIN
          PERFORM min_val::numeric;
        EXCEPTION WHEN others THEN
          RAISE EXCEPTION 'Min value must be numeric or a valid special value';
        END;
      END IF;

      -- Validate max value if present
      IF max_val IS NOT NULL THEN
        BEGIN
          PERFORM max_val::numeric;
        EXCEPTION WHEN others THEN
          RAISE EXCEPTION 'Max value must be numeric';
        END;
      END IF;
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rating ranges validation
DROP TRIGGER IF EXISTS validate_rating_ranges_trigger ON parameters;
CREATE TRIGGER validate_rating_ranges_trigger
  BEFORE INSERT OR UPDATE ON parameters
  FOR EACH ROW
  EXECUTE FUNCTION validate_rating_ranges();

-- Function to calculate rating based on parameter type and value
CREATE OR REPLACE FUNCTION calculate_parameter_rating(
  parameter_id text,
  value text
) RETURNS integer AS $$
DECLARE
  param_record record;
  range_record record;
  numeric_value float;
BEGIN
  -- Get parameter details
  SELECT * INTO param_record
  FROM parameters
  WHERE id = parameter_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Handle special case for Z1 impurities
  IF param_record.rating_code = 'Z1' AND value = 'impurities' THEN
    RETURN -12;
  END IF;

  -- Handle selection type parameters (Z10, Z13)
  IF param_record.rating_type = 'selection' THEN
    FOR range_record IN SELECT * FROM jsonb_array_elements(param_record.rating_ranges) LOOP
      IF range_record->>'min' = value THEN
        RETURN (range_record->>'rating')::integer;
      END IF;
    END LOOP;
    RETURN NULL;
  END IF;

  -- Try to convert value to numeric for range comparisons
  BEGIN
    numeric_value := value::float;
  EXCEPTION WHEN others THEN
    RETURN NULL;
  END;

  -- Handle range type parameters
  IF param_record.rating_type = 'range' THEN
    FOR range_record IN 
      SELECT * FROM jsonb_array_elements(param_record.rating_ranges)
      ORDER BY (range_record->>'min')::float
    LOOP
      IF range_record ? 'max' THEN
        IF numeric_value >= (range_record->>'min')::float 
           AND numeric_value < (range_record->>'max')::float THEN
          RETURN (range_record->>'rating')::integer;
        END IF;
      ELSE
        IF numeric_value >= (range_record->>'min')::float THEN
          RETURN (range_record->>'rating')::integer;
        END IF;
      END IF;
    END LOOP;
  END IF;

  RETURN 0;
END;
$$ LANGUAGE plpgsql;