/*
  # Fix substructures relationships
  
  1. Changes
    - Add back manufacturer_id to substructure_systems
    - Add back system_id to substructure_versions
    - Re-add foreign key constraints
    - Re-add unique constraints for proper relationships
    - Update view to handle relationships correctly
    
  2. Security
    - Maintain RLS policies
*/

-- First drop existing view
DROP VIEW IF EXISTS substructures_view;

-- Add back relationship columns
ALTER TABLE substructure_systems
  ADD COLUMN manufacturer_id uuid REFERENCES manufacturers(id);

ALTER TABLE substructure_versions
  ADD COLUMN system_id uuid REFERENCES substructure_systems(id);

-- Drop old unique constraints
ALTER TABLE substructure_systems
  DROP CONSTRAINT IF EXISTS unique_system_name;

ALTER TABLE substructure_versions
  DROP CONSTRAINT IF EXISTS unique_version_name;

-- Add proper unique constraints for relationships
ALTER TABLE substructure_systems
  ADD CONSTRAINT unique_system_per_manufacturer UNIQUE (name, manufacturer_id);

ALTER TABLE substructure_versions
  ADD CONSTRAINT unique_version_per_system UNIQUE (name, system_id);

-- Create new view with correct joins
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