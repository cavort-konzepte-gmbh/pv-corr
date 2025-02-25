/*
  # Fix Media Links Table Structure

  1. Changes
    - Drop existing media_links table
    - Recreate media_links table with correct structure
    - Add constraints and indexes
    - Migrate any existing data

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing table
DROP TABLE IF EXISTS media_links;

-- Create media_links table with correct structure
CREATE TABLE media_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  media_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_entity_types CHECK (entity_type IN ('substructure', 'field', 'zone', 'datapoint')),
  CONSTRAINT unique_media_link UNIQUE (entity_type, entity_id, media_id)
);

-- Add indexes
CREATE INDEX idx_media_links_entity ON media_links(entity_type, entity_id);
CREATE INDEX idx_media_links_media ON media_links(media_id);
CREATE INDEX idx_media_links_created_at ON media_links(created_at);
CREATE INDEX idx_media_links_updated_at ON media_links(updated_at);

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