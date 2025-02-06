-- Drop existing policies for fields
DROP POLICY IF EXISTS "Enable read for authenticated users" ON fields;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON fields;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON fields;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON fields;

-- Create new simplified policies for fields
CREATE POLICY "fields_select_policy"
  ON fields FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "fields_insert_policy"
  ON fields FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "fields_update_policy"
  ON fields FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "fields_delete_policy"
  ON fields FOR DELETE
  TO authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.fields TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;