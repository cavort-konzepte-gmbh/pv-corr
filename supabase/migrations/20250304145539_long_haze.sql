/*
  # Fix Parameter Mapping and Rating Calculation

  1. Changes
    - Fix UUID comparison in map_parameter_ids_to_codes function
    - Update parameter mapping to handle UUID values correctly
    - Improve rating calculation logic
    
  2. Improvements
    - More robust parameter ID handling
    - Better type casting
    - Clearer error handling
*/

-- Update function to properly handle UUID parameter IDs
CREATE OR REPLACE FUNCTION map_parameter_ids_to_codes(
  values_with_ids jsonb
) RETURNS jsonb AS $$
DECLARE
  mapped jsonb := '{}'::jsonb;
  key text;
  value text;
  param_code text;
BEGIN
  FOR key, value IN SELECT * FROM jsonb_each_text(values_with_ids) LOOP
    -- Cast key to UUID for comparison
    SELECT short_name INTO param_code
    FROM parameters
    WHERE id::text = key;
    
    IF param_code IS NOT NULL THEN
      mapped := mapped || jsonb_build_object(param_code, value);
    END IF;
  END LOOP;
  
  RETURN mapped;
END;
$$ LANGUAGE plpgsql;

-- Update calculate_datapoint_ratings to handle edge cases better
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

-- Function to recalculate all datapoint ratings
CREATE OR REPLACE FUNCTION recalculate_all_datapoint_ratings()
RETURNS void AS $$
DECLARE
  dp record;
BEGIN
  FOR dp IN SELECT * FROM datapoints LOOP
    UPDATE datapoints
    SET ratings = calculate_datapoint_ratings(values, type)
    WHERE id = dp.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Recalculate all existing ratings
SELECT recalculate_all_datapoint_ratings();