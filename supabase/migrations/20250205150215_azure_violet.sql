/*
  # Fix Places RLS Policies
  
  1. Changes
    - Drop all existing policies for places table
    - Create new simplified policies that properly handle authentication
    - Enable full access for authenticated users
    - Enable read-only access for anonymous users
  
  2. Security
    - Maintains security by requiring authentication for write operations
    - Allows public read access for better usability
*/

-- Drop all existing policies for places
DROP POLICY IF EXISTS "Enable read access for everyone" ON places;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON places;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON places;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON places;

-- Create new policies with proper authentication checks
CREATE POLICY "Enable read access for all users"
  ON places FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable write access for authenticated users only"
  ON places FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users only"
  ON places FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users only"
  ON places FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');