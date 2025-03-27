import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertDocumentSchema } from "@shared/schema";
import { processAndVerifyDocument } from "./lib/documentAi";
import { uploadToIpfs } from "./lib/ipfs";
import { storeOnBlockchain } from "./lib/blockchain";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check route
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Get document stats
  app.get("/api/stats", async (req, res) => {
    try {
      // Using a mock user ID for simplicity, in a real app this would come from authentication
      const userId = 1;
      const stats = await storage.getDocumentStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: `Error fetching stats: ${error}` });
    }
  });

  // Get all documents
  app.get("/api/documents", async (req, res) => {
    try {
      // Using a mock user ID for simplicity, in a real app this would come from authentication
      const userId = 1;
      const documents = await storage.getDocuments(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: `Error fetching documents: ${error}` });
    }
  });

  // Get document by ID
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json(document);
    } catch (error) {
      res.status(500).json({ message: `Error fetching document: ${error}` });
    }
  });

  // Upload and verify document
  app.post("/api/documents/verify", upload.single("document"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No document file uploaded" });
      }

      if (!req.body.documentType) {
        return res.status(400).json({ message: "Document type is required" });
      }

      // Using a mock user ID for simplicity, in a real app this would come from authentication
      const userId = 1;
      const documentType = req.body.documentType;
      const filePath = req.file.path;

      // Create initial pending document record
      const pendingDocument = await storage.createDocument({
        userId,
        documentType,
        documentId: "pending-verification",
        status: "pending",
        ipfsHash: null,
        blockchainTxId: null,
        errorDetails: null,
        metadata: null
      });

      // Process in background and send response immediately
      res.json({
        message: "Document verification in progress",
        documentId: pendingDocument.id,
      });

      // Process the document with AI
      const verificationResult = await processAndVerifyDocument(filePath, documentType);
      
      // If document is valid, store it on IPFS and blockchain
      if (verificationResult.isValid) {
        // Upload document to IPFS
        const ipfsHash = await uploadToIpfs(filePath);
        
        // Store reference on blockchain
        const blockchainTxId = await storeOnBlockchain({
          documentId: verificationResult.documentId!,
          documentType,
          ipfsHash,
          userId,
        });
        
        // Update document with verification results
        await storage.updateDocument(pendingDocument.id, {
          documentId: verificationResult.documentId!,
          status: "verified",
          ipfsHash,
          blockchainTxId,
        });
      } else {
        // Update document with error details
        await storage.updateDocument(pendingDocument.id, {
          status: "invalid",
          errorDetails: verificationResult.errorDetails,
        });
      }

      // Clean up the temporary file
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting temporary file:", err);
      });
    } catch (error) {
      res.status(500).json({ message: `Error processing document: ${error}` });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const deleted = await storage.deleteDocument(id);
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: `Error deleting document: ${error}` });
    }
  });

  // Get blockchain status
  app.get("/api/blockchain/status", (_req, res) => {
    res.json({
      networkStatus: "active",
      lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      securityLevel: "256-bit encryption"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
