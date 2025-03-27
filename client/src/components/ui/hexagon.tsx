import React from 'react';
import { cn } from '@/lib/utils';

interface HexagonProps {
  className?: string;
  children: React.ReactNode;
}

const Hexagon: React.FC<HexagonProps> = ({ className, children }) => {
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center", 
        className
      )}
      style={{
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
      }}
    >
      {children}
    </div>
  );
};

export default Hexagon;
