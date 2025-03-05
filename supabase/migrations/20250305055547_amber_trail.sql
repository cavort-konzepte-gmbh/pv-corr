/*
  # Update DIN 50929-3 norm configuration
  
  Updates the output configuration with correct UUIDs from the database:
  - Z1: 957468d4-f953-451a-b1e0-90bf1d04e836 (Soil type)
  - Z2: f47c0645-f9d4-4ca0-9eb1-a8cbf38d037e (Specific soil resistivity)
  - Z3: 0ee3b071-107a-416b-9e38-126cf82fd4a4 (Water content)
  - Z4: 59b28cae-4551-4705-9005-c0206b4bdedb (pH value)
  - Z5: 41ebeb27-78b8-4b9c-92cb-9a9edd93b3ef (Buffer capacity)
  - Z7: 5ee86cc9-ad68-44ef-a14a-b7df6eff4d31 (Sulphate reducing bacteria)
  - Z8: a2b99f8d-83f6-4c3d-855b-c9b90c367aba (Sulphate content)
  - Z9: 01a85a80-76f1-470a-be59-6b4f70a01aec (Neutral salts)
  - Z10: f303faf2-98c1-4e7c-a130-36b50872cf41 (Groundwater)
*/

UPDATE norms 
SET output_config = jsonb_build_array(
  jsonb_build_object(
    'id', 'b0',
    'name', 'B0',
    'description', 'Basic corrosion assessment (Z1-Z10)',
    'formula', '
      // Parameter UUIDs from database
      const Z1 = "957468d4-f953-451a-b1e0-90bf1d04e836";  // Soil type
      const Z2 = "f47c0645-f9d4-4ca0-9eb1-a8cbf38d037e";  // Specific soil resistivity
      const Z3 = "0ee3b071-107a-416b-9e38-126cf82fd4a4";  // Water content
      const Z4 = "59b28cae-4551-4705-9005-c0206b4bdedb";  // pH value
      const Z5 = "41ebeb27-78b8-4b9c-92cb-9a9edd93b3ef";  // Buffer capacity
      const Z7 = "5ee86cc9-ad68-44ef-a14a-b7df6eff4d31";  // Sulphate reducing bacteria
      const Z8 = "a2b99f8d-83f6-4c3d-855b-c9b90c367aba";  // Sulphate content
      const Z9 = "01a85a80-76f1-470a-be59-6b4f70a01aec";  // Neutral salts
      const Z10 = "f303faf2-98c1-4e7c-a130-36b50872cf41"; // Groundwater

      // Calculate B0 sum from ratings
      const b0 = 
        (parseInt(ratings[Z1] || "0")) +   // Soil type
        (parseInt(ratings[Z2] || "0")) +   // Resistivity
        (parseInt(ratings[Z3] || "0")) +   // Water content
        (parseInt(ratings[Z4] || "0")) +   // pH value
        (parseInt(ratings[Z5] || "0")) +   // Buffer capacity
        (parseInt(ratings[Z7] || "0")) +   // Sulfide
        (parseInt(ratings[Z8] || "0")) +   // Sulfate
        (parseInt(ratings[Z9] || "0")) +   // Neutral salts
        (parseInt(ratings[Z10] || "0"));   // Groundwater

      return b0;
    '
  )
)
WHERE name LIKE 'DIN 50929-3%';