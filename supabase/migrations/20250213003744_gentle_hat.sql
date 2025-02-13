/*
  # Update RLS policies for manufacturers table

  1. Changes
    - Drop existing policies
    - Add new policies that allow authenticated users to perform all operations
    - Keep admin-only restrictions for sensitive operations

  2. Security
    - Enable RLS
    - Allow all authenticated users to read and insert
    - Restrict update/delete to admin users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access for all authenticated users" ON manufacturers;
DROP POLICY IF EXISTS "Allow full access for admin users" ON manufacturers;

-- Create new policies
CREATE POLICY "Enable read access for all users" ON manufacturers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for all users" ON manufacturers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for admin users" ON manufacturers
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users))
  WITH CHECK (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

CREATE POLICY "Enable delete for admin users" ON manufacturers
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));