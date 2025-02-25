/*
  # Fix unique constraints for systems and versions
  
  1. Changes
    - Remove duplicate system and version names
    - Add unique constraints after cleaning up duplicates
    
  2. Security
    - No changes to RLS policies needed
*/

-- First, identify and fix duplicate system names
WITH duplicates AS (
  SELECT name, COUNT(*), MIN(id) as keep_id
  FROM substructure_systems
  GROUP BY name
  HAVING COUNT(*) > 1
),
numbered_duplicates AS (
  SELECT 
    s.id,
    s.name,
    ROW_NUMBER() OVER (PARTITION BY s.name ORDER BY s.created_at) as rn
  FROM substructure_systems s
  JOIN duplicates d ON s.name = d.name
  WHERE s.id != d.keep_id
)
UPDATE substructure_systems s
SET name = name || ' ' || nd.rn
FROM numbered_duplicates nd
WHERE s.id = nd.id;

-- Then, identify and fix duplicate version names
WITH duplicates AS (
  SELECT name, COUNT(*), MIN(id) as keep_id
  FROM substructure_versions
  GROUP BY name
  HAVING COUNT(*) > 1
),
numbered_duplicates AS (
  SELECT 
    v.id,
    v.name,
    ROW_NUMBER() OVER (PARTITION BY v.name ORDER BY v.created_at) as rn
  FROM substructure_versions v
  JOIN duplicates d ON v.name = d.name
  WHERE v.id != d.keep_id
)
UPDATE substructure_versions v
SET name = name || ' ' || nd.rn
FROM numbered_duplicates nd
WHERE v.id = nd.id;

-- Now add the unique constraints
ALTER TABLE substructure_systems
  ADD CONSTRAINT unique_system_name UNIQUE (name);

ALTER TABLE substructure_versions
  ADD CONSTRAINT unique_version_name UNIQUE (name);