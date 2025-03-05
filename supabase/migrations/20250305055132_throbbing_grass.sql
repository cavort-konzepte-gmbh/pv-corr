/*
  # Update DIN 50929-3 norm calculations

  1. Changes
    - Add B0 calculation using parameter UUIDs
    - Add B1 calculation that includes B0 plus additional parameters
    - Add proper parameter descriptions and comments
    - Ensure proper type handling for calculations

  2. Parameters Used
    - Z1-Z10 for B0 calculation
    - Z11-Z15 for additional B1 parameters
*/

UPDATE norms 
SET output_config = jsonb_build_array(
  jsonb_build_object(
    'id', 'b0',
    'name', 'B0',
    'description', 'Basic corrosion assessment (Z1-Z10)',
    'formula', '
      // Parameter UUIDs for Z1-Z10
      const Z1 = "957468d4-f953-451a-b1e0-90bf1d04e836";  // Soil type
      const Z2 = "f47c0645-f9d4-4ca0-9eb1-a8cbf38d037e";  // Resistivity
      const Z3 = "0ee3b071-107a-416b-9e38-126cf82fd4a4";  // Water content
      const Z4 = "59b28cae-4551-4705-9005-c0206b4bdedb";  // pH value
      const Z5 = "41ebeb27-78b8-4b9c-92cb-9a9edd93b3ef";  // Buffer capacity
      const Z6 = "b8fc486b-8b3b-4b3e-a6a2-38ea73d27efb";  // Carbonate
      const Z7 = "5ee86cc9-ad68-44ef-a14a-b7df6eff4d31";  // Sulfide
      const Z8 = "a2b99f8d-83f6-4c3d-855b-c9b90c367aba";  // Sulfate
      const Z9 = "01a85a80-76f1-470a-be59-6b4f70a01aec";  // Neutral salts
      const Z10 = "f303faf2-98c1-4e7c-a130-36b50872cf41"; // Groundwater

      // Calculate B0 sum from ratings
      const b0 = 
        (parseInt(ratings[Z1] || "0")) +
        (parseInt(ratings[Z2] || "0")) +
        (parseInt(ratings[Z3] || "0")) +
        (parseInt(ratings[Z4] || "0")) +
        (parseInt(ratings[Z5] || "0")) +
        (parseInt(ratings[Z6] || "0")) +
        (parseInt(ratings[Z7] || "0")) +
        (parseInt(ratings[Z8] || "0")) +
        (parseInt(ratings[Z9] || "0")) +
        (parseInt(ratings[Z10] || "0"));

      return b0;
    '
  ),
  jsonb_build_object(
    'id', 'b1',
    'name', 'B1',
    'description', 'Extended corrosion assessment including additional factors (Z11-Z15)',
    'formula', '
      // Parameter UUIDs for Z1-Z10 (Basic assessment)
      const Z1 = "957468d4-f953-451a-b1e0-90bf1d04e836";  // Soil type
      const Z2 = "f47c0645-f9d4-4ca0-9eb1-a8cbf38d037e";  // Resistivity
      const Z3 = "0ee3b071-107a-416b-9e38-126cf82fd4a4";  // Water content
      const Z4 = "59b28cae-4551-4705-9005-c0206b4bdedb";  // pH value
      const Z5 = "41ebeb27-78b8-4b9c-92cb-9a9edd93b3ef";  // Buffer capacity
      const Z6 = "b8fc486b-8b3b-4b3e-a6a2-38ea73d27efb";  // Carbonate
      const Z7 = "5ee86cc9-ad68-44ef-a14a-b7df6eff4d31";  // Sulfide
      const Z8 = "a2b99f8d-83f6-4c3d-855b-c9b90c367aba";  // Sulfate
      const Z9 = "01a85a80-76f1-470a-be59-6b4f70a01aec";  // Neutral salts
      const Z10 = "f303faf2-98c1-4e7c-a130-36b50872cf41"; // Groundwater

      // Parameter UUIDs for Z11-Z15 (Additional factors)
      const Z11 = "6417c5bb-2524-459a-8fab-2f53463294f0"; // Moisture
      const Z12 = "8233864a-934b-4028-bfa6-0653b58a9510"; // Aeration
      const Z13 = "d5800a68-172a-4794-987c-9461cf4d1367"; // Drainage
      const Z14 = "957468d4-f953-451a-b1e0-90bf1d04e836"; // Homogeneity
      const Z15 = "f47c0645-f9d4-4ca0-9eb1-a8cbf38d037e"; // Foreign Cathodes

      // Calculate B0 (basic assessment)
      const b0 = 
        (parseInt(ratings[Z1] || "0")) +
        (parseInt(ratings[Z2] || "0")) +
        (parseInt(ratings[Z3] || "0")) +
        (parseInt(ratings[Z4] || "0")) +
        (parseInt(ratings[Z5] || "0")) +
        (parseInt(ratings[Z6] || "0")) +
        (parseInt(ratings[Z7] || "0")) +
        (parseInt(ratings[Z8] || "0")) +
        (parseInt(ratings[Z9] || "0")) +
        (parseInt(ratings[Z10] || "0"));

      // Calculate additional factors (Z11-Z15)
      const additional =
        (parseInt(ratings[Z11] || "0")) +
        (parseInt(ratings[Z12] || "0")) +
        (parseInt(ratings[Z13] || "0")) +
        (parseInt(ratings[Z14] || "0")) +
        (parseInt(ratings[Z15] || "0"));

      // B1 is the sum of B0 and additional factors
      return b0 + additional;
    '
  )
)
WHERE name LIKE 'DIN 50929-3%';