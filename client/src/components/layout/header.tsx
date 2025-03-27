import React from 'react';
import { Link, useLocation } from 'wouter';
import Hexagon from '@/components/ui/hexagon';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Header: React.FC = () => {
  const [location] = useLocation();
  
  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/documents', label: 'Documents' },
    { href: '/history', label: 'History' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Hexagon className="bg-accent-600 w-10 h-10">
              <Shield className="text-white h-5 w-5" />
            </Hexagon>
            <span className="ml-2 text-xl font-semibold text-gray-900">DocuChain</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`px-1 py-2 text-sm font-medium ${
                  location === item.href 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-gray-100 text-gray-500 hover:text-gray-700 focus-visible:ring-0"
            >
              <span className="sr-only">Notifications</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-3 rounded-full bg-gray-100 text-gray-500 hover:text-gray-700 focus-visible:ring-0"
            >
              <span className="sr-only">User profile</span>
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="User avatar" 
                />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
