import React, { useState } from 'react';
import PageHeader from '@/components/layout/page-header';
import DocumentUpload from '@/components/dashboard/document-upload';
import DocumentCard from '@/components/dashboard/document-card';
import DocumentStatsCard from '@/components/dashboard/document-stats';
import BlockchainStatusCard from '@/components/dashboard/blockchain-status';
import DocumentSearch from '@/components/dashboard/document-search';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Document } from '@shared/schema';

const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  // Filter documents based on selected document types
  const filteredDocuments = documents
    ? filters.length > 0
      ? documents.filter(doc => filters.includes(doc.documentType))
      : documents
    : [];

  const handleRetry = async (documentId: number) => {
    console.log(`Retry verification for document ${documentId}`);
    
    try {
      // Call the retry API endpoint
      const response = await fetch(`/api/documents/${documentId}/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      // Show toast notification (assuming toast is available)
      console.log('Document verification retry initiated');
    } catch (error) {
      console.error('Error retrying document verification:', error);
    }
  };

  const handleFilterChange = (newFilters: string[]) => {
    setFilters(newFilters);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader 
        title="Document Verification & Storage" 
        description="Securely verify and store your official documents using AI and blockchain technology."
      />
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content Area (2/3) */}
        <div className="md:col-span-2 space-y-6">
          {/* Document Upload Section */}
          <DocumentUpload />
          
          {/* Recently Verified Documents */}
          <Card>
            <CardHeader className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recently Verified Documents</h2>
              <span className="text-sm text-primary-600 cursor-pointer">View All</span>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-500 mt-2">Loading documents...</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100">
                    <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by uploading your first document.</p>
                </div>
              ) : (
                filteredDocuments.map(document => (
                  <DocumentCard 
                    key={document.id} 
                    document={document} 
                    onRetry={handleRetry}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar Area (1/3) */}
        <div className="space-y-6">
          <DocumentStatsCard />
          <BlockchainStatusCard />
          <DocumentSearch onFilterChange={handleFilterChange} />
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
