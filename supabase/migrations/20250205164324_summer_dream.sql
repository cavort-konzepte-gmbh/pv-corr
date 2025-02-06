-- Drop the unique constraint that's causing issues
ALTER TABLE places 
  DROP CONSTRAINT IF EXISTS places_name_country_unique;

-- Add a more appropriate unique constraint on hidden_id instead
ALTER TABLE places 
  ADD CONSTRAINT places_hidden_id_unique 
  UNIQUE (hidden_id);