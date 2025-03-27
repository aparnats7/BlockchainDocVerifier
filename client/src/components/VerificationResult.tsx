import React from 'react';
import { DocumentType } from '@shared/schema';
import { format } from 'date-fns';

interface VerificationResultProps {
  isSuccess: boolean;
  data: {
    documentType: DocumentType;
    documentId?: string;
    blockchainRef?: string;
    issues?: string[];
  };
  onGoToDashboard: () => void;
  onTryAgain: () => void;
  onUploadAnother: () => void;
  onCancel: () => void;
}

const VerificationResult: React.FC<VerificationResultProps> = ({
  isSuccess,
  data,
  onGoToDashboard,
  onTryAgain,
  onUploadAnother,
  onCancel
}) => {
  const getDocumentTypeName = (type: DocumentType): string => {
    switch (type) {
      case 'AADHAR': return 'Aadhar Card';
      case 'PAN': return 'PAN Card';
      case 'DRIVING_LICENSE': return 'Driving License';
      default: return 'Document';
    }
  };

  const formatDate = () => {
    return format(new Date(), 'MMMM d, yyyy');
  };

  const truncateBlockchainRef = (ref?: string) => {
    if (!ref) return 'N/A';
    if (ref.length <= 10) return ref;
    return `${ref.substring(0, 6)}...${ref.substring(ref.length - 4)}`;
  };

  if (isSuccess) {
    return (
      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-6 py-16 flex flex-col items-center justify-center text-center">
          <div className="bg-green-100 rounded-full h-24 w-24 flex items-center justify-center mb-6">
            <span className="material-icons text-5xl text-secondary">check_circle</span>
          </div>
          <h3 className="text-2xl font-semibold text-neutral-900 mb-2">Document Verified Successfully!</h3>
          <p className="text-neutral-600 max-w-md mb-8">
            Your {getDocumentTypeName(data.documentType)} has been verified and securely stored on our blockchain. It can now be accessed from your dashboard.
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm max-w-lg w-full mb-8">
            <div className="col-span-1">
              <dt className="text-neutral-500">Document Type</dt>
              <dd className="font-medium text-neutral-900">{getDocumentTypeName(data.documentType)}</dd>
            </div>
            <div className="col-span-1">
              <dt className="text-neutral-500">Document ID</dt>
              <dd className="font-medium text-neutral-900">{data.documentId || "Generated on save"}</dd>
            </div>
            <div className="col-span-1">
              <dt className="text-neutral-500">Verification Date</dt>
              <dd className="font-medium text-neutral-900">{formatDate()}</dd>
            </div>
            <div className="col-span-1">
              <dt className="text-neutral-500">Blockchain Reference</dt>
              <dd className="font-medium text-neutral-900 truncate">{truncateBlockchainRef(data.blockchainRef)}</dd>
            </div>
          </dl>
          <div className="flex space-x-4">
            <button onClick={onGoToDashboard} className="bg-primary hover:bg-primary-dark text-white rounded-md px-6 py-2 text-sm font-medium">
              Go to Dashboard
            </button>
            <button onClick={onUploadAnother} className="border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 rounded-md px-6 py-2 text-sm font-medium">
              Upload Another Document
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
      <div className="px-6 py-16 flex flex-col items-center justify-center text-center">
        <div className="bg-red-100 rounded-full h-24 w-24 flex items-center justify-center mb-6">
          <span className="material-icons text-5xl text-red-600">error</span>
        </div>
        <h3 className="text-2xl font-semibold text-neutral-900 mb-2">Verification Failed</h3>
        <p className="text-neutral-600 max-w-md mb-6">
          We couldn't verify the {getDocumentTypeName(data.documentType)} you provided. Please check the issues below and try again.
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8 max-w-md w-full text-left">
          <h4 className="text-md font-medium text-red-800 mb-2">Issues Detected:</h4>
          <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
            {data.issues && data.issues.length > 0 ? (
              data.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))
            ) : (
              <>
                <li>Document appears to be damaged or has low visibility</li>
                <li>Important information is not clearly visible</li>
                <li>The document may be expired or invalid</li>
              </>
            )}
          </ul>
        </div>
        
        <div className="flex space-x-4">
          <button onClick={onTryAgain} className="bg-primary hover:bg-primary-dark text-white rounded-md px-6 py-2 text-sm font-medium">
            Try Again
          </button>
          <button onClick={onCancel} className="border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 rounded-md px-6 py-2 text-sm font-medium">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationResult;
