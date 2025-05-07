import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { constants } from 'crypto';
import { db, pool } from './db';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Parse JSON request bodies
app.use(express.json());

// Add security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  next();
});

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
    if (!process.env.DATABASE_URL?.includes('postgresql://')) {
      throw new Error("DATABASE_URL must be a PostgreSQL connection string");
    }
    
    console.log('Using PostgreSQL database');
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
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      error: {
        message: err.message || 'Internal Server Error',
        status: err.status || 500
      }
    });
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
  const httpsServer = https.createServer({
    ...options,
    keepAliveTimeout: 60000, // 60 seconds
  }, app);

  // Function to kill any process using a port
  const killProcessOnPort = (port: number) => {
    try {
      require('child_process').execSync(`lsof -ti:${port} | xargs kill -9`);
      return true;
    } catch (err) {
      return false;
    }
  };

  // Try to start the server on the desired port
  httpsServer.listen(PORT, "0.0.0.0", () => {
    log(`HTTPS Server running on https://localhost:${PORT}`);
    log(`HTTPS Server running on https://192.168.1.210:${PORT}`);
  }).on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
      log(`Port ${PORT} is busy, attempting to free it...`);
      if (killProcessOnPort(PORT)) {
        log(`Successfully freed port ${PORT}, retrying...`);
        setTimeout(() => {
          httpsServer.listen(PORT, "0.0.0.0");
        }, 1000);
      } else {
        log(`Failed to free port ${PORT}, please check what's using it`);
        process.exit(1);
      }
    } else {
      log(`Failed to start server: ${e.message}`);
      process.exit(1);
    }
  });
})();