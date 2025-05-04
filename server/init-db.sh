#!/bin/bash

# Extract database name from DATABASE_URL
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

if [ -z "$DB_NAME" ]; then
    echo "Error: Could not extract database name from DATABASE_URL"
    exit 1
fi

# Drop and recreate database
echo "Dropping database if it exists..."
psql -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
echo "Creating fresh database..."
psql -d postgres -c "CREATE DATABASE $DB_NAME;"

# Run migrations in correct order
echo "Running migrations in order..."

# First run the users table migration
echo "Creating users table..."
psql -d $DB_NAME -f server/migrations/001a_create_users_table.sql

# Then run the initial schema
echo "Creating initial schema..."
psql -d $DB_NAME -f server/migrations/001_initial_schema.sql

# Run any remaining migrations in order
for migration in $(ls -v server/migrations/[0-9]*.sql | grep -v "001a_\|001_"); do
    echo "Running migration: $migration"
    psql -d $DB_NAME -f "$migration"
done

echo "Database initialization completed successfully!" 