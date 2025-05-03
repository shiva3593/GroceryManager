#!/bin/bash

# Grocery Manager Setup Script
# This script sets up the environment and starts the application

# Set development mode
export NODE_ENV=development

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
fi

# Check if DATABASE_URL is set, provide info if not
if [ -z "$DATABASE_URL" ]; then
  echo "No DATABASE_URL environment variable detected."
  echo "The application will use a local SQLite database for development."
  echo "To use PostgreSQL, create a .env file with DATABASE_URL set."
else
  echo "Using PostgreSQL database connection."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Initialize the database schema
echo "Applying database migrations..."
npm run db:push

# Seed the database with initial data
echo "Seeding the database..."
npm run db:seed

# Start the application
echo "Starting the application..."
npm run dev