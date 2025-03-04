/*
  # Add order number column to parameters table
  
  1. Changes
    - Add order_number column to parameters table
    - Add default value of 0
    - Add NOT NULL constraint
    - Update existing rows to have sequential order numbers
*/

-- Add order_number column
ALTER TABLE parameters
ADD COLUMN order_number integer NOT NULL DEFAULT 0;

-- Update existing rows with sequential numbers
WITH numbered_rows AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at) * 10 as new_order
  FROM parameters
)
UPDATE parameters p
SET order_number = nr.new_order
FROM numbered_rows nr
WHERE p.id = nr.id;