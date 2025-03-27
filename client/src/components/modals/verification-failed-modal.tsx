import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface VerificationFailedModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorDetails: string | null;
  documentId?: number | null;
}

const VerificationFailedModal: React.FC<VerificationFailedModalProps> = ({
  isOpen,
  onClose,
  errorDetails,
  documentId
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const handleRetry = async () => {
    if (!documentId) {
      toast({
        title: "Error",
        description: "Document ID not found. Please upload a new document.",
        variant: "destructive"
      });
      onClose();
      return;
    }

    setIsRetrying(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      // Successfully initiated retry
      toast({
        title: "Verification Retry",
        description: "Document verification retry has been initiated. Please wait..."
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      // Close the modal and let the parent component handle the status polling
      onClose();
    } catch (error) {
      console.error('Error retrying verification:', error);
      toast({
        title: "Error",
        description: "Failed to retry document verification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle className="text-lg font-medium">Document Verification Failed</DialogTitle>
        <DialogDescription>
          We couldn't verify your document due to the following issues:
        </DialogDescription>
        
        <div className="sm:flex sm:items-start pt-4">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <div className="mt-4">
              <ul className="list-disc pl-5 space-y-1">
                {errorList.map((error, index) => (
                  <li key={index} className="text-sm text-red-600">{error}</li>
                ))}
              </ul>
            </div>
          </div>
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
          <Button 
            onClick={handleRetry} 
            className="w-full sm:w-auto sm:ml-3"
            disabled={isRetrying || !documentId}
          >
            {isRetrying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              "Try Again"
            )}
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
