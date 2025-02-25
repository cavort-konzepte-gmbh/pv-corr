/*
  # Fix manufacturer permissions

  1. Changes
    - Drop existing RLS policies for manufacturers table
    - Create new policies that allow authenticated users to:
      - Read manufacturers
      - Insert new manufacturers
      - Update manufacturers
      - Delete manufacturers (admin only)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "manufacturers_read" ON manufacturers;
DROP POLICY IF EXISTS "manufacturers_insert" ON manufacturers;
DROP POLICY IF EXISTS "manufacturers_update" ON manufacturers;
DROP POLICY IF EXISTS "manufacturers_delete" ON manufacturers;

-- Create new policies for manufacturers
CREATE POLICY "manufacturers_read" ON manufacturers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "manufacturers_insert" ON manufacturers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "manufacturers_update" ON manufacturers
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "manufacturers_delete" ON manufacturers
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));