import { create } from 'ipfs-http-client';
import * as buffer from 'buffer';

// Make buffer available globally for IPFS
(window as any).Buffer = buffer.Buffer;

// Create a basic auth token for IPFS (in a real app, these would come from environment variables)
const projectId = process.env.VITE_IPFS_PROJECT_ID || 'ipfs-project-id';
const projectSecret = process.env.VITE_IPFS_PROJECT_SECRET || 'ipfs-project-secret';
const auth = 'Basic ' + buffer.Buffer.from(projectId + ':' + projectSecret).toString('base64');

// Configure IPFS client
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

// Upload file to IPFS
export async function uploadToIPFS(file: File) {
  try {
    const fileBuffer = await file.arrayBuffer();
    const result = await ipfs.add(buffer.Buffer.from(fileBuffer));
    
    return {
      success: true,
      ipfsHash: result.path,
      url: `https://ipfs.io/ipfs/${result.path}`
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload to IPFS'
    };
  }
}

// Get file from IPFS
export async function getFromIPFS(ipfsHash: string) {
  try {
    const url = `https://ipfs.io/ipfs/${ipfsHash}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.status} ${response.statusText}`);
    }
    
    return {
      success: true,
      data: await response.blob(),
      url
    };
  } catch (error) {
    console.error('IPFS fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch from IPFS'
    };
  }
}

// Generate thumbnail from image
export async function generateThumbnail(imageFile: File, maxWidth = 300, maxHeight = 200) {
  return new Promise<{ thumbnailFile: File; thumbnailUrl: string }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to file
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create thumbnail blob'));
            return;
          }
          
          const thumbnailFile = new File([blob], `thumbnail_${imageFile.name}`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          
          const thumbnailUrl = URL.createObjectURL(blob);
          resolve({ thumbnailFile, thumbnailUrl });
        }, 'image/jpeg', 0.7);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for thumbnail generation'));
    };
    
    img.src = URL.createObjectURL(imageFile);
  });
}

// Save document metadata to blockchain (simulated)
export async function saveToBlockchain(documentHash: string, metadata: any) {
  try {
    // In a real app, this would interact with a smart contract
    // For this demo, we'll simulate a blockchain transaction
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a fake transaction hash
    const transactionHash = '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)).join('');
    
    return {
      success: true,
      transactionHash,
      blockchainRef: transactionHash.substring(0, 10) + '...' + transactionHash.substring(58)
    };
  } catch (error) {
    console.error('Blockchain storage error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to store on blockchain'
    };
  }
}
