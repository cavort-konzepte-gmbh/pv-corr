/*
  # Update DIN 50929-3 parameter mappings

  1. Changes
    - Update parameter UUIDs to match actual database values
    - Remove unused Z11-Z15 parameters
    - Add proper parameter descriptions
*/

UPDATE norms 
SET output_config = jsonb_build_array(
  jsonb_build_object(
    'id', 'b0',
    'name', 'B0',
    'description', 'Basic corrosion assessment (Z1-Z10)',
    'formula', '
      // Parameter UUIDs mapped to actual database values
      const RHO = "6417c5bb-2524-459a-8fab-2f53463294f0";    // Resistivity (Z2)
      const H2O = "0ee3b071-107a-416b-9e38-126cf82fd4a4";    // Water content (Z3)
      const PH = "59b28cae-4551-4705-9005-c0206b4bdedb";     // pH value (Z4)
      const K_ALC = "41ebeb27-78b8-4b9c-92cb-9a9edd93b3ef";  // Buffer capacity (Z5)
      const SRB = "5ee86cc9-ad68-44ef-a14a-b7df6eff4d31";    // Sulfide (Z7)
      const SO4 = "a2b99f8d-83f6-4c3d-855b-c9b90c367aba";    // Sulfate (Z8)
      const SALZE = "01a85a80-76f1-470a-be59-6b4f70a01aec";  // Neutral salts (Z9)
      const GND_H2O = "f303faf2-98c1-4e7c-a130-36b50872cf41"; // Groundwater (Z10)

      // Calculate B0 sum from ratings
      const b0 = 
        (parseInt(ratings[RHO] || "0")) +     // Z2
        (parseInt(ratings[H2O] || "0")) +     // Z3
        (parseInt(ratings[PH] || "0")) +      // Z4
        (parseInt(ratings[K_ALC] || "0")) +   // Z5
        (parseInt(ratings[SRB] || "0")) +     // Z7
        (parseInt(ratings[SO4] || "0")) +     // Z8
        (parseInt(ratings[SALZE] || "0")) +   // Z9
        (parseInt(ratings[GND_H2O] || "0"));  // Z10

      return b0;
    '
  )
)
WHERE name LIKE 'DIN 50929-3%';