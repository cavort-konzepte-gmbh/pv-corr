/*
  # Clean up and consolidate constraints

  1. Changes
    - Drop all existing constraints and indexes
    - Recreate constraints in correct order
    - Add unique constraint for media asset URLs
    - Add indexes for better query performance

  2. Security
    - No changes to RLS policies
*/

-- First drop any existing constraints that might conflict
ALTER TABLE manufacturers 
  DROP CONSTRAINT IF EXISTS unique_manufacturer_name;

ALTER TABLE substructure_systems 
  DROP CONSTRAINT IF EXISTS unique_system_per_manufacturer;

ALTER TABLE substructure_versions 
  DROP CONSTRAINT IF EXISTS unique_version_per_system;

-- Drop any existing indexes that might conflict
DROP INDEX IF EXISTS idx_substructures_manufacturer;
DROP INDEX IF EXISTS idx_substructures_system;
DROP INDEX IF EXISTS idx_substructures_version;

-- Now add the constraints back in the correct order
ALTER TABLE manufacturers
  ADD CONSTRAINT unique_manufacturer_name UNIQUE (name);

ALTER TABLE substructure_systems
  ADD CONSTRAINT unique_system_per_manufacturer UNIQUE (name, manufacturer_id);

ALTER TABLE substructure_versions
  ADD CONSTRAINT unique_version_per_system UNIQUE (name, system_id);

-- Create indexes for better query performance
CREATE INDEX idx_substructures_manufacturer ON substructures(manufacturer_id);
CREATE INDEX idx_substructures_system ON substructures(system_id);
CREATE INDEX idx_substructures_version ON substructures(version_id);

-- Add unique constraint to media_assets to prevent duplicate URLs
ALTER TABLE media_assets
  ADD CONSTRAINT unique_media_asset_url UNIQUE (url);