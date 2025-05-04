-- Drop existing constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;

-- Add token column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'token') THEN
        ALTER TABLE users ADD COLUMN token TEXT;
    END IF;
END $$;

-- Add index on token
CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);

-- Add comment to explain the column
COMMENT ON COLUMN users.token IS 'JWT token for user authentication';

-- Add unique constraint with correct name
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Update timestamp types and defaults
ALTER TABLE users 
    ALTER COLUMN created_at TYPE timestamp without time zone,
    ALTER COLUMN updated_at TYPE timestamp without time zone,
    ALTER COLUMN created_at SET DEFAULT now(),
    ALTER COLUMN updated_at SET DEFAULT now(); 