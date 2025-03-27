import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Document } from '@shared/schema';
import { documentTypes } from '@shared/schema';
import { format } from 'date-fns';

interface VerificationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number | null;
}

const VerificationSuccessModal: React.FC<VerificationSuccessModalProps> = ({
  isOpen,
  onClose,
  documentId
}) => {
  const { data: document } = useQuery<Document>({
    queryKey: [`/api/documents/${documentId}`],
    enabled: isOpen && documentId !== null,
  });

  const documentTypeLabel = document ? 
    documentTypes.find(type => type.value === document.documentType)?.label || document.documentType
    : '';

  const formattedDate = document?.verificationDate
    ? format(new Date(document.verificationDate), 'MMM dd, yyyy')
    : '';

  const shortenBlockchainId = (id: string) => {
    if (!id) return '';
    return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Document Verified Successfully
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Your document has been verified and stored securely on the blockchain. You can now access it anytime from your dashboard.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-5 sm:mt-4 sm:border-t sm:border-gray-200 sm:pt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Document Type:</span>
              <span className="text-sm text-gray-900">{documentTypeLabel}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Verification Date:</span>
              <span className="text-sm text-gray-900">{formattedDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Blockchain Transaction:</span>
              <span className="text-sm text-primary-600 hover:underline cursor-pointer">
                {document?.blockchainTxId ? shortenBlockchainId(document.blockchainTxId) : 'Processing...'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <Button onClick={onClose} className="w-full sm:w-auto sm:ml-3">
            View Document
          </Button>
          <Button variant="outline" onClick={onClose} className="mt-3 sm:mt-0 w-full sm:w-auto">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationSuccessModal;
