/*
  # Fix substructures view

  1. Changes
    - Recreates the view without trying to add policies (not supported on views)
    - Uses security_invoker to inherit RLS from base tables
  
  2. Security
    - View inherits security from base tables through security_invoker
*/

-- Drop existing view if it exists
DROP VIEW IF EXISTS substructures_view;

-- Create the view with security_invoker
CREATE VIEW substructures_view AS
SELECT 
  s.id,
  s.hidden_id,
  s.type,
  s.link,
  s.created_at,
  s.updated_at,
  m.name as manufacturer,
  sys.name as system,
  v.name as version,
  s.manufacturer_id,
  s.system_id,
  s.version_id
FROM substructures s
JOIN manufacturers m ON s.manufacturer_id = m.id
JOIN substructure_systems sys ON s.system_id = sys.id
JOIN substructure_versions v ON s.version_id = v.id;

-- Enable RLS inheritance
ALTER VIEW substructures_view SET (security_invoker = true);