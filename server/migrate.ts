import { pool } from './db';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug environment variables
console.log('Migration script environment:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
  DATABASE_URL_STARTS_WITH: process.env.DATABASE_URL?.substring(0, 20) + '...'
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');

    // Read and execute migrations
    const migrationsPath = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migration = fs.readFileSync(path.join(migrationsPath, file), 'utf8');
      await client.query(migration);
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log('Migrations completed successfully');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error running migrations:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migrations
runMigrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 