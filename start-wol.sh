#!/bin/bash

# Enable error handling
set -e
trap 'echo "Error on line $LINENO"' ERR

# Set environment variables
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/grocery_manager"
export NODE_ENV="development"
export JWT_SECRET="your-secret-key"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to cleanup processes
cleanup_processes() {
    log "Cleaning up existing processes..."
    # Kill any existing node processes
    log "Killing Node.js processes..."
    pkill -f "node.*wake-on-lan.js" || true
    pkill -f "node.*port-forward.js" || true
    pkill -f "tsx.*server/index.ts" || true
    pkill -f "bore local" || true
    
    # Kill any processes using our ports
    log "Killing processes using ports 5001-5003..."
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    lsof -ti:5002 | xargs kill -9 2>/dev/null || true
    lsof -ti:5003 | xargs kill -9 2>/dev/null || true
    
    # Wait for processes to fully terminate
    log "Waiting for processes to terminate..."
    sleep 2
}

# Function to check if server is healthy
check_server_health() {
    curl -s -f -k https://localhost:5001 > /dev/null
    return $?
}

# Function to check if bore tunnel is healthy
check_bore_health() {
    curl -s -f -k https://bore.pub:5001 > /dev/null
    return $?
}

# Function to start bore tunnel
start_bore_tunnel() {
    log "Starting bore tunnel..."
    # Add keepalive and retry options
    bore local 5002 --to bore.pub --port 5001 --keepalive 30 --retry 5 > bore.log 2>&1 &
    BORE_PID=$!
    log "Bore tunnel started with PID: $BORE_PID"
    sleep 3  # Wait for tunnel to establish
    
    # Verify tunnel is running
    if ! ps -p $BORE_PID > /dev/null; then
        log "Failed to start bore tunnel"
        log "Bore logs:"
        tail -n 20 bore.log
        return 1
    fi
    
    # Wait for tunnel to be healthy
    for i in {1..10}; do
        if check_bore_health; then
            log "Bore tunnel is healthy"
            return 0
        fi
        log "Waiting for bore tunnel... attempt $i/10"
        sleep 1
    done
    
    log "Bore tunnel failed health check"
    log "Bore logs:"
    tail -n 20 bore.log
    return 1
}

# Function to start local server
start_local_server() {
    log "Starting local server..."
    # Start the server with the environment variable and force port 5001
    PORT=5001 env DATABASE_URL="$DATABASE_URL" npm run dev > server.log 2>&1 &
    SERVER_PID=$!
    log "Local server started with PID: $SERVER_PID"
    
    # Wait for the server to start
    log "Waiting for local server to start..."
    for i in {1..30}; do
        if check_server_health; then
            log "Local server is responding"
            return 0
        fi
        if [ $i -eq 30 ]; then
            log "Local server failed to start after 30 seconds"
            log "Server logs:"
            tail -n 20 server.log
            kill $SERVER_PID 2>/dev/null || true
            return 1
        fi
        log "Waiting for local server... attempt $i/30"
        sleep 1
    done
}

# Main function
main() {
    log "Starting wake-on-LAN and bore tunnel setup..."
    
    # Clean up any existing processes
    cleanup_processes

    # Start wake-on-LAN service first
    log "Starting wake-on-LAN service..."
    /opt/homebrew/bin/node server/wake-on-lan.js > server/wake-on-lan.log 2>&1 &
    WOL_PID=$!
    log "Wake-on-LAN service started with PID: $WOL_PID"

    # Wait for wake-on-LAN service to start
    log "Waiting for wake-on-LAN service to initialize..."
    sleep 2

    # Start local server
    if ! start_local_server; then
        log "Failed to start local server"
        kill $WOL_PID 2>/dev/null || true
        exit 1
    fi

    # Check if bore is installed
    if ! command -v bore &> /dev/null; then
        log "Installing bore..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # Install Rust if not installed
            if ! command -v rustc &> /dev/null; then
                log "Installing Rust..."
                curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
                # Source the cargo environment
                source "$HOME/.cargo/env"
            fi
            # Install bore using cargo
            source "$HOME/.cargo/env"  # Ensure cargo is in PATH
            cargo install bore-cli
            # Source again to ensure bore is in PATH
            source "$HOME/.cargo/env"
        else
            log "Please install bore manually:"
            log "Visit: https://github.com/ekzhang/bore"
            exit 1
        fi
    fi
    
    # Ensure bore is in PATH
    source "$HOME/.cargo/env"
    
    # Main loop to keep bore tunnel running
    while true; do
        if ! check_bore_health; then
            log "Bore tunnel is down, restarting..."
            pkill -f "bore local" || true
            sleep 2
            if ! start_bore_tunnel; then
                log "Failed to restart bore tunnel, retrying in 5 seconds..."
                sleep 5
                continue
            fi
        fi
        
        log "================================================"
        log "🚀 bore tunnel established successfully!"
        log "🌐 Your application is now available at:"
        log "   https://bore.pub:5001"
        log "   (Will wake up your Mac when accessed while sleeping)"
        log "================================================"
        log ""
        log "Press Ctrl+C to stop the tunnel"
        log ""
        
        # Monitor both server and tunnel health
        while check_server_health && check_bore_health; do
            sleep 5
        done
        
        log "Connection issue detected, attempting to recover..."
        sleep 2
    done
}

# Run the main function
main 