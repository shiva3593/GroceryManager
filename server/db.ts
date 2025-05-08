import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema.ts';

// Get database URL from environment variable or use default
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/grocerymanager';

// Create a new pool using the connection string
const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Create a drizzle instance with the pool and schema
export const db = drizzle(pool, { schema });

// Export the pool for direct access if needed
export { pool }; 