#!/bin/bash

# Kill any existing wake-on-LAN process
pkill -f wake-on-lan.js

# Start the wake-on-LAN server
cd "$(dirname "$0")"
node wake-on-lan.js &

echo "Wake-on-LAN service started. Your Mac will now wake up when someone tries to access the Grocery Manager app."
echo "Press Ctrl+C to stop the service." 