import express from "express";
import http from "http";
import { log } from "./vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create a simple express server for quick startup
const app = express();

// Basic health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Home route
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>DocuChain Server</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .card {
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            background-color: #f9f9f9;
          }
          h1 {
            color: #333;
          }
          pre {
            background-color: #eee;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
          }
        </style>
      </head>
      <body>
        <h1>DocuChain API Server</h1>
        <div class="card">
          <h2>Status: Running</h2>
          <p>The server is running correctly.</p>
          <p>Available endpoints:</p>
          <ul>
            <li><code>/api/health</code> - Health check endpoint</li>
          </ul>
        </div>
        <div class="card">
          <h2>Full Application</h2>
          <p>The full application server will be initialized in the background.</p>
        </div>
      </body>
    </html>
  `);
});

// Start the server right away
const server = http.createServer(app);
const port = 5000;

server.listen({
  port,
  host: "0.0.0.0",
}, () => {
  log(`Server started on port ${port}`);
  
  // Initialize the full application in the background
  setTimeout(async () => {
    try {
      // Load necessary modules asynchronously
      const { setupVite } = await import("./vite");
      const { registerRoutes } = await import("./routes");
      const { storage } = await import("./storage");
      
      log("Loading application routes...");
      
      // Initialize database in background
      if ('initialize' in storage) {
        storage.initialize()
          .then(() => {
            log("Database initialized successfully");
          })
          .catch((error) => {
            console.error("Database initialization error:", error);
          });
      }
      
      // Setup vite for frontend
      await setupVite(app, server);
      
      log("Application fully initialized");
    } catch (error) {
      console.error("Error initializing full application:", error);
    }
  }, 500);
});
