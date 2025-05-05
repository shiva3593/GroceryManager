-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create default admin user
INSERT INTO users (username, password)
VALUES ('admin', '$2a$10$JcKh7.k5U.eN1PwuSCAy8.LpVqG3XyWGFW1X2XgKz7ZZnkv7mNnOi')
ON CONFLICT (username) DO NOTHING; 