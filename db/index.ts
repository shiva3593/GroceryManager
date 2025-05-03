
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@shared/schema";

// Try to get the connection string from environment variable
let connectionString = process.env.DATABASE_URL;

// Check if running in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Initialize database variables
let db: any;
let pool: any;

// For local development, provide a fallback if DATABASE_URL is not set
if (!connectionString) {
  if (isDevelopment) {
    console.warn("Warning: DATABASE_URL environment variable is not set.");
    console.warn("Using a local SQLite database for development.");
    
    try {
      // Import SQLite modules using dynamic import
      const { default: sqlite } = await import('better-sqlite3');
      const { drizzle: drizzleSqlite } = await import('drizzle-orm/better-sqlite3');
      
      // Create or open a SQLite database file
      const sqliteDb = sqlite('local_dev.db');
      
      // Initialize drizzle instance for SQLite
      db = drizzleSqlite(sqliteDb, { schema });
      pool = sqliteDb;
      
      console.info("Successfully initialized local SQLite database for development.");
      
    } catch (err) {
      console.error("Failed to initialize SQLite fallback:", err);
      console.error("Please install better-sqlite3 package or set DATABASE_URL environment variable.");
      console.error("To install SQLite support: npm install better-sqlite3");
      throw new Error("Database connection failed. See above for details.");
    }
  } else {
    // In production, we still require the real PostgreSQL connection
    throw new Error("DATABASE_URL environment variable is required");
  }
} else {
  // Configure PostgreSQL connection options
  const sql = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10
  });

  db = drizzle(sql, { schema });
  pool = sql;
}

// Export the database connection
export { db, pool };
