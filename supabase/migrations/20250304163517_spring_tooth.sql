/*
  # Add rating logic code to parameters table
  
  1. New Fields
    - `rating_logic_code` - Text field to store the JavaScript rating function code
  
  2. Changes
    - Add rating_logic_code column to parameters table
    - Update existing parameters with their rating logic code
*/

-- Add rating_logic_code column
ALTER TABLE parameters
ADD COLUMN IF NOT EXISTS rating_logic_code text;

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
  END
WHERE short_name IN ('Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6', 'Z7', 'Z8', 'Z9', 'Z10', 'Z15');