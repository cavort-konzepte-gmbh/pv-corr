/*
  # Fix user management and substructures

  1. Changes
    - Create user_management table
    - Add RLS policies
    - Add triggers
    
  2. Tables Added
    - user_management
*/

-- Create user_management table
CREATE TABLE IF NOT EXISTS user_management (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  admin_level text NOT NULL CHECK (admin_level IN ('super_admin', 'admin', 'user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_management ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON user_management
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for admin users" ON user_management
  FOR INSERT TO authenticated 
  WITH CHECK (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

CREATE POLICY "Enable update for admin users" ON user_management
  FOR UPDATE TO authenticated 
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users))
  WITH CHECK (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

CREATE POLICY "Enable delete for admin users" ON user_management
  FOR DELETE TO authenticated 
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

-- Create updated_at trigger
CREATE TRIGGER update_user_management_updated_at
  BEFORE UPDATE ON user_management
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Insert initial admin user
INSERT INTO user_management (email, admin_level)
VALUES ('admin@example.com', 'super_admin')
ON CONFLICT (email) DO NOTHING;