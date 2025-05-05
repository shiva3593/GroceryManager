-- Update default values for recipes table
BEGIN;

-- Handle instructions column
ALTER TABLE recipes ALTER COLUMN instructions DROP DEFAULT;
ALTER TABLE recipes ALTER COLUMN instructions SET DEFAULT NULL;
UPDATE recipes SET instructions = NULL WHERE instructions IS NULL;

-- Handle nutrition column
ALTER TABLE recipes ALTER COLUMN nutrition DROP DEFAULT;
ALTER TABLE recipes ALTER COLUMN nutrition SET DEFAULT NULL;
UPDATE recipes SET nutrition = NULL WHERE nutrition IS NULL;

-- Handle comments column
ALTER TABLE recipes ALTER COLUMN comments DROP DEFAULT;
ALTER TABLE recipes ALTER COLUMN comments SET DEFAULT NULL;
UPDATE recipes SET comments = NULL WHERE comments IS NULL;

-- Set empty default values for recipes table
ALTER TABLE recipes 
    ALTER COLUMN instructions SET DEFAULT NULL,
    ALTER COLUMN nutrition SET DEFAULT NULL,
    ALTER COLUMN comments SET DEFAULT NULL;

COMMIT; 