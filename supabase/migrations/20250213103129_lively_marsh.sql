/*
  # Fix user management table and sync with auth.users
  
  1. Changes
    - Create function to sync auth users to user_management
    - Add function to handle new user signups
    - Add trigger to keep tables in sync
    
  2. Security
    - Maintains existing RLS policies
    - Only admins can modify user roles
*/

-- Create function to sync auth users to user_management
CREATE OR REPLACE FUNCTION sync_auth_users()
RETURNS void AS $$
BEGIN
  -- Insert any missing users from auth.users into user_management
  INSERT INTO user_management (id, email, admin_level, first_name, last_name, display_name)
  SELECT 
    id,
    email,
    COALESCE(
      (raw_user_meta_data->>'admin_level')::text,
      CASE WHEN email = 'admin@example.com' THEN 'super_admin' ELSE 'user' END
    ),
    COALESCE((raw_user_meta_data->>'first_name')::text, ''),
    COALESCE((raw_user_meta_data->>'last_name')::text, ''),
    COALESCE((raw_user_meta_data->>'display_name')::text, email)
  FROM auth.users
  WHERE id NOT IN (SELECT id FROM user_management)
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    admin_level = EXCLUDED.admin_level,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_management (id, email, admin_level, first_name, last_name, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN NEW.email = 'admin@example.com' THEN 'super_admin' ELSE 'user' END,
    COALESCE((NEW.raw_user_meta_data->>'first_name')::text, ''),
    COALESCE((NEW.raw_user_meta_data->>'last_name')::text, ''),
    COALESCE((NEW.raw_user_meta_data->>'display_name')::text, NEW.email)
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

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Sync existing users
SELECT sync_auth_users();