/*
  # Update RLS policies for substructures management

  1. Changes
    - Drop existing restrictive policies
    - Add new policies allowing authenticated users to perform CRUD operations
    - Keep admin-only restrictions for deletions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access for all authenticated users" ON manufacturers;
DROP POLICY IF EXISTS "Allow full access for admin users" ON manufacturers;
DROP POLICY IF EXISTS "Allow read access for all authenticated users" ON substructure_systems;
DROP POLICY IF EXISTS "Allow full access for admin users" ON substructure_systems;
DROP POLICY IF EXISTS "Allow read access for all authenticated users" ON substructure_versions;
DROP POLICY IF EXISTS "Allow full access for admin users" ON substructure_versions;
DROP POLICY IF EXISTS "Allow read access for all authenticated users" ON media_assets;
DROP POLICY IF EXISTS "Allow full access for admin users" ON media_assets;

-- Create new policies for manufacturers
CREATE POLICY "Enable read access for all users" ON manufacturers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for all users" ON manufacturers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON manufacturers
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for admin users" ON manufacturers
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

-- Create new policies for substructure_systems
CREATE POLICY "Enable read access for all users" ON substructure_systems
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for all users" ON substructure_systems
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON substructure_systems
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for admin users" ON substructure_systems
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

-- Create new policies for substructure_versions
CREATE POLICY "Enable read access for all users" ON substructure_versions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for all users" ON substructure_versions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON substructure_versions
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for admin users" ON substructure_versions
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

-- Create new policies for media_assets
CREATE POLICY "Enable read access for all users" ON media_assets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for all users" ON media_assets
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON media_assets
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for admin users" ON media_assets
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));