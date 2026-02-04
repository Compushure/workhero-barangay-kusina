'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

export default function NavSection() {
  const [active, setActive] = useState('dashboard');
  const [hovered, setHovered] = useState<string | null>(null);
  const router = useRouter();

  const getIconClasses = (name: string) => {
    const isActive = active === name;
    const isHovered = hovered === name;

    if (isActive && !hovered) {
      return 'w-30 h-30'; // expanded size
    }
    if (isHovered) {
      return 'w-30 h-30'; // expanded size
    }
    return 'w-25 h-25'; // compact size
  };

  const handleClick = (name: string, href: string) => {
    setActive(name);
    router.push(href);
  };

  return (
    <Card className="mt-10 h-full flex flex-col bg-transparent shadow-none border-none">
      <CardContent className="flex flex-col gap-6 mt-4 w-full p-0 items-start">
        
        {/* Dashboard */}
        <img
          src="/kitchen.png"
          alt="Kitchen"
          className={`${getIconClasses('dashboard')} pixelated cursor-pointer transition-all duration-400 ease-in-out`}
          onClick={() => handleClick('dashboard', '/employee/dashboard')}
          onMouseEnter={() => setHovered('dashboard')}
          onMouseLeave={() => setHovered(null)}
        />

        {/* All Tasks */}
        <img
          src="/book.png"
          alt="Notebook"
          className={`${getIconClasses('tasks')} pixelated cursor-pointer transition-all duration-400 ease-in-out`}
          onClick={() => handleClick('tasks', '/employee/tasks')}
          onMouseEnter={() => setHovered('tasks')}
          onMouseLeave={() => setHovered(null)}
        />

        {/* Mercado */}
        <img
          src="/mercado.png"
          alt="Market"
          className={`${getIconClasses('mercado')} pixelated cursor-pointer transition-all duration-400 ease-in-out`}
          onClick={() => handleClick('mercado', '/employee/mercado')}
          onMouseEnter={() => setHovered('mercado')}
          onMouseLeave={() => setHovered(null)}
        />
      </CardContent>
    </Card>
  );
}
