'use client';

import { useState } from 'react';
import { LayoutDashboard, ListTodo, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NAV_ITEMS } from './constants';

/**
 * SidebarNavigation - Client Component
 * Left sidebar with navigation items
 */
export function SidebarNavigation() {
  const [activeNav, setActiveNav] = useState('dashboard');

  const iconMap = {
    LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
    ListTodo: <ListTodo className="h-5 w-5" />,
    ShoppingBag: <ShoppingBag className="h-5 w-5" />,
  };

  return (
    <div className="flex flex-col gap-3">
      {NAV_ITEMS.map((item) => (
        <Button
          key={item.id}
          variant={activeNav === item.id ? 'default' : 'outline'}
          className={`justify-start gap-2 rounded-full px-6 py-6 font-semibold ${
            activeNav === item.id
              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              : 'border-2 border-amber-200 text-amber-900 hover:bg-amber-50'
          }`}
          onClick={() => setActiveNav(item.id)}
        >
          {iconMap[item.icon as keyof typeof iconMap]}
          {item.label}
        </Button>
      ))}
    </div>
  );
}
