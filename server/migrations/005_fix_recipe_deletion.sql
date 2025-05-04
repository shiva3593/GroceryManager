-- Add a trigger to ensure recipe ingredients are deleted with the correct user_id check
CREATE OR REPLACE FUNCTION delete_recipe_ingredients()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM recipe_ingredients 
  WHERE recipe_id = OLD.id 
  AND user_id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'delete_recipe_ingredients_trigger'
    ) THEN
        CREATE TRIGGER delete_recipe_ingredients_trigger
        BEFORE DELETE ON recipes
        FOR EACH ROW
        EXECUTE FUNCTION delete_recipe_ingredients();
    END IF;
END $$;

-- Add a trigger to prevent recipe deletion if user_id doesn't match
CREATE OR REPLACE FUNCTION prevent_recipe_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.user_id != NEW.user_id THEN
    RAISE EXCEPTION 'Cannot delete recipe: user_id mismatch';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'prevent_recipe_deletion_trigger'
    ) THEN
        CREATE TRIGGER prevent_recipe_deletion_trigger
        BEFORE DELETE ON recipes
        FOR EACH ROW
        EXECUTE FUNCTION prevent_recipe_deletion();
    END IF;
END $$;

-- Add a trigger to prevent recipe ingredient deletion if user_id doesn't match
CREATE OR REPLACE FUNCTION prevent_ingredient_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.user_id != NEW.user_id THEN
    RAISE EXCEPTION 'Cannot delete ingredient: user_id mismatch';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'prevent_ingredient_deletion_trigger'
    ) THEN
        CREATE TRIGGER prevent_ingredient_deletion_trigger
        BEFORE DELETE ON recipe_ingredients
        FOR EACH ROW
        EXECUTE FUNCTION prevent_ingredient_deletion();
    END IF;
END $$; 