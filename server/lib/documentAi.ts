/**
 * AI-based document verification
 * Handles document recognition, OCR, and validation
 */

import fs from 'fs';
import path from 'path';
import { DocumentType, VerificationResult } from '@shared/schema';
import { processImage } from './imageProcessing';

// In a real implementation, we would import TensorFlow.js or a similar library
// import * as tf from '@tensorflow/tfjs-node';

/**
 * Process and verify a document using AI
 * @param filePath Path to the document image file
 * @param documentType Type of document to verify
 * @returns Verification result
 */
export async function processAndVerifyDocument(
  filePath: string, 
  documentType: string
): Promise<VerificationResult> {
  try {
    console.log(`Processing ${documentType} document at ${filePath}`);
    
    // Step 1: Image preprocessing to enhance quality for OCR
    const processedImagePath = await processImage(filePath);
    
    // Step 2: Perform OCR on the image
    const ocrText = await performOcr(processedImagePath);
    
    // Step 3: Validate the document based on the OCR text
    const validationResult = validateDocument(ocrText, documentType as DocumentType);
    
    // Clean up the processed image
    fs.unlink(processedImagePath, (err) => {
      if (err) console.error("Error deleting processed image:", err);
    });
    
    if (!validationResult.isValid) {
      return {
        isValid: false,
        errorDetails: validationResult.reasons.join(', ')
      };
    }
    
    return {
      isValid: true,
      documentId: validationResult.documentId,
      documentType: documentType
    };
  } catch (error) {
    console.error("Error processing document:", error);
    return {
      isValid: false,
      errorDetails: `Error processing document: ${error}`
    };
  }
}

/**
 * Perform OCR (Optical Character Recognition) on an image
 * @param imagePath Path to the image file
 * @returns Extracted text from the image
 */
async function performOcr(imagePath: string): Promise<string> {
  // In a real implementation, this would use a proper OCR service or library
  /*
  // Example using Tesseract.js or similar OCR library:
  const { createWorker } = require('tesseract.js');
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(imagePath);
  await worker.terminate();
  return text;
  */
  
  // For this implementation, we'll simulate OCR based on the document type
  console.log(`Performing OCR on ${imagePath}`);
  
  // Simulate OCR processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Extract document type from filename (in real implementation, would use actual OCR)
  const fileName = path.basename(imagePath).toLowerCase();
  
  if (fileName.includes('aadhar')) {
    return "GOVERNMENT OF INDIA\nAadhar Number: 1234 5678 9012\nName: John Doe\nDOB: 01/01/1990\nGender: Male\nAddress: 123 Main St, Anytown, India\nIssue Date: 01/01/2022";
  } else if (fileName.includes('pan')) {
    return "INCOME TAX DEPARTMENT\nPermanent Account Number\nPANNO: ABCPK1234Z\nName: JOHN DOE\nFather's Name: ROBERT DOE\nDOB: 01/01/1990\nIssue Date: 01/01/2019";
  } else if (fileName.includes('driving') || fileName.includes('license')) {
    return "DRIVING LICENSE\nLicense No: DL-0123456789\nName: JOHN DOE\nAddress: 123 Main St\nDOB: 01/01/1990\nIssue Date: 01/01/2020\nValid Till: 31/12/2030";
  } else {
    // For other document types, use a generic document format
    return "OFFICIAL DOCUMENT\nID: DOC123456\nName: JOHN DOE\nIssue Date: 01/01/2022\nExpiry: 01/01/2027";
  }
}

/**
 * Validates a document based on OCR text and document type
 * @param ocrText OCR text from document
 * @param documentType Type of document
 * @returns Validation result object
 */
