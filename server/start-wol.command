#!/bin/bash

# Change to the script directory
cd "$(dirname "$0")"

# Kill any existing processes
pkill -f wake-on-lan.js
pkill -f port-forward.js

# Start wake-on-LAN service with full path to node
/opt/homebrew/bin/node wake-on-lan.js > wake-on-lan.log 2>&1 &

# Start port forwarding service
/opt/homebrew/bin/node port-forward.js > port-forward.log 2>&1 &

# Keep the script running
wait

echo "All services are running"
echo "Your Mac will wake up when someone tries to access the Grocery Manager app" 