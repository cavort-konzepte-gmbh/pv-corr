/*
  # Fix Ratings Calculation

  1. Changes
    - Fix parameter ID lookup in calculate_datapoint_ratings function
    - Use rating_code instead of id for JSONB lookup
    - Add error handling for missing rating_code
    - Improve rating calculation logic

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity during rating calculations
*/

-- Updated function to calculate ratings using rating_code
CREATE OR REPLACE FUNCTION calculate_datapoint_ratings(
  datapoint_values jsonb,
  datapoint_type text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  ratings jsonb := '{}'::jsonb;
  param record;
  value text;
  rating integer;
BEGIN
  -- For each parameter in the values
  FOR param IN 
    SELECT p.* 
    FROM parameters p
    WHERE p.rating_ranges IS NOT NULL
      AND p.rating_code IS NOT NULL  -- Only include parameters with rating_code
  LOOP
    -- Get the value using rating_code
    value := datapoint_values->>param.rating_code;
    
    -- Skip if no value
    CONTINUE WHEN value IS NULL;
    
    -- Calculate rating based on parameter type
    IF param.rating_type = 'selection' THEN
      -- For selection type, find matching option
      SELECT (range_obj->>'rating')::integer INTO rating
      FROM jsonb_array_elements(param.rating_ranges) AS range_obj
      WHERE range_obj->>'min' = value
      LIMIT 1;
      
    ELSIF param.rating_type = 'range' AND param.rating_code = 'Z1' AND value = 'impurities' THEN
      -- Special case for Z1 impurities
      rating := -12;
      
    ELSIF param.rating_type = 'range' THEN
      -- For range type, convert value to numeric and find matching range
      BEGIN
        DECLARE
          num_value numeric := value::numeric;
        BEGIN
          SELECT (range_obj->>'rating')::integer INTO rating
          FROM jsonb_array_elements(param.rating_ranges) AS range_obj
          WHERE 
            num_value >= (range_obj->>'min')::numeric
            AND (
              range_obj->>'max' IS NULL 
              OR num_value < (range_obj->>'max')::numeric
            )
          ORDER BY (range_obj->>'min')::numeric DESC
          LIMIT 1;
        END;
      EXCEPTION WHEN others THEN
        -- Invalid numeric value
        rating := NULL;
      END;
    END IF;

    -- Add rating to results if calculated
    IF rating IS NOT NULL THEN
      ratings := ratings || jsonb_build_object(param.rating_code, rating);
    END IF;
  END LOOP;

  RETURN ratings;
END;
$$ LANGUAGE plpgsql;

-- Recalculate ratings for all existing datapoints
SELECT recalculate_all_datapoint_ratings();