/*
  # Add Rating Calculation Functions

  1. New Functions
    - calculate_parameter_rating: Calculates rating for a single parameter value
    - calculate_datapoint_ratings: Calculates ratings for all parameters in a datapoint
    - update_datapoint_ratings: Trigger function to automatically update ratings
    
  2. Changes
    - Adds trigger to automatically calculate ratings on datapoint insert/update
    - Adds function to recalculate all existing datapoint ratings
*/

-- Function to calculate rating for a single parameter value
CREATE OR REPLACE FUNCTION calculate_parameter_rating(
  param_code text,
  value text,
  param_ranges jsonb
) RETURNS integer AS $$
DECLARE
  range_record record;
  numeric_value float;
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

  -- Find matching range
  FOR range_record IN 
    SELECT * FROM jsonb_array_elements(param_ranges)
    ORDER BY (range_record->>'min')::float DESC
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

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate all ratings for a datapoint
CREATE OR REPLACE FUNCTION calculate_datapoint_ratings(
  datapoint_values jsonb,
  standard_id text DEFAULT 'din50929-3'
) RETURNS jsonb AS $$
DECLARE
  ratings jsonb := '{}'::jsonb;
  param record;
  value text;
  rating integer;
BEGIN
  -- Get parameters for the standard
  FOR param IN 
    SELECT p.* 
    FROM parameters p
    WHERE p.rating_ranges IS NOT NULL
  LOOP
    -- Get value for this parameter
    value := datapoint_values->>(param.shortName);
    
    -- Skip if no value
    CONTINUE WHEN value IS NULL;
    
    -- Calculate rating
    rating := calculate_parameter_rating(
      param.shortName,
      value,
      param.rating_ranges
    );

    -- Add rating if calculated
    IF rating IS NOT NULL THEN
      ratings := ratings || jsonb_build_object(param.shortName, rating);
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

-- Function to recalculate all existing datapoint ratings
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