/*
  # Update user admin levels
  
  1. Changes
    - Updates all users except test@test.de and bj@julinq.com to admin level
    - Syncs metadata to auth.users table
    
  2. Security
    - Maintains existing RLS policies
    - Only updates specified users
*/

-- Update user_management table
UPDATE user_management
SET admin_level = 'admin'
WHERE email NOT IN ('test@test.de', 'bj@julinq.com')
  AND admin_level = 'user';

-- Sync changes to auth.users metadata
UPDATE auth.users u
SET raw_user_meta_data = jsonb_build_object(
  'first_name', COALESCE((SELECT first_name FROM user_management WHERE email = u.email), ''),
  'last_name', COALESCE((SELECT last_name FROM user_management WHERE email = u.email), ''),
  'display_name', COALESCE((SELECT display_name FROM user_management WHERE email = u.email), u.email),
  'admin_level', COALESCE((SELECT admin_level FROM user_management WHERE email = u.email), 'user')
)
WHERE email NOT IN ('test@test.de', 'bj@julinq.com');