import dgram from 'dgram';
import net from 'net';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// Your Mac's MAC address
const MAC_ADDRESS = '5e:98:50:b8:b5:6b';
const WOL_PORT = 9; // Standard wake-on-LAN port
const LISTEN_PORT = 5002; // Port for our wake-on-LAN service (bore will connect here)
const APP_PORT = 5001; // Fixed port for the app

// Track active connections
let activeConnections = 0;

// Function to prevent sleep
function preventSleep() {
    // Use pmset to prevent sleep
    exec('pmset -a disablesleep 1', (error) => {
        if (error) {
            console.error('Error preventing sleep:', error);
        } else {
            console.log('Sleep prevention enabled');
        }
    });
}

// Function to allow sleep
function allowSleep() {
    // Re-enable sleep
    exec('pmset -a disablesleep 0', (error) => {
        if (error) {
            console.error('Error allowing sleep:', error);
        } else {
            console.log('Sleep prevention disabled');
        }
    });
}

// Get the broadcast address from the network interface
function getBroadcastAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 interfaces
            if (iface.internal || iface.family !== 'IPv4') continue;
            
            // Calculate broadcast address
            const ipParts = iface.address.split('.');
            const maskParts = iface.netmask.split('.');
            const broadcastParts = ipParts.map((part, i) => 
                (parseInt(part) | (~parseInt(maskParts[i]) & 0xff)).toString()
            );
            return broadcastParts.join('.');
        }
    }
    return '255.255.255.255'; // Fallback to global broadcast
}

const BROADCAST_ADDR = getBroadcastAddress();

// Create magic packet
function createMagicPacket(mac) {
    const macBuffer = Buffer.from(mac.replace(/:/g, ''), 'hex');
    const magicPacket = Buffer.alloc(102);
    
    // First 6 bytes are 0xFF
    for (let i = 0; i < 6; i++) {
        magicPacket[i] = 0xFF;
    }
    
    // Next 96 bytes are the MAC address repeated 16 times
    for (let i = 0; i < 16; i++) {
        macBuffer.copy(magicPacket, 6 + (i * 6));
    }
    
    return magicPacket;
}

// Send magic packet with retries
async function sendMagicPacket(mac, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await new Promise((resolve, reject) => {
                const client = dgram.createSocket('udp4');
                
                client.on('error', (err) => {
                    console.error('Socket error:', err);
                    client.close();
                    reject(err);
                });

                client.on('listening', () => {
                    client.setBroadcast(true);
                    const magicPacket = createMagicPacket(mac);
                    
                    console.log(`Sending wake-on-LAN packet (attempt ${attempt}/${retries}) to broadcast address:`, BROADCAST_ADDR);
                    client.send(magicPacket, 0, magicPacket.length, WOL_PORT, BROADCAST_ADDR, (err) => {
                        if (err) {
                            console.error('Error sending magic packet:', err);
                            reject(err);
                        } else {
                            console.log('Magic packet sent successfully');
                            resolve();
                        }
                        client.close();
                    });
                });

                client.bind();
            });
            
            // If we get here, the packet was sent successfully
            return;
        } catch (err) {
            console.error(`Failed to send magic packet (attempt ${attempt}/${retries}):`, err);
            if (attempt < retries) {
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    throw new Error(`Failed to send magic packet after ${retries} attempts`);
}

// Function to check if the app is responding
async function isAppResponding() {
    return new Promise((resolve) => {
        const client = net.createConnection(APP_PORT, 'localhost', () => {
            client.end();
            resolve(true);
        });
        
        client.on('error', () => {
            resolve(false);
        });
        
        // Set a timeout
        setTimeout(() => {
            client.destroy();
            resolve(false);
        }, 1000);
    });
}

// Create TCP server to monitor connections
const server = net.createServer(async (socket) => {
    const clientAddress = socket.remoteAddress;
    console.log(`New connection from ${clientAddress}:${socket.remotePort}`);
    activeConnections++;
    
    // Prevent sleep when we have active connections
    if (activeConnections === 1) {
        preventSleep();
    }
    
    try {
        // Send wake-on-LAN packet
        console.log('Processing connection...');
        await sendMagicPacket(MAC_ADDRESS);
        
        // Wait for the app to wake up
        console.log('Waiting for app to wake up...');
        let attempts = 0;
        while (!(await isAppResponding()) && attempts < 30) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (attempts % 5 === 0) {
                // Send another wake packet every 5 attempts
                await sendMagicPacket(MAC_ADDRESS);
            }
        }
        
        if (attempts >= 30) {
            throw new Error('App failed to wake up after 30 seconds');
        }
        
        console.log('App is responding, forwarding connection...');
        
        // Forward the connection to the app port
        const appSocket = net.createConnection(APP_PORT, 'localhost', () => {
            socket.pipe(appSocket);
            appSocket.pipe(socket);
        });
        
        appSocket.on('error', (err) => {
            console.error('Error forwarding to app:', err);
            socket.end();
        });
    } catch (err) {
        console.error('Error handling connection:', err);
        socket.end();
    }
    
    // Handle connection close
    socket.on('close', () => {
        activeConnections--;
        console.log(`Connection closed. Active connections: ${activeConnections}`);
        
        // Allow sleep if no more active connections
        if (activeConnections === 0) {
            allowSleep();
        }
    });
});

// Handle server errors
server.on('error', (err) => {
    console.error('Server error:', err);
});

// Start the server
server.listen(LISTEN_PORT, '0.0.0.0', () => {
    console.log(`Wake-on-LAN server listening on all interfaces, port ${LISTEN_PORT}`);
    console.log('Forwarding connections to app on port', APP_PORT);
    console.log('Your Mac will wake up when someone tries to access the Grocery Manager app');
    console.log('Broadcast address:', BROADCAST_ADDR);
    console.log('MAC address:', MAC_ADDRESS);
}); 