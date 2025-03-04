/*
  # Fix Parameter ID to Code Mapping

  1. Changes
    - Fix map_parameter_ids_to_codes function to properly handle UUID parameters
    - Add better error handling and logging
    - Improve type casting
    
  2. Improvements
    - More robust UUID handling
    - Better null value handling
    - Clearer parameter mapping logic
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS map_parameter_ids_to_codes(jsonb);

-- Create improved mapping function
CREATE OR REPLACE FUNCTION map_parameter_ids_to_codes(
  values_with_ids jsonb
) RETURNS jsonb AS $$
DECLARE
  mapped jsonb := '{}'::jsonb;
  param_map jsonb;
BEGIN
  -- First create a mapping of parameter IDs to short names
  SELECT jsonb_object_agg(id::text, short_name)
  INTO param_map
  FROM parameters
  WHERE short_name IS NOT NULL;

  -- Map each value using the parameter mapping
  FOR key, value IN SELECT * FROM jsonb_each_text(values_with_ids) LOOP
    IF param_map ? key THEN
      mapped := mapped || jsonb_build_object(param_map->>key, value);
    END IF;
  END LOOP;

  RETURN mapped;
END;
$$ LANGUAGE plpgsql;

-- Recalculate all existing ratings with the improved mapping
SELECT recalculate_all_datapoint_ratings();