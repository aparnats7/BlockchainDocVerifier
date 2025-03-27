import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon to use WebSockets
neonConfig.webSocketConstructor = ws;

// Create database connection with fallback for environments without DATABASE_URL
let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not found. Using in-memory storage instead.");
    // We'll still create a minimal pool that will fail gracefully
    pool = new Pool({ connectionString: "postgresql://user:password@localhost:5432/dummy" });
  } else {
    // Create the real connection pool
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 10, // Maximum number of clients
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection not established
    });
    
    // Test the connection
    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
    
    console.log("Database connection pool established");
  }
  
  // Initialize Drizzle ORM with the connection pool
  db = drizzle({ client: pool, schema });
  
} catch (error) {
  console.error("Error setting up database:", error);
  // Create a dummy pool and db that will fail gracefully
  pool = new Pool({ connectionString: "postgresql://user:password@localhost:5432/dummy" });
  db = drizzle({ client: pool, schema });
}

export { pool, db };
