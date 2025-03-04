/*
  # Add Parameter Rating Calculation Logic

  1. Changes
    - Add rating_ranges JSONB column to store parameter-specific rating ranges
    - Add rating_type column to specify how ratings should be calculated
    - Add rating_unit column for parameter units
    - Add rating_code column for parameter codes (Z1, Z2, etc.)
    - Add constraints to ensure valid rating ranges

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns for rating calculation
ALTER TABLE parameters
ADD COLUMN IF NOT EXISTS rating_ranges JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS rating_type text CHECK (rating_type IN ('range', 'selection', 'comparison')),
ADD COLUMN IF NOT EXISTS rating_unit text,
ADD COLUMN IF NOT EXISTS rating_code text;

-- Add constraint to ensure rating_ranges has valid structure
ALTER TABLE parameters
ADD CONSTRAINT rating_ranges_check CHECK (
  (rating_ranges IS NULL) OR
  (jsonb_typeof(rating_ranges) = 'array' AND
   NOT EXISTS (
     SELECT 1
     FROM jsonb_array_elements(rating_ranges) AS range
     WHERE NOT (
       -- Each range must have min, max (optional), and rating fields
       range ? 'min' AND
       range ? 'rating' AND
       -- Rating must be between -12 and 12
       (range->>'rating')::integer BETWEEN -12 AND 12 AND
       -- Min must be numeric or 'impurities', 'never', 'constant', 'intermittent', 'homogenous', 'heterogenous'
       (
         (range->>'min' ~ '^-?\d*\.?\d+$' OR
          range->>'min' IN ('impurities', 'never', 'constant', 'intermittent', 'homogenous', 'heterogenous')
         ) AND
         -- Max must be numeric if present
         (NOT range ? 'max' OR range->>'max' ~ '^-?\d*\.?\d+$')
       )
     )
   )
  )
);

-- Function to calculate rating based on parameter type and value
CREATE OR REPLACE FUNCTION calculate_parameter_rating(
  parameter_id text,
  value text
) RETURNS integer AS $$
DECLARE
  param_record record;
  range_record record;
  numeric_value float;
BEGIN
  -- Get parameter details
  SELECT * INTO param_record
  FROM parameters
  WHERE id = parameter_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Handle special case for Z1 impurities
  IF param_record.rating_code = 'Z1' AND value = 'impurities' THEN
    RETURN -12;
  END IF;

  -- Handle selection type parameters (Z10, Z13)
  IF param_record.rating_type = 'selection' THEN
    FOR range_record IN SELECT * FROM jsonb_array_elements(param_record.rating_ranges) LOOP
      IF range_record->>'min' = value THEN
        RETURN (range_record->>'rating')::integer;
      END IF;
    END FOR;
    RETURN NULL;
  END IF;

  -- Try to convert value to numeric for range comparisons
  BEGIN
    numeric_value := value::float;
  EXCEPTION WHEN others THEN
    RETURN NULL;
  END;

  -- Handle range type parameters
  IF param_record.rating_type = 'range' THEN
    FOR range_record IN 
      SELECT * FROM jsonb_array_elements(param_record.rating_ranges)
      ORDER BY (range_record->>'min')::float
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
  END IF;

  RETURN 0;
END;
$$ LANGUAGE plpgsql;