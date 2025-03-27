import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, AlertTriangle, Database } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { DocumentStats } from '@/types';

const DocumentStatsCard: React.FC = () => {
  const { data: stats, isLoading } = useQuery<DocumentStats>({
    queryKey: ['/api/stats'],
  });

  // Calculate storage percentage
  const maxStorage = 100; // 100MB limit
  const storagePercentage = stats ? Math.min(Math.round((stats.storageUsed / maxStorage) * 100), 100) : 0;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Document Stats</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="bg-primary-100 rounded-full p-2 mr-3">
                <CheckSquare className="text-primary-600 h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Verified Documents</p>
                <p className="text-lg font-semibold text-gray-900">
                  {isLoading ? '...' : stats?.verifiedCount || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <AlertTriangle className="text-red-600 h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending/Failed</p>
                <p className="text-lg font-semibold text-gray-900">
                  {isLoading ? '...' : stats?.pendingFailedCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-700">Storage Used</p>
            <p className="text-xs text-gray-500">{storagePercentage}%</p>
          </div>
          <Progress value={storagePercentage} className="h-2" />
          <p className="mt-1 text-xs text-gray-500">
            {isLoading ? 'Loading...' : `${stats?.storageUsed || 0}MB of ${maxStorage}MB used`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentStatsCard;
