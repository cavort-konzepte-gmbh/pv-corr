/*
  # Update people table schema
  
  1. Changes
    - Remove values JSONB column
    - Add individual columns for all person fields
    - Migrate existing data to new columns
    
  2. New Columns
    - salutation (text)
    - title (text)
    - first_name (text)
    - last_name (text) 
    - email (text)
    - phone (text)
*/

-- Create new columns
ALTER TABLE people
  ADD COLUMN salutation text,
  ADD COLUMN title text,
  ADD COLUMN first_name text,
  ADD COLUMN last_name text,
  ADD COLUMN email text,
  ADD COLUMN phone text;

-- Migrate existing data
DO $$ 
BEGIN
  UPDATE people
  SET
    salutation = values->>'salutation',
    title = values->>'title',
    first_name = values->>'firstName',
    last_name = values->>'lastName',
    email = values->>'email',
    phone = values->>'phone';
END $$;

-- Make required fields non-nullable
ALTER TABLE people
  ALTER COLUMN salutation SET NOT NULL,
  ALTER COLUMN first_name SET NOT NULL,
  ALTER COLUMN last_name SET NOT NULL,
  ALTER COLUMN email SET NOT NULL;

-- Drop old values column
ALTER TABLE people DROP COLUMN values;

-- Add indexes for commonly queried fields
CREATE INDEX idx_people_email ON people(email);
CREATE INDEX idx_people_names ON people(first_name, last_name);

-- Add unique constraint on email
ALTER TABLE people ADD CONSTRAINT people_email_unique UNIQUE (email);