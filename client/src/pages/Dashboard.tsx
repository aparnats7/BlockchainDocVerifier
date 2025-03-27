import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Document } from '@shared/schema';
import DocumentCard from '@/components/DocumentCard';
import { Link, useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const Dashboard: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDocument, setViewDocument] = useState<Document | null>(null);

  const { data: documents, isLoading, error } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  const filteredDocuments = documents?.filter(doc => {
    return (
      doc.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleViewDocument = (doc: Document) => {
    setViewDocument(doc);
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/download`);
      
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.documentName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: `${doc.documentName} has been downloaded successfully.`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "An error occurred while downloading the document",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="border-b border-neutral-200 px-6 py-5">
          <h3 className="text-lg font-medium text-neutral-900">Your Documents</h3>
          <p className="mt-1 text-sm text-neutral-500">Manage your verified documents securely stored on the blockchain.</p>
        </div>
        
        <div className="px-6 py-5">
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="w-full md:w-auto mb-4 md:mb-0">
              <div className="relative rounded-md shadow-sm max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons text-neutral-400">search</span>
                </div>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  placeholder="Search documents"
                />
              </div>
            </div>
            <Link href="/upload">
              <button className="bg-primary hover:bg-primary-dark text-white rounded-md px-4 py-2 text-sm font-medium flex items-center">
                <span className="material-icons mr-2">add</span>
                Upload New Document
              </button>
            </Link>
          </div>
          
          {isLoading && (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
              <div className="flex">
                <span className="material-icons text-red-500 mr-2">error</span>
                <p className="text-sm text-red-700">
                  Error loading documents. Please try refreshing the page.
                </p>
              </div>
            </div>
          )}
          
          {!isLoading && !error && filteredDocuments && filteredDocuments.length === 0 && (
            <div className="text-center py-10">
              <span className="material-icons text-4xl text-neutral-300 mb-2">description</span>
              <h3 className="text-lg font-medium text-neutral-800 mb-1">No documents found</h3>
              {searchTerm ? (
                <p className="text-sm text-neutral-500">No results matching your search criteria.</p>
              ) : (
                <p className="text-sm text-neutral-500">
                  You haven't uploaded any documents yet. Click "Upload New Document" to get started.
                </p>
              )}
            </div>
          )}
          
          {!isLoading && !error && filteredDocuments && filteredDocuments.length > 0 && (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((document) => (
                <DocumentCard 
                  key={document.id} 
                  document={document} 
                  onView={handleViewDocument}
                  onDownload={handleDownloadDocument}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Document Viewer Dialog */}
      <Dialog open={!!viewDocument} onOpenChange={(open) => !open && setViewDocument(null)}>
        <DialogContent className="max-w-3xl">
          {viewDocument && (
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-4">
                {viewDocument.documentType === 'AADHAR' ? 'Aadhar Card' : 
                 viewDocument.documentType === 'PAN' ? 'PAN Card' : 'Driving License'}
              </h3>
              
              <div className="aspect-w-4 aspect-h-3 mb-4 bg-neutral-200 rounded-md overflow-hidden">
                <img 
                  src={`https://ipfs.io/ipfs/${viewDocument.ipfsHash}`}
                  alt={`${viewDocument.documentName}`}
                  className="object-contain"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-neutral-500">Document ID</p>
                  <p className="font-medium">{viewDocument.documentNumber || `DOC-${viewDocument.id}`}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Verification Date</p>
                  <p className="font-medium">
                    {new Date(viewDocument.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Blockchain Reference</p>
                  <p className="font-medium">{viewDocument.blockchainRef || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">IPFS Hash</p>
                  <p className="font-medium text-xs truncate">{viewDocument.ipfsHash}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleDownloadDocument(viewDocument)}
                  className="bg-primary text-white rounded-md px-4 py-2 text-sm font-medium flex items-center"
                >
                  <span className="material-icons mr-2">download</span>
                  Download Document
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
