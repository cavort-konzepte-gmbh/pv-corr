/*
  # Create substructures view

  1. New View
    - Creates a view that joins substructures with their related tables
    - Provides a simplified way to query substructure data with manufacturer, system and version names
  
  2. Security
    - Enables RLS on the view
    - Adds policies to match the base table's security model
*/

-- Create the view
CREATE OR REPLACE VIEW substructures_view AS
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

-- Enable RLS
ALTER VIEW substructures_view SET (security_invoker = true);

-- Create policies
CREATE POLICY "Enable read access for all users" ON substructures_view
  FOR SELECT TO authenticated USING (true);