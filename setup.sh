#!/bin/bash

# Check if required software is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

if ! command -v openssl &> /dev/null; then
    echo "OpenSSL is not installed. Please install OpenSSL first."
    exit 1
fi

# Create necessary directories
mkdir -p server/certs
mkdir -p db

# Generate SSL certificates
echo "Generating SSL certificates..."
openssl req -x509 -newkey rsa:4096 -keyout server/certs/key.pem -out server/certs/cert.pem -days 365 -nodes \
    -subj "/CN=localhost" \
    -addext "subjectAltName=IP:192.168.1.210,DNS:localhost"

# Initialize SQLite database
echo "Initializing database..."
rm -f db/local_dev.db
sqlite3 db/local_dev.db < db/migrations.sql

# Install dependencies
echo "Installing dependencies..."
npm install

# Build client
echo "Building client..."
cd client
npm install
npm run build
cd ..

# Start server
echo "Starting server..."
npm run dev

echo "Setup complete! You can now access the application at:"
echo "https://192.168.1.210:5001"
echo ""
echo "To trust the SSL certificate in Safari:"
echo "1. Open https://192.168.1.210:5001 in Safari"
echo "2. Click 'Show Certificate' in the security warning"
echo "3. Click 'Trust' and select 'Always Trust'"
echo "4. Enter your password when prompted"