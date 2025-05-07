#!/bin/bash

# Function to check if services are running
check_status() {
    if pgrep -f wake-on-lan.js > /dev/null; then
        echo "Wake-on-LAN service is running"
    else
        echo "Wake-on-LAN service is not running"
    fi
    
    if pgrep -f port-forward.js > /dev/null; then
        echo "Port forward service is running"
    else
        echo "Port forward service is not running"
    fi
}

# Function to start the services
start_service() {
    cd "$(dirname "$0")"
    
    # Start wake-on-LAN service
    if ! pgrep -f wake-on-lan.js > /dev/null; then
        node wake-on-lan.js &
        echo "Wake-on-LAN service started"
    else
        echo "Wake-on-LAN service is already running"
    fi
    
    # Start port forward service
    if ! pgrep -f port-forward.js > /dev/null; then
        node port-forward.js &
        echo "Port forward service started"
    else
        echo "Port forward service is already running"
    fi
}

# Function to stop the services
stop_service() {
    pkill -f wake-on-lan.js
    pkill -f port-forward.js
    echo "All services stopped"
}

# Main menu
while true; do
    echo ""
    echo "Wake-on-LAN Service Manager"
    echo "1. Check Status"
    echo "2. Start Services"
    echo "3. Stop Services"
    echo "4. Exit"
    echo ""
    read -p "Enter your choice (1-4): " choice

    case $choice in
        1) check_status ;;
        2) start_service ;;
        3) stop_service ;;
        4) exit 0 ;;
        *) echo "Invalid choice. Please try again." ;;
    esac
done 