/*
  # Fix policy name conflicts

  1. Changes
    - Drop existing policies with conflicting names
    - Create new policies with unique names for each table
    - Maintain same permissions but with distinct policy names
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON manufacturers;
DROP POLICY IF EXISTS "Enable insert for all users" ON manufacturers;
DROP POLICY IF EXISTS "Enable update for all users" ON manufacturers;
DROP POLICY IF EXISTS "Enable delete for admin users" ON manufacturers;

-- Create new policies for manufacturers with unique names
CREATE POLICY "manufacturers_read" ON manufacturers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "manufacturers_insert" ON manufacturers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "manufacturers_update" ON manufacturers
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "manufacturers_delete" ON manufacturers
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

-- Create new policies for substructure_systems with unique names
CREATE POLICY "systems_read" ON substructure_systems
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "systems_insert" ON substructure_systems
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "systems_update" ON substructure_systems
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "systems_delete" ON substructure_systems
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

-- Create new policies for substructure_versions with unique names
CREATE POLICY "versions_read" ON substructure_versions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "versions_insert" ON substructure_versions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "versions_update" ON substructure_versions
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "versions_delete" ON substructure_versions
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

-- Create new policies for media_assets with unique names
CREATE POLICY "media_read" ON media_assets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "media_insert" ON media_assets
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "media_update" ON media_assets
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "media_delete" ON media_assets
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));