import { create } from 'ipfs-http-client';
import * as buffer from 'buffer';
import fetch from 'node-fetch';

// Interface for blockchain storage result
interface BlockchainStorageResult {
  success: boolean;
  ipfsHash?: string;
  blockchainRef?: string;
  error?: string;
}

// Create a basic auth token for IPFS (in a real app, get from env vars)
const projectId = process.env.IPFS_PROJECT_ID || 'ipfs-project-id';
const projectSecret = process.env.IPFS_PROJECT_SECRET || 'ipfs-project-secret';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

// Configure IPFS client
let ipfs: any;

try {
  ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth,
    },
  });
} catch (error) {
  console.error("Failed to create IPFS client:", error);
  // Fall back to a mock implementation for demo purposes
  ipfs = {
    add: async (data: any) => {
      // Generate a random IPFS hash (for demo purposes)
      const hash = 'Qm' + Array.from({ length: 44 }, () => 
        Math.floor(Math.random() * 36).toString(36)).join('');
      
      return { path: hash, size: data.length };
    }
  };
}

// Store a document on the blockchain (IPFS + simulated blockchain reference)
export async function storeOnBlockchain(
  documentData: Buffer, 
  metadata: { documentType: string; documentNumber?: string; metadata?: any }
): Promise<BlockchainStorageResult> {
  try {
    // Upload to IPFS
    const result = await ipfs.add(documentData);
    
    // In a real app, we would now register this hash on a blockchain
    // For this demo, we'll simulate a blockchain transaction
    
    // Generate a fake transaction hash
    const blockchainRef = '0x' + Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 16).toString(16)).join('');
    
    return {
      success: true,
      ipfsHash: result.path,
      blockchainRef
    };
  } catch (error) {
    console.error("Blockchain storage error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to store on blockchain"
    };
  }
}

// Retrieve a document from IPFS by its hash
export async function retrieveFromBlockchain(ipfsHash: string): Promise<Buffer | null> {
  try {
    // For a production app, we would use the IPFS client to fetch from the network
    // However, since we're likely in a sandbox environment, we'll use the public gateway
    const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.arrayBuffer();
    return Buffer.from(data);
  } catch (error) {
    console.error("Error retrieving from blockchain:", error);
    return null;
  }
}

// Verify a document exists on the blockchain
export async function verifyDocumentOnBlockchain(ipfsHash: string): Promise<boolean> {
  try {
    // In a real app, we would verify this hash exists on the blockchain
    // For this demo, we'll just check if we can access it on IPFS
    const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`, {
      method: 'HEAD' // Just check if it exists, don't download
    });
    
    return response.ok;
  } catch (error) {
    console.error("Error verifying document on blockchain:", error);
    return false;
  }
}
