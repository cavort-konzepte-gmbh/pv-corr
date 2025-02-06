/*
  # Fix Project RLS Policies

  1. Changes
    - Drop existing project policies
    - Create new simplified policies that properly handle authentication
    - Ensure proper access control for project operations
  
  2. Security
    - Enable RLS on projects table
    - Add policies for SELECT, INSERT, UPDATE, DELETE operations
    - Ensure authenticated users can manage their projects
*/

-- Drop existing project policies
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update projects" ON projects;
DROP POLICY IF EXISTS "Users can delete projects" ON projects;

-- Create new simplified policies
CREATE POLICY "projects_select_policy"
  ON projects FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT project_id 
      FROM user_projects 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "projects_insert_policy"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "projects_update_policy"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT project_id 
      FROM user_projects 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "projects_delete_policy"
  ON projects FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT project_id 
      FROM user_projects 
      WHERE user_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;