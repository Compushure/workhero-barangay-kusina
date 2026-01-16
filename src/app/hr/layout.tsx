'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/hr/sidebar';
import { cn } from '@/lib/utils';

export default function MercadoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex min-h-screen">

      <Sidebar
        variant="rewards"
        isExpanded={isHovered}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      <main
        className={cn(
          'flex-1 transition-all duration-300 ease-in-out',
          isHovered ? 'pl-56' : 'pl-20'
        )}
      >
        {children}
      </main>
    </div>
  );
}
