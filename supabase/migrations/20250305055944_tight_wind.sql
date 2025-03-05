/*
  # Fix Parameter Rating Ranges

  1. Changes
    - Update rating ranges for each parameter using correct UUIDs
    - Ensure proper rating calculation for all parameter types
    - Fix parameter mappings for B0 calculation

  2. Parameters
    - Update rating ranges for Z1-Z10 parameters
    - Ensure correct rating ranges and values
*/

-- Update rating ranges for each parameter
UPDATE parameters
SET rating_ranges = jsonb_build_array(
  jsonb_build_object('min', '0', 'max', '10', 'rating', 4),
  jsonb_build_object('min', '10', 'max', '30', 'rating', 2),
  jsonb_build_object('min', '30', 'max', '50', 'rating', 0),
  jsonb_build_object('min', '50', 'max', '80', 'rating', -2),
  jsonb_build_object('min', '80', 'rating', -4),
  jsonb_build_object('min', 'impurities', 'rating', -12)
)
WHERE id = '957468d4-f953-451a-b1e0-90bf1d04e836'; -- Z1

UPDATE parameters
SET rating_ranges = jsonb_build_array(
  jsonb_build_object('min', '500', 'rating', 4),
  jsonb_build_object('min', '200', 'max', '500', 'rating', 2),
  jsonb_build_object('min', '50', 'max', '200', 'rating', 0),
  jsonb_build_object('min', '20', 'max', '50', 'rating', -2),
  jsonb_build_object('min', '10', 'max', '20', 'rating', -4),
  jsonb_build_object('min', '0', 'max', '10', 'rating', -6)
)
WHERE id = 'f47c0645-f9d4-4ca0-9eb1-a8cbf38d037e'; -- Z2 (RHO)

UPDATE parameters
SET rating_ranges = jsonb_build_array(
  jsonb_build_object('min', '0', 'max', '20', 'rating', 0),
  jsonb_build_object('min', '20', 'max', '40', 'rating', -1),
  jsonb_build_object('min', '40', 'rating', -2)
)
WHERE id = '0ee3b071-107a-416b-9e38-126cf82fd4a4'; -- Z3 (H2O)

UPDATE parameters
SET rating_ranges = jsonb_build_array(
  jsonb_build_object('min', '0', 'max', '4', 'rating', -2),
  jsonb_build_object('min', '4', 'max', '5', 'rating', -1),
  jsonb_build_object('min', '5', 'max', '8', 'rating', 0),
  jsonb_build_object('min', '8', 'max', '9', 'rating', -1),
  jsonb_build_object('min', '9', 'rating', -2)
)
WHERE id = '59b28cae-4551-4705-9005-c0206b4bdedb'; -- Z4 (PH)

UPDATE parameters
SET rating_ranges = jsonb_build_array(
  jsonb_build_object('min', '0', 'max', '2', 'rating', 0),
  jsonb_build_object('min', '2', 'max', '10', 'rating', -1),
  jsonb_build_object('min', '10', 'max', '20', 'rating', -2),
  jsonb_build_object('min', '20', 'rating', -3)
)
WHERE id = '41ebeb27-78b8-4b9c-92cb-9a9edd93b3ef'; -- Z5 (K_ALC)

UPDATE parameters
SET rating_ranges = jsonb_build_array(
  jsonb_build_object('min', '0', 'max', '5', 'rating', 0),
  jsonb_build_object('min', '5', 'max', '10', 'rating', -3),
  jsonb_build_object('min', '10', 'rating', -6)
)
WHERE id = '5ee86cc9-ad68-44ef-a14a-b7df6eff4d31'; -- Z7 (SRB)

UPDATE parameters
SET rating_ranges = jsonb_build_array(
  jsonb_build_object('min', '0', 'max', '2', 'rating', 0),
  jsonb_build_object('min', '2', 'max', '5', 'rating', -1),
  jsonb_build_object('min', '5', 'max', '10', 'rating', -2),
  jsonb_build_object('min', '10', 'rating', -3)
)
WHERE id = 'a2b99f8d-83f6-4c3d-855b-c9b90c367aba'; -- Z8 (SO4)

UPDATE parameters
SET rating_ranges = jsonb_build_array(
  jsonb_build_object('min', '0', 'max', '3', 'rating', 0),
  jsonb_build_object('min', '3', 'max', '10', 'rating', -1),
  jsonb_build_object('min', '10', 'max', '30', 'rating', -2),
  jsonb_build_object('min', '30', 'max', '100', 'rating', -3),
  jsonb_build_object('min', '100', 'rating', -4)
)
WHERE id = '01a85a80-76f1-470a-be59-6b4f70a01aec'; -- Z9 (SALZE)

UPDATE parameters
SET rating_ranges = jsonb_build_array(
  jsonb_build_object('min', 'never', 'rating', 0),
  jsonb_build_object('min', 'constant', 'rating', -1),
  jsonb_build_object('min', 'intermittent', 'rating', -2)
)
WHERE id = 'f303faf2-98c1-4e7c-a130-36b50872cf41'; -- Z10 (GND_H2O)

-- Recalculate all datapoint ratings
SELECT recalculate_all_datapoint_ratings();