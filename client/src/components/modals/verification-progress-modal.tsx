import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogHeader,
  DialogDescription 
} from '@/components/ui/dialog';
import { Loader2, Check } from 'lucide-react';
import { VerificationProgress, VerificationStep } from '@/types';

interface VerificationProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VerificationProgressModal: React.FC<VerificationProgressModalProps> = ({
  isOpen,
  onClose
}) => {
  const [progress, setProgress] = useState<VerificationProgress>({
    received: false,
    preprocessing: false,
    aiVerification: false,
    blockchainStorage: false
  });
  
  // Simulate verification process
  useEffect(() => {
    if (isOpen) {
      // Reset progress when modal opens
      setProgress({
        received: false,
        preprocessing: false,
        aiVerification: false,
        blockchainStorage: false
      });
      
      // Step 1: Document received
      setTimeout(() => {
        setProgress(prev => ({ ...prev, received: true }));
        
        // Step 2: Preprocessing image
        setTimeout(() => {
          setProgress(prev => ({ ...prev, preprocessing: true }));
          
          // Step 3: AI verification
          setTimeout(() => {
            setProgress(prev => ({ ...prev, aiVerification: true }));
            
            // Step 4: Blockchain storage
            setTimeout(() => {
              setProgress(prev => ({ ...prev, blockchainStorage: true }));
            }, 2000);
          }, 3000);
        }, 1500);
      }, 1000);
    }
  }, [isOpen]);

  const steps: { key: VerificationStep; label: string }[] = [
    { key: 'received', label: 'Document received' },
    { key: 'preprocessing', label: 'Preprocessing image' },
    { key: 'aiVerification', label: 'AI verification in progress' },
    { key: 'blockchainStorage', label: 'Blockchain storage' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Verifying Document</DialogTitle>
          <DialogDescription>
            Our AI system is analyzing your document. This may take a few moments.
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12">
            <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Verification Steps:</h4>
          <div className="space-y-3">
            {steps.map((step, index) => {
              const isCompleted = progress[step.key];
              const isActive = !isCompleted && steps.slice(0, index).every(s => progress[s.key]);
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-4 w-4 text-green-600" />
                      </span>
                    ) : isActive ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100">
                        <Loader2 className="h-4 w-4 text-primary-600 animate-spin" />
                      </span>
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                        <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                      </span>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm ${
                      isCompleted ? 'text-gray-600' : 
                      isActive ? 'text-gray-600' : 
                      'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="text-primary-500 h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Your document is being processed securely. All data is encrypted end-to-end.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationProgressModal;
