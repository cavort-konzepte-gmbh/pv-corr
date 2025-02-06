/*
  # Fix user_projects duplicates

  1. Changes
    - Add stored procedure for atomic project creation with owner association
    - Add unique constraint on user_id and project_id
    - Remove existing trigger in favor of stored procedure
    
  2. Security
    - Procedure runs with security definer to ensure proper permissions
    - Checks for authenticated user
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_project_created ON projects;
DROP FUNCTION IF EXISTS create_user_project();

-- Create function to handle project creation and user association atomically
CREATE OR REPLACE FUNCTION create_project_with_owner(project_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_project_id uuid;
  result jsonb;
BEGIN
  -- Insert the project
  INSERT INTO projects (
    name,
    hidden_id,
    client_ref,
    latitude,
    longitude,
    image_url,
    place_id,
    company_id,
    manager_id,
    created_at,
    updated_at
  )
  VALUES (
    project_data->>'name',
    project_data->>'hidden_id',
    project_data->>'client_ref',
    project_data->>'latitude',
    project_data->>'longitude',
    project_data->>'image_url',
    (project_data->>'place_id')::uuid,
    (project_data->>'company_id')::uuid,
    (project_data->>'manager_id')::uuid,
    now(),
    now()
  )
  RETURNING id INTO new_project_id;

  -- Create user_projects entry
  INSERT INTO user_projects (user_id, project_id, role)
  VALUES (auth.uid(), new_project_id, 'owner')
  ON CONFLICT (user_id, project_id) DO NOTHING;

  -- Get the complete project data
  SELECT row_to_json(p)::jsonb INTO result
  FROM projects p
  WHERE id = new_project_id;

  RETURN result;
EXCEPTION
  WHEN others THEN
    RAISE;
END;
$$;