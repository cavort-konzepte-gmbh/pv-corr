-- Drop existing policies
DROP POLICY IF EXISTS "places_select_policy" ON places;
DROP POLICY IF EXISTS "places_insert_policy" ON places;
DROP POLICY IF EXISTS "places_update_policy" ON places;
DROP POLICY IF EXISTS "places_delete_policy" ON places;

-- Create new policies that allow all authenticated users to access places
CREATE POLICY "places_select_policy"
  ON places FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "places_insert_policy"
  ON places FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "places_update_policy"
  ON places FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "places_delete_policy"
  ON places FOR DELETE
  TO authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE places ENABLE ROW LEVEL SECURITY;