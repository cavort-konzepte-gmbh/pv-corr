/*
  # Fix Version Management

  1. Changes
     - Remove the 'link' column from version creation
     - Fix version management functionality
*/

-- First, check if the versions table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'versions') THEN
    -- If the table exists, check if the link column exists and add it if it doesn't
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'versions' AND column_name = 'link') THEN
      ALTER TABLE versions ADD COLUMN link text;
    END IF;
  END IF;
END $$;

-- Update the version_auth_is_admin function to be more robust
CREATE OR REPLACE FUNCTION version_auth_is_admin()
RETURNS boolean AS $$
DECLARE
  user_meta jsonb;
  admin_level text;
BEGIN
  -- Try to get from JWT first (faster)
  BEGIN
    admin_level := current_setting('request.jwt.claims', true)::jsonb->>'admin_level';
    IF admin_level IS NOT NULL THEN
      RETURN admin_level IN ('admin', 'super_admin');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- JWT approach failed, try direct DB lookup
  END;

  -- Get user metadata directly from auth.users
  SELECT raw_user_meta_data INTO user_meta
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Check if admin_level is admin or super_admin
  RETURN (user_meta->>'admin_level') IN ('admin', 'super_admin');
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, default to false
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the set_version_as_current function to be more robust
CREATE OR REPLACE FUNCTION set_version_as_current(version_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if user is admin
  IF NOT version_auth_is_admin() THEN
    RAISE EXCEPTION 'Only admins can set current versions';
  END IF;

  -- Update in a transaction to ensure consistency
  BEGIN
    -- First set all versions to not current
    UPDATE versions SET is_current = false;
    
    -- Then set the specified version as current
    UPDATE versions SET is_current = true WHERE id = version_id;
    
    -- Verify the update was successful
    IF NOT EXISTS (SELECT 1 FROM versions WHERE id = version_id AND is_current = true) THEN
      RAISE EXCEPTION 'Failed to set version as current';
    END IF;
  END;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error setting version as current: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;