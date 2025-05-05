#!/bin/bash

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Function to setup database configuration
setup_database() {
    # Set default database URL if not set
    if [ -z "$DATABASE_URL" ]; then
        export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/grocery_manager"
        echo "Setting default DATABASE_URL: $DATABASE_URL"
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
        echo "Error: Could not extract database name from DATABASE_URL"
        echo "Please check your DATABASE_URL format"
        exit 1
    fi

    # Check if database exists
    if ! psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        echo "Database $DB_NAME does not exist. Creating database..."
        # Create the database
        createdb "$DB_NAME"
        if [ $? -ne 0 ]; then
            echo "Failed to create database $DB_NAME"
            exit 1
        fi
        echo "Database $DB_NAME created successfully"
    fi

    # Verify database connection
    echo "Verifying database connection..."
    if ! pg_isready -d "$DB_NAME" > /dev/null 2>&1; then
        echo "Database is not accessible. Please ensure PostgreSQL is running."
        exit 1
    fi

    # Run database migrations
    echo "Running database migrations..."
    npm run migrate

    # Verify database setup
    echo "Verifying database setup..."
    if ! npm run db:push; then
        echo "Database setup verification failed"
        exit 1
    fi
}

# Function to launch bore tunnel
launch_bore() {
    # Setup database first
    setup_database

    # Check if bore is installed
    if ! command -v bore &> /dev/null; then
        echo "Installing bore..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # Install Rust if not installed
            if ! command -v rustc &> /dev/null; then
                echo "Installing Rust..."
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
            echo "Please install bore manually:"
            echo "Visit: https://github.com/ekzhang/bore"
            exit 1
        fi
    fi
    
    # Ensure bore is in PATH
    source "$HOME/.cargo/env"
    
    # Check for existing bore processes and kill them
    echo "Checking for existing bore tunnels..."
    pkill -f "bore local" || true
    sleep 2  # Wait for processes to clean up
    
    # Check if port 5001 is in use
    if lsof -i :5001 > /dev/null 2>&1; then
        echo "Port 5001 is still in use. Attempting to free it..."
        lsof -ti :5001 | xargs kill -9 2>/dev/null || true
        sleep 2  # Wait for port to be freed
    fi
    
    # Start the local server in the background
    echo "Starting local server..."
    echo "Using DATABASE_URL: $DATABASE_URL"
    
    # Start the server with the environment variable
    env DATABASE_URL="$DATABASE_URL" npm run dev &
    SERVER_PID=$!
    
    # Wait for the server to start
    echo "Waiting for local server to start..."
    for i in {1..30}; do
        if curl -s -f -k https://localhost:5001 > /dev/null; then
            break
        fi
        if [ $i -eq 30 ]; then
            echo "Local server failed to start"
            kill $SERVER_PID 2>/dev/null || true
            exit 1
        fi
        sleep 1
    done
    
    echo "Starting bore tunnel..."
    # Start bore with a fixed subdomain and proper configuration
    bore local 5001 \
        --to bore.pub \
        --port 5001 &
    BORE_PID=$!
    
    # Wait a moment for the tunnel to start
    sleep 3
    
    # Verify the tunnel is running
    if ! ps -p $BORE_PID > /dev/null; then
        echo "Failed to start bore tunnel. Please check the logs above for errors."
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
    
    echo "================================================"
    echo "🚀 bore tunnel established successfully!"
    echo "🌐 Your application is now available at:"
    echo "   https://bore.pub:5001"
    echo "================================================"
    echo ""
    echo "Press Ctrl+C to stop the tunnel"
    echo ""
    
    # Cleanup processes when the script exits
    trap "kill $SERVER_PID $BORE_PID 2>/dev/null || true" EXIT
    
    # Keep the script running to maintain the tunnel
    wait $BORE_PID
}

# Check if script is called with --bore argument
if [ "$1" == "--bore" ]; then
    launch_bore
    exit 0
fi

# Setup database for local development
setup_database

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