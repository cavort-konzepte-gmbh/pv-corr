/*
  # Fix Project RLS and Triggers

  1. Changes
    - Drop and recreate all project-related policies
    - Ensure proper trigger function for user_projects
    - Add security definer to critical functions
    - Simplify policy checks
  
  2. Security
    - Enable RLS on all relevant tables
    - Ensure proper authentication checks
    - Maintain data integrity with triggers
*/

-- Drop existing policies and triggers
DROP POLICY IF EXISTS "projects_select_policy" ON projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON projects;
DROP POLICY IF EXISTS "projects_update_policy" ON projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON projects;
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
CREATE POLICY "Enable read for users own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_projects
      WHERE user_id = auth.uid()
      AND project_id = projects.id
    )
  );

CREATE POLICY "Enable insert for authenticated users"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for users own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_projects
      WHERE user_id = auth.uid()
      AND project_id = projects.id
    )
  );

CREATE POLICY "Enable delete for users own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_projects
      WHERE user_id = auth.uid()
      AND project_id = projects.id
    )
  );

-- Ensure RLS is enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.user_projects TO authenticated;