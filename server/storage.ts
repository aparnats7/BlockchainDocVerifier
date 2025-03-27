import { users, documents, type User, type InsertUser, type Document, type InsertDocument } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document methods
  getDocuments(userId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocumentStatus(id: number, status: string): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  userCurrentId: number;
  documentCurrentId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.userCurrentId = 1;
    this.documentCurrentId = 1;
    
    // Add a demo user
    this.createUser({
      username: "demo",
      password: "password",
      fullName: "Demo User",
      email: "demo@example.com"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Document methods
  async getDocuments(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      doc => doc.userId === userId
    );
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentCurrentId++;
    const now = new Date();
    
    // Ensure all properties are correctly typed
    const document: Document = {
      id,
      userId: insertDocument.userId,
      documentType: insertDocument.documentType,
      documentName: insertDocument.documentName,
      documentNumber: insertDocument.documentNumber || null,
      ipfsHash: insertDocument.ipfsHash,
      blockchainRef: insertDocument.blockchainRef || null,
      thumbnailIpfsHash: insertDocument.thumbnailIpfsHash || null,
      verificationStatus: insertDocument.verificationStatus,
      verificationDetails: insertDocument.verificationDetails || null,
      createdAt: now,
      updatedAt: now
    };
    
    this.documents.set(id, document);
    return document;
  }
  
  async updateDocumentStatus(id: number, status: string): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updated: Document = {
      ...document,
      verificationStatus: status,
      updatedAt: new Date()
    };
    
    this.documents.set(id, updated);
    return updated;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
}

export const storage = new MemStorage();
