/*
  # Fix substructure relationships

  1. Schema Changes
    - Drop old substructures table
    - Create new substructures table with proper foreign key relationships
    - Add necessary indexes and constraints

  2. Security
    - Enable RLS
    - Add appropriate policies
*/

-- Drop old substructures table
DROP TABLE IF EXISTS substructures CASCADE;

-- Create new substructures table with proper relationships
CREATE TABLE substructures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hidden_id text NOT NULL,
  manufacturer_id uuid NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  system_id uuid NOT NULL REFERENCES substructure_systems(id) ON DELETE CASCADE,
  version_id uuid NOT NULL REFERENCES substructure_versions(id) ON DELETE CASCADE,
  type substructure_type NOT NULL,
  link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX idx_substructures_manufacturer ON substructures(manufacturer_id);
CREATE INDEX idx_substructures_system ON substructures(system_id);
CREATE INDEX idx_substructures_version ON substructures(version_id);
CREATE INDEX idx_substructures_created_at ON substructures(created_at);
CREATE INDEX idx_substructures_updated_at ON substructures(updated_at);

-- Enable RLS
ALTER TABLE substructures ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "substructures_read" ON substructures
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "substructures_insert" ON substructures
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "substructures_update" ON substructures
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "substructures_delete" ON substructures
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

-- Create updated_at trigger
CREATE TRIGGER update_substructures_updated_at
  BEFORE UPDATE ON substructures
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();