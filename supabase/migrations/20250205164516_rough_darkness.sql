-- Drop existing update policy
DROP POLICY IF EXISTS "places_update_policy" ON places;

-- Create new simplified update policy that allows all authenticated users to update
CREATE POLICY "places_update_policy"
  ON places FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure house_number column exists and has proper type
DO $$ 
BEGIN
  -- Drop the column if it exists to ensure clean state
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'house_number'
  ) THEN
    ALTER TABLE places DROP COLUMN house_number;
  END IF;

  -- Add the column back with proper type
  ALTER TABLE places ADD COLUMN house_number text;
END $$;

-- Create index on house_number for better query performance
CREATE INDEX IF NOT EXISTS idx_places_house_number ON places(house_number);