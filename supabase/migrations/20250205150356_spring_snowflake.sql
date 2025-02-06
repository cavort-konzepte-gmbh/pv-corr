/*
  # Fix Authentication and RLS - Final Version
  
  1. Changes
    - Drop all existing policies
    - Create new simplified policies with proper auth checks
    - Add basic auth trigger
  
  2. Security
    - Ensures proper authentication checks
    - Maintains basic security through RLS
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "places_select_policy" ON places;
DROP POLICY IF EXISTS "places_insert_policy" ON places;
DROP POLICY IF EXISTS "places_update_policy" ON places;
DROP POLICY IF EXISTS "places_delete_policy" ON places;

-- Create auth trigger function
CREATE OR REPLACE FUNCTION public.handle_auth()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE places ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Create trigger for new places
DROP TRIGGER IF EXISTS set_place_user_id ON places;
CREATE TRIGGER set_place_user_id
  BEFORE INSERT ON places
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth();

-- Create new policies
CREATE POLICY "Enable read for all"
  ON places FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON places FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users"
  ON places FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users"
  ON places FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Ensure RLS is enabled
ALTER TABLE places ENABLE ROW LEVEL SECURITY;