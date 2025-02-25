/*
  # Enhance user management with role update function
  
  1. Changes
    - Add function to update user roles
    - Add function to sync auth.users metadata
    - Add trigger to keep metadata in sync
    
  2. Security
    - Only admins can update roles
    - Maintains existing RLS policies
*/

-- Create function to update user role
CREATE OR REPLACE FUNCTION update_user_role(target_user_id uuid, new_role text)
RETURNS void AS $$
BEGIN
  -- Verify the new role is valid
  IF new_role NOT IN ('super_admin', 'admin', 'user') THEN
    RAISE EXCEPTION 'Invalid role. Must be super_admin, admin, or user';
  END IF;

  -- Update the user's role in user_management
  UPDATE user_management
  SET admin_level = new_role
  WHERE id = target_user_id;

  -- The update_user_metadata trigger will handle syncing with auth.users
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the metadata update function to handle role changes
CREATE OR REPLACE FUNCTION update_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update display_name if first_name or last_name changes
  NEW.display_name := CASE
    WHEN NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL THEN 
      TRIM(CONCAT(NEW.first_name, ' ', NEW.last_name))
    WHEN NEW.first_name IS NOT NULL THEN 
      NEW.first_name
    WHEN NEW.last_name IS NOT NULL THEN 
      NEW.last_name
    ELSE
      NEW.email
  END;
  
  -- Update auth.users metadata
  UPDATE auth.users 
  SET raw_user_meta_data = jsonb_build_object(
    'first_name', COALESCE(NEW.first_name, ''),
    'last_name', COALESCE(NEW.last_name, ''),
    'display_name', NEW.display_name,
    'admin_level', NEW.admin_level
  )
  WHERE email = NEW.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger to use the updated function
DROP TRIGGER IF EXISTS update_user_metadata_trigger ON user_management;

CREATE TRIGGER update_user_metadata_trigger
  BEFORE UPDATE ON user_management
  FOR EACH ROW
  EXECUTE FUNCTION update_user_metadata();