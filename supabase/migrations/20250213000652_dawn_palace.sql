/*
  # Create Admin Users Table

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Only allow super admins to modify admin users
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access for authenticated users" ON admin_users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow full access for super admins" ON admin_users
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = ANY(ARRAY['admin@example.com']))
  WITH CHECK (auth.jwt() ->> 'email' = ANY(ARRAY['admin@example.com']));

-- Create updated_at trigger
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Insert initial admin user
INSERT INTO admin_users (email)
VALUES ('admin@example.com')
ON CONFLICT (email) DO NOTHING;