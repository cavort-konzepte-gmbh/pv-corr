/*
  # Fix Parameter Rating Calculations

  1. Changes
    - Update rating calculation functions
    - Add proper type handling for numeric values
    - Fix parameter rating ranges

  2. Parameters
    - Ensure correct rating calculation for all parameter types
*/

-- Drop existing functions to recreate them
DROP FUNCTION IF EXISTS calculate_parameter_rating(text, text, jsonb);
DROP FUNCTION IF EXISTS calculate_datapoint_ratings(jsonb, text);

-- Create improved parameter rating calculation
CREATE OR REPLACE FUNCTION calculate_parameter_rating(
  param_code text,
  value text,
  param_ranges jsonb
) RETURNS integer AS $$
DECLARE
  numeric_value float;
  range_record jsonb;
BEGIN
  -- Special case for Z1 impurities
  IF param_code = 'Z1' AND value = 'impurities' THEN
    RETURN -12;
  END IF;

  -- Handle selection type values (Z10)
  IF value IN ('never', 'constant', 'intermittent') THEN
    FOR range_record IN SELECT * FROM jsonb_array_elements(param_ranges) LOOP
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

  -- Find matching range by iterating through sorted ranges
  FOR range_record IN 
    SELECT * FROM jsonb_array_elements(param_ranges) AS r
    ORDER BY (r->>'min')::float DESC
  LOOP
    BEGIN
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
    EXCEPTION WHEN others THEN
      CONTINUE;
    END;
  END LOOP;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create improved datapoint ratings calculation
CREATE OR REPLACE FUNCTION calculate_datapoint_ratings(
  datapoint_values jsonb,
  datapoint_type text DEFAULT 'din50929-3'
) RETURNS jsonb AS $$
DECLARE
  ratings jsonb := '{}'::jsonb;
  param record;
  value text;
  rating integer;
BEGIN
  -- Get parameters with rating ranges
  FOR param IN 
    SELECT 
      p.id,
      p.short_name as param_code,
      p.rating_ranges
    FROM parameters p
    WHERE p.rating_ranges IS NOT NULL
  LOOP
    -- Get value for this parameter
    value := datapoint_values->>param.id;
    
    -- Skip if no value
    CONTINUE WHEN value IS NULL;
    
    -- Calculate rating
    rating := calculate_parameter_rating(
      param.param_code,
      value,
      param.rating_ranges
    );

    -- Add rating if calculated
    IF rating IS NOT NULL THEN
      ratings := ratings || jsonb_build_object(param.id, rating);
    END IF;
  END LOOP;

  RETURN ratings;
END;
$$ LANGUAGE plpgsql;

-- Update trigger function
CREATE OR REPLACE FUNCTION update_datapoint_ratings()
RETURNS trigger AS $$
BEGIN
  -- Only recalculate if values changed
  IF TG_OP = 'INSERT' OR OLD.values IS DISTINCT FROM NEW.values THEN
    NEW.ratings := calculate_datapoint_ratings(NEW.values, NEW.type);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS update_datapoint_ratings_trigger ON datapoints;
CREATE TRIGGER update_datapoint_ratings_trigger
  BEFORE INSERT OR UPDATE ON datapoints
  FOR EACH ROW
  EXECUTE FUNCTION update_datapoint_ratings();

-- Recalculate all existing ratings
SELECT recalculate_all_datapoint_ratings();