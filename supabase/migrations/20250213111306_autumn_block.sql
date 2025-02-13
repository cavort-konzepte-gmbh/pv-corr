/*
  # Remove deprecated admin_users table
  
  This migration removes the admin_users table since its functionality has been 
  fully replaced by the user_management table.

  1. Changes
    - Drop admin_users table
    - Update RLS policies to use user_management instead
    - Clean up any remaining references
*/

-- First update any policies that might reference admin_users
DROP POLICY IF EXISTS "Enable delete for admin users" ON manufacturers;
DROP POLICY IF EXISTS "Enable delete for admin users" ON substructure_systems;
DROP POLICY IF EXISTS "Enable delete for admin users" ON substructure_versions;
DROP POLICY IF EXISTS "Enable delete for admin users" ON media_assets;
DROP POLICY IF EXISTS "Enable delete for admin users" ON substructures;

-- Create new policies using user_management
CREATE POLICY "manufacturers_delete" ON manufacturers
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN (
    SELECT email FROM user_management 
    WHERE admin_level IN ('admin', 'super_admin')
  ));

CREATE POLICY "systems_delete" ON substructure_systems
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN (
    SELECT email FROM user_management 
    WHERE admin_level IN ('admin', 'super_admin')
  ));

CREATE POLICY "versions_delete" ON substructure_versions
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN (
    SELECT email FROM user_management 
    WHERE admin_level IN ('admin', 'super_admin')
  ));

CREATE POLICY "media_delete" ON media_assets
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN (
    SELECT email FROM user_management 
    WHERE admin_level IN ('admin', 'super_admin')
  ));

CREATE POLICY "substructures_delete" ON substructures
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN (
    SELECT email FROM user_management 
    WHERE admin_level IN ('admin', 'super_admin')
  ));

-- Finally drop the admin_users table
DROP TABLE IF EXISTS admin_users CASCADE;