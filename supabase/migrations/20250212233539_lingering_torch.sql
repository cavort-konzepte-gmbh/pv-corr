/*
  # Substructures Management Schema

  1. New Tables
    - `manufacturers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `website` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `substructure_systems`
      - `id` (uuid, primary key)
      - `manufacturer_id` (uuid, foreign key)
      - `name` (text)
      - `type` (text, enum: 'roof' | 'field')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `substructure_versions`
      - `id` (uuid, primary key)
      - `system_id` (uuid, foreign key)
      - `name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `media_assets`
      - `id` (uuid, primary key)
      - `url` (text)
      - `type` (text, enum: 'schematic' | 'example')
      - `title` (text, optional)
      - `description` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read all data
    - Add policies for admin users to manage data
*/

-- Create enum types
CREATE TYPE substructure_type AS ENUM ('roof', 'field');
CREATE TYPE media_asset_type AS ENUM ('schematic', 'example');

-- Create manufacturers table
CREATE TABLE IF NOT EXISTS manufacturers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create substructure_systems table
CREATE TABLE IF NOT EXISTS substructure_systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id uuid REFERENCES manufacturers(id) ON DELETE CASCADE,
  name text NOT NULL,
  type substructure_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create substructure_versions table
CREATE TABLE IF NOT EXISTS substructure_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id uuid REFERENCES substructure_systems(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create media_assets table
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  type media_asset_type NOT NULL,
  title text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE substructure_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE substructure_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Create policies for manufacturers
CREATE POLICY "Allow read access for all authenticated users" ON manufacturers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow full access for admin users" ON manufacturers
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users))
  WITH CHECK (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

-- Create policies for substructure_systems
CREATE POLICY "Allow read access for all authenticated users" ON substructure_systems
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow full access for admin users" ON substructure_systems
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users))
  WITH CHECK (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

-- Create policies for substructure_versions
CREATE POLICY "Allow read access for all authenticated users" ON substructure_versions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow full access for admin users" ON substructure_versions
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users))
  WITH CHECK (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

-- Create policies for media_assets
CREATE POLICY "Allow read access for all authenticated users" ON media_assets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow full access for admin users" ON media_assets
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users))
  WITH CHECK (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_manufacturers_updated_at
  BEFORE UPDATE ON manufacturers
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_substructure_systems_updated_at
  BEFORE UPDATE ON substructure_systems
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_substructure_versions_updated_at
  BEFORE UPDATE ON substructure_versions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_media_assets_updated_at
  BEFORE UPDATE ON media_assets
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();