import { 
  users, 
  documents, 
  type User, 
  type InsertUser,
  type Document,
  type InsertDocument,
  type DocumentType
} from "@shared/schema";

export interface IStorage {
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
    const document: Document = { ...insertDocument, id, verificationDate };
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

export const storage = new MemStorage();
