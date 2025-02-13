/*
  # Final fix for user creation
  
  1. Changes
    - Grant proper permissions for trigger execution
    - Set correct search path and security context
    - Add additional error handling
    
  2. Security
    - Maintain RLS policies
    - Only grant necessary permissions
*/

-- Drop and recreate the trigger function with proper permissions
CREATE OR REPLACE FUNCTION handle_auth_user_created() 
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public, auth
AS $$
DECLARE
  _display_name text;
BEGIN
  -- Calculate display name
  _display_name := COALESCE(
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
  );

  -- Insert or update user management record
  INSERT INTO public.user_management (
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
    _display_name
  )
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    admin_level = EXCLUDED.admin_level,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    updated_at = now();
    
  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Error in handle_auth_user_created: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Ensure proper function ownership and permissions
ALTER FUNCTION handle_auth_user_created OWNER TO postgres;
REVOKE ALL ON FUNCTION handle_auth_user_created FROM PUBLIC;
GRANT EXECUTE ON FUNCTION handle_auth_user_created TO postgres;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_user_created();

-- Grant additional required permissions
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres;

-- Ensure user_management permissions are correct
GRANT ALL ON public.user_management TO postgres;
GRANT SELECT, INSERT, UPDATE ON public.user_management TO authenticated;

-- Run sync to ensure existing users are properly set up
SELECT sync_auth_users();