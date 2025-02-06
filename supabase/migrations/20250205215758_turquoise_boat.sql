/*
  # Make parameter unit optional

  1. Changes
    - Make unit column nullable in parameters table
    - Update parameter_unit type to include null value
    - Add check constraint to ensure valid values

  2. Security
    - Maintains existing RLS policies
*/

-- Drop existing check constraint if it exists
ALTER TABLE parameters DROP CONSTRAINT IF EXISTS parameters_unit_check;

-- Make unit column nullable
ALTER TABLE parameters ALTER COLUMN unit DROP NOT NULL;

-- Add check constraint to ensure unit is either NULL or a valid value
ALTER TABLE parameters ADD CONSTRAINT parameters_unit_check
  CHECK (
    unit IS NULL OR
    unit IN (
      'Ohm.m',
      'Ohm.cm',
      'mmol/kg',
      'mg/kg',
      'g/mol',
      'mg/mmol',
      '%',
      'ppm',
      'V',
      'mV',
      'A',
      'mA'
    )
  );