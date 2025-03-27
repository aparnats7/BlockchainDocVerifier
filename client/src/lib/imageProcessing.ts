/**
 * Compresses an image file to reduce size
 * @param file Image file to compress
 * @param maxWidth Maximum width for the compressed image
 * @param quality JPEG quality (0-1)
 * @returns Compressed image as Blob
 */
export async function compressImage(
  file: File,
  maxWidth = 1600,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = Math.floor(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Enhances an image for better OCR/document recognition
 * @param file Image file to enhance
 * @returns Enhanced image as Blob
 */
export async function enhanceDocumentImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Apply image processing for document enhancement
        // 1. Convert to grayscale
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;     // R
          data[i + 1] = avg; // G
          data[i + 2] = avg; // B
        }
        
        // 2. Increase contrast
        const contrast = 1.5; // Contrast factor
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        
        for (let i = 0; i < data.length; i += 4) {
          data[i] = factor * (data[i] - 128) + 128;     // R
          data[i + 1] = factor * (data[i + 1] - 128) + 128; // G
          data[i + 2] = factor * (data[i + 2] - 128) + 128; // B
        }
        
        // Put processed image back
        ctx.putImageData(imageData, 0, 0);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to enhance image'));
            }
          },
          'image/jpeg',
          0.95
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Detects document boundaries in an image
 * @param file Image file to process
 * @returns Coordinates of document boundaries or null if not detected
 */
export async function detectDocumentBoundaries(file: File): Promise<{
  topLeft: [number, number];
  topRight: [number, number];
  bottomRight: [number, number];
  bottomLeft: [number, number];
} | null> {
  // This is a placeholder function for document boundary detection
  // In a real implementation, this would use computer vision algorithms
  // to detect the edges of the document within the image
  
  console.log("Detecting document boundaries in image:", file.name);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // For demo purposes, return null or mock boundaries
  // In 30% of cases, simulate failed detection
  if (Math.random() < 0.3) {
    return null;
  }
  
  // Mock document boundary detection result
  return {
    topLeft: [100, 50],
    topRight: [900, 50],
    bottomRight: [900, 600],
    bottomLeft: [100, 600]
  };
}
