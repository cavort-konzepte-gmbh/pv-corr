/*
  # Fix substructures schema and relationships

  1. Changes
    - Drop and recreate tables with proper relationships
    - Add correct constraints and foreign keys
    - Create view with proper joins
    - Add RLS policies
    
  2. Tables Modified
    - manufacturers
    - substructure_systems  
    - substructure_versions
    - substructures
    - substructures_view
*/

-- First drop the view since it depends on the tables
DROP VIEW IF EXISTS substructures_view;

-- Drop and recreate tables
DROP TABLE IF EXISTS substructures CASCADE;
DROP TABLE IF EXISTS substructure_versions CASCADE;
DROP TABLE IF EXISTS substructure_systems CASCADE;
DROP TABLE IF EXISTS manufacturers CASCADE;

-- Create manufacturers table
CREATE TABLE manufacturers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create substructure_systems table
CREATE TABLE substructure_systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  manufacturer_id uuid NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_system_per_manufacturer UNIQUE (name, manufacturer_id)
);

-- Create substructure_versions table
CREATE TABLE substructure_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  system_id uuid NOT NULL REFERENCES substructure_systems(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_version_per_system UNIQUE (name, system_id)
);

-- Create substructures table
CREATE TABLE substructures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hidden_id text NOT NULL,
  manufacturer_id uuid NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  system_id uuid NOT NULL REFERENCES substructure_systems(id) ON DELETE CASCADE,
  version_id uuid NOT NULL REFERENCES substructure_versions(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('roof', 'field')),
  link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create view
CREATE VIEW substructures_view AS
SELECT 
  s.id,
  s.hidden_id,
  s.type,
  s.link,
  s.created_at,
  s.updated_at,
  s.manufacturer_id,
  s.system_id,
  s.version_id,
  m.name as manufacturer,
  sys.name as system,
  v.name as version
FROM substructures s
JOIN manufacturers m ON s.manufacturer_id = m.id
JOIN substructure_systems sys ON s.system_id = sys.id
JOIN substructure_versions v ON s.version_id = v.id;

-- Enable RLS inheritance
ALTER VIEW substructures_view SET (security_invoker = true);

-- Enable RLS on all tables
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE substructure_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE substructure_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE substructures ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for manufacturers
CREATE POLICY "manufacturers_select" ON manufacturers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "manufacturers_insert" ON manufacturers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "manufacturers_update" ON manufacturers
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "manufacturers_delete" ON manufacturers
  FOR DELETE TO authenticated USING (true);

-- Create RLS policies for substructure_systems
CREATE POLICY "systems_select" ON substructure_systems
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "systems_insert" ON substructure_systems
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "systems_update" ON substructure_systems
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "systems_delete" ON substructure_systems
  FOR DELETE TO authenticated USING (true);

-- Create RLS policies for substructure_versions
CREATE POLICY "versions_select" ON substructure_versions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "versions_insert" ON substructure_versions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "versions_update" ON substructure_versions
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "versions_delete" ON substructure_versions
  FOR DELETE TO authenticated USING (true);

-- Create RLS policies for substructures
CREATE POLICY "substructures_select" ON substructures
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "substructures_insert" ON substructures
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "substructures_update" ON substructures
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "substructures_delete" ON substructures
  FOR DELETE TO authenticated USING (true);

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

CREATE TRIGGER update_substructures_updated_at
  BEFORE UPDATE ON substructures
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();