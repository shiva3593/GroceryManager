#!/bin/bash

# Exit on error
set -e

echo "Setting up database..."

# Database configuration
DB_NAME="grocerymanager"
DB_USER="postgres"

# Create database if it doesn't exist
echo "Creating database if it doesn't exist..."
psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;" || true

# Apply migrations
echo "Applying migrations..."
psql -d $DB_NAME -f db/migrations/0000_initial.sql

# Create admin user if it doesn't exist
echo "Creating admin user if it doesn't exist..."
psql -d $DB_NAME -c "INSERT INTO users (username, password) VALUES ('admin', '\$2a\$10\$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33eEUzWqZz9x9V9Gj9PSifm') ON CONFLICT (username) DO NOTHING;"

echo "Database setup complete!" 