/*
  # Sync users and fix display
  
  1. Changes
    - Run sync function to ensure all users are in user_management
    - Update display names for existing users
    - Fix any missing metadata
    
  2. Security
    - Maintains existing RLS policies
    - Only affects user display data
*/

-- Run sync function to ensure all users are present
SELECT sync_auth_users();

-- Update display names for any users that might have blank ones
UPDATE user_management
SET display_name = CASE
  WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN 
    TRIM(CONCAT(first_name, ' ', last_name))
  WHEN first_name IS NOT NULL THEN 
    first_name
  WHEN last_name IS NOT NULL THEN 
    last_name
  ELSE
    email
  END
WHERE display_name IS NULL OR display_name = '';

-- Ensure metadata is synced for all users
UPDATE auth.users u
SET raw_user_meta_data = jsonb_build_object(
  'first_name', COALESCE((SELECT first_name FROM user_management WHERE email = u.email), ''),
  'last_name', COALESCE((SELECT last_name FROM user_management WHERE email = u.email), ''),
  'display_name', COALESCE((SELECT display_name FROM user_management WHERE email = u.email), u.email),
  'admin_level', COALESCE((SELECT admin_level FROM user_management WHERE email = u.email), 'user')
)
WHERE raw_user_meta_data IS NULL OR raw_user_meta_data = '{}'::jsonb;