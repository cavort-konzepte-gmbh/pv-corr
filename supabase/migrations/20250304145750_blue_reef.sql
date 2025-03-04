/*
  # Fix Rating Calculation

  1. Changes
    - Fix record type handling in calculate_parameter_rating function
    - Improve range sorting and comparison logic
    - Add better error handling
    
  2. Improvements
    - More robust parameter value handling
    - Better type casting
    - Clearer range matching logic
*/

-- Update the calculate_parameter_rating function to fix record handling
CREATE OR REPLACE FUNCTION calculate_parameter_rating(
  param_code text,
  value text,
  param_ranges jsonb
) RETURNS integer AS $$
DECLARE
  numeric_value float;
  range_obj jsonb;
  min_val float;
  max_val float;
  rating_val integer;
BEGIN
  -- Special case for Z1 impurities
  IF param_code = 'Z1' AND value = 'impurities' THEN
    RETURN -12;
  END IF;

  -- Handle selection type values (Z10)
  IF value IN ('never', 'constant', 'intermittent') THEN
    SELECT (r->>'rating')::integer INTO rating_val
    FROM jsonb_array_elements(param_ranges) r
    WHERE r->>'min' = value
    LIMIT 1;
    
    RETURN rating_val;
  END IF;

  -- Try to convert value to numeric for range comparisons
  BEGIN
    numeric_value := value::float;
  EXCEPTION WHEN others THEN
    RETURN NULL;
  END;

  -- Find matching range by iterating through sorted ranges
  FOR range_obj IN 
    SELECT r FROM (
      SELECT jsonb_array_elements(param_ranges) r
      ORDER BY (r->>'min')::float DESC
    ) sorted
  LOOP
    min_val := (range_obj->>'min')::float;
    
    -- Handle max value if present
    IF range_obj ? 'max' THEN
      max_val := (range_obj->>'max')::float;
      IF numeric_value >= min_val AND numeric_value < max_val THEN
        RETURN (range_obj->>'rating')::integer;
      END IF;
    ELSE
      IF numeric_value >= min_val THEN
        RETURN (range_obj->>'rating')::integer;
      END IF;
    END IF;
  END LOOP;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update calculate_datapoint_ratings to use the fixed function
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
  -- Map UUID parameter IDs to short names
  mapped_values := map_parameter_ids_to_codes(datapoint_values);
  
  -- Get parameters with rating ranges
  FOR param IN 
    SELECT 
      p.id,
      p.short_name as param_code,
      p.rating_ranges
    FROM parameters p
    WHERE p.rating_ranges IS NOT NULL 
      AND p.short_name IS NOT NULL
  LOOP
    -- Get value using short name
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

-- Recalculate all existing ratings
SELECT recalculate_all_datapoint_ratings();