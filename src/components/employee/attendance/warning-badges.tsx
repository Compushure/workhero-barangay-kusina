// app/components/PixelBadge.tsx
'use client';

import { ReactNode } from 'react';

interface PixelBadgeProps {
  children: ReactNode;
  color: 'red' | 'orange' | 'yellow' | 'purple' | 'blue' | 'green';
}

export default function PixelBadge({ children, color }: PixelBadgeProps) {
  const colorClasses = {
    red: 'bg-red-600 text-white',
    orange: 'bg-orange-500 text-black',
    yellow: 'bg-yellow-500 text-black',
    purple: 'bg-purple-700 text-white',
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
  };

  return (
    <span
      className={`flex justify-center py-1 px-4 text-xl font-jersey
                 rounded-full 
                  ${colorClasses[color]}`}
    >
      {children}
    </span>
  );
}
