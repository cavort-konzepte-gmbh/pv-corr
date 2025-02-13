/*
  # Update Substructures Schema

  1. Changes
    - Add media_links table for linking media assets to various entities
    - Update substructures table to use foreign keys
    - Add indexes for better query performance

  2. Tables
    - media_links
      - id (uuid, primary key)
      - entity_type (text)
      - entity_id (uuid)
      - media_id (uuid)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  3. Security
    - Enable RLS on media_links table
    - Add policies for authenticated users
*/

-- Create media_links table
CREATE TABLE IF NOT EXISTS media_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  media_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_media_links_entity ON media_links(entity_type, entity_id);
CREATE INDEX idx_media_links_media ON media_links(media_id);

-- Enable RLS
ALTER TABLE media_links ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access for authenticated users" ON media_links
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow full access for admin users" ON media_links
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users))
  WITH CHECK (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

-- Create updated_at trigger
CREATE TRIGGER update_media_links_updated_at
  BEFORE UPDATE ON media_links
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Update substructures table
ALTER TABLE substructures 
  ADD COLUMN manufacturer_id uuid REFERENCES manufacturers(id),
  ADD COLUMN system_id uuid REFERENCES substructure_systems(id),
  ADD COLUMN version_id uuid REFERENCES substructure_versions(id);

-- Create indexes for foreign keys
CREATE INDEX idx_substructures_manufacturer ON substructures(manufacturer_id);
CREATE INDEX idx_substructures_system ON substructures(system_id);
CREATE INDEX idx_substructures_version ON substructures(version_id);

-- Migrate existing data
DO $$ 
BEGIN
  -- For each existing substructure, try to find or create the related records
  FOR r IN SELECT * FROM substructures LOOP
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

    -- Media assets for schematic
    IF r.schematic IS NOT NULL THEN
      WITH ins AS (
        INSERT INTO media_assets (url, type)
        VALUES (r.schematic, 'schematic')
        ON CONFLICT (url) DO NOTHING
        RETURNING id
      ),
      media_id AS (
        SELECT COALESCE(
          (SELECT id FROM ins),
          (SELECT id FROM media_assets WHERE url = r.schematic)
        ) as id
      )
      INSERT INTO media_links (entity_type, entity_id, media_id)
      SELECT 'substructure', r.id, id
      FROM media_id
      ON CONFLICT DO NOTHING;
    END IF;

    -- Media assets for example
    IF r.example IS NOT NULL THEN
      WITH ins AS (
        INSERT INTO media_assets (url, type)
        VALUES (r.example, 'example')
        ON CONFLICT (url) DO NOTHING
        RETURNING id
      ),
      media_id AS (
        SELECT COALESCE(
          (SELECT id FROM ins),
          (SELECT id FROM media_assets WHERE url = r.example)
        ) as id
      )
      INSERT INTO media_links (entity_type, entity_id, media_id)
      SELECT 'substructure', r.id, id
      FROM media_id
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- Drop old columns
ALTER TABLE substructures
  DROP COLUMN manufacturer,
  DROP COLUMN system,
  DROP COLUMN version,
  DROP COLUMN schematic,
  DROP COLUMN example;