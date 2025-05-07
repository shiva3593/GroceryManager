#!/bin/bash

# Enable error handling
set -e
trap 'echo "Error on line $LINENO"' ERR

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to setup database configuration
setup_database() {
    # Set default database URL if not set
    if [ -z "$DATABASE_URL" ]; then
        export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/grocery_manager"
        log "Setting default DATABASE_URL: $DATABASE_URL"
    fi

    # Ensure DATABASE_URL is properly formatted
    if [[ ! "$DATABASE_URL" =~ ^postgresql:// ]]; then
        # If DATABASE_URL doesn't start with postgresql://, add it
        export DATABASE_URL="postgresql://${DATABASE_URL#*://}"
    fi

    # Ensure DATABASE_URL has username and password
    if [[ ! "$DATABASE_URL" =~ @ ]]; then
        # If no username/password, add default postgres:postgres
        export DATABASE_URL="postgresql://postgres:postgres@${DATABASE_URL#*://}"
    fi

    # Extract database name from DATABASE_URL
    DB_NAME=$(echo "$DATABASE_URL" | sed -E 's/^.*\/([^/]+)$/\1/')

    if [ -z "$DB_NAME" ]; then
        log "Error: Could not extract database name from DATABASE_URL"
        log "Please check your DATABASE_URL format"
        exit 1
    fi

    # Check if database exists
    if ! psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        log "Database $DB_NAME does not exist. Creating database..."
        # Create the database
        createdb "$DB_NAME"
        if [ $? -ne 0 ]; then
            log "Failed to create database $DB_NAME"
            exit 1
        fi
        log "Database $DB_NAME created successfully"
    fi

    # Verify database connection
    log "Verifying database connection..."
    if ! pg_isready -d "$DB_NAME" > /dev/null 2>&1; then
        log "Database is not accessible. Please ensure PostgreSQL is running."
        exit 1
    fi

    # Run database migrations
    log "Running database migrations..."
    npm run migrate

    # Verify database setup
    log "Verifying database setup..."
    if ! npm run db:push; then
        log "Database setup verification failed"
        exit 1
    fi
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

# Function to launch bore tunnel
launch_bore() {
    log "Starting bore tunnel setup..."
    
    # Setup database first
    setup_database

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

    # Start the local server
    log "Starting local server..."
    log "Using DATABASE_URL: $DATABASE_URL"
    
    # Start the server with the environment variable and force port 5001
    PORT=5001 env DATABASE_URL="$DATABASE_URL" npm run dev > server.log 2>&1 &
    SERVER_PID=$!
    log "Local server started with PID: $SERVER_PID"
    
    # Wait for the server to start
    log "Waiting for local server to start..."
    for i in {1..30}; do
        if curl -s -f -k https://localhost:5001 > /dev/null 2>&1; then
            log "Local server is responding"
            break
        fi
        if [ $i -eq 30 ]; then
            log "Local server failed to start after 30 seconds"
            log "Server logs:"
            tail -n 20 server.log
            kill $SERVER_PID 2>/dev/null || true
            kill $WOL_PID 2>/dev/null || true
            exit 1
        fi
        log "Waiting for local server... attempt $i/30"
        sleep 1
    done

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
        bore local 5002 --to bore.pub --port 5001 > bore.log 2>&1 &
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

# Function to setup wake-on-LAN
setup_wake_on_lan() {
    log "Setting up wake-on-LAN..."
    
    # Make the start-wol.command executable
    chmod +x server/start-wol.command
    
    # Create LaunchAgents directory if it doesn't exist
    mkdir -p ~/Library/LaunchAgents
    
    # Add the script as a login item
    osascript -e 'tell application "System Events" to make login item at end with properties {path:"'$(pwd)'/server/start-wol.command", hidden:true}'
    
    log "Wake-on-LAN setup complete. The service will start automatically when you log in."
}

# Check if script is called with --bore argument
if [ "$1" == "--bore" ]; then
    launch_bore
    exit 0
fi

# Setup database for local development
setup_database

# Setup wake-on-LAN
setup_wake_on_lan

# Run start-wol.sh
log "Starting wake-on-LAN and bore tunnel..."
./start-wol.sh

# Check for tunnel options
echo "Select a tunnel service to expose your local server:"
echo "1) ngrok"
echo "2) bore (free static URL)"
echo "3) No tunnel"
read -p "Enter your choice (1-3): " TUNNEL_CHOICE

case $TUNNEL_CHOICE in
    1)
        # Check if ngrok is installed
        if ! command -v ngrok &> /dev/null; then
            echo "Warning: ngrok is not installed. To expose your local server to the internet, please install ngrok:"
            echo "  brew install ngrok (on macOS)"
            echo "  or visit https://ngrok.com/download"
        else
            echo "Starting ngrok tunnel..."
            # Start ngrok in the background
            ngrok http https://localhost:5001 > /dev/null 2>&1 &
            NGROK_PID=$!
            
            # Wait a moment for ngrok to start
            sleep 2
            
            # Get the ngrok URL
            NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*')
            
            if [ ! -z "$NGROK_URL" ]; then
                echo "ngrok tunnel established!"
                echo "Your application is now available at: $NGROK_URL"
            else
                echo "Failed to establish ngrok tunnel. Please check ngrok configuration."
            fi
        fi
        ;;
    2)
        launch_bore
        ;;
    3)
        echo "No tunnel service selected. Running server locally only."
        ;;
    *)
        echo "Invalid choice. Running server locally only."
        ;;
esac

echo "Starting development server..."

# Start the development server with proper database configuration
env DATABASE_URL="$DATABASE_URL" npm run dev

# Cleanup tunnel process when the script exits
if [ ! -z "$NGROK_PID" ]; then
    trap "kill $NGROK_PID 2>/dev/null || true" EXIT
elif [ ! -z "$BORE_PID" ]; then
    trap "kill $BORE_PID 2>/dev/null || true" EXIT
fi