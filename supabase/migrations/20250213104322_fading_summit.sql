/*
  # Fix admin access for jh@cavort.de
  
  1. Changes
    - Set jh@cavort.de as super admin
    - Ensure admin privileges are preserved
    
  2. Security
    - Maintains existing RLS policies
    - Only affects specific user
*/

-- Update jh@cavort.de to super_admin
UPDATE user_management
SET admin_level = 'super_admin'
WHERE email = 'jh@cavort.de';

-- Ensure metadata is synced
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'first_name', COALESCE((SELECT first_name FROM user_management WHERE email = 'jh@cavort.de'), ''),
  'last_name', COALESCE((SELECT last_name FROM user_management WHERE email = 'jh@cavort.de'), ''),
  'display_name', COALESCE((SELECT display_name FROM user_management WHERE email = 'jh@cavort.de'), 'jh@cavort.de'),
  'admin_level', 'super_admin'
)
WHERE email = 'jh@cavort.de';