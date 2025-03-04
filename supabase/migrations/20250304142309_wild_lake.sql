/*
  # Add Ratings Calculation Trigger

  1. Changes
    - Add function to calculate ratings for all parameter values
    - Add trigger to automatically update ratings on insert/update
    - Add function to recalculate ratings for existing datapoints

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity during rating calculations
*/

-- Function to calculate ratings for a datapoint
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
  LOOP
    -- Get the value for this parameter
    value := datapoint_values->>param.id;
    
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
      ratings := ratings || jsonb_build_object(param.id, rating);
    END IF;
  END LOOP;

  RETURN ratings;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update ratings on datapoint changes
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

-- Create trigger
DROP TRIGGER IF EXISTS update_datapoint_ratings_trigger ON datapoints;
CREATE TRIGGER update_datapoint_ratings_trigger
  BEFORE INSERT OR UPDATE ON datapoints
  FOR EACH ROW
  EXECUTE FUNCTION update_datapoint_ratings();

-- Function to recalculate ratings for existing datapoints
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

-- Recalculate ratings for all existing datapoints
SELECT recalculate_all_datapoint_ratings();