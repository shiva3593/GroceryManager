import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@shared/schema";

// Get the connection string from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Configure PostgreSQL connection options
const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 300, // 5 minutes
  connect_timeout: 30, // 30 seconds
  keep_alive: 60, // 60 seconds
  max_lifetime: 3600, // 1 hour
  connection: {
    application_name: 'grocery-manager'
  }
});

// Create drizzle instance
const db = drizzle(sql, { schema });
const pool = sql;

// Export the database connection
export { db, pool };
