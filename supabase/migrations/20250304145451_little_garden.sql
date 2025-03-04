/*
  # Fix Parameter Mapping for Rating Calculation

  1. Changes
    - Add function to map UUID parameter IDs to short names
    - Update rating calculation to handle UUID parameter IDs
    - Fix value lookup in rating calculation
    
  2. Improvements
    - Better handling of parameter mapping
    - More robust value extraction
    - Proper error handling
*/

-- Function to map parameter IDs to short names
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
    -- Get parameter short name for this ID
    SELECT short_name INTO param_code
    FROM parameters
    WHERE id = key;
    
    IF param_code IS NOT NULL THEN
      mapped := mapped || jsonb_build_object(param_code, value);
    END IF;
  END LOOP;
  
  RETURN mapped;
END;
$$ LANGUAGE plpgsql;

-- Update calculate_datapoint_ratings to handle UUID parameter IDs
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
  -- First map the UUID parameter IDs to short names
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