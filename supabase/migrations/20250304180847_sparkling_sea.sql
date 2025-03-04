-- Update order numbers for parameters
UPDATE parameters p
SET order_number = CASE short_name
  WHEN 'Z1' THEN 1.00
  WHEN 'Z2' THEN 2.00
  WHEN 'Z3' THEN 3.00
  WHEN 'Z4' THEN 4.00
  WHEN 'Z5' THEN 5.00
  WHEN 'Z6' THEN 6.00
  WHEN 'Z7' THEN 7.00
  WHEN 'Z8' THEN 8.00
  WHEN 'Z9' THEN 9.00
  WHEN 'Z10' THEN 10.00
  WHEN 'Z11' THEN 11.00
  WHEN 'Z12' THEN 12.00
  WHEN 'Z13' THEN 13.00
  WHEN 'Z14' THEN 14.00
  WHEN 'Z15' THEN 15.00
  ELSE p.order_number
END;

-- Add index on order_number for faster sorting
CREATE INDEX IF NOT EXISTS parameters_order_number_idx ON parameters (order_number);