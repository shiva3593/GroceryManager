import express from 'express';
// Use .ts extension for ESM + ts-node compatibility
import { registerRoutes } from './routes.ts';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Create Express app
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Register routes
  const server = await registerRoutes(app);

  // Load SSL certificates
  const options = {
    key: fs.readFileSync(path.join(__dirname, '../certs/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certs/cert.pem'))
  };

  // Start both HTTP and HTTPS servers
  const PORT = 3001;
  const HTTP_PORT = 3000;

  // Create HTTPS server
  const httpsServer = https.createServer(options, app);
  
  // Create HTTP server
  const httpServer = http.createServer(app);

  // Start HTTP server
  httpServer.listen(HTTP_PORT, "0.0.0.0", () => {
    console.log(`HTTP Server running on http://localhost:${HTTP_PORT}`);
    console.log(`HTTP Server running on http://192.168.1.210:${HTTP_PORT}`);
  });

  // Start HTTPS server
  httpsServer.listen(PORT, "0.0.0.0", () => {
    console.log(`HTTPS Server running on https://localhost:${PORT}`);
    console.log(`HTTPS Server running on https://192.168.1.210:${PORT}`);
  }).on('error', (e: any) => {
    console.error(`Failed to start server: ${e.message}`);
    process.exit(1);
  });
}

startServer().catch(console.error); 