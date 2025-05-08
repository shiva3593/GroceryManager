#!/bin/bash

set -e

# Colors for output
green='\033[0;32m'
red='\033[0;31m'
reset='\033[0m'

# Print header
echo -e "${green}=== GroceryManager iOS App Server Setup ===${reset}"

# Step 1: Install dependencies
if [ ! -d "node_modules" ]; then
  echo -e "${green}Installing npm dependencies...${reset}"
  npm install
else
  echo -e "${green}Dependencies already installed.${reset}"
fi

# Step 2: Build server (if using TypeScript)
if [ -f "server/start-server.ts" ]; then
  if ! command -v ts-node &> /dev/null; then
    echo -e "${green}Installing ts-node...${reset}"
    npm install -g ts-node typescript
  fi
  echo -e "${green}Starting server with ts-node...${reset}"
  npx ts-node server/start-server.ts &
  SERVER_PID=$!
else
  if [ -f "server/start-server.js" ]; then
    echo -e "${green}Starting server with node...${reset}"
    node server/start-server.js &
    SERVER_PID=$!
  else
    echo -e "${red}Could not find server/start-server.ts or server/start-server.js!${reset}"
    exit 1
  fi
fi

sleep 2

# Step 3: Print server info
PORT=5001
if lsof -i :$PORT | grep LISTEN; then
  echo -e "${green}Server is running on:${reset} http://localhost:$PORT"
else
  echo -e "${red}Server did not start on port $PORT. Check logs above for errors.${reset}"
fi

echo -e "${green}To stop the server, run:${reset} kill $SERVER_PID"

echo -e "${green}If running on a real device, use your Mac's LAN IP address instead of localhost.${reset}"

echo -e "${green}=== Setup complete ===${reset}" 