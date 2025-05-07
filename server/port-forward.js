import net from 'net';

const LOCAL_PORT = 5001;  // Your app's port
const WOL_PORT = 5002;    // Wake-on-LAN service port
const FORWARD_PORT = 5003; // Port to expose externally

const server = net.createServer((socket) => {
    const clientAddress = socket.remoteAddress;
    console.log(`New connection from ${clientAddress}:${socket.remotePort}`);

    // Connect to the wake-on-LAN service first
    const wolSocket = net.createConnection(WOL_PORT, 'localhost', () => {
        console.log('Connected to wake-on-LAN service');
        
        // After wake-on-LAN service processes the connection, connect to the app
        const appSocket = net.createConnection(LOCAL_PORT, 'localhost', () => {
            console.log('Connected to local app');
            socket.pipe(appSocket);
            appSocket.pipe(socket);
        });
        
        appSocket.on('error', (err) => {
            console.error('Error connecting to app:', err);
            socket.end();
        });
    });
    
    wolSocket.on('error', (err) => {
        console.error('Error connecting to wake-on-LAN service:', err);
        // If wake-on-LAN service fails, try connecting directly to app
        const appSocket = net.createConnection(LOCAL_PORT, 'localhost', () => {
            console.log('Connected directly to local app');
            socket.pipe(appSocket);
            appSocket.pipe(socket);
        });
        
        appSocket.on('error', (err) => {
            console.error('Error connecting to app:', err);
            socket.end();
        });
    });
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

server.listen(FORWARD_PORT, '0.0.0.0', () => {
    console.log(`Port forwarding server listening on port ${FORWARD_PORT}`);
    console.log(`Forwarding external connections to wake-on-LAN service on port ${WOL_PORT}`);
    console.log(`Wake-on-LAN service forwards to local app on port ${LOCAL_PORT}`);
}); 