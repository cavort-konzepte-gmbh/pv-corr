/*
  # Fix Media Links Table

  1. Changes
    - Add unique constraint to prevent duplicate media links
    - Add check constraint for valid entity types
    - Add missing indexes

  2. Security
    - Maintain existing RLS policies
*/

-- Add check constraint for valid entity types
ALTER TABLE media_links
  ADD CONSTRAINT valid_entity_types 
  CHECK (entity_type IN ('substructure', 'field', 'zone', 'datapoint'));

-- Add unique constraint to prevent duplicates
ALTER TABLE media_links
  ADD CONSTRAINT unique_media_link 
  UNIQUE (entity_type, entity_id, media_id);

-- Add missing indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_media_links_created_at ON media_links(created_at);
CREATE INDEX IF NOT EXISTS idx_media_links_updated_at ON media_links(updated_at);