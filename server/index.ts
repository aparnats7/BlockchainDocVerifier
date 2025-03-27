import express, { Express, NextFunction, Request, Response } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  // Log API requests
  if (path.startsWith("/api")) {
    res.on("finish", () => {
      const duration = Date.now() - start;
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`, "express");
    });
  }
  
  next();
});

// Add basic health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Add error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

async function startServer() {
  try {
    // Register API routes
    const server = await registerRoutes(app);
    
    // Set up Vite for development or serve static files in production
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    } else {
      await setupVite(app, server);
    }
    
    // Start the server on port 5000 (important as it's not firewalled)
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      log(`Server running on port ${port}`, "express");
      
      // Initialize database after server starts
      if ('initialize' in storage) {
        storage.initialize()
          .then(() => {
            log("Database initialized successfully", "express");
          })
          .catch((error) => {
            console.error("Database initialization error:", error);
          });
      }
    });
    
    return server;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
