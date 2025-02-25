/*
  # Sync authenticated users to user management

  1. Changes
    - Insert existing authenticated users into user_management table
    - Set default role as 'user'
    - Preserve admin role for admin@example.com
    
  2. Security
    - Maintains existing RLS policies
    - Only adds users, doesn't modify existing ones
*/

-- Insert authenticated users into user_management
INSERT INTO user_management (email, admin_level)
SELECT 
  email,
  CASE 
    WHEN email = 'admin@example.com' THEN 'super_admin'
    ELSE 'user'
  END as admin_level
FROM auth.users
WHERE email NOT IN (SELECT email FROM user_management)
ON CONFLICT (email) DO NOTHING;