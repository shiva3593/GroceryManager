#!/bin/bash

# Create cert directory if it doesn't exist
mkdir -p cert

# Create a configuration file for the certificate
cat > cert/openssl.cnf <<-EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = Organization
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = 192.168.1.210
IP.1 = 127.0.0.1
IP.2 = 192.168.1.210
EOF

# Generate private key
openssl genrsa -out cert/localhost-key.pem 2048

# Generate CSR with the configuration file
openssl req -new -key cert/localhost-key.pem -out cert/localhost.csr -config cert/openssl.cnf

# Generate self-signed certificate with extensions
openssl x509 -req -days 365 -in cert/localhost.csr -signkey cert/localhost-key.pem -out cert/localhost.pem -extensions v3_req -extfile cert/openssl.cnf

# Clean up
rm cert/localhost.csr cert/openssl.cnf

echo "SSL certificates generated successfully!"
echo "You can now access your app via HTTPS at https://localhost:5001 or https://192.168.1.210:5001"
echo "Note: You may need to trust the certificate in your system's keychain for Safari to accept it." 