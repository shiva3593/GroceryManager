#!/bin/bash

# Create certs directory if it doesn't exist
mkdir -p certs

# Generate SSL certificates
openssl req -x509 -newkey rsa:2048 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/CN=localhost"

echo "SSL certificates generated successfully in the certs directory" 