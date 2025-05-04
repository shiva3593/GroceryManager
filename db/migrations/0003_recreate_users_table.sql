-- Drop existing tables that depend on users
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS shopping_items CASCADE;

-- Drop and recreate users table
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    token TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Create index on token
CREATE INDEX idx_users_token ON users(token);

-- Add comment to explain the columns
COMMENT ON COLUMN users.token IS 'JWT token for user authentication';
COMMENT ON COLUMN users.username IS 'Unique username for login';
COMMENT ON COLUMN users.password IS 'Hashed password'; 