/*
  # Fix Places RLS Policies - Final Version
  
  1. Changes
    - Drop all existing policies
    - Create new simplified policies with minimal conditions
    - Enable full access for authenticated users
  
  2. Security
    - Maintains basic security through authentication
    - Simplifies policy logic to ensure reliable access
*/

-- Drop all existing policies for places
DROP POLICY IF EXISTS "Enable read access for all users" ON places;
DROP POLICY IF EXISTS "Enable write access for authenticated users only" ON places;
DROP POLICY IF EXISTS "Enable update access for authenticated users only" ON places;
DROP POLICY IF EXISTS "Enable delete access for authenticated users only" ON places;

-- Create new simplified policies
CREATE POLICY "places_select_policy"
  ON places FOR SELECT
  USING (true);

CREATE POLICY "places_insert_policy"
  ON places FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "places_update_policy"
  ON places FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "places_delete_policy"
  ON places FOR DELETE
  TO authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE places ENABLE ROW LEVEL SECURITY;