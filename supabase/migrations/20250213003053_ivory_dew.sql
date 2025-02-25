/*
  # Update substructures schema with proper relationships

  1. Changes
    - Add foreign key columns to substructures table
    - Create proper relationships between tables
    - Add unique constraints to prevent duplicates
    - Create indexes for better performance
    - Migrate existing data to new structure

  2. Security
    - Maintains existing RLS policies
*/

-- Add unique constraints to prevent duplicates
ALTER TABLE manufacturers
  ADD CONSTRAINT unique_manufacturer_name UNIQUE (name);

ALTER TABLE substructure_systems
  ADD CONSTRAINT unique_system_per_manufacturer UNIQUE (name, manufacturer_id);

ALTER TABLE substructure_versions
  ADD CONSTRAINT unique_version_per_system UNIQUE (name, system_id);

-- Update substructures table
ALTER TABLE substructures
  ADD COLUMN manufacturer_id uuid REFERENCES manufacturers(id),
  ADD COLUMN system_id uuid REFERENCES substructure_systems(id),
  ADD COLUMN version_id uuid REFERENCES substructure_versions(id);

-- Create indexes for foreign keys
CREATE INDEX idx_substructures_manufacturer ON substructures(manufacturer_id);
CREATE INDEX idx_substructures_system ON substructures(system_id);
CREATE INDEX idx_substructures_version ON substructures(version_id);

-- Migrate existing data using proper cursor
DO $$ 
DECLARE
  r RECORD;
  cur CURSOR FOR SELECT * FROM substructures;
BEGIN
  OPEN cur;
  LOOP
    FETCH cur INTO r;
    EXIT WHEN NOT FOUND;

    -- Manufacturer
    WITH ins AS (
      INSERT INTO manufacturers (name)
      VALUES (r.manufacturer)
      ON CONFLICT (name) DO NOTHING
      RETURNING id
    )
    UPDATE substructures s
    SET manufacturer_id = COALESCE(
      (SELECT id FROM ins),
      (SELECT id FROM manufacturers WHERE name = r.manufacturer)
    )
    WHERE s.id = r.id;

    -- System
    WITH ins AS (
      INSERT INTO substructure_systems (name, manufacturer_id, type)
      SELECT 
        r.system,
        s.manufacturer_id,
        s.type::substructure_type
      FROM substructures s
      WHERE s.id = r.id
      ON CONFLICT (name, manufacturer_id) DO NOTHING
      RETURNING id
    )
    UPDATE substructures s
    SET system_id = COALESCE(
      (SELECT id FROM ins),
      (SELECT id FROM substructure_systems WHERE name = r.system AND manufacturer_id = s.manufacturer_id)
    )
    WHERE s.id = r.id;

    -- Version
    WITH ins AS (
      INSERT INTO substructure_versions (name, system_id)
      SELECT 
        r.version,
        s.system_id
      FROM substructures s
      WHERE s.id = r.id
      ON CONFLICT (name, system_id) DO NOTHING
      RETURNING id
    )
    UPDATE substructures s
    SET version_id = COALESCE(
      (SELECT id FROM ins),
      (SELECT id FROM substructure_versions WHERE name = r.version AND system_id = s.system_id)
    )
    WHERE s.id = r.id;
  END LOOP;
  CLOSE cur;
END $$;

-- Make foreign key columns required
ALTER TABLE substructures
  ALTER COLUMN manufacturer_id SET NOT NULL,
  ALTER COLUMN system_id SET NOT NULL,
  ALTER COLUMN version_id SET NOT NULL;

-- Drop old columns
ALTER TABLE substructures
  DROP COLUMN manufacturer,
  DROP COLUMN system,
  DROP COLUMN version;