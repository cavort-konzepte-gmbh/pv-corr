/*
  # Update DIN 50929-3 Output Configuration
  
  Updates the B0 calculation formula to correctly handle parameter ratings.
  
  1. Changes
    - Ensures proper type conversion with parseInt
    - Adds explicit parameter mapping in comments
    - Returns exact integer sum
*/

UPDATE norms 
SET output_config = jsonb_build_array(
  jsonb_build_object(
    'id', 'b0',
    'name', 'B0',
    'description', 'Corrosion stress assessment based on soil parameters Z1-Z10',
    'formula', '
      // Parameter mapping:
      // Z1: 957468d4-f953-451a-b1e0-90bf1d04e836
      // Z2: f47c0645-f9d4-4ca0-9eb1-a8cbf38d037e
      // Z3: 0ee3b071-107a-416b-9e38-126cf82fd4a4
      // Z4: 59b28cae-4551-4705-9005-c0206b4bdedb
      // Z5: 41ebeb27-78b8-4b9c-92cb-9a9edd93b3ef
      // Z6: b8fc486b-8b3b-4b3e-a6a2-38ea73d27efb
      // Z7: 5ee86cc9-ad68-44ef-a14a-b7df6eff4d31
      // Z8: a2b99f8d-83f6-4c3d-855b-c9b90c367aba
      // Z9: 01a85a80-76f1-470a-be59-6b4f70a01aec
      // Z10: f303faf2-98c1-4e7c-a130-36b50872cf41

      // Sum up all ratings, ensuring integer values
      const sum = 
        parseInt(ratings["957468d4-f953-451a-b1e0-90bf1d04e836"] || "0") +  // Z1
        parseInt(ratings["f47c0645-f9d4-4ca0-9eb1-a8cbf38d037e"] || "0") +  // Z2
        parseInt(ratings["0ee3b071-107a-416b-9e38-126cf82fd4a4"] || "0") +  // Z3
        parseInt(ratings["59b28cae-4551-4705-9005-c0206b4bdedb"] || "0") +  // Z4
        parseInt(ratings["41ebeb27-78b8-4b9c-92cb-9a9edd93b3ef"] || "0") +  // Z5
        parseInt(ratings["b8fc486b-8b3b-4b3e-a6a2-38ea73d27efb"] || "0") +  // Z6
        parseInt(ratings["5ee86cc9-ad68-44ef-a14a-b7df6eff4d31"] || "0") +  // Z7
        parseInt(ratings["a2b99f8d-83f6-4c3d-855b-c9b90c367aba"] || "0") +  // Z8
        parseInt(ratings["01a85a80-76f1-470a-be59-6b4f70a01aec"] || "0") +  // Z9
        parseInt(ratings["f303faf2-98c1-4e7c-a130-36b50872cf41"] || "0");   // Z10

      return sum;  // Return exact integer sum
    '
  )
)
WHERE name LIKE 'DIN 50929-3%';