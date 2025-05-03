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

# Install dependencies
echo "Installing dependencies..."
rm -rf node_modules
rm -f package-lock.json
npm install

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Warning: DATABASE_URL environment variable is not set."
    echo "Please set DATABASE_URL in your environment or .env file."
    echo "Example: DATABASE_URL=postgresql://username:password@localhost:5432/grocerymanager"
    exit 1
fi

# Run database migrations
echo "Running database migrations..."
npm run migrate

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