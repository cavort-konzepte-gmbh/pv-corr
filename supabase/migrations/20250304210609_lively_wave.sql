/*
  # Add B0 output configuration
  
  1. Changes
    - Updates DIN 50929-3 norm with output configuration for B0
    - Adds formula using parameter UUIDs to calculate B0 rating
*/

-- Update DIN 50929-3 norm with B0 output configuration
UPDATE norms 
SET output_config = jsonb_build_array(
  jsonb_build_object(
    'id', 'b0',
    'name', 'B0',
    'description', 'Corrosion stress assessment based on soil parameters Z1-Z10',
    'formula', '
      // Parameter UUID references
      const Z1 = ''957468d4-f953-451a-b1e0-90bf1d04e836'';
      const Z2 = ''f47c0645-f9d4-4ca0-9eb1-a8cbf38d037e'';
      const Z3 = ''0ee3b071-107a-416b-9e38-126cf82fd4a4'';
      const Z4 = ''59b28cae-4551-4705-9005-c0206b4bdedb'';
      const Z5 = ''41ebeb27-78b8-4b9c-92cb-9a9edd93b3ef'';
      const Z6 = ''b8fc486b-8b3b-4b3e-a6a2-38ea73d27efb'';
      const Z7 = ''5ee86cc9-ad68-44ef-a14a-b7df6eff4d31'';
      const Z8 = ''a2b99f8d-83f6-4c3d-855b-c9b90c367aba'';
      const Z9 = ''01a85a80-76f1-470a-be59-6b4f70a01aec'';
      const Z10 = ''f303faf2-98c1-4e7c-a130-36b50872cf41'';

      // B0 calculation formula
      return (
        (ratings[Z1] || 0) + 
        (ratings[Z2] || 0) + 
        (ratings[Z3] || 0) + 
        (ratings[Z4] || 0) + 
        (ratings[Z5] || 0) + 
        (ratings[Z6] || 0) + 
        (ratings[Z7] || 0) + 
        (ratings[Z8] || 0) + 
        (ratings[Z9] || 0) + 
        (ratings[Z10] || 0)
      );
    '
  )
)
WHERE name LIKE 'DIN 50929-3%';