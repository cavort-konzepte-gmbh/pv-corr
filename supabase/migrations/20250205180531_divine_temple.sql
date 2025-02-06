/*
  # Add Standards Tables
  
  1. New Tables
    - standards
      - id (uuid, primary key)
      - hidden_id (text, unique hex identifier)
      - name (text, standard name)
      - description (text, optional description)
      - version (text, standard version)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - standard_parameters (junction table)
      - id (uuid, primary key)
      - standard_id (uuid, references standards)
      - parameter_id (uuid, references parameters)
      - parameter_code (text, e.g., "Z1", "Z2")
      - rating_ranges (jsonb, stores rating values for ranges)
      - created_at (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create standards table
CREATE TABLE standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hidden_id text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  version text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create standard_parameters junction table
CREATE TABLE standard_parameters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_id uuid NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
  parameter_id uuid NOT NULL REFERENCES parameters(id) ON DELETE CASCADE,
  parameter_code text NOT NULL,
  rating_ranges jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  UNIQUE(standard_id, parameter_code)
);

-- Create updated_at trigger for standards
CREATE TRIGGER update_standards_updated_at
  BEFORE UPDATE ON standards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_parameters ENABLE ROW LEVEL SECURITY;

-- Create policies for standards
CREATE POLICY "Enable read for authenticated users"
  ON standards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON standards FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON standards FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users"
  ON standards FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for standard_parameters
CREATE POLICY "Enable read for authenticated users"
  ON standard_parameters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON standard_parameters FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON standard_parameters FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users"
  ON standard_parameters FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX idx_standards_name ON standards(name);
CREATE INDEX idx_standards_hidden_id ON standards(hidden_id);
CREATE INDEX idx_standard_parameters_standard_id ON standard_parameters(standard_id);
CREATE INDEX idx_standard_parameters_parameter_id ON standard_parameters(parameter_id);
CREATE INDEX idx_standard_parameters_parameter_code ON standard_parameters(parameter_code);

-- Insert sample standard
INSERT INTO standards (hidden_id, name, description, version) VALUES
  (encode(gen_random_bytes(12), 'hex'), 'DIN 50929-3', 'Probability of corrosion of metallic materials when subject to corrosion from the outside', '2018-09');

-- Get IDs for parameters we need
WITH param_ids AS (
  SELECT id, name FROM parameters
  WHERE name IN (
    'Soil Resistivity',
    'pH Value',
    'Moisture Content',
    'Chloride Content',
    'Sulfate Content'
  )
),
standard_id AS (
  SELECT id FROM standards WHERE name = 'DIN 50929-3' LIMIT 1
)
-- Insert standard parameters with ratings
INSERT INTO standard_parameters (standard_id, parameter_id, parameter_code, rating_ranges)
SELECT 
  (SELECT id FROM standard_id),
  param_ids.id,
  CASE 
    WHEN param_ids.name = 'Soil Resistivity' THEN 'Z1'
    WHEN param_ids.name = 'pH Value' THEN 'Z2'
    WHEN param_ids.name = 'Moisture Content' THEN 'Z3'
    WHEN param_ids.name = 'Chloride Content' THEN 'Z4'
    WHEN param_ids.name = 'Sulfate Content' THEN 'Z5'
  END,
  CASE 
    WHEN param_ids.name = 'Soil Resistivity' THEN '[
      {"min": 0, "max": 10, "rating": -6},
      {"min": 10, "max": 20, "rating": -4},
      {"min": 20, "max": 50, "rating": -2},
      {"min": 50, "max": 200, "rating": 0},
      {"min": 200, "max": 500, "rating": 2},
      {"min": 500, "max": null, "rating": 4}
    ]'::jsonb
    WHEN param_ids.name = 'pH Value' THEN '[
      {"min": 0, "max": 4, "rating": -2},
      {"min": 4, "max": 5, "rating": -1},
      {"min": 5, "max": 8, "rating": 0},
      {"min": 8, "max": 9, "rating": -1},
      {"min": 9, "max": 14, "rating": -2}
    ]'::jsonb
    WHEN param_ids.name = 'Moisture Content' THEN '[
      {"min": 0, "max": 20, "rating": 0},
      {"min": 20, "max": 40, "rating": -1},
      {"min": 40, "max": 100, "rating": -2}
    ]'::jsonb
    WHEN param_ids.name = 'Chloride Content' THEN '[
      {"min": 0, "max": 100, "rating": 0},
      {"min": 100, "max": 300, "rating": -1},
      {"min": 300, "max": 1000, "rating": -2},
      {"min": 1000, "max": null, "rating": -3}
    ]'::jsonb
    WHEN param_ids.name = 'Sulfate Content' THEN '[
      {"min": 0, "max": 200, "rating": 0},
      {"min": 200, "max": 500, "rating": -1},
      {"min": 500, "max": 1000, "rating": -2},
      {"min": 1000, "max": null, "rating": -3}
    ]'::jsonb
  END
FROM param_ids;