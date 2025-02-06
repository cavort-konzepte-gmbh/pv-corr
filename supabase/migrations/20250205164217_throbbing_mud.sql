-- Drop existing policies
DROP POLICY IF EXISTS "places_select_policy" ON places;
DROP POLICY IF EXISTS "places_insert_policy" ON places;
DROP POLICY IF EXISTS "places_update_policy" ON places;
DROP POLICY IF EXISTS "places_delete_policy" ON places;

-- Create new policies with proper authentication checks
CREATE POLICY "places_select_policy"
  ON places FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "places_insert_policy"
  ON places FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "places_update_policy"
  ON places FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "places_delete_policy"
  ON places FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- Ensure RLS is enabled
ALTER TABLE places ENABLE ROW LEVEL SECURITY;