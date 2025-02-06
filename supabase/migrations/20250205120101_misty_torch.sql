/*
  # Fix project creation and RLS policies

  1. Changes
    - Simplifies project creation policy
    - Updates trigger function to properly handle user association
    - Ensures proper RLS policy chain for project access

  2. Security
    - Maintains proper access control
    - Ensures every project is associated with a user
*/

-- Drop existing policies and triggers
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can manage their own project assignments" ON user_projects;
DROP TRIGGER IF EXISTS on_project_created ON projects;
DROP FUNCTION IF EXISTS create_user_project();

-- Create improved user project association function
CREATE OR REPLACE FUNCTION create_user_project()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_projects (user_id, project_id, role)
  VALUES (auth.uid(), NEW.id, 'owner');
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create trigger for automatic user association
CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_user_project();

-- Update project creation policy
CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Update user_projects policy
CREATE POLICY "Users can manage their own project assignments"
  ON user_projects
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());