/*
  # Fix substructure type handling
  
  1. Changes
    - Add type column to substructures table if not exists
    - Ensure type is properly constrained to 'roof' or 'field'
    
  2. Security
    - No changes to RLS policies needed
*/

-- Add type column to substructures if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'substructures' 
    AND column_name = 'type'
  ) THEN
    ALTER TABLE substructures ADD COLUMN type text;
    ALTER TABLE substructures ADD CONSTRAINT valid_substructure_type CHECK (type IN ('roof', 'field'));
  END IF;
END $$;