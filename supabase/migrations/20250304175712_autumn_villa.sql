/*
  # Add output configuration to norms

  1. New Columns
    - `output_config` - JSONB column to store output configuration
      - Stores formulas and display settings for calculated values like B0, B1
      - Example: { "B0": { "formula": "sum(Z1..Z10)", "label": "B0 Value" } }

  2. Security
    - Enable RLS on norms table
    - Add policies for authenticated users
*/

-- Add output_config column
ALTER TABLE norms
ADD COLUMN IF NOT EXISTS output_config JSONB DEFAULT '[]'::jsonb;

-- Add constraint to ensure output_config has valid structure
ALTER TABLE norms
ADD CONSTRAINT output_config_check CHECK (
  output_config IS NULL OR (
    jsonb_typeof(output_config) = 'array' AND
    NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(output_config) AS output
      WHERE NOT (
        output ? 'id' AND
        output ? 'name' AND
        output ? 'formula' AND
        output ? 'description'
      )
    )
  )
);

-- Enable RLS
ALTER TABLE norms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access for authenticated users" ON norms
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow insert for authenticated users" ON norms
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON norms
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);