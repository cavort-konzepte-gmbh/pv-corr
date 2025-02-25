/*
  # Enhance user management table
  
  1. Changes
    - Add first_name and last_name columns
    - Add display_name column
    - Add function to update user metadata
    - Add function to sync auth.users display name
    
  2. Security
    - Maintains existing RLS policies
    - Only admins can update user roles
*/

-- Add new columns to user_management
ALTER TABLE user_management
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS display_name text;

-- Create function to update user metadata
CREATE OR REPLACE FUNCTION update_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update display_name if first_name or last_name changes
  NEW.display_name := TRIM(CONCAT(NEW.first_name, ' ', NEW.last_name));
  
  -- Update auth.users metadata
  UPDATE auth.users 
  SET raw_user_meta_data = jsonb_build_object(
    'first_name', NEW.first_name,
    'last_name', NEW.last_name,
    'display_name', NEW.display_name,
    'admin_level', NEW.admin_level
  )
  WHERE email = NEW.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update metadata
CREATE TRIGGER update_user_metadata_trigger
  BEFORE UPDATE ON user_management
  FOR EACH ROW
  EXECUTE FUNCTION update_user_metadata();

-- Update existing users with empty names
UPDATE user_management
SET 
  first_name = '',
  last_name = '',
  display_name = email
WHERE first_name IS NULL;