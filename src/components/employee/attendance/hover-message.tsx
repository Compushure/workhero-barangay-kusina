'use client';

import React from 'react';

interface HoverMessageProps {
  message: string;
  children: React.ReactNode;
  position?: 
    | 'top' 
    | 'top-left' 
    | 'top-right' 
    | 'right' 
    | 'bottom' 
    | 'bottom-left' 
    | 'bottom-right' 
    | 'left';
  rotation?: number; // degrees to rotate the tooltip
}

export const HoverMessage: React.FC<HoverMessageProps> = ({
  message,
  children,
  position = 'top',
  rotation = 0,
}) => {
  const positionClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  return (
    <div className="relative inline-block group">
      {children}
      <div
        className={`absolute ${positionClasses[position]} 
          hidden group-hover:block 
          bg-gray-800 text-white text-sm rounded px-2 py-1 
          whitespace-nowrap shadow-lg transform`}
        style={{ rotate: `${rotation}deg` }}
      >
        {message}
      </div>
    </div>
  );
};
