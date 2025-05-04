-- Add token column to users table
ALTER TABLE users ADD COLUMN token TEXT;

-- Add index on token for faster lookups
CREATE INDEX idx_users_token ON users(token);

-- Add comment to explain the column
COMMENT ON COLUMN users.token IS 'JWT token for user authentication'; 