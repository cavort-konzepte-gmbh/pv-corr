/*
  # Update places table policies

  1. Changes
    - Add policies for full CRUD operations on places table
    - Enable anonymous access for reading places
    - Allow authenticated users to create/update/delete places

  2. Security
    - Public read access
    - Write access requires authentication
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all places" ON places;
DROP POLICY IF EXISTS "Users can create places" ON places;
DROP POLICY IF EXISTS "Users can update places" ON places;
DROP POLICY IF EXISTS "Users can delete places" ON places;

-- Create new policies
CREATE POLICY "Anyone can view places"
  ON places
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create places"
  ON places
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update places"
  ON places
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete places"
  ON places
  FOR DELETE
  TO authenticated
  USING (true);