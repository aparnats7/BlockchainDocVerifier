import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface VerificationFailedModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorDetails: string | null;
}

const VerificationFailedModal: React.FC<VerificationFailedModalProps> = ({
  isOpen,
  onClose,
  errorDetails
}) => {
  // Parse error details to show specific issues
  const getErrorList = () => {
    if (!errorDetails) return ['Document verification failed'];
    
    // Try to extract specific errors
    if (errorDetails.includes(',')) {
      return errorDetails.split(',').map(err => err.trim());
    }
    return [errorDetails];
  };

  const errorList = getErrorList();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Document Verification Failed
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                We couldn't verify your document due to the following issues:
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <ul className="list-disc pl-5 space-y-1">
            {errorList.map((error, index) => (
              <li key={index} className="text-sm text-red-600">{error}</li>
            ))}
          </ul>
        </div>
        
        <div className="mt-5 bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li className="text-sm text-gray-600">Ensure good lighting when taking a photo</li>
            <li className="text-sm text-gray-600">Make sure all corners of the document are visible</li>
            <li className="text-sm text-gray-600">Upload a valid, non-expired document</li>
          </ul>
        </div>
        
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <Button onClick={onClose} className="w-full sm:w-auto sm:ml-3">
            Try Again
          </Button>
          <Button variant="outline" onClick={onClose} className="mt-3 sm:mt-0 w-full sm:w-auto">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationFailedModal;
