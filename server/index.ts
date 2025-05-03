import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { constants } from 'crypto';
import { db, pool } from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize database
async function initializeDatabase() {
  try {
    // Check if we're using PostgreSQL
    if (process.env.DATABASE_URL?.includes('postgresql://')) {
      console.log('Using PostgreSQL database');
      // Run SQL migrations directly
      const client = await pool.connect();
      try {
        const migrationFile = path.join(__dirname, 'migrations/001_initial_schema.sql');
        const migration = fs.readFileSync(migrationFile, 'utf8');
        await client.query(migration);
        console.log('Database migrations completed successfully');
      } catch (error) {
        console.error('Error running migrations:', error);
        throw error;
      } finally {
        client.release();
      }
    } else {
      console.log('Warning: DATABASE_URL environment variable is not set.');
      console.log('Using a local SQLite database for development.');
      console.log('Successfully initialized local SQLite database for development.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup Vite in development or serve static files in production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server
  await initializeDatabase();

  // Load SSL certificates
  const options = {
    key: fs.readFileSync(path.join(__dirname, '../certs/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certs/cert.pem'))
  };

  // Start HTTPS server
  const PORT = parseInt(process.env.PORT || '5001', 10);
  const httpsServer = https.createServer(options, app);

  httpsServer.listen(PORT, "0.0.0.0", () => {
    log(`HTTPS Server running on https://localhost:${PORT}`);
    log(`HTTPS Server running on https://192.168.1.210:${PORT}`);
  }).on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
      const nextPort = PORT + 1;
      log(`Port ${PORT} is busy, trying ${nextPort}...`);
      httpsServer.listen(nextPort, "0.0.0.0");
    }
  });
})();