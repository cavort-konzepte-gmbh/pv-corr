/*
  # Fix user management table setup
  
  1. Changes
    - Drop and recreate user_management table with proper structure
    - Add necessary indexes and constraints
    - Create proper RLS policies
    
  2. Security
    - Enable RLS
    - Add policies for proper access control
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS user_management CASCADE;

-- Create user_management table with proper structure
CREATE TABLE user_management (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  admin_level text NOT NULL CHECK (admin_level IN ('super_admin', 'admin', 'user')),
  first_name text,
  last_name text,
  display_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_management ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all authenticated users" ON user_management
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON user_management
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON user_management
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for super admins" ON user_management
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN (
    SELECT email FROM user_management WHERE admin_level = 'super_admin'
  ));

-- Add indexes for better performance
CREATE INDEX idx_user_management_email ON user_management(email);
CREATE INDEX idx_user_management_admin_level ON user_management(admin_level);

-- Create trigger for updated_at
CREATE TRIGGER update_user_management_updated_at
  BEFORE UPDATE ON user_management
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial super admin users
INSERT INTO user_management (id, email, admin_level, display_name)
VALUES 
  (gen_random_uuid(), 'jh@cavort.de', 'super_admin', 'jh@cavort.de'),
  (gen_random_uuid(), 'admin@example.com', 'super_admin', 'admin@example.com')
ON CONFLICT (email) DO UPDATE SET
  admin_level = EXCLUDED.admin_level,
  display_name = EXCLUDED.display_name;