import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  documentType: text("document_type").notNull(), // "aadhar", "pan", "driving_license", etc.
  documentId: text("document_id").notNull(), // document number/identifier
  status: text("status").notNull(), // "verified", "invalid", "pending"
  ipfsHash: text("ipfs_hash"), // IPFS hash for the document
  blockchainTxId: text("blockchain_tx_id"), // blockchain transaction ID
  errorDetails: text("error_details"), // details if verification failed
  verificationDate: timestamp("verification_date").notNull().defaultNow(),
  metadata: jsonb("metadata"), // any additional metadata
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  documentType: true,
  documentId: true,
  status: true,
  ipfsHash: true,
  blockchainTxId: true,
  errorDetails: true,
  metadata: true,
});

export const documentTypes = [
  { value: "aadhar", label: "Aadhar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "driving_license", label: "Driving License" },
  { value: "passport", label: "Passport" },
  { value: "voter_id", label: "Voter ID" },
];

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type DocumentWithProgress = Document & {
  progress?: {
    received: boolean;
    preprocessing: boolean;
    aiVerification: boolean;
    blockchainStorage: boolean;
  };
};

export type DocumentType = (typeof documentTypes)[number]["value"];

export interface VerificationResult {
  isValid: boolean;
  documentId?: string;
  documentType?: string;
  ipfsHash?: string;
  blockchainTxId?: string;
  errorDetails?: string;
}
