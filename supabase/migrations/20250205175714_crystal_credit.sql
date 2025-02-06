/*
  # Fix User Projects Duplicate Key Issue

  1. Changes
    - Drop existing trigger and function
    - Create new improved function with duplicate check
    - Recreate trigger with proper error handling

  2. Security
    - Maintain existing RLS policies
    - Keep security definer setting for proper permissions
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_project_created ON projects;
DROP FUNCTION IF EXISTS create_user_project();

-- Create improved user project association function with duplicate check
CREATE OR REPLACE FUNCTION create_user_project()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if association already exists
  IF NOT EXISTS (
    SELECT 1 FROM user_projects 
    WHERE user_id = auth.uid() 
    AND project_id = NEW.id
  ) THEN
    -- Only insert if no existing association
    INSERT INTO user_projects (user_id, project_id, role)
    VALUES (auth.uid(), NEW.id, 'owner');
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If we somehow still get a duplicate, just continue
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_user_project();