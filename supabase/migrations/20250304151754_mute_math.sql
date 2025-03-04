/*
  # Fix Rating Calculation Functions

  1. Changes
    - Fix record handling in calculate_parameter_rating function
    - Improve range sorting and comparison logic
    - Add better error handling for invalid values
    
  2. Improvements
    - More robust range matching
    - Better handling of edge cases
    - Clearer code organization
*/

-- Drop existing functions to recreate them
DROP FUNCTION IF EXISTS map_parameter_ids_to_codes(jsonb);
DROP FUNCTION IF EXISTS calculate_parameter_rating(text, text, jsonb);
DROP FUNCTION IF EXISTS calculate_datapoint_ratings(jsonb, text);

-- Create improved parameter mapping function
CREATE OR REPLACE FUNCTION map_parameter_ids_to_codes(
  values_with_ids jsonb
) RETURNS jsonb AS $$
DECLARE
  mapped jsonb := '{}'::jsonb;
  param_map jsonb;
  r record;
BEGIN
  -- Create mapping of parameter IDs to codes (short_name or name)
  SELECT jsonb_object_agg(id::text, COALESCE(short_name, name))
  INTO param_map
  FROM parameters;

  -- Map each value using the parameter mapping
  FOR r IN SELECT * FROM jsonb_each_text(values_with_ids) LOOP
    IF param_map ? r.key THEN
      mapped := mapped || jsonb_build_object(param_map->>r.key, r.value);
    END IF;
  END LOOP;

  RETURN mapped;
END;
$$ LANGUAGE plpgsql;

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

  -- Handle selection type values
  IF value IN ('never', 'constant', 'intermittent', 'drained') THEN
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
      -- Check if value falls within this range
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
      -- Skip invalid ranges
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
  mapped_values jsonb;
  param record;
  value text;
  rating integer;
BEGIN
  -- Map parameter IDs to codes
  mapped_values := map_parameter_ids_to_codes(datapoint_values);
  
  -- Get parameters with rating ranges
  FOR param IN 
    SELECT 
      p.id,
      COALESCE(p.short_name, p.name) as param_code,
      p.rating_ranges
    FROM parameters p
    WHERE p.rating_ranges IS NOT NULL
  LOOP
    -- Get value using parameter code
    value := mapped_values->>(param.param_code);
    
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
      ratings := ratings || jsonb_build_object(param.param_code, rating);
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