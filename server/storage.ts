import { 
  users, 
  documents, 
  type User, 
  type InsertUser,
  type Document,
  type InsertDocument,
  type DocumentType
} from "@shared/schema";
import { eq, or, count, and } from 'drizzle-orm';
import { db } from './db';
import dotenv from 'dotenv';

// Environment variables are already loaded by the server

// Interface for storage operations
export interface IStorage {
  // Database operations
  initialize(): Promise<void>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document operations
  getDocuments(userId: number): Promise<Document[]>;
  getDocumentsByType(userId: number, documentType: DocumentType): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Stats
  getDocumentStats(userId: number): Promise<{
    verifiedCount: number;
    pendingFailedCount: number;
    storageUsed: number;
  }>;
}

export class PgStorage implements IStorage {
  private initialized = false;

  constructor() {
    // This class will use the db object imported from db.ts
  }

  private get db() {
    return db; // Return the imported db object
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Mark as initialized immediately to prevent blocking repeated calls
      this.initialized = true;
      
      // Simple connection test
      await this.db.select().from(users).limit(1);
      
      // Create default user if none exists - do this in background
      setTimeout(async () => {
        try {
          const existingUsers = await this.db.select().from(users).limit(1);
          if (existingUsers.length === 0) {
            await this.createUser({
              username: "testuser",
              password: "password"
            });
            console.log("Created default user");
          }
        } catch (err) {
          console.error("Error creating default user:", err);
        }
      }, 100);
      
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      // Don't throw error, just log it - allows server to start even if DB is down
      // Will retry on next DB operation
      this.initialized = false;
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    await this.initialize();
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.initialize();
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.initialize();
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Document operations
  async getDocuments(userId: number): Promise<Document[]> {
    await this.initialize();
    return this.db.select().from(documents).where(eq(documents.userId, userId));
  }

  async getDocumentsByType(userId: number, documentType: DocumentType): Promise<Document[]> {
    await this.initialize();
    return this.db.select().from(documents).where(
      and(
        eq(documents.userId, userId),
        eq(documents.documentType, documentType)
      )
    );
  }

  async getDocument(id: number): Promise<Document | undefined> {
    await this.initialize();
    const result = await this.db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return result[0];
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    await this.initialize();
    const result = await this.db.insert(documents).values({
      ...insertDocument,
      verificationDate: new Date()
    }).returning();
    return result[0];
  }

  async updateDocument(id: number, documentUpdate: Partial<InsertDocument>): Promise<Document | undefined> {
    await this.initialize();
    const result = await this.db.update(documents)
      .set(documentUpdate)
      .where(eq(documents.id, id))
      .returning();
    return result[0];
  }

  async deleteDocument(id: number): Promise<boolean> {
    await this.initialize();
    const result = await this.db.delete(documents).where(eq(documents.id, id)).returning();
    return result.length > 0;
  }

  // Stats
  async getDocumentStats(userId: number): Promise<{
    verifiedCount: number;
    pendingFailedCount: number;
    storageUsed: number;
  }> {
    await this.initialize();
    
    // Count verified documents
    const verifiedResult = await this.db.select({ count: count() }).from(documents).where(
      and(
        eq(documents.userId, userId),
        eq(documents.status, "verified")
      )
    );
    const verifiedCount = Number(verifiedResult[0].count);
    
    // Count pending and failed documents
    const pendingFailedResult = await this.db.select({ count: count() }).from(documents).where(
      and(
        eq(documents.userId, userId),
        or(
          eq(documents.status, "pending"),
          eq(documents.status, "invalid")
        )
      )
    );
    const pendingFailedCount = Number(pendingFailedResult[0].count);
    
    // Get total document count for storage estimation
    const totalResult = await this.db.select({ count: count() }).from(documents).where(
      eq(documents.userId, userId)
    );
    const totalCount = Number(totalResult[0].count);
    
    // Estimate storage (5MB per document)
    const storageUsed = totalCount * 5;
    
    return {
      verifiedCount,
      pendingFailedCount,
      storageUsed
    };
  }
}

// For backwards compatibility, we'll keep the MemStorage class
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private currentUserId: number;
  private currentDocumentId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.currentUserId = 1;
    this.currentDocumentId = 1;
    
    // Create a default user
    this.createUser({
      username: "testuser",
      password: "password"
    });
  }

  async initialize(): Promise<void> {
    // Nothing to initialize for in-memory storage
    return Promise.resolve();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Document operations
  async getDocuments(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.userId === userId
    );
  }

  async getDocumentsByType(userId: number, documentType: DocumentType): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.userId === userId && document.documentType === documentType
    );
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const verificationDate = new Date();
    // Ensure all required fields are present
    const document: Document = { 
      ...insertDocument, 
      id, 
      verificationDate,
      userId: insertDocument.userId ?? null,
      ipfsHash: insertDocument.ipfsHash ?? null,
      blockchainTxId: insertDocument.blockchainTxId ?? null,
      errorDetails: insertDocument.errorDetails ?? null,
      metadata: insertDocument.metadata ?? null
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, documentUpdate: Partial<InsertDocument>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument = { ...document, ...documentUpdate };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Stats
  async getDocumentStats(userId: number): Promise<{
    verifiedCount: number;
    pendingFailedCount: number;
    storageUsed: number;
  }> {
    const userDocuments = Array.from(this.documents.values()).filter(
      (document) => document.userId === userId
    );
    
    const verifiedCount = userDocuments.filter(
      (document) => document.status === "verified"
    ).length;
    
    const pendingFailedCount = userDocuments.filter(
      (document) => document.status === "invalid" || document.status === "pending"
    ).length;
    
    // Mock storage calculation (in MB)
    const storageUsed = userDocuments.length * 5; // assuming each document uses 5MB
    
    return {
      verifiedCount,
      pendingFailedCount,
      storageUsed
    };
  }
}

// Use PostgreSQL storage if database URL is available, otherwise fallback to memory storage
export const storage = process.env.DATABASE_URL 
  ? new PgStorage() 
  : new MemStorage();
