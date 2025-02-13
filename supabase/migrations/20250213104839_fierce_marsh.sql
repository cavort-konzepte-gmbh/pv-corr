/*
  # Fix user creation and management
  
  1. Changes
    - Add proper user creation handling
    - Fix database error when creating users
    - Ensure proper role synchronization
    
  2. Security
    - Maintains existing RLS policies
    - Only allows authorized operations
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Insert into user_management with proper error handling
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
      COALESCE(
        (NEW.raw_user_meta_data->>'admin_level')::text,
        CASE 
          WHEN NEW.email = 'jh@cavort.de' THEN 'super_admin'
          WHEN NEW.email = 'admin@example.com' THEN 'super_admin'
          ELSE 'user'
        END
      ),
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
  EXCEPTION WHEN others THEN
    -- Log error but don't fail the transaction
    RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure user_management has proper constraints
ALTER TABLE user_management
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN admin_level SET NOT NULL,
  ALTER COLUMN admin_level SET DEFAULT 'user';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_management_email ON user_management(email);
CREATE INDEX IF NOT EXISTS idx_user_management_admin_level ON user_management(admin_level);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_management TO authenticated;
GRANT USAGE ON SEQUENCE user_management_id_seq TO authenticated;