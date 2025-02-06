/*
  # Update places table schema
  
  1. Changes
    - Add individual columns for all place fields
    - Migrate existing data to new columns
    - Drop values JSONB column
    
  2. New Columns
    - street_number (text)
    - street_name (text)
    - apartment (text)
    - city (text)
    - state (text)
    - postal_code (text)
    - district (text)
    - building (text)
    - room (text)
    - province (text)
*/

-- Create new columns (skipping 'name' since it already exists)
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS street_number text,
  ADD COLUMN IF NOT EXISTS street_name text,
  ADD COLUMN IF NOT EXISTS apartment text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS building text,
  ADD COLUMN IF NOT EXISTS room text,
  ADD COLUMN IF NOT EXISTS province text;

-- Migrate existing data
DO $$ 
BEGIN
  UPDATE places
  SET
    street_number = values->>'street_number',
    street_name = values->>'street_name',
    apartment = values->>'apartment',
    city = values->>'city',
    state = values->>'state',
    postal_code = COALESCE(values->>'postal_code', values->>'zip'),
    district = values->>'district',
    building = values->>'building',
    room = values->>'room',
    province = values->>'province';
END $$;

-- Make required fields non-nullable
ALTER TABLE places
  ALTER COLUMN city SET NOT NULL;

-- Drop old values column
ALTER TABLE places DROP COLUMN values;

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_places_city ON places(city);
CREATE INDEX IF NOT EXISTS idx_places_postal_code ON places(postal_code);

-- Add unique constraint on name within same country
ALTER TABLE places 
  ADD CONSTRAINT places_name_country_unique 
  UNIQUE (name, country);