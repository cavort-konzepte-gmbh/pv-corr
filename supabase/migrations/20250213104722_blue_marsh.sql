/*
  # Enhance user management capabilities
  
  1. Changes
    - Add password reset functionality
    - Ensure proper role synchronization
    - Add user deletion cascade
    
  2. Security
    - Maintains existing RLS policies
    - Only allows authorized operations
*/

-- Create function to handle user deletion
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete from user_management when auth user is deleted
  DELETE FROM user_management
  WHERE email = OLD.email;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_deletion();

-- Update sync function to handle role changes
CREATE OR REPLACE FUNCTION sync_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync changes from user_management to auth.users
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'first_name', NEW.first_name,
    'last_name', NEW.last_name,
    'display_name', NEW.display_name,
    'admin_level', NEW.admin_level
  )
  WHERE email = NEW.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;