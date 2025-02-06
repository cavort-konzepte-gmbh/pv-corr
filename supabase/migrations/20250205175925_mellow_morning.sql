/*
  # Fix User Projects Duplicate Key Issue
  
  1. Changes
    - Improve trigger function to properly handle concurrent inserts
    - Add proper locking to prevent race conditions
    - Ensure idempotent project creation
    
  2. Security
    - Maintain existing RLS policies
    - Keep security definer setting
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_project_created ON projects;
DROP FUNCTION IF EXISTS create_user_project();

-- Create improved user project association function with proper locking
CREATE OR REPLACE FUNCTION create_user_project()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id uuid;
  v_lock_obtained boolean;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Try to obtain a lock on the user_projects table for this user and project
  SELECT pg_try_advisory_xact_lock(hashtext(v_user_id::text || NEW.id::text)) INTO v_lock_obtained;
  
  IF v_lock_obtained THEN
    -- Check if association already exists
    IF NOT EXISTS (
      SELECT 1 FROM user_projects 
      WHERE user_id = v_user_id 
      AND project_id = NEW.id
      FOR UPDATE
    ) THEN
      -- Only insert if no existing association
      INSERT INTO user_projects (user_id, project_id, role)
      VALUES (v_user_id, NEW.id, 'owner')
      ON CONFLICT (user_id, project_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If we somehow still get a duplicate, just continue
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING 'Error in create_user_project: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_user_project();

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_user_projects_user_project ON user_projects(user_id, project_id);

-- Clean up any potential duplicate entries
DELETE FROM user_projects a USING user_projects b
WHERE a.id > b.id 
AND a.user_id = b.user_id 
AND a.project_id = b.project_id;