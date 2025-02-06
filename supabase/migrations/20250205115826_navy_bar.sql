/*
  # Update RLS policies for projects and user_projects

  1. Changes
    - Modified project creation policy to explicitly check for authenticated users
    - Added WITH CHECK clause to user_projects policy
    - Improved security by ensuring proper user authentication

  2. Security
    - Strengthens RLS policies by requiring explicit authentication
    - Ensures consistent access control across all operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can manage their own project assignments" ON user_projects;

-- Create updated policies
CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own project assignments"
  ON user_projects
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());