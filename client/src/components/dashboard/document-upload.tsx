import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { documentTypes } from '@shared/schema';
import Webcam from 'react-webcam';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import VerificationProgressModal from '@/components/modals/verification-progress-modal';
import VerificationSuccessModal from '@/components/modals/verification-success-modal';
import VerificationFailedModal from '@/components/modals/verification-failed-modal';

const DocumentUpload: React.FC = () => {
  const [documentType, setDocumentType] = useState<string>("");
  const [uploadMethod, setUploadMethod] = useState<'camera' | 'file' | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [verificationState, setVerificationState] = useState<'idle' | 'progress' | 'success' | 'failed'>('idle');
  const [currentDocumentId, setCurrentDocumentId] = useState<number | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDocumentTypeChange = (value: string) => {
    setDocumentType(value);
  };

  const handleCameraClick = () => {
    setUploadMethod('camera');
    setCameraActive(true);
  };

  const handleFileClick = () => {
    setUploadMethod('file');
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await verifyDocument(file);
    }
  };

  const capturePhoto = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      // Convert base64 to blob
      const byteString = atob(imageSrc.split(',')[1]);
      const mimeString = imageSrc.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      
      setCameraActive(false);
      await verifyDocument(file);
    }
  }, [webcamRef]);

  const verifyDocument = async (file: File) => {
    if (!documentType) {
      toast({
        title: "Document type required",
        description: "Please select a document type before verifying",
        variant: "destructive"
      });
      return;
    }

    try {
      setVerificationState('progress');
      
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);
      
      const response = await fetch('/api/documents/verify', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setCurrentDocumentId(data.documentId);
      
      // Poll for document status updates
      pollDocumentStatus(data.documentId);
      
    } catch (error) {
      console.error('Error verifying document:', error);
      setVerificationState('failed');
      setErrorDetails('Failed to upload document. Please try again.');
    }
  };

  // Track whether component is mounted
  const isMountedRef = useRef(true);
  
  // Add cleanup effect
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const pollDocumentStatus = async (documentId: number) => {
    // Check if component is still mounted
    if (!isMountedRef.current) return;
    
    try {
      console.log(`Polling status for document ID: ${documentId}`);
      const response = await fetch(`/api/documents/${documentId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const document = await response.json();
      console.log(`Document status: ${document.status}`, document);
      
      // Prevent state updates if component unmounted
      if (!isMountedRef.current) return;
      
      if (document.status === 'pending') {
        // Keep polling every 2 seconds
        setTimeout(() => {
          if (isMountedRef.current) {
            pollDocumentStatus(documentId);
          }
        }, 2000);
      } else if (document.status === 'verified') {
        console.log('Document verified successfully');
        queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        setVerificationState('success');
      } else if (document.status === 'invalid' || document.status === 'error') {
        console.log('Document verification failed');
        queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        setVerificationState('failed');
        setErrorDetails(document.errorDetails || 'Document verification failed');
      }
    } catch (error) {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        console.error('Error polling document status:', error);
        setVerificationState('failed');
        setErrorDetails('Failed to check document status');
      }
    }
  };

  const resetState = () => {
    setVerificationState('idle');
    setCurrentDocumentId(null);
    setErrorDetails(null);
    setUploadMethod(null);
    setCameraActive(false);
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upload New Document</h2>
          
          <div className="mb-6">
            <Label htmlFor="document-type" className="block text-sm font-medium text-gray-700 mb-1">Document Type</Label>
            <Select value={documentType} onValueChange={handleDocumentTypeChange}>
              <SelectTrigger className="w-full" id="document-type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all bg-gray-50 hover:bg-gray-100 ${
                uploadMethod === 'camera' ? 'border-primary-500' : 'border-gray-300 hover:border-primary-500'
              }`}
              onClick={handleCameraClick}
            >
              <div className="w-12 h-12 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Camera className="text-primary-600 h-6 w-6" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Take a Photo</h3>
              <p className="text-xs text-gray-500">Use your camera to capture document</p>
            </div>
            
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all bg-gray-50 hover:bg-gray-100 ${
                uploadMethod === 'file' ? 'border-primary-500' : 'border-gray-300 hover:border-primary-500'
              }`}
              onClick={handleFileClick}
            >
              <div className="w-12 h-12 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="text-primary-600 h-6 w-6" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Upload File</h3>
              <p className="text-xs text-gray-500">Select document from your device</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>
          
          {cameraActive && (
            <div className="mt-6 border rounded-lg p-4">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                videoConstraints={{
                  facingMode: "environment"
                }}
                className="rounded-lg"
              />
              <div className="flex justify-center mt-4">
                <Button onClick={capturePhoto}>
                  Capture Photo
                </Button>
                <Button variant="outline" onClick={() => setCameraActive(false)} className="ml-2">
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <Button 
              disabled={!documentType || cameraActive || uploadMethod === null}
              onClick={() => {
                // If camera is selected and active, capture photo
                if (uploadMethod === 'camera' && webcamRef.current) {
                  capturePhoto();
                } 
                // We don't need an else case for file upload - it's handled by handleFileChange
              }}
            >
              Verify Document
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <VerificationProgressModal 
        isOpen={verificationState === 'progress'} 
        onClose={resetState} 
      />
      
      <VerificationSuccessModal 
        isOpen={verificationState === 'success'} 
        onClose={resetState}
        documentId={currentDocumentId} 
      />
      
      <VerificationFailedModal 
        isOpen={verificationState === 'failed'} 
        onClose={resetState}
        errorDetails={errorDetails}
        documentId={currentDocumentId}
      />
    </>
  );
};

export default DocumentUpload;
