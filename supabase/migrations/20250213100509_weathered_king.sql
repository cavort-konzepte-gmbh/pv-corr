/*
  # Fix substructure relationships and constraints
  
  1. Changes
    - Drop and recreate unique constraints with proper relationships
    - Update view to handle relationships correctly
    
  2. Security
    - Maintain RLS policies
*/

-- Drop existing view
DROP VIEW IF EXISTS substructures_view;

-- Drop existing constraints that we want to recreate
ALTER TABLE substructure_systems
  DROP CONSTRAINT IF EXISTS unique_system_per_manufacturer;

ALTER TABLE substructure_versions
  DROP CONSTRAINT IF EXISTS unique_version_per_system;

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