import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { documentTypes } from '@shared/schema';
import { useQueryClient } from '@tanstack/react-query';

interface DocumentSearchProps {
  onFilterChange: (filters: string[]) => void;
}

const DocumentSearch: React.FC<DocumentSearchProps> = ({ onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleFilter = (type: string) => {
    const newFilters = selectedFilters.includes(type)
      ? selectedFilters.filter(t => t !== type)
      : [...selectedFilters, type];
    
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Search</h2>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400 h-5 w-5" />
          </div>
          <input 
            type="text" 
            placeholder="Search documents..." 
            value={searchQuery}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Filter by:</p>
          <div className="flex flex-wrap gap-2">
            {documentTypes.map((type) => {
              const isSelected = selectedFilters.includes(type.value);
              return (
                <span 
                  key={type.value}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${
                    isSelected 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => toggleFilter(type.value)}
                >
                  {type.label}
                  {isSelected && (
                    <button 
                      type="button"
                      className="flex-shrink-0 ml-1 text-primary-500 focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFilter(type.value);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentSearch;
