import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  documentType: text("document_type").notNull(), // 'AADHAR', 'PAN', 'DL'
  documentNumber: text("document_number"),
  documentName: text("document_name").notNull(),
  ipfsHash: text("ipfs_hash").notNull(),
  blockchainRef: text("blockchain_ref"),
  thumbnailIpfsHash: text("thumbnail_ipfs_hash"),
  verificationStatus: text("verification_status").notNull(), // 'PENDING', 'VERIFIED', 'FAILED'
  verificationDetails: json("verification_details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  documentType: true,
  documentName: true,
  documentNumber: true,
  ipfsHash: true,
  thumbnailIpfsHash: true,
  verificationStatus: true,
  verificationDetails: true,
  blockchainRef: true,
});

// Enums for the frontend
export const DocumentTypes = {
  AADHAR: "AADHAR",
  PAN: "PAN",
  DRIVING_LICENSE: "DRIVING_LICENSE"
} as const;

export const VerificationStatus = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  FAILED: "FAILED"
} as const;

// Frontend schemas
export const documentTypeSchema = z.enum([
  DocumentTypes.AADHAR,
  DocumentTypes.PAN,
  DocumentTypes.DRIVING_LICENSE
]);

export const verificationStatusSchema = z.enum([
  VerificationStatus.PENDING,
  VerificationStatus.VERIFIED,
  VerificationStatus.FAILED
]);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type DocumentType = typeof DocumentTypes[keyof typeof DocumentTypes];
export type VerificationStatusType = typeof VerificationStatus[keyof typeof VerificationStatus];
