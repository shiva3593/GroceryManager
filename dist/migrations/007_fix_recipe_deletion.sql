-- Drop problematic triggers if they exist
DROP TRIGGER IF EXISTS delete_recipe_ingredients_trigger ON recipes;
DROP TRIGGER IF EXISTS prevent_recipe_deletion_trigger ON recipes;
DROP TRIGGER IF EXISTS prevent_ingredient_deletion_trigger ON recipe_ingredients;

-- Drop the trigger functions
DROP FUNCTION IF EXISTS delete_recipe_ingredients();
DROP FUNCTION IF EXISTS prevent_recipe_deletion();
DROP FUNCTION IF EXISTS prevent_ingredient_deletion();

-- Ensure proper cascading delete is in place
ALTER TABLE recipe_ingredients 
  DROP CONSTRAINT IF EXISTS recipe_ingredients_recipe_id_fkey,
  ADD CONSTRAINT recipe_ingredients_recipe_id_fkey 
  FOREIGN KEY (recipe_id) 
  REFERENCES recipes(id) 
  ON DELETE CASCADE; 