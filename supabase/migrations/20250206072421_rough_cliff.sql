/*
  # Add datapoints table and relationships

  1. New Tables
    - `datapoints`
      - `id` (uuid, primary key)
      - `zone_id` (uuid, foreign key to zones)
      - `hidden_id` (text)
      - `sequential_id` (text)
      - `type` (text)
      - `values` (jsonb)
      - `ratings` (jsonb)
      - `timestamp` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `datapoints` table
    - Add policies for authenticated users
*/

-- Create datapoints table
CREATE TABLE IF NOT EXISTS datapoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES zones(id) ON DELETE CASCADE NOT NULL,
  hidden_id text NOT NULL,
  sequential_id text NOT NULL,
  type text NOT NULL,
  values jsonb NOT NULL DEFAULT '{}',
  ratings jsonb NOT NULL DEFAULT '{}',
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create updated_at trigger
CREATE TRIGGER update_datapoints_updated_at
  BEFORE UPDATE ON datapoints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE datapoints ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read for authenticated users"
  ON datapoints FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON datapoints FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON datapoints FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users"
  ON datapoints FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX idx_datapoints_zone_id ON datapoints(zone_id);
CREATE INDEX idx_datapoints_hidden_id ON datapoints(hidden_id);
CREATE INDEX idx_datapoints_sequential_id ON datapoints(sequential_id);
CREATE INDEX idx_datapoints_timestamp ON datapoints(timestamp);