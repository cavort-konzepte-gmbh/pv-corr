/*
  # Add Parameters and Ratings Tables

  1. New Tables
    - `parameters`
      - `id` (uuid, primary key)
      - `hidden_id` (text)
      - `name` (text)
      - `short_name` (text)
      - `unit` (text)
      - `range_type` (text)
      - `range_value` (text)
      - `rating_ranges` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create parameters table
CREATE TABLE IF NOT EXISTS parameters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hidden_id text NOT NULL,
  name text NOT NULL,
  short_name text,
  unit text,
  range_type text CHECK (range_type IN ('range', 'selection', 'open', 'greater', 'less', 'greaterEqual', 'lessEqual')),
  range_value text,
  rating_ranges jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraint to ensure rating_ranges has valid structure
ALTER TABLE parameters
ADD CONSTRAINT rating_ranges_check CHECK (
  (rating_ranges IS NULL) OR
  (jsonb_typeof(rating_ranges) = 'array' AND
   NOT EXISTS (
     SELECT 1
     FROM jsonb_array_elements(rating_ranges) AS range
     WHERE NOT (
       -- Each range must have min and rating fields
       range ? 'min' AND
       range ? 'rating' AND
       -- Rating must be between -12 and 12
       (range->>'rating')::integer BETWEEN -12 AND 12 AND
       -- Min must be numeric or special values
       (
         (range->>'min' ~ '^-?\d*\.?\d+$' OR
          range->>'min' IN ('impurities', 'never', 'constant', 'intermittent', 'homogenous', 'heterogenous')
         ) AND
         -- Max must be numeric if present
         (NOT range ? 'max' OR range->>'max' ~ '^-?\d*\.?\d+$')
       )
     )
   )
  )
);

-- Enable RLS
ALTER TABLE parameters ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access for authenticated users" ON parameters
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow insert for authenticated users" ON parameters
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON parameters
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_parameters_updated_at
  BEFORE UPDATE ON parameters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();