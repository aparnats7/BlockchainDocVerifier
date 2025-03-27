import React from 'react';
import { Document, VerificationStatus } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface DocumentCardProps {
  document: Document;
  onView: (doc: Document) => void;
  onDownload: (doc: Document) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onView, onDownload }) => {
  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return 'bg-green-100 text-green-800';
      case VerificationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case VerificationStatus.FAILED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return 'Verified';
      case VerificationStatus.PENDING:
        return 'Processing';
      case VerificationStatus.FAILED:
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'AADHAR':
        return 'Aadhar Card';
      case 'PAN':
        return 'PAN Card';
      case 'DRIVING_LICENSE':
        return 'Driving License';
      default:
        return type;
    }
  };

  const formatDate = (date: Date | null | string) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy');
  };

  const truncateBlockchainRef = (ref: string) => {
    if (!ref) return 'N/A';
    if (ref.length <= 10) return ref;
    return `${ref.substring(0, 6)}...${ref.substring(ref.length - 4)}`;
  };

  return (
    <div className="document-card bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden transition-all hover:transform hover:-translate-y-1 hover:shadow-md">
      <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
        <h4 className="font-medium text-neutral-800">{getDocumentTypeLabel(document.documentType)}</h4>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(document.verificationStatus)}`}>
          {getStatusLabel(document.verificationStatus)}
        </span>
      </div>
      <div className="p-4">
        <div className="aspect-w-4 aspect-h-3 mb-4 bg-neutral-200 rounded-md overflow-hidden">
          {document.thumbnailIpfsHash && (
            <img 
              src={`https://ipfs.io/ipfs/${document.thumbnailIpfsHash}`}
              alt={`${getDocumentTypeLabel(document.documentType)} Preview`}
              className="object-cover"
            />
          )}
          {!document.thumbnailIpfsHash && (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100">
              <span className="material-icons text-4xl text-neutral-400">description</span>
            </div>
          )}
        </div>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm">
          <div className="col-span-1">
            <dt className="text-neutral-500">Document ID</dt>
            <dd className="font-medium text-neutral-900">{document.documentNumber || `DOC-${document.id}`}</dd>
          </div>
          <div className="col-span-1">
            <dt className="text-neutral-500">{document.verificationStatus === VerificationStatus.VERIFIED ? 'Verified Date' : 'Uploaded Date'}</dt>
            <dd className="font-medium text-neutral-900">{formatDate(document.updatedAt)}</dd>
          </div>
          {document.blockchainRef && (
            <div className="col-span-1">
              <dt className="text-neutral-500">Blockchain Ref</dt>
              <dd className="font-medium text-neutral-900">{truncateBlockchainRef(document.blockchainRef)}</dd>
            </div>
          )}
        </dl>
        <div className="mt-4 flex space-x-2">
          {document.verificationStatus === VerificationStatus.VERIFIED ? (
            <>
              <button 
                onClick={() => onView(document)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2 px-4 rounded-md text-sm font-medium"
              >
                <span className="material-icons text-sm mr-1">visibility</span>
                View
              </button>
              <button 
                onClick={() => onDownload(document)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2 px-4 rounded-md text-sm font-medium"
              >
                <span className="material-icons text-sm mr-1">download</span>
                Download
              </button>
            </>
          ) : document.verificationStatus === VerificationStatus.PENDING ? (
            <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md text-sm font-medium">
              <span className="material-icons text-sm mr-1">pending</span>
              Verification in Progress
            </button>
          ) : (
            <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium">
              <span className="material-icons text-sm mr-1">error</span>
              Verification Failed
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
