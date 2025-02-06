-- Drop existing update policy
DROP POLICY IF EXISTS "places_update_policy" ON places;

-- Create new simplified update policy
CREATE POLICY "places_update_policy"
  ON places FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add missing house_number column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'house_number'
  ) THEN
    ALTER TABLE places ADD COLUMN house_number text;
  END IF;
END $$;