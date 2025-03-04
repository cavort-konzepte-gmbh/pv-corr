/*
  # Add parameter fields for impurities and ratings

  1. Changes
    - Add `has_impurities` boolean column to parameters table
    - Add `rating` integer column to parameters table
    - Set default values and constraints

  2. Security
    - Maintain existing RLS policies
*/

-- Add has_impurities column with default false
ALTER TABLE parameters 
ADD COLUMN IF NOT EXISTS has_impurities boolean DEFAULT false;

-- Add rating column that can be null (since not all parameters have ratings)
ALTER TABLE parameters 
ADD COLUMN IF NOT EXISTS rating integer;

-- Add constraint to ensure rating is within reasonable bounds when present
ALTER TABLE parameters 
ADD CONSTRAINT rating_range CHECK (rating IS NULL OR (rating >= -12 AND rating <= 12));