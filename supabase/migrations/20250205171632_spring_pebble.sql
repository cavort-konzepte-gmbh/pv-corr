/*
  # Fix Project RLS Policies

  1. Changes
    - Drop existing project policies
    - Create new simplified policies with proper security checks
    - Add proper grants for authenticated users
    - Fix user project association trigger

  2. Security
    - Enable RLS on projects table
    - Add policies for CRUD operations
    - Ensure proper user association
*/

-- Drop existing policies and triggers
DROP POLICY IF EXISTS "Enable read for users own projects" ON projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable update for users own projects" ON projects;
DROP POLICY IF EXISTS "Enable delete for users own projects" ON projects;
DROP TRIGGER IF EXISTS on_project_created ON projects;
DROP FUNCTION IF EXISTS create_user_project();

-- Create improved user project association function
CREATE OR REPLACE FUNCTION create_user_project()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO user_projects (user_id, project_id, role)
  VALUES (auth.uid(), NEW.id, 'owner');
  RETURN NEW;
END;
$$;

-- Create trigger for automatic user association
CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_user_project();

-- Create simplified policies with proper checks
CREATE POLICY "projects_select"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_projects
      WHERE user_id = auth.uid()
      AND project_id = projects.id
    )
  );

CREATE POLICY "projects_insert"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "projects_update"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_projects
      WHERE user_id = auth.uid()
      AND project_id = projects.id
      AND role = 'owner'
    )
  );

CREATE POLICY "projects_delete"
  ON projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_projects
      WHERE user_id = auth.uid()
      AND project_id = projects.id
      AND role = 'owner'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;