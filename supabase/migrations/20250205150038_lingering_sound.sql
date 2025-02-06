/*
  # Fix places table RLS policies

  1. Changes
    - Drop and recreate all places policies with simpler rules
    - Enable full access for authenticated users
    - Maintain public read access

  2. Security
    - Public read access maintained
    - Authenticated users can perform all operations
*/

-- Drop all existing policies for places
DROP POLICY IF EXISTS "Anyone can view places" ON places;
DROP POLICY IF EXISTS "Authenticated users can create places" ON places;
DROP POLICY IF EXISTS "Authenticated users can update places" ON places;
DROP POLICY IF EXISTS "Authenticated users can delete places" ON places;

-- Create simplified policies
CREATE POLICY "Enable read access for everyone"
  ON places FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON places FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON places FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users"
  ON places FOR DELETE
  TO authenticated
  USING (true);