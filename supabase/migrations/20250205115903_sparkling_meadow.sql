/*
  # Fix project RLS policies

  1. Changes
    - Adds automatic user_projects entry creation via trigger
    - Updates project creation policy to ensure proper user association
    - Fixes user_projects policies to allow proper access

  2. Security
    - Ensures every project is associated with a user
    - Maintains proper access control
*/

-- Create function to automatically create user_projects entry
CREATE OR REPLACE FUNCTION create_user_project()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_projects (user_id, project_id, role)
  VALUES (auth.uid(), NEW.id, 'owner');
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create trigger to automatically create user_projects entry
DROP TRIGGER IF EXISTS on_project_created ON projects;
CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_user_project();

-- Update project creation policy
DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Update user_projects policies
DROP POLICY IF EXISTS "Users can manage their own project assignments" ON user_projects;
CREATE POLICY "Users can manage their own project assignments"
  ON user_projects
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());