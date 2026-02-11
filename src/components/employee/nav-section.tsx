'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import HoverBubble from './hover-bubble';

export default function NavSection() {
  const pathname = usePathname();
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  const getIconClasses = (name: string) => {
    const isActive = pathname.includes(name);
    const isHovered = hovered === name;

    if (isActive && !hovered) {
      return 'w-30 h-30'; // expanded size
    }
    if (isHovered) {
      return 'w-30 h-30'; // expanded size
    }
    return 'w-25 h-25'; // compact size
  };

  const handleClick = (href: string) => {
    router.push(href);
  };

  const hoverMessages: Record<string, string> = {
    dashboard: 'Want to visit your kitchen?',
    tasks: 'Explore kitchen tasks!',
    mercado: 'Redeem your rewards here!',
  };

  return (
    <Card className="h-full flex flex-col bg-transparent shadow-none border-none">
      <CardContent className="flex flex-col w-full p-0 items-start gap-6">
        {/* Dashboard */}
        <div className="relative flex items-center">
          <img
            src="/kitchen.png"
            alt="Kitchen"
            className={`${getIconClasses('dashboard')} pixelated cursor-pointer transition-all duration-300 ease-in-out`}
            onClick={() => handleClick('/employee/dashboard')}
            onMouseEnter={() => setHovered('dashboard')}
            onMouseLeave={() => setHovered(null)}
          />
          <HoverBubble show={hovered === 'dashboard'} message={hoverMessages.dashboard} />
        </div>

        {/* All Tasks */}
        <div className="relative flex items-center">
          <img
            src="/book.png"
            alt="Notebook"
            className={`${getIconClasses('tasks')} pixelated cursor-pointer transition-all duration-300 ease-in-out`}
            onClick={() => handleClick('/employee/tasks')}
            onMouseEnter={() => setHovered('tasks')}
            onMouseLeave={() => setHovered(null)}
          />
          <HoverBubble show={hovered === 'tasks'} message={hoverMessages.tasks} />
        </div>

        {/* Mercado */}
        <div className="relative flex items-center">
          <img
            src="/mercado.png"
            alt="Market"
            className={`${getIconClasses('mercado')} pixelated cursor-pointer transition-all duration-300 ease-in-out`}
            onClick={() => handleClick('/employee/mercado')}
            onMouseEnter={() => setHovered('mercado')}
            onMouseLeave={() => setHovered(null)}
          />
          <HoverBubble show={hovered === 'mercado'} message={hoverMessages.mercado} />
        </div>
      </CardContent>
    </Card>
  );
}
