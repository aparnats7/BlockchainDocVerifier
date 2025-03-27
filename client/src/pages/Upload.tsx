import React, { useState } from 'react';
import { useLocation } from 'wouter';
import DocumentUpload from '@/components/DocumentUpload';
import VerificationResult from '@/components/VerificationResult';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { Document, DocumentType, VerificationStatus } from '@shared/schema';

const Upload: React.FC = () => {
  const [location, navigate] = useLocation();
  const [verificationState, setVerificationState] = useState<{
    showResult: boolean;
    isSuccess: boolean;
    data: {
      documentType: DocumentType;
      documentId?: string;
      blockchainRef?: string;
      issues?: string[];
      ipfsHash?: string;
    };
  }>({
    showResult: false,
    isSuccess: false,
    data: {
      documentType: 'AADHAR'
    }
  });

  const saveDocumentMutation = useMutation({
    mutationFn: async (documentData: any) => {
      const response = await apiRequest('POST', '/api/documents', documentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    }
  });

  const handleVerificationSuccess = async (result: any) => {
    try {
      // Save the verified document
      const documentData = {
        documentType: result.documentType,
        documentName: `${result.documentType} Document`,
        documentNumber: result.documentNumber || '',
        ipfsHash: result.ipfsHash,
        thumbnailIpfsHash: result.thumbnailIpfsHash || result.ipfsHash,
        verificationStatus: VerificationStatus.VERIFIED,
        verificationDetails: result.details || {},
        blockchainRef: result.blockchainRef || ''
      };
      
      const savedDocument = await saveDocumentMutation.mutateAsync(documentData);
      
      setVerificationState({
        showResult: true,
        isSuccess: true,
        data: {
          documentType: result.documentType,
          documentId: savedDocument.documentNumber || `DOC-${savedDocument.id}`,
          blockchainRef: savedDocument.blockchainRef,
          ipfsHash: savedDocument.ipfsHash
        }
      });
    } catch (error) {
      console.error("Failed to save document:", error);
      setVerificationState({
        showResult: true,
        isSuccess: false,
        data: {
          documentType: result.documentType,
          issues: ['Failed to save the document after verification. Please try again.']
        }
      });
    }
  };

  const handleVerificationError = (error: any) => {
    setVerificationState({
      showResult: true,
      isSuccess: false,
      data: {
        documentType: error.documentType || 'AADHAR',
        issues: error.issues || [
          'The document could not be verified.',
          'Make sure the document is clear and all information is visible.',
          'Try using better lighting conditions.'
        ]
      }
    });
  };

  const handleGoToDashboard = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    setVerificationState({
      ...verificationState,
      showResult: false
    });
  };

  const handleUploadAnother = () => {
    setVerificationState({
      showResult: false,
      isSuccess: false,
      data: {
        documentType: 'AADHAR'
      }
    });
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (verificationState.showResult) {
    return (
      <VerificationResult
        isSuccess={verificationState.isSuccess}
        data={verificationState.data}
        onGoToDashboard={handleGoToDashboard}
        onTryAgain={handleTryAgain}
        onUploadAnother={handleUploadAnother}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <DocumentUpload
      onSuccess={handleVerificationSuccess}
      onError={handleVerificationError}
      onCancel={handleCancel}
    />
  );
};

export default Upload;
