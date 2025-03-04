/*
  # Update order numbers to support decimal values

  1. Changes
    - Modify order_number column to use numeric type for decimal support
    - Update existing order numbers to use decimal values
    - Add constraint to ensure positive values
*/

-- Change order_number to numeric type to support decimals
ALTER TABLE parameters
ALTER COLUMN order_number TYPE numeric(10,2);

-- Add constraint to ensure positive values
ALTER TABLE parameters
ADD CONSTRAINT order_number_positive CHECK (order_number >= 0);

-- Update existing rows with decimal numbers
WITH numbered_rows AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at) * 10.00 as new_order
  FROM parameters
)
UPDATE parameters p
SET order_number = nr.new_order
FROM numbered_rows nr
WHERE p.id = nr.id;