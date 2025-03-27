import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { verifyDocumentService } from "./verificationService";
import { storeOnBlockchain, retrieveFromBlockchain } from "./blockchainService";
import { VerificationStatus, insertDocumentSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes - all prefixed with /api
  
  // Get all documents for the current user
  app.get("/api/documents", async (req, res) => {
    try {
      // In a real app, you would get the user ID from the session
      const userId = 1; // Default to user 1 for demo
      const documents = await storage.getDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Get a specific document
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const docId = parseInt(req.params.id);
      if (isNaN(docId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await storage.getDocument(docId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Download a document from blockchain/IPFS
  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      const docId = parseInt(req.params.id);
      if (isNaN(docId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await storage.getDocument(docId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (document.verificationStatus !== VerificationStatus.VERIFIED) {
        return res.status(400).json({ message: "Document is not verified" });
      }

      // Retrieve document from blockchain/IPFS
      const documentData = await retrieveFromBlockchain(document.ipfsHash);
      if (!documentData) {
        return res.status(500).json({ message: "Failed to retrieve document from storage" });
      }

      res.set('Content-Type', 'application/octet-stream');
      res.set('Content-Disposition', `attachment; filename="${document.documentName}"`);
      res.send(documentData);
    } catch (error) {
      console.error("Error downloading document:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Create a new document
  app.post("/api/documents", upload.single('document'), async (req, res) => {
    try {
      // We can accept either a file upload or JSON data
      let documentData;
      
      if (req.file) {
        // If a file was uploaded, process it with the verification service
        const file = req.file;
        const documentType = req.body.documentType;
        
        if (!documentType) {
          return res.status(400).json({ message: "Document type is required" });
        }
        
        // Verify the document
        const verificationResult = await verifyDocumentService(documentType, file.buffer);
        
        if (!verificationResult.isValid) {
          return res.status(400).json({ 
            message: "Document verification failed", 
            issues: verificationResult.issues 
          });
        }
        
        // Store on blockchain/IPFS
        const blockchainResult = await storeOnBlockchain(file.buffer, {
          documentType,
          documentNumber: verificationResult.documentInfo?.documentNumber,
          metadata: verificationResult.documentInfo
        });
        
        // Prepare the document data
        documentData = {
          userId: 1, // Default to user 1 for demo
          documentType,
          documentName: req.body.documentName || `${documentType} Document`,
          documentNumber: verificationResult.documentInfo?.documentNumber,
          ipfsHash: blockchainResult.ipfsHash,
          blockchainRef: blockchainResult.blockchainRef,
          verificationStatus: VerificationStatus.VERIFIED,
          verificationDetails: verificationResult
        };
      } else {
        // If JSON data was provided directly (e.g. from a frontend that already did verification)
        documentData = req.body;
        
        // Validate with our schema
        const validationResult = insertDocumentSchema.safeParse({
          ...documentData,
          userId: documentData.userId || 1 // Default to user 1 for demo
        });
        
        if (!validationResult.success) {
          return res.status(400).json({ 
            message: "Invalid document data",
            errors: validationResult.error.errors
          });
        }
        
        documentData = validationResult.data;
      }
      
      // Save to storage
      const document = await storage.createDocument(documentData);
      
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Verify a document (separate endpoint for verification only)
  app.post("/api/verify", upload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No document provided" });
      }
      
      const file = req.file;
      const documentType = req.body.documentType;
      
      if (!documentType) {
        return res.status(400).json({ message: "Document type is required" });
      }
      
      // Verify the document
      const verificationResult = await verifyDocumentService(documentType, file.buffer);
      
      res.json(verificationResult);
    } catch (error) {
      console.error("Error verifying document:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Update a document's status
  app.patch("/api/documents/:id/status", async (req, res) => {
    try {
      const docId = parseInt(req.params.id);
      if (isNaN(docId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const { status } = req.body;
      
      // Validate status
      const statusSchema = z.enum([
        VerificationStatus.PENDING,
        VerificationStatus.VERIFIED,
        VerificationStatus.FAILED
      ]);
      
      const validationResult = statusSchema.safeParse(status);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const document = await storage.updateDocumentStatus(docId, status);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json(document);
    } catch (error) {
      console.error("Error updating document status:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Delete a document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const docId = parseInt(req.params.id);
      if (isNaN(docId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const success = await storage.deleteDocument(docId);
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
