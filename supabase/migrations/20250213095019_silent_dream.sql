-- First drop the type column from substructure_systems
ALTER TABLE substructure_systems DROP COLUMN type;

-- Drop the enum type if it's not used by other tables
DO $$ 
BEGIN
  -- Only drop if it's not used by substructures table
  IF EXISTS (
    SELECT 1 
    FROM pg_type t 
    WHERE t.typname = 'substructure_type'
    AND NOT EXISTS (
      SELECT 1 
      FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid
      JOIN pg_catalog.pg_type t2 ON a.atttypid = t2.oid
      WHERE c.relname = 'substructures'
      AND t2.typname = 'substructure_type'
    )
  ) THEN
    DROP TYPE substructure_type;
  END IF;
END $$;