/*
  # Add Recalculate Ratings Function

  1. Changes
    - Add function to recalculate ratings for all datapoints
    - Fix missing function error
    - Ensure ratings are calculated correctly using rating_code

  2. Security
    - Maintain existing RLS policies
    - No destructive operations
*/

-- Function to recalculate ratings for all existing datapoints
CREATE OR REPLACE FUNCTION recalculate_all_datapoint_ratings()
RETURNS void AS $$
DECLARE
  dp record;
BEGIN
  FOR dp IN SELECT * FROM datapoints LOOP
    UPDATE datapoints
    SET ratings = calculate_datapoint_ratings(values, type)
    WHERE id = dp.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;