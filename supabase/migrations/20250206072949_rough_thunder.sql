/*
  # Add Zones Table

  1. New Tables
    - `zones` table for storing field zones
      - `id` (uuid, primary key)
      - `field_id` (uuid, foreign key to fields)
      - `hidden_id` (text)
      - `name` (text)
      - `latitude` (text)
      - `longitude` (text)

  2. Changes
    - Add foreign key relationship between zones and fields
    - Add RLS policies for zones table
    - Add indexes for better query performance

  3. Security
    - Enable RLS on zones table
    - Add policies for CRUD operations
*/

-- Create zones table if it doesn't exist
CREATE TABLE IF NOT EXISTS zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid REFERENCES fields(id) ON DELETE CASCADE NOT NULL,
  hidden_id text NOT NULL,
  name text NOT NULL,
  latitude text,
  longitude text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create updated_at trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_zones_updated_at'
  ) THEN
    CREATE TRIGGER update_zones_updated_at
      BEFORE UPDATE ON zones
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Enable RLS
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read for authenticated users" ON zones;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON zones;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON zones;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON zones;

-- Create policies
CREATE POLICY "Enable read for authenticated users"
  ON zones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON zones FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON zones FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users"
  ON zones FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_zones_field_id ON zones(field_id);
CREATE INDEX IF NOT EXISTS idx_zones_hidden_id ON zones(hidden_id);