import React from 'react';
import PageHeader from '@/components/layout/page-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Document, documentTypes } from '@shared/schema';
import { format } from 'date-fns';

const History: React.FC = () => {
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });
  
  // Sort documents by verification date (most recent first)
  const sortedDocuments = documents
    ? [...documents].sort((a, b) => 
        new Date(b.verificationDate).getTime() - new Date(a.verificationDate).getTime()
      )
    : [];

  const getDocumentTypeLabel = (type: string) => {
    return documentTypes.find(t => t.value === type)?.label || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>;
      case 'invalid':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Invalid</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader 
        title="Verification History" 
        description="Track all your document verification attempts and their results"
      />
      
      <Card>
        <CardHeader className="border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Activity Log</h2>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8">
              <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-500 mt-2">Loading history...</p>
            </div>
          ) : sortedDocuments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No verification history found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Document ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Blockchain TX</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      {format(new Date(doc.verificationDate), 'MMM dd, yyyy - HH:mm')}
                    </TableCell>
                    <TableCell>{getDocumentTypeLabel(doc.documentType)}</TableCell>
                    <TableCell>
                      {doc.documentId === 'pending-verification' ? '—' : doc.documentId}
                    </TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell>
                      {doc.blockchainTxId ? (
                        <span className="text-primary-600 hover:underline cursor-pointer">
                          {doc.blockchainTxId.substring(0, 6)}...{doc.blockchainTxId.substring(doc.blockchainTxId.length - 4)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default History;
