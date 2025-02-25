/*
  # Add Entity Type Column to Media Links

  1. Changes
    - Add entity_type column to media_links table
    - Drop and recreate constraints in correct order
    - Add NOT NULL constraint to entity_type

  2. Security
    - Maintain existing RLS policies
*/

-- First drop existing constraints that depend on entity_type
ALTER TABLE media_links
  DROP CONSTRAINT IF EXISTS valid_entity_types,
  DROP CONSTRAINT IF EXISTS unique_media_link;

-- Add entity_type column
ALTER TABLE media_links
  ADD COLUMN IF NOT EXISTS entity_type text NOT NULL DEFAULT 'substructure';

-- Recreate constraints
ALTER TABLE media_links
  ADD CONSTRAINT valid_entity_types 
  CHECK (entity_type IN ('substructure', 'field', 'zone', 'datapoint'));

ALTER TABLE media_links
  ADD CONSTRAINT unique_media_link 
  UNIQUE (entity_type, entity_id, media_id);