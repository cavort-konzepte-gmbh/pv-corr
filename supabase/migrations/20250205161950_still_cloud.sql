/*
  # Add theme column to user settings

  1. Changes
    - Add theme_id column to user_settings table
    - Set default theme to 'ferra'
    - Add check constraint to ensure valid theme values
*/

-- Add theme_id column with default value
ALTER TABLE user_settings
  ADD COLUMN theme_id text NOT NULL DEFAULT 'ferra';

-- Add check constraint to ensure valid theme values
ALTER TABLE user_settings
  ADD CONSTRAINT valid_theme_id CHECK (
    theme_id IN ('tokyo-night', 'ferra', 'monokai', 'nord')
  );