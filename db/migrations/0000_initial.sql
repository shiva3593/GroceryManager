-- Drop existing tables if they exist
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS inventory_items;
DROP TABLE IF EXISTS shopping_items;

-- Create users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create recipes table
CREATE TABLE recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    prep_time INTEGER NOT NULL,
    servings INTEGER NOT NULL,
    difficulty TEXT NOT NULL,
    rating REAL NOT NULL,
    rating_count INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    url TEXT,
    instructions TEXT NOT NULL,
    storage_instructions TEXT,
    is_favorite INTEGER NOT NULL DEFAULT 0,
    cost_per_serving REAL NOT NULL,
    nutrition TEXT NOT NULL,
    comments TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create recipe ingredients table
CREATE TABLE recipe_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    quantity TEXT NOT NULL,
    unit TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Create inventory items table
CREATE TABLE inventory_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity TEXT NOT NULL,
    unit TEXT NOT NULL,
    count INTEGER NOT NULL,
    barcode TEXT,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    expiry_date TEXT,
    image_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create shopping items table
CREATE TABLE shopping_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity TEXT NOT NULL,
    unit TEXT NOT NULL,
    category TEXT NOT NULL,
    checked INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create a trigger to automatically update the updated_at timestamp for recipes
CREATE TRIGGER update_recipes_timestamp
AFTER UPDATE ON recipes
BEGIN
    UPDATE recipes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Create a trigger to automatically update the updated_at timestamp for inventory_items
CREATE TRIGGER update_inventory_items_timestamp
AFTER UPDATE ON inventory_items
BEGIN
    UPDATE inventory_items SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Create a trigger to automatically update the updated_at timestamp for shopping_items
CREATE TRIGGER update_shopping_items_timestamp
AFTER UPDATE ON shopping_items
BEGIN
    UPDATE shopping_items SET updated_at = datetime('now') WHERE id = NEW.id;
END;
