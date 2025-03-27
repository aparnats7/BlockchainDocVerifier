import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, Share, RefreshCw, Loader2, Check, Copy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Document } from '@shared/schema';
import { format } from 'date-fns';
import { documentTypes } from '@shared/schema';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface DocumentCardProps {
  document: Document;
  onRetry?: (documentId: number) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onRetry }) => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const { toast } = useToast();
  
  const documentTypeLabel = documentTypes.find(type => type.value === document.documentType)?.label || document.documentType;
  const formattedDate = format(new Date(document.verificationDate), 'MMM dd, yyyy');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="text-green-500 text-xs mr-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case 'invalid':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="text-red-500 text-xs mr-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="text-yellow-500 text-xs mr-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="10" y1="15" x2="10" y2="9"></line>
            <line x1="14" y1="15" x2="14" y2="9"></line>
          </svg>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'invalid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'aadhar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-400 text-4xl" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2"></rect>
            <path d="M7 8h10"></path>
            <path d="M7 12h10"></path>
            <path d="M7 16h10"></path>
          </svg>
        );
      case 'pan':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-400 text-4xl" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2"></rect>
            <path d="M3 10h18"></path>
          </svg>
        );
      case 'driving_license':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-400 text-4xl" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="9" r="3"></circle>
            <path d="M17.83 15c.84-.3 1.48-1.07 1.48-2 0-1.2-1.03-2.26-2.25-2.34-.82-1.67-2.88-2.66-5.06-2.66-2.18 0-4.24.99-5.06 2.66-1.22.08-2.25 1.13-2.25 2.34 0 .93.64 1.7 1.48 2"></path>
            <rect x="3" y="5" width="18" height="14" rx="2"></rect>
            <path d="M7 15h10"></path>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-400 text-4xl" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
    }
  };
  
  // Handle document view action
  const handleViewDocument = () => {
    if (document.status !== 'verified') {
      toast({
        title: "Document not verified",
        description: "Only verified documents can be viewed.",
        variant: "destructive"
      });
      return;
    }
    
    setIsViewDialogOpen(true);
  };
  
  // Handle document download action
  const handleDownloadDocument = () => {
    if (document.status !== 'verified') {
      toast({
        title: "Document not verified",
        description: "Only verified documents can be downloaded.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a direct download link
    const downloadUrl = `/api/documents/${document.id}/download`;
    const link = window.document.createElement('a');
    link.href = downloadUrl;
    // The download attribute tells the browser to download the file instead of navigating to it
    link.download = `${document.documentType}_${document.documentId}.png`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };
  
  // Handle document share action
  const handleShareDocument = async () => {
    if (document.status !== 'verified') {
      toast({
        title: "Document not verified",
        description: "Only verified documents can be shared.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setIsShareDialogOpen(true);
    
    try {
      const response = await fetch(`/api/documents/${document.id}/share`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setShareLink(data.shareLink);
    } catch (error) {
      console.error('Error generating share link:', error);
      toast({
        title: "Error",
        description: "Failed to generate share link. Please try again.",
        variant: "destructive"
      });
      setIsShareDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle copy share link to clipboard
  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      
      toast({
        title: "Link copied",
        description: "The shareable link has been copied to your clipboard.",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border border-gray-200 rounded-lg mb-4 last:mb-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/4 bg-gray-100 p-4 flex items-center justify-center">
          <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
            {getDocumentIcon(document.documentType)}
          </div>
        </div>
        
        <div className="sm:w-3/4 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-medium text-gray-900">{documentTypeLabel}</h3>
              <p className="text-sm text-gray-500">
                {document.status === 'verified' 
                  ? `Verified on ${formattedDate}` 
                  : document.status === 'invalid' 
                    ? `Verification failed on ${formattedDate}` 
                    : `Pending verification since ${formattedDate}`}
              </p>
            </div>
            <Badge className={cn("flex items-center", getStatusColor(document.status))}>
              {getStatusIcon(document.status)}
              <span>{document.status === 'verified' ? 'Verified' : document.status === 'invalid' ? 'Invalid' : 'Pending'}</span>
            </Badge>
          </div>
          
          {document.status === 'verified' ? (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Document ID</p>
                <p className="text-sm font-medium text-gray-900">{document.documentId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Blockchain ID</p>
                <p className="text-sm font-medium text-gray-900">
                  {document.blockchainTxId ? 
                    `${document.blockchainTxId.substring(0, 6)}...${document.blockchainTxId.substring(document.blockchainTxId.length - 4)}` :
                    'N/A'}
                </p>
              </div>
            </div>
          ) : document.status === 'invalid' ? (
            <div className="mt-4 grid grid-cols-1 gap-4">
              <div>
                <p className="text-xs text-gray-500">Error details</p>
                <p className="text-sm font-medium text-red-600">{document.errorDetails || 'Document verification failed'}</p>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-medium text-yellow-600">Verification in progress...</p>
              </div>
            </div>
          )}
          
          <div className="mt-4 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={handleViewDocument}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            {document.status === 'verified' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={handleDownloadDocument}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={handleShareDocument}
                >
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </>
            )}
            
            {document.status === 'invalid' && onRetry && (
              <Button 
                size="sm" 
                className="h-8"
                onClick={() => onRetry(document.id)}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* View document dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{documentTypeLabel}</DialogTitle>
            <DialogDescription>
              Document ID: {document.documentId}
            </DialogDescription>
          </DialogHeader>
          
          {document.status === 'verified' && (
            <div className="mt-2 border rounded-lg overflow-hidden">
              <img 
                src={`/api/documents/${document.id}/view`} 
                alt={`${documentTypeLabel} document`}
                className="w-full h-auto"
              />
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button onClick={handleDownloadDocument}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share document dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
            <DialogDescription>
              Create a shareable link for {documentTypeLabel}
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Generating share link...</span>
            </div>
          ) : shareLink ? (
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <div className="border rounded-lg p-3 bg-gray-50 flex-1 truncate">
                  {shareLink}
                </div>
                <Button 
                  size="sm" 
                  className="flex-shrink-0" 
                  onClick={handleCopyShareLink}
                >
                  {copySuccess ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                This link will expire in 24 hours. Anyone with the link can view the document.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-red-600">
              <X className="h-6 w-6 mr-2" />
              <span>Failed to generate share link. Please try again.</span>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DocumentCard;
