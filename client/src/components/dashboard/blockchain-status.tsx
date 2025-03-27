import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, RefreshCw, Lock, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { BlockchainStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const BlockchainStatusCard: React.FC = () => {
  const { data: status, isLoading } = useQuery<BlockchainStatus>({
    queryKey: ['/api/blockchain/status'],
  });

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Blockchain Status</h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="text-green-500 h-5 w-5 mr-2" />
              <span className="text-sm text-gray-700">Network Status</span>
            </div>
            <span className="text-sm font-medium text-green-600">
              {isLoading ? '...' : status?.networkStatus || 'Unknown'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <RefreshCw className="text-green-500 h-5 w-5 mr-2" />
              <span className="text-sm text-gray-700">Last Sync</span>
            </div>
            <span className="text-sm text-gray-600">
              {isLoading 
                ? '...' 
                : status?.lastSync 
                  ? formatDistanceToNow(new Date(status.lastSync), { addSuffix: true }) 
                  : 'Never'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Lock className="text-gray-500 h-5 w-5 mr-2" />
              <span className="text-sm text-gray-700">Security</span>
            </div>
            <span className="text-sm font-medium text-gray-600">
              {isLoading ? '...' : status?.securityLevel || '256-bit encryption'}
            </span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 flex items-center">
            <Info className="text-gray-400 h-4 w-4 mr-1" />
            All documents are encrypted and stored securely on the blockchain.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockchainStatusCard;
