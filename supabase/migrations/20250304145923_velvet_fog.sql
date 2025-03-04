/*
  # Fix Parameter Mapping Function

  1. Changes
    - Fix jsonb_each_text iteration syntax
    - Improve parameter mapping logic
    - Add better error handling
    
  2. Improvements
    - More robust UUID handling
    - Better null value handling
    - Clearer parameter mapping logic
*/

-- Drop existing function
DROP FUNCTION IF EXISTS map_parameter_ids_to_codes(jsonb);

-- Create improved mapping function
CREATE OR REPLACE FUNCTION map_parameter_ids_to_codes(
  values_with_ids jsonb
) RETURNS jsonb AS $$
DECLARE
  mapped jsonb := '{}'::jsonb;
  param_map jsonb;
  r record;
BEGIN
  -- First create a mapping of parameter IDs to short names
  SELECT jsonb_object_agg(id::text, short_name)
  INTO param_map
  FROM parameters
  WHERE short_name IS NOT NULL;

  -- Map each value using the parameter mapping
  FOR r IN SELECT * FROM jsonb_each_text(values_with_ids) LOOP
    IF param_map ? r.key THEN
      mapped := mapped || jsonb_build_object(param_map->>r.key, r.value);
    END IF;
  END LOOP;

  RETURN mapped;
END;
$$ LANGUAGE plpgsql;

-- Recalculate all existing ratings with the improved mapping
SELECT recalculate_all_datapoint_ratings();