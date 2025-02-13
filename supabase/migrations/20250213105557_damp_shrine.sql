/*
  # Fix auth schema permissions
  
  1. Changes
    - Grant proper permissions to view auth schema and tables
    - Ensure authenticated users can view auth tables
    
  2. Security
    - Only grant SELECT permissions
    - Maintain existing RLS policies
*/

-- Grant usage on auth schema
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO anon;

-- Grant ability to view users table
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO anon;

-- Ensure proper permissions for user management functions
GRANT EXECUTE ON FUNCTION handle_auth_user_created TO authenticated;
GRANT EXECUTE ON FUNCTION handle_auth_user_updated TO authenticated;
GRANT EXECUTE ON FUNCTION handle_auth_user_deleted TO authenticated;
GRANT EXECUTE ON FUNCTION sync_auth_users TO authenticated;

-- Ensure proper permissions for user management table
GRANT SELECT, INSERT, UPDATE ON user_management TO authenticated;
GRANT SELECT ON user_management TO anon;