/*
  # Fix substructure type handling
  
  1. Changes
    - Make type column required in substructures table
    - Add NOT NULL constraint
    
  2. Security
    - No changes to RLS policies needed
*/

-- Make type column required
ALTER TABLE substructures 
  ALTER COLUMN type SET NOT NULL;