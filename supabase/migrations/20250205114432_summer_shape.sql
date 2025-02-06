/*
  # Project Management Schema

  1. New Tables
    - `user_projects` (junction table for user-project relationships)
      - `user_id` (uuid, foreign key to auth.users)
      - `project_id` (uuid, foreign key to projects)
      - `role` (text)
      - `created_at` (timestamptz)

    - `projects`
      - `id` (uuid, primary key)
      - `name` (text)
      - `hidden_id` (text)
      - `client_ref` (text)
      - `latitude` (text)
      - `longitude` (text)
      - `image_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `fields`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `name` (text)
      - `hidden_id` (text)
      - `latitude` (text)
      - `longitude` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `gates`
      - `id` (uuid, primary key)
      - `field_id` (uuid, foreign key)
      - `name` (text)
      - `hidden_id` (text)
      - `latitude` (text)
      - `longitude` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `zones`
      - `id` (uuid, primary key)
      - `field_id` (uuid, foreign key)
      - `name` (text)
      - `hidden_id` (text)
      - `latitude` (text)
      - `longitude` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data

  3. Indexes
    - Add indexes for foreign keys and frequently queried fields
*/

-- Create user_projects junction table
CREATE TABLE IF NOT EXISTS user_projects (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hidden_id text NOT NULL,
  client_ref text,
  latitude text,
  longitude text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key to user_projects after projects table exists
ALTER TABLE user_projects 
  ADD CONSTRAINT fk_user_projects_project_id 
  FOREIGN KEY (project_id) 
  REFERENCES projects(id) 
  ON DELETE CASCADE;

-- Create fields table
CREATE TABLE IF NOT EXISTS fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  hidden_id text NOT NULL,
  latitude text,
  longitude text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gates table
CREATE TABLE IF NOT EXISTS gates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid REFERENCES fields(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  hidden_id text NOT NULL,
  latitude text NOT NULL,
  longitude text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create zones table
CREATE TABLE IF NOT EXISTS zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid REFERENCES fields(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  hidden_id text NOT NULL,
  latitude text,
  longitude text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fields_project_id ON fields(project_id);
CREATE INDEX IF NOT EXISTS idx_gates_field_id ON gates(field_id);
CREATE INDEX IF NOT EXISTS idx_zones_field_id ON zones(field_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_project_id ON user_projects(project_id);

-- Create RLS policies for projects
CREATE POLICY "Users can view their own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT project_id FROM user_projects WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (id IN (
    SELECT project_id FROM user_projects WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (id IN (
    SELECT project_id FROM user_projects WHERE user_id = auth.uid()
  ));

-- Create RLS policies for user_projects
CREATE POLICY "Users can view their own project assignments"
  ON user_projects
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own project assignments"
  ON user_projects
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policies for fields
CREATE POLICY "Users can view fields of their projects"
  ON fields
  FOR SELECT
  TO authenticated
  USING (project_id IN (
    SELECT project_id FROM user_projects WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create fields in their projects"
  ON fields
  FOR INSERT
  TO authenticated
  WITH CHECK (project_id IN (
    SELECT project_id FROM user_projects WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update fields in their projects"
  ON fields
  FOR UPDATE
  TO authenticated
  USING (project_id IN (
    SELECT project_id FROM user_projects WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete fields in their projects"
  ON fields
  FOR DELETE
  TO authenticated
  USING (project_id IN (
    SELECT project_id FROM user_projects WHERE user_id = auth.uid()
  ));

-- Create RLS policies for gates
CREATE POLICY "Users can view gates in their projects"
  ON gates
  FOR SELECT
  TO authenticated
  USING (field_id IN (
    SELECT id FROM fields WHERE project_id IN (
      SELECT project_id FROM user_projects WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can create gates in their projects"
  ON gates
  FOR INSERT
  TO authenticated
  WITH CHECK (field_id IN (
    SELECT id FROM fields WHERE project_id IN (
      SELECT project_id FROM user_projects WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update gates in their projects"
  ON gates
  FOR UPDATE
  TO authenticated
  USING (field_id IN (
    SELECT id FROM fields WHERE project_id IN (
      SELECT project_id FROM user_projects WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete gates in their projects"
  ON gates
  FOR DELETE
  TO authenticated
  USING (field_id IN (
    SELECT id FROM fields WHERE project_id IN (
      SELECT project_id FROM user_projects WHERE user_id = auth.uid()
    )
  ));

-- Create RLS policies for zones
CREATE POLICY "Users can view zones in their projects"
  ON zones
  FOR SELECT
  TO authenticated
  USING (field_id IN (
    SELECT id FROM fields WHERE project_id IN (
      SELECT project_id FROM user_projects WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can create zones in their projects"
  ON zones
  FOR INSERT
  TO authenticated
  WITH CHECK (field_id IN (
    SELECT id FROM fields WHERE project_id IN (
      SELECT project_id FROM user_projects WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update zones in their projects"
  ON zones
  FOR UPDATE
  TO authenticated
  USING (field_id IN (
    SELECT id FROM fields WHERE project_id IN (
      SELECT project_id FROM user_projects WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete zones in their projects"
  ON zones
  FOR DELETE
  TO authenticated
  USING (field_id IN (
    SELECT id FROM fields WHERE project_id IN (
      SELECT project_id FROM user_projects WHERE user_id = auth.uid()
    )
  ));

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_fields_updated_at
  BEFORE UPDATE ON fields
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_gates_updated_at
  BEFORE UPDATE ON gates
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_zones_updated_at
  BEFORE UPDATE ON zones
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();