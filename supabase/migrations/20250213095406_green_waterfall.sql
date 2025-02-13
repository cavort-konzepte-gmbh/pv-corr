/*
  # Remove interconnections between manufacturer, system and version tables
  
  1. Changes
    - Drop foreign key constraints from substructure_systems and substructure_versions
    - Drop manufacturer_id from substructure_systems
    - Drop system_id from substructure_versions
    - Drop unique constraints that enforce the relationships
    
  2. Security
    - No changes to RLS policies needed
*/

-- Drop foreign key constraints
ALTER TABLE substructure_systems
  DROP CONSTRAINT IF EXISTS substructure_systems_manufacturer_id_fkey;

ALTER TABLE substructure_versions
  DROP CONSTRAINT IF EXISTS substructure_versions_system_id_fkey;

-- Drop unique constraints that enforce relationships
ALTER TABLE substructure_systems
  DROP CONSTRAINT IF EXISTS unique_system_per_manufacturer;

ALTER TABLE substructure_versions
  DROP CONSTRAINT IF EXISTS unique_version_per_system;

-- Drop columns that create the interconnections
ALTER TABLE substructure_systems
  DROP COLUMN manufacturer_id;

ALTER TABLE substructure_versions
  DROP COLUMN system_id;

-- Add new unique constraints for names only
ALTER TABLE substructure_systems
  ADD CONSTRAINT unique_system_name UNIQUE (name);

ALTER TABLE substructure_versions
  ADD CONSTRAINT unique_version_name UNIQUE (name);