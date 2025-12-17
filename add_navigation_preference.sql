-- Add navigation_layout preference to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS navigation_layout TEXT DEFAULT 'sidebar';
