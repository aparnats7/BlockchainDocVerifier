import React from 'react';

interface HeaderProps {
  user: {
    name: string;
    initials: string;
  };
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="material-icons text-primary mr-2">security</span>
            <h1 className="text-xl font-semibold text-neutral-800">DocumentChain</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-1 rounded-full text-neutral-500 hover:text-primary focus:outline-none">
              <span className="material-icons">notifications</span>
            </button>
            
            <div className="flex items-center">
              <span className="hidden md:block text-sm font-medium text-neutral-700 mr-2">{user.name}</span>
              <button className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                {user.initials}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
