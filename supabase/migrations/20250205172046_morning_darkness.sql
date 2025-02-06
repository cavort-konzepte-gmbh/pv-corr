/*
  # Update Project RLS Policies

  1. Security Changes
    - Drop existing policies and recreate with proper ownership checks
    - Ensure automatic user-project association on creation
    - Grant proper permissions to authenticated users
  
  2. Changes
    - Drop all existing policies
    - Create new policies for CRUD operations
    - Set up trigger for automatic project ownership
*/

-- Drop existing policies
DROP POLICY IF EXISTS "projects_select" ON projects;
DROP POLICY IF EXISTS "projects_insert" ON projects;
DROP POLICY IF EXISTS "projects_update" ON projects;
DROP POLICY IF EXISTS "projects_delete" ON projects;
DROP POLICY IF EXISTS "Enable read for users own projects" ON projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable update for users own projects" ON projects;
DROP POLICY IF EXISTS "Enable delete for users own projects" ON projects;

-- Drop existing trigger and function
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

-- Create new policies with unique names
CREATE POLICY "allow_select_own_projects_20250205"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_projects
      WHERE user_id = auth.uid()
      AND project_id = projects.id
    )
  );

CREATE POLICY "allow_insert_projects_20250205"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_update_own_projects_20250205"
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

CREATE POLICY "allow_delete_own_projects_20250205"
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