/*
  # Fix Project Creation RLS

  1. Security Changes
    - Modify project creation policy to work with trigger
    - Ensure proper order of operations for project creation
    - Fix permission issues with user_projects table
  
  2. Changes
    - Drop and recreate project policies with correct timing
    - Update trigger to run with proper permissions
    - Grant explicit permissions on user_projects table
*/

-- Drop existing policies
DROP POLICY IF EXISTS "allow_select_own_projects_20250205" ON projects;
DROP POLICY IF EXISTS "allow_insert_projects_20250205" ON projects;
DROP POLICY IF EXISTS "allow_update_own_projects_20250205" ON projects;
DROP POLICY IF EXISTS "allow_delete_own_projects_20250205" ON projects;

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_project_created ON projects;
DROP FUNCTION IF EXISTS create_user_project();

-- Create improved user project association function with proper permissions
CREATE OR REPLACE FUNCTION create_user_project()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert the user-project association
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

-- Create policies with proper checks
CREATE POLICY "projects_select_policy"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_projects
      WHERE user_id = auth.uid()
      AND project_id = projects.id
    )
  );

CREATE POLICY "projects_insert_policy"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "projects_update_policy"
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

CREATE POLICY "projects_delete_policy"
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

-- Create policies for user_projects table
CREATE POLICY "user_projects_select_policy"
  ON user_projects FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_projects_insert_policy"
  ON user_projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.user_projects TO authenticated;