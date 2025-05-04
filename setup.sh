#!/bin/bash

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js v20 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install PostgreSQL 15 or higher."
    exit 1
fi

# Check if PostgreSQL service is running
if ! pg_isready &> /dev/null; then
    echo "PostgreSQL service is not running. Please start the PostgreSQL service."
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Warning: DATABASE_URL environment variable is not set."
    echo "Please set DATABASE_URL in your environment or .env file."
    echo "Example: DATABASE_URL=postgresql://username:password@localhost:5432/grocerymanager"
    exit 1
fi

# Extract database name from DATABASE_URL in a macOS-compatible way
DB_NAME=$(echo "$DATABASE_URL" | sed -E 's/^.*\/([^/]+)$/\1/')

if [ -z "$DB_NAME" ]; then
    echo "Error: Could not extract database name from DATABASE_URL"
    echo "Please check your DATABASE_URL format"
    exit 1
fi

# Check if database exists
if ! psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "Database $DB_NAME does not exist. Creating database..."
    # Create the database
    createdb "$DB_NAME"
    if [ $? -ne 0 ]; then
        echo "Failed to create database $DB_NAME"
        exit 1
    fi
    echo "Database $DB_NAME created successfully"
fi

# Install dependencies
echo "Installing dependencies..."
rm -rf node_modules
rm -f package-lock.json
npm install

# Run database migrations
echo "Running database migrations..."
npm run migrate

# Verify database setup
echo "Verifying database setup..."
if ! npm run db:push; then
    echo "Database setup verification failed"
    exit 1
fi

# Build the application
echo "Building the application..."
npm run build

echo "Setup completed successfully!"
echo "The server will be available at:"
echo "  - https://localhost:5001"
echo "  - https://192.168.1.210:5001"
echo ""
echo "Starting development server..."

# Start the development server
npm run dev