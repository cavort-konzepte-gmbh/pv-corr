/*
  # Fix User Projects Schema and Trigger

  1. Changes
    - Add UUID id column if missing
    - Add unique constraint for user_id and project_id
    - Update trigger function with proper error handling
    - Add indexes for performance

  2. Security
    - Maintain existing RLS policies
    - Keep security definer setting for proper permissions
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_project_created ON projects;
DROP FUNCTION IF EXISTS create_user_project();

-- Add id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_projects' AND column_name = 'id'
  ) THEN
    -- First drop the existing primary key if it exists
    ALTER TABLE user_projects DROP CONSTRAINT IF EXISTS user_projects_pkey;
    
    -- Then add the id column
    ALTER TABLE user_projects 
      ADD COLUMN id uuid DEFAULT gen_random_uuid(),
      ALTER COLUMN id SET NOT NULL;
      
    -- Add the primary key constraint
    ALTER TABLE user_projects ADD CONSTRAINT user_projects_pkey PRIMARY KEY (id);
  END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_projects_user_id_project_id_key'
  ) THEN
    ALTER TABLE user_projects 
      ADD CONSTRAINT user_projects_user_id_project_id_key 
      UNIQUE (user_id, project_id);
  END IF;
END $$;

-- Create improved user project association function
CREATE OR REPLACE FUNCTION create_user_project()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Insert the association if it doesn't exist
  INSERT INTO user_projects (user_id, project_id, role)
  VALUES (v_user_id, NEW.id, 'owner')
  ON CONFLICT (user_id, project_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If we somehow still get a duplicate, just continue
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Create trigger
CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_user_project();

-- Create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'user_projects' AND indexname = 'idx_user_projects_user_id'
  ) THEN
    CREATE INDEX idx_user_projects_user_id ON user_projects(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'user_projects' AND indexname = 'idx_user_projects_project_id'
  ) THEN
    CREATE INDEX idx_user_projects_project_id ON user_projects(project_id);
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own project assignments" ON user_projects;
DROP POLICY IF EXISTS "Users can manage their own project assignments" ON user_projects;

-- Create RLS policies
CREATE POLICY "Users can view their own project assignments"
  ON user_projects FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own project assignments"
  ON user_projects FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());