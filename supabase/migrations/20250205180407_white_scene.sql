/*
  # Add Parameters Table
  
  1. New Tables
    - parameters
      - id (uuid, primary key)
      - hidden_id (text, unique hex identifier)
      - name (text, parameter name)
      - custom_name (text, optional custom name)
      - unit (text, restricted to allowed values)
      - range_type (text, type of range validation)
      - range_value (text, actual range values)
      - created_at (timestamptz)
      - updated_at (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create enum for units
CREATE TYPE parameter_unit AS ENUM (
  'Ohm.m',
  'Ohm.cm',
  'mmol/kg',
  'mg/kg',
  'g/mol',
  'mg/mmol',
  '%',
  'ppm',
  'V',
  'mV',
  'A',
  'mA'
);

-- Create enum for range types
CREATE TYPE range_type AS ENUM (
  'range',
  'selection',
  'open',
  'greater',
  'less',
  'greaterEqual',
  'lessEqual'
);

-- Create parameters table
CREATE TABLE parameters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hidden_id text NOT NULL UNIQUE,
  name text NOT NULL,
  custom_name text,
  unit parameter_unit NOT NULL,
  range_type range_type NOT NULL,
  range_value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create updated_at trigger
CREATE TRIGGER update_parameters_updated_at
  BEFORE UPDATE ON parameters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE parameters ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read for authenticated users"
  ON parameters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON parameters FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON parameters FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users"
  ON parameters FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX idx_parameters_name ON parameters(name);
CREATE INDEX idx_parameters_hidden_id ON parameters(hidden_id);

-- Insert some sample parameters
INSERT INTO parameters (hidden_id, name, unit, range_type, range_value) VALUES
  (encode(gen_random_bytes(12), 'hex'), 'Soil Resistivity', 'Ohm.m', 'range', '0-10000'),
  (encode(gen_random_bytes(12), 'hex'), 'pH Value', 'ppm', 'range', '0-14'),
  (encode(gen_random_bytes(12), 'hex'), 'Moisture Content', '%', 'range', '0-100'),
  (encode(gen_random_bytes(12), 'hex'), 'Chloride Content', 'mg/kg', 'range', '0-1000'),
  (encode(gen_random_bytes(12), 'hex'), 'Sulfate Content', 'mmol/kg', 'range', '0-500'),
  (encode(gen_random_bytes(12), 'hex'), 'Redox Potential', 'mV', 'range', '-500-500'),
  (encode(gen_random_bytes(12), 'hex'), 'Soil Type', '%', 'selection', 'clay,silt,sand,gravel'),
  (encode(gen_random_bytes(12), 'hex'), 'Groundwater Level', 'ppm', 'greaterEqual', '0');