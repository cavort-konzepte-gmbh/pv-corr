/*
  # Remove Sequential ID and Require Name

  1. Changes
    - Removes sequential_id column
    - Makes name column required
    - Removes name handling trigger
    - Updates existing datapoints

  2. Security
    - No changes to RLS policies
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS handle_datapoint_name_trigger ON datapoints;
DROP FUNCTION IF EXISTS handle_datapoint_name();

-- Make name required and drop sequential_id
ALTER TABLE datapoints
ALTER COLUMN name SET NOT NULL,
DROP COLUMN sequential_id;