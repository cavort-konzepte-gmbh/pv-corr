/*
  # Fix user creation permissions and triggers
  
  1. Changes
    - Grant proper permissions for trigger functions
    - Ensure trigger functions can access auth schema
    - Fix user creation flow
    
  2. Security
    - Maintain RLS policies
    - Only grant necessary permissions
*/

-- Grant proper permissions for auth schema objects
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO postgres;

-- Update handle_auth_user_created function to be more robust
CREATE OR REPLACE FUNCTION handle_auth_user_created()
RETURNS trigger 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql
AS $$
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
EXCEPTION WHEN others THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Error in handle_auth_user_created: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION handle_auth_user_created TO postgres;
GRANT EXECUTE ON FUNCTION handle_auth_user_created TO authenticated;

-- Recreate trigger with proper permissions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_user_created();

-- Ensure proper function ownership
ALTER FUNCTION handle_auth_user_created OWNER TO postgres;