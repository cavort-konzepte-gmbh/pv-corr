/*
  # Add rating logic constraint
  
  1. Changes
    - Add rating_logic_code column to store JavaScript rating function
    - Add rating_logic_test_cases column to store test cases
    - Add simpler constraints that don't use subqueries
*/

-- Add rating logic columns
ALTER TABLE parameters 
ADD COLUMN IF NOT EXISTS rating_logic_code text,
ADD COLUMN IF NOT EXISTS rating_logic_test_cases jsonb DEFAULT '[]'::jsonb;

-- Add basic constraint to ensure test cases are an array
ALTER TABLE parameters
ADD CONSTRAINT rating_logic_test_cases_array_check 
CHECK (jsonb_typeof(rating_logic_test_cases) = 'array');

-- Update existing parameters with their rating logic code
UPDATE parameters
SET rating_logic_code = 
  CASE short_name
    WHEN 'Z1' THEN 
      'if (value === "impurities") return -12;
       const num = parseFloat(value);
       if (num < 10) return 4;
       if (num >= 10 && num <= 30) return 2;
       if (num > 30 && num <= 50) return 0;
       if (num > 50 && num <= 80) return -2;
       if (num > 80) return -4;
       return 0;'
    WHEN 'Z2' THEN
      'const num = parseFloat(value);
       if (num > 500) return 4;
       if (num >= 200 && num <= 500) return 2;
       if (num >= 50 && num < 200) return 0;
       if (num >= 20 && num < 50) return -2;
       if (num >= 10 && num < 20) return -4;
       if (num < 10) return -6;
       return 0;'
    WHEN 'Z3' THEN
      'const num = parseFloat(value);
       if (num < 20) return 0;
       if (num >= 20 && num <= 40) return -1;
       if (num > 40) return -2;
       return 0;'
    WHEN 'Z4' THEN
      'const num = parseFloat(value);
       if (num < 4) return -2;
       if (num >= 4 && num < 5) return -1;
       if (num >= 5 && num <= 8) return 0;
       if (num > 8 && num <= 9) return -1;
       if (num > 9) return -2;
       return 0;'
    WHEN 'Z5' THEN
      'const num = parseFloat(value);
       if (num < 2) return 0;
       if (num >= 2 && num < 10) return -1;
       if (num >= 10 && num < 20) return -2;
       if (num >= 20) return -3;
       return 0;'
    WHEN 'Z6' THEN
      'const num = parseFloat(value);
       if (num < 2.5) return 0;
       if (num >= 2.5 && num < 5) return -2;
       if (num >= 5 && num < 10) return -4;
       if (num >= 10 && num < 20) return -6;
       if (num >= 20 && num < 30) return -8;
       if (num >= 30) return -10;
       return 0;'
    WHEN 'Z7' THEN
      'const num = parseFloat(value);
       if (num < 5) return 0;
       if (num >= 5 && num <= 10) return -3;
       if (num > 10) return -6;
       return 0;'
    WHEN 'Z8' THEN
      'const num = parseFloat(value);
       if (num < 2) return 0;
       if (num >= 2 && num < 5) return -1;
       if (num >= 5 && num <= 10) return -2;
       if (num > 10) return -3;
       return 0;'
    WHEN 'Z9' THEN
      'const num = parseFloat(value);
       if (num < 3) return 0;
       if (num >= 3 && num < 10) return -1;
       if (num >= 10 && num < 30) return -2;
       if (num >= 30 && num <= 100) return -3;
       if (num > 100) return -4;
       return 0;'
    WHEN 'Z10' THEN
      'if (value === "never") return 0;
       if (value === "constant") return -1;
       if (value === "intermittent") return -2;
       return 0;'
    WHEN 'Z15' THEN
      'const num = parseFloat(value);
       if (num < -0.5) return 0;
       if (num >= -0.5 && num < -0.4) return -3;
       if (num >= -0.4 && num <= -0.3) return -8;
       if (num > -0.3) return -10;
       return 0;'
  END,
  rating_logic_test_cases = 
  CASE short_name
    WHEN 'Z1' THEN '[
      {"input": "5", "expected": 4},
      {"input": "15", "expected": 2},
      {"input": "35", "expected": 0},
      {"input": "60", "expected": -2},
      {"input": "90", "expected": -4},
      {"input": "impurities", "expected": -12}
    ]'::jsonb
    WHEN 'Z2' THEN '[
      {"input": "600", "expected": 4},
      {"input": "300", "expected": 2},
      {"input": "100", "expected": 0},
      {"input": "30", "expected": -2},
      {"input": "15", "expected": -4},
      {"input": "5", "expected": -6}
    ]'::jsonb
    WHEN 'Z3' THEN '[
      {"input": "15", "expected": 0},
      {"input": "30", "expected": -1},
      {"input": "50", "expected": -2}
    ]'::jsonb
    WHEN 'Z4' THEN '[
      {"input": "3", "expected": -2},
      {"input": "4.5", "expected": -1},
      {"input": "6", "expected": 0},
      {"input": "8.5", "expected": -1},
      {"input": "10", "expected": -2}
    ]'::jsonb
    WHEN 'Z5' THEN '[
      {"input": "1", "expected": 0},
      {"input": "5", "expected": -1},
      {"input": "15", "expected": -2},
      {"input": "25", "expected": -3}
    ]'::jsonb
    WHEN 'Z6' THEN '[
      {"input": "2", "expected": 0},
      {"input": "3", "expected": -2},
      {"input": "7", "expected": -4},
      {"input": "15", "expected": -6},
      {"input": "25", "expected": -8},
      {"input": "35", "expected": -10}
    ]'::jsonb
    WHEN 'Z7' THEN '[
      {"input": "3", "expected": 0},
      {"input": "7", "expected": -3},
      {"input": "15", "expected": -6}
    ]'::jsonb
    WHEN 'Z8' THEN '[
      {"input": "1", "expected": 0},
      {"input": "3", "expected": -1},
      {"input": "7", "expected": -2},
      {"input": "15", "expected": -3}
    ]'::jsonb
    WHEN 'Z9' THEN '[
      {"input": "2", "expected": 0},
      {"input": "5", "expected": -1},
      {"input": "20", "expected": -2},
      {"input": "50", "expected": -3},
      {"input": "150", "expected": -4}
    ]'::jsonb
    WHEN 'Z10' THEN '[
      {"input": "never", "expected": 0},
      {"input": "constant", "expected": -1},
      {"input": "intermittent", "expected": -2}
    ]'::jsonb
    WHEN 'Z15' THEN '[
      {"input": "-0.6", "expected": 0},
      {"input": "-0.45", "expected": -3},
      {"input": "-0.35", "expected": -8},
      {"input": "-0.2", "expected": -10}
    ]'::jsonb
  END
WHERE short_name IN ('Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6', 'Z7', 'Z8', 'Z9', 'Z10', 'Z15');