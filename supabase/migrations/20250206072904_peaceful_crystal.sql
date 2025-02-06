/*
  # Add Field Gates Table

  1. New Tables
    - `gates` table for storing field gates
      - `id` (uuid, primary key)
      - `field_id` (uuid, foreign key to fields)
      - `hidden_id` (text)
      - `name` (text)
      - `latitude` (text)
      - `longitude` (text)

  2. Changes
    - Add foreign key relationship between gates and fields
    - Add RLS policies for gates table
    - Add indexes for better query performance

  3. Security
    - Enable RLS on gates table
    - Add policies for CRUD operations
*/

-- Create gates table if it doesn't exist
CREATE TABLE IF NOT EXISTS gates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid REFERENCES fields(id) ON DELETE CASCADE NOT NULL,
  hidden_id text NOT NULL,
  name text NOT NULL,
  latitude text NOT NULL,
  longitude text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create updated_at trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_gates_updated_at'
  ) THEN
    CREATE TRIGGER update_gates_updated_at
      BEFORE UPDATE ON gates
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Enable RLS
ALTER TABLE gates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read for authenticated users" ON gates;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON gates;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON gates;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON gates;

-- Create policies
CREATE POLICY "Enable read for authenticated users"
  ON gates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON gates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON gates FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users"
  ON gates FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_gates_field_id ON gates(field_id);
CREATE INDEX IF NOT EXISTS idx_gates_hidden_id ON gates(hidden_id);