function validateDocument(ocrText: string, documentType: DocumentType): {
  isValid: boolean;
  documentId?: string;
  reasons: string[];
} {
  console.log(`Validating ${documentType} document`);
  
  const reasons: string[] = [];
  
  // Check if OCR text is too short (OCR likely failed)
  if (ocrText.length < 20) {
    reasons.push("Could not clearly read document text. Please ensure good lighting and clear image quality.");
    return { isValid: false, reasons };
  }
  
  // Extract document ID based on document type
  const documentId = extractDocumentId(ocrText, documentType);
  if (!documentId) {
    reasons.push(`Could not find valid ${documentType.replace('_', ' ')} number in the document.`);
    return { isValid: false, reasons };
  }
  
  // Check for document expiry
  const expiryMatch = ocrText.match(/(?:expir[a-z]*|valid\s+(?:till|until|thru)):\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
  if (expiryMatch) {
    const expiryDateParts = expiryMatch[1].split(/[\/\-\.]/);
    if (expiryDateParts.length === 3) {
      let year = parseInt(expiryDateParts[2]);
      if (year < 100) year += 2000; // Assuming 20xx for two-digit years
      
      const month = parseInt(expiryDateParts[1]) - 1; // JavaScript months are 0-indexed
      const day = parseInt(expiryDateParts[0]);
      const expiryDate = new Date(year, month, day);
      
      if (expiryDate < new Date()) {
        reasons.push("Document has expired. Please provide a valid, non-expired document.");
      }
    }
  }
  
  // Document-specific validation
  switch (documentType) {
    case 'aadhar':
      if (!ocrText.match(/GOVERNMENT\s+OF\s+INDIA|UID|UIDAI|UNIQUE\s+IDENTIFICATION/i)) {
        reasons.push("Document doesn't appear to be a genuine Aadhar card.");
      }
      
      // Validate Aadhar number format (12 digits)
      if (documentId && !documentId.replace(/\s/g, '').match(/^\d{12}$/)) {
        reasons.push("Aadhar card number format is invalid.");
      }
      break;
      
    case 'pan':
      if (!ocrText.match(/INCOME\s+TAX\s+DEPARTMENT|PERMANENT\s+ACCOUNT\s+NUMBER/i)) {
        reasons.push("Document doesn't appear to be a genuine PAN card.");
      }
      
      // Validate PAN format (ABCDE1234F)
      if (documentId && !documentId.match(/^[A-Z]{5}\d{4}[A-Z]$/)) {
        reasons.push("PAN card number format is invalid.");
      }
      break;
      
    case 'driving_license':
      if (!ocrText.match(/DRIVING\s+LIC[E]?NSE|MOTOR\s+VEHICLE/i)) {
        reasons.push("Document doesn't appear to be a genuine driving license.");
      }
      break;
      
    case 'passport':
      if (!ocrText.match(/PASSPORT|REPUBLIC/i)) {
        reasons.push("Document doesn't appear to be a genuine passport.");
      }
      break;
      
    case 'voter_id':
      if (!ocrText.match(/ELECTION\s+COMMISSION|VOTER|IDENTITY\s+CARD/i)) {
        reasons.push("Document doesn't appear to be a genuine voter ID.");
      }
      break;
  }
  
  return {
    isValid: reasons.length === 0,
    documentId: reasons.length === 0 ? documentId : undefined,
    reasons
  };
}

/**
 * Extracts document ID from OCR text based on document type
 * @param ocrText OCR text from document
 * @param documentType Type of document
 * @returns Extracted document ID or undefined if not found
 */
function extractDocumentId(ocrText: string, documentType: DocumentType): string | undefined {
  // Define regex patterns for different document types
  const patterns: Record<DocumentType, RegExp> = {
    aadhar: /\b\d{4}\s?\d{4}\s?\d{4}\b/,         // Aadhar: 1234 5678 9012
    pan: /\b[A-Z]{5}\d{4}[A-Z]\b/,               // PAN: ABCDE1234F
    driving_license: /\b(?:DL|dl)[- ]?\d{10,16}\b/, // Driving License: DL-0123456789
    passport: /\b[A-Z]\d{7}\b/,                  // Passport: J1234567
    voter_id: /\b[A-Z]{3}\d{7}\b/                // Voter ID: ABC1234567
  };
  
  const pattern = patterns[documentType];
  if (!pattern) return undefined;
  
  const match = ocrText.match(pattern);
  return match ? match[0] : undefined;
}
