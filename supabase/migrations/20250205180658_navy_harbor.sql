/*
  # Link Datapoints to Parameters and Standards
  
  1. New Tables
    - datapoint_values
      - id (uuid, primary key)
      - datapoint_id (uuid, references zones.datapoints)
      - parameter_id (uuid, references parameters)
      - standard_id (uuid, references standards)
      - value (text, the actual measurement value)
      - rating (integer, calculated rating based on standard)
      - created_at (timestamptz)
      - updated_at (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create datapoint_values table
CREATE TABLE datapoint_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  datapoint_id uuid NOT NULL,
  parameter_id uuid NOT NULL REFERENCES parameters(id) ON DELETE CASCADE,
  standard_id uuid NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
  value text NOT NULL,
  rating integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(datapoint_id, parameter_id, standard_id)
);

-- Create updated_at trigger
CREATE TRIGGER update_datapoint_values_updated_at
  BEFORE UPDATE ON datapoint_values
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE datapoint_values ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read for authenticated users"
  ON datapoint_values FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON datapoint_values FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON datapoint_values FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users"
  ON datapoint_values FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX idx_datapoint_values_datapoint ON datapoint_values(datapoint_id);
CREATE INDEX idx_datapoint_values_parameter ON datapoint_values(parameter_id);
CREATE INDEX idx_datapoint_values_standard ON datapoint_values(standard_id);

-- Create function to calculate rating based on value and standard ranges
CREATE OR REPLACE FUNCTION calculate_rating(
  p_value text,
  p_rating_ranges jsonb
) RETURNS integer AS $$
DECLARE
  v_value numeric;
  v_range jsonb;
BEGIN
  -- Try to convert value to numeric for comparison
  BEGIN
    v_value := p_value::numeric;
  EXCEPTION WHEN OTHERS THEN
    -- For non-numeric values, try direct string matching
    FOR v_range IN SELECT * FROM jsonb_array_elements(p_rating_ranges)
    LOOP
      IF p_value = (v_range->>'min')::text THEN
        RETURN (v_range->>'rating')::integer;
      END IF;
    END LOOP;
    RETURN NULL;
  END;

  -- For numeric values, check ranges
  FOR v_range IN SELECT * FROM jsonb_array_elements(p_rating_ranges)
  LOOP
    -- Check if this range applies
    IF (
      (v_range->>'min' IS NULL OR v_value >= (v_range->>'min')::numeric) AND
      (v_range->>'max' IS NULL OR v_value < (v_range->>'max')::numeric)
    ) THEN
      RETURN (v_range->>'rating')::integer;
    END IF;
  END LOOP;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger function to automatically calculate rating
CREATE OR REPLACE FUNCTION update_datapoint_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_rating_ranges jsonb;
BEGIN
  -- Get rating ranges for this parameter in this standard
  SELECT rating_ranges INTO v_rating_ranges
  FROM standard_parameters
  WHERE standard_id = NEW.standard_id
  AND parameter_id = NEW.parameter_id;

  -- Calculate and set the rating
  IF v_rating_ranges IS NOT NULL THEN
    NEW.rating := calculate_rating(NEW.value, v_rating_ranges);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update rating before insert/update
CREATE TRIGGER before_datapoint_value_change
  BEFORE INSERT OR UPDATE OF value ON datapoint_values
  FOR EACH ROW
  EXECUTE FUNCTION update_datapoint_rating();