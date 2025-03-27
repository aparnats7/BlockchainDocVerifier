import React, { useState, useRef, useCallback } from 'react';
import { DocumentType, DocumentTypes } from '@shared/schema';
import Webcam from 'react-webcam';
import { useToast } from '@/hooks/use-toast';
import { useBlockchain } from '@/hooks/useBlockchain';
import { useDocumentVerification } from '@/hooks/useDocumentVerification';

interface DocumentUploadProps {
  onSuccess: (result: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onSuccess, onError, onCancel }) => {
  const [documentType, setDocumentType] = useState<DocumentType>(DocumentTypes.AADHAR);
  const [uploadMethod, setUploadMethod] = useState<'camera' | 'file'>('camera');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { uploadToIPFS } = useBlockchain();
  const { verifyDocument } = useDocumentVerification();

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    } else {
      toast({
        title: "Camera Error",
        description: "Could not capture image. Please check camera permissions.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive"
        });
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Unsupported file type",
          description: "Please upload JPEG, PNG, or PDF files only",
          variant: "destructive"
        });
        return;
      }
      
      setFileSelected(file);
    }
  };

  const handleVerify = async () => {
    let file: File | null = null;
    
    if (uploadMethod === 'camera' && capturedImage) {
      // Convert base64 to file
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      file = new File([blob], `${documentType.toLowerCase()}_document.jpg`, { type: 'image/jpeg' });
    } else if (uploadMethod === 'file' && fileSelected) {
      file = fileSelected;
    }
    
    if (!file) {
      toast({
        title: "No document selected",
        description: uploadMethod === 'camera' 
          ? "Please capture an image first" 
          : "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsVerifying(true);
      
      // Upload to IPFS first
      const ipfsResult = await uploadToIPFS(file);
      if (!ipfsResult) {
        throw new Error("Failed to upload document to IPFS");
      }
      
      // Verify the document
      const verificationResult = await verifyDocument(documentType, ipfsResult.ipfsHash, file);
      
      if (verificationResult.success) {
        onSuccess({
          documentType,
          ipfsHash: ipfsResult.ipfsHash,
          ...verificationResult
        });
      } else {
        onError(verificationResult);
      }
    } catch (error) {
      console.error("Document verification error:", error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      onError({ success: false, error });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
      <div className="border-b border-neutral-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-neutral-900">Upload New Document</h3>
            <p className="mt-1 text-sm text-neutral-500">Upload an official document for AI verification and blockchain storage.</p>
          </div>
          <button onClick={onCancel} className="text-neutral-500 hover:text-neutral-700">
            <span className="material-icons">close</span>
          </button>
        </div>
      </div>
      
      <div className="px-6 py-5 space-y-6">
        {/* Document Type Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Document Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              onClick={() => setDocumentType(DocumentTypes.AADHAR)}
              className={`border ${documentType === DocumentTypes.AADHAR ? 'border-primary bg-blue-50 ring-2 ring-primary' : 'border-neutral-300'} rounded-md p-4 flex items-center space-x-3 hover:border-primary cursor-pointer`}
            >
              <span className={`material-icons ${documentType === DocumentTypes.AADHAR ? 'text-primary' : 'text-neutral-500'}`}>credit_card</span>
              <span className={`text-sm font-medium ${documentType === DocumentTypes.AADHAR ? 'text-neutral-900' : 'text-neutral-700'}`}>Aadhar Card</span>
            </div>
            <div 
              onClick={() => setDocumentType(DocumentTypes.PAN)}
              className={`border ${documentType === DocumentTypes.PAN ? 'border-primary bg-blue-50 ring-2 ring-primary' : 'border-neutral-300'} rounded-md p-4 flex items-center space-x-3 hover:border-primary cursor-pointer`}
            >
              <span className={`material-icons ${documentType === DocumentTypes.PAN ? 'text-primary' : 'text-neutral-500'}`}>account_balance</span>
              <span className={`text-sm font-medium ${documentType === DocumentTypes.PAN ? 'text-neutral-900' : 'text-neutral-700'}`}>PAN Card</span>
            </div>
            <div 
              onClick={() => setDocumentType(DocumentTypes.DRIVING_LICENSE)}
              className={`border ${documentType === DocumentTypes.DRIVING_LICENSE ? 'border-primary bg-blue-50 ring-2 ring-primary' : 'border-neutral-300'} rounded-md p-4 flex items-center space-x-3 hover:border-primary cursor-pointer`}
            >
              <span className={`material-icons ${documentType === DocumentTypes.DRIVING_LICENSE ? 'text-primary' : 'text-neutral-500'}`}>directions_car</span>
              <span className={`text-sm font-medium ${documentType === DocumentTypes.DRIVING_LICENSE ? 'text-neutral-900' : 'text-neutral-700'}`}>Driving License</span>
            </div>
          </div>
        </div>
        
        {/* Upload Method */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Upload Method</label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input 
                id="camera" 
                name="upload-method" 
                type="radio" 
                checked={uploadMethod === 'camera'}
                onChange={() => setUploadMethod('camera')}
                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
              />
              <label htmlFor="camera" className="ml-2 block text-sm text-neutral-700">
                Use Camera
              </label>
            </div>
            <div className="flex items-center">
              <input 
                id="file" 
                name="upload-method" 
                type="radio" 
                checked={uploadMethod === 'file'}
                onChange={() => setUploadMethod('file')}
                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
              />
              <label htmlFor="file" className="ml-2 block text-sm text-neutral-700">
                Upload File
              </label>
            </div>
          </div>
        </div>
        
        {/* Camera Feed */}
        {uploadMethod === 'camera' && (
          <div id="camera-feed-container" className={capturedImage ? "hidden" : ""}>
            <div className="camera-feed aspect-w-4 aspect-h-3 mb-4 bg-neutral-800 rounded-lg flex items-center justify-center">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ 
                  facingMode: "environment",
                  width: 1280,
                  height: 720
                }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="verification-animation h-24 w-24 border-4 border-primary rounded-full opacity-75"></div>
              </div>
            </div>
            <div className="flex justify-center">
              <button 
                onClick={handleCapture}
                disabled={isCapturing}
                className="bg-primary hover:bg-primary-dark text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg"
              >
                <span className="material-icons">photo_camera</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Captured Image Preview */}
        {uploadMethod === 'camera' && capturedImage && (
          <div>
            <div className="aspect-w-4 aspect-h-3 mb-4 bg-neutral-200 rounded-lg overflow-hidden">
              <img src={capturedImage} alt="Captured document" className="object-cover w-full h-full" />
            </div>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={retakePhoto}
                className="bg-white border border-neutral-300 text-neutral-700 rounded-md px-4 py-2 text-sm font-medium"
              >
                Retake Photo
              </button>
            </div>
          </div>
        )}
        
        {/* File Upload */}
        {uploadMethod === 'file' && (
          <div id="file-upload-container">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-neutral-300 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary"
            >
              {fileSelected ? (
                <div className="text-center">
                  <span className="material-icons text-primary text-4xl mb-2">description</span>
                  <p className="text-sm font-medium text-neutral-700">{fileSelected.name}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {(fileSelected.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <>
                  <span className="material-icons text-neutral-400 text-4xl mb-2">upload_file</span>
                  <div className="text-center">
                    <p className="text-sm text-neutral-600">
                      Drag and drop your document here, or <span className="text-primary font-medium">browse</span>
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Supported formats: JPEG, PNG, PDF (max 5MB)
                    </p>
                  </div>
                </>
              )}
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".jpeg,.jpg,.png,.pdf"
              />
            </div>
            {fileSelected && (
              <div className="mt-2 text-right">
                <button 
                  onClick={() => setFileSelected(null)}
                  className="text-sm text-neutral-500 hover:text-neutral-700"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="text-right">
          <button 
            onClick={handleVerify}
            disabled={isVerifying || (uploadMethod === 'camera' && !capturedImage) || (uploadMethod === 'file' && !fileSelected)}
            className={`bg-primary hover:bg-primary-dark text-white rounded-md px-6 py-2 text-sm font-medium ${
              isVerifying || (uploadMethod === 'camera' && !capturedImage) || (uploadMethod === 'file' && !fileSelected)
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {isVerifying ? 'Verifying...' : 'Verify Document'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
