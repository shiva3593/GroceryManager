-- Add storage_location column to shopping_items table
ALTER TABLE shopping_items ADD COLUMN IF NOT EXISTS storage_location TEXT; 