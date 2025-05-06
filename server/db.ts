import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from './config/env';

// Configure connection pool with Neon-specific settings
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
  maxUses: 7500, // Close a connection after it has been used this many times
});

// Add error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Add connection event handlers
pool.on('connect', () => {
  console.log('New client connected to Neon database');
});

pool.on('acquire', () => {
  console.log('Client acquired from pool');
});

pool.on('remove', () => {
  console.log('Client removed from pool');
});

// Function to test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW()');
      console.log('Successfully connected to Neon database:', result.rows[0].now);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error testing database connection:', error);
    throw error;
  }
}

// Initialize drizzle with the pool
const db = drizzle(pool);

// Export both the pool and drizzle instance
export { pool, db };

// Test connection on startup
testConnection().catch(console.error); 