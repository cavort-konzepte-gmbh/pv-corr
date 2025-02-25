/*
  # Create Substructures Table

  1. New Tables
    - `substructures`
      - `id` (uuid, primary key)
      - `hidden_id` (text)
      - `manufacturer` (text)
      - `system` (text) 
      - `version` (text)
      - `type` (text, enum: 'roof' | 'field')
      - `link` (text, optional)
      - `schematic` (text, optional)
      - `example` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create substructures table
CREATE TABLE IF NOT EXISTS substructures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hidden_id text NOT NULL,
  manufacturer text NOT NULL,
  system text NOT NULL,
  version text NOT NULL,
  type text CHECK (type IN ('roof', 'field')) NOT NULL,
  link text,
  schematic text,
  example text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE substructures ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON substructures
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON substructures
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON substructures
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON substructures
  FOR DELETE TO authenticated USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_substructures_updated_at
  BEFORE UPDATE ON substructures
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();