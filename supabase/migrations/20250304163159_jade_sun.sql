/*
  # Add rating logic to parameters table
  
  1. New Fields
    - `rating_logic` - JSONB field to store rating ranges and logic
    - `rating_type` - Type of rating calculation (range, selection)
    - `rating_unit` - Unit for the rating values
  
  2. Changes
    - Add validation for rating_logic structure
    - Add helper functions for rating calculations
*/

-- Add new columns for rating logic
ALTER TABLE parameters
ADD COLUMN IF NOT EXISTS rating_logic JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rating_type TEXT CHECK (rating_type IN ('range', 'selection')),
ADD COLUMN IF NOT EXISTS rating_unit TEXT;

-- Add constraint to ensure rating_logic has valid structure
ALTER TABLE parameters
ADD CONSTRAINT rating_logic_check CHECK (
  rating_logic IS NULL OR (
    jsonb_typeof(rating_logic) = 'array' AND
    NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(rating_logic) AS range
      WHERE NOT (
        range ? 'min' AND
        range ? 'rating' AND
        (range->>'rating')::integer BETWEEN -12 AND 12 AND
        (
          -- Min must be numeric or special values
          range->>'min' ~ '^-?\d*\.?\d+$' OR
          range->>'min' IN ('impurities', 'never', 'constant', 'intermittent')
        ) AND
        -- Max must be numeric if present
        (NOT range ? 'max' OR range->>'max' ~ '^-?\d*\.?\d+$')
      )
    )
  )
);

-- Function to calculate rating based on parameter logic
CREATE OR REPLACE FUNCTION calculate_parameter_rating(
  param_id uuid,
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
  WHERE id = param_id;

  IF NOT FOUND OR param_record.rating_logic IS NULL THEN
    RETURN NULL;
  END IF;

  -- Special case for Z1 impurities
  IF param_record.short_name = 'Z1' AND value = 'impurities' THEN
    RETURN -12;
  END IF;

  -- Handle selection type parameters
  IF param_record.rating_type = 'selection' THEN
    FOR range_record IN SELECT * FROM jsonb_array_elements(param_record.rating_logic) LOOP
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
    SELECT * FROM jsonb_array_elements(param_record.rating_logic) AS r
    ORDER BY (r->>'min')::float DESC
  LOOP
    BEGIN
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
      CONTINUE;
    END;
  END LOOP;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Insert example rating logic for Z1-Z10 parameters
INSERT INTO parameters (hidden_id, name, short_name, unit, rating_type, rating_logic) VALUES
(gen_random_uuid(), 'Soil type/Proportion of components that can be sloughed off', 'Z1', '%', 'range', '[
  {"min": "0", "max": "10", "rating": 4},
  {"min": "10", "max": "30", "rating": 2},
  {"min": "30", "max": "50", "rating": 0},
  {"min": "50", "max": "80", "rating": -2},
  {"min": "80", "rating": -4},
  {"min": "impurities", "rating": -12}
]'),
(gen_random_uuid(), 'Specific soil resistivity', 'Z2', 'Ω⋅m', 'range', '[
  {"min": "500", "rating": 4},
  {"min": "200", "max": "500", "rating": 2},
  {"min": "50", "max": "200", "rating": 0},
  {"min": "20", "max": "50", "rating": -2},
  {"min": "10", "max": "20", "rating": -4},
  {"min": "0", "max": "10", "rating": -6}
]'),
(gen_random_uuid(), 'Water content', 'Z3', '%', 'range', '[
  {"min": "0", "max": "20", "rating": 0},
  {"min": "20", "max": "40", "rating": -1},
  {"min": "40", "rating": -2}
]'),
(gen_random_uuid(), 'pH value', 'Z4', '-', 'range', '[
  {"min": "0", "max": "4", "rating": -2},
  {"min": "4", "max": "5", "rating": -1},
  {"min": "5", "max": "8", "rating": 0},
  {"min": "8", "max": "9", "rating": -1},
  {"min": "9", "rating": -2}
]'),
(gen_random_uuid(), 'Buffer capacity', 'Z5', 'ml/kg', 'range', '[
  {"min": "0", "max": "2", "rating": 0},
  {"min": "2", "max": "10", "rating": -1},
  {"min": "10", "max": "20", "rating": -2},
  {"min": "20", "rating": -3}
]'),
(gen_random_uuid(), 'Carbonate content', 'Z6', '%', 'range', '[
  {"min": "0", "max": "1", "rating": -2},
  {"min": "1", "max": "5", "rating": -1},
  {"min": "5", "max": "10", "rating": 0},
  {"min": "10", "rating": 1}
]'),
(gen_random_uuid(), 'Sulphate reducing bacteria/Sulphide content', 'Z7', 'mg/kg', 'range', '[
  {"min": "0", "max": "5", "rating": 0},
  {"min": "5", "max": "10", "rating": -3},
  {"min": "10", "rating": -6}
]'),
(gen_random_uuid(), 'Sulphate content', 'Z8', 'mmol/kg', 'range', '[
  {"min": "0", "max": "2", "rating": 0},
  {"min": "2", "max": "5", "rating": -1},
  {"min": "5", "max": "10", "rating": -2},
  {"min": "10", "rating": -3}
]'),
(gen_random_uuid(), 'Neutral salts/Chlorides and sulphates in aqueous extract', 'Z9', 'mmol/kg', 'range', '[
  {"min": "0", "max": "3", "rating": 0},
  {"min": "3", "max": "10", "rating": -1},
  {"min": "10", "max": "30", "rating": -2},
  {"min": "30", "max": "100", "rating": -3},
  {"min": "100", "rating": -4}
]'),
(gen_random_uuid(), 'Location of the object in relation to the groundwater', 'Z10', '-', 'selection', '[
  {"min": "never", "rating": 0},
  {"min": "constant", "rating": -1},
  {"min": "intermittent", "rating": -2}
]'),
(gen_random_uuid(), 'Presence of foreign cathodes', 'Z15', 'V', 'range', '[
  {"min": "-0.5", "rating": 0},
  {"min": "-0.4", "max": "-0.3", "rating": -8},
  {"min": "-0.3", "rating": -10}
]')
ON CONFLICT DO NOTHING;