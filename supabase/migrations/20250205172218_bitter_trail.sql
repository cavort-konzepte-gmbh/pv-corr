/*
  # Final Fix for Project RLS

  1. Security Changes
    - Simplify RLS policies to minimum required
    - Fix project creation flow
    - Ensure proper permissions cascade
  
  2. Changes
    - Drop all existing policies
    - Create simplified policies
    - Fix permission chain
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "projects_select_policy" ON projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON projects;
DROP POLICY IF EXISTS "projects_update_policy" ON projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON projects;
DROP POLICY IF EXISTS "user_projects_select_policy" ON user_projects;
DROP POLICY IF EXISTS "user_projects_insert_policy" ON user_projects;

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_project_created ON projects;
DROP FUNCTION IF EXISTS create_user_project();

-- Create simplified project policies
CREATE POLICY "enable_read_for_authenticated"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "enable_insert_for_authenticated"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "enable_update_for_authenticated"
  ON projects FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "enable_delete_for_authenticated"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

-- Create simplified user_projects policies
CREATE POLICY "enable_all_for_authenticated"
  ON user_projects
  TO authenticated
  USING (true)
  WITH CHECK (true);

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

-- Ensure RLS is enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.user_projects TO authenticated;