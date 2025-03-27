import React from 'react';
import { Link, useLocation } from 'wouter';

const Sidebar: React.FC = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="space-y-1 sticky top-6">
      <Link href="/" className={`${isActive('/') ? 'bg-primary text-white' : 'text-neutral-700 hover:bg-neutral-100'} group flex items-center px-3 py-2 text-sm font-medium rounded-md`}>
        <span className={`material-icons mr-3 ${isActive('/') ? 'text-white' : 'text-neutral-500'}`}>dashboard</span>
        Dashboard
      </Link>
      <Link href="/upload" className={`${isActive('/upload') ? 'bg-primary text-white' : 'text-neutral-700 hover:bg-neutral-100'} group flex items-center px-3 py-2 text-sm font-medium rounded-md`}>
        <span className={`material-icons mr-3 ${isActive('/upload') ? 'text-white' : 'text-neutral-500'}`}>file_upload</span>
        Upload Documents
      </Link>
      <Link href="/history" className="text-neutral-700 hover:bg-neutral-100 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
        <span className="material-icons mr-3 text-neutral-500">history</span>
        History
      </Link>
      <Link href="/profile" className="text-neutral-700 hover:bg-neutral-100 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
        <span className="material-icons mr-3 text-neutral-500">account_circle</span>
        Profile
      </Link>
      <Link href="/settings" className="text-neutral-700 hover:bg-neutral-100 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
        <span className="material-icons mr-3 text-neutral-500">settings</span>
        Settings
      </Link>
    </nav>
  );
};

export default Sidebar;
