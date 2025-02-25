/*
  # Update substructures view
  
  1. Changes
    - Drop existing view
    - Create new view with correct column references
    - Add proper joins to related tables
    
  2. Security
    - Maintain security_invoker setting
*/

-- Drop existing view
DROP VIEW IF EXISTS substructures_view;

-- Create new view with correct columns
CREATE VIEW substructures_view AS
SELECT 
  s.id,
  s.hidden_id,
  s.type,
  s.link,
  s.created_at,
  s.updated_at,
  s.manufacturer_id,
  s.system_id,
  s.version_id,
  m.name as manufacturer,
  sys.name as system,
  v.name as version
FROM substructures s
JOIN manufacturers m ON s.manufacturer_id = m.id
JOIN substructure_systems sys ON s.system_id = sys.id
JOIN substructure_versions v ON s.version_id = v.id;

-- Enable RLS inheritance
ALTER VIEW substructures_view SET (security_invoker = true);