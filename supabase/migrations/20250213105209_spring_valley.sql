/*
  # Add automatic user management hooks
  
  1. Changes
    - Create function to automatically handle new user creation
    - Create function to sync user metadata changes
    - Add triggers to handle user events automatically
    
  2. Security
    - Functions run with security definer to ensure proper permissions
    - Only affects user-related tables
*/

-- Create function to handle new user creation and metadata sync
CREATE OR REPLACE FUNCTION handle_auth_user_created()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_management (
    id,
    email,
    admin_level,
    first_name,
    last_name,
    display_name
  )
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email = 'jh@cavort.de' THEN 'super_admin'
      WHEN NEW.email = 'admin@example.com' THEN 'super_admin'
      ELSE COALESCE((NEW.raw_user_meta_data->>'admin_level')::text, 'user')
    END,
    COALESCE((NEW.raw_user_meta_data->>'first_name')::text, ''),
    COALESCE((NEW.raw_user_meta_data->>'last_name')::text, ''),
    COALESCE(
      (NEW.raw_user_meta_data->>'display_name')::text,
      NEW.email
    )
  )
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    admin_level = EXCLUDED.admin_level,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle user metadata updates
CREATE OR REPLACE FUNCTION handle_auth_user_updated()
RETURNS trigger AS $$
BEGIN
  -- Only process if metadata has changed
  IF OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data THEN
    UPDATE user_management
    SET
      admin_level = COALESCE((NEW.raw_user_meta_data->>'admin_level')::text, admin_level),
      first_name = COALESCE((NEW.raw_user_meta_data->>'first_name')::text, first_name),
      last_name = COALESCE((NEW.raw_user_meta_data->>'last_name')::text, last_name),
      display_name = COALESCE(
        (NEW.raw_user_meta_data->>'display_name')::text,
        CASE
          WHEN (NEW.raw_user_meta_data->>'first_name') IS NOT NULL 
            AND (NEW.raw_user_meta_data->>'last_name') IS NOT NULL 
          THEN TRIM(CONCAT(
            (NEW.raw_user_meta_data->>'first_name')::text, 
            ' ', 
            (NEW.raw_user_meta_data->>'last_name')::text
          ))
          ELSE NEW.email
        END
      )
    WHERE email = NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle user deletion
CREATE OR REPLACE FUNCTION handle_auth_user_deleted()
RETURNS trigger AS $$
BEGIN
  DELETE FROM user_management
  WHERE email = OLD.email;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Create triggers for auth events
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_user_created();

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_user_updated();

CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_user_deleted();

-- Run initial sync to ensure all existing users are properly set up
SELECT sync_auth_users();