/*
  # Update database policies to allow write access

  1. Changes
    - Update RLS policies for all tables to allow write access for authenticated users
    - Maintain basic authentication check for security
    - Enable full CRUD operations for authenticated users

  2. Security
    - Still requires authentication
    - Maintains row-level security
    - Preserves audit trails and timestamps
*/

-- Update places policies
DROP POLICY IF EXISTS "Users can update places" ON places;
DROP POLICY IF EXISTS "Users can delete places" ON places;

CREATE POLICY "Users can update places"
  ON places
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete places"
  ON places
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Update people policies
DROP POLICY IF EXISTS "Users can update people" ON people;
DROP POLICY IF EXISTS "Users can delete people" ON people;

CREATE POLICY "Users can update people"
  ON people
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete people"
  ON people
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Update companies policies
DROP POLICY IF EXISTS "Users can update companies" ON companies;
DROP POLICY IF EXISTS "Users can delete companies" ON companies;

CREATE POLICY "Users can update companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete companies"
  ON companies
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Update fields policies
DROP POLICY IF EXISTS "Users can update fields in their projects" ON fields;
DROP POLICY IF EXISTS "Users can delete fields in their projects" ON fields;

CREATE POLICY "Users can update fields"
  ON fields
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete fields"
  ON fields
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Update gates policies
DROP POLICY IF EXISTS "Users can update gates in their projects" ON gates;
DROP POLICY IF EXISTS "Users can delete gates in their projects" ON gates;

CREATE POLICY "Users can update gates"
  ON gates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete gates"
  ON gates
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Update zones policies
DROP POLICY IF EXISTS "Users can update zones in their projects" ON zones;
DROP POLICY IF EXISTS "Users can delete zones in their projects" ON zones;

CREATE POLICY "Users can update zones"
  ON zones
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete zones"
  ON zones
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Update projects policies
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

CREATE POLICY "Users can update projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);