'use client';

import { Gift, Store, BarChart3 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: 'Rewards Requests', href: '/HR/requests', icon: Gift },
  { name: 'Mercado Manager', href: '/HR/mercado', icon: Store },
  { name: 'Leaderboard', href: '/HR/leaderboard', icon: BarChart3 },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen w-56',
        'border-r border-sidebar-border bg-sidebar',
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-sidebar-border px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-sidebar-primary">WorkHero</h1>
            <p className="text-xs text-muted-foreground">Barangay Kusina</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">UN</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground">User Name</p>
              <p className="truncate text-xs text-muted-foreground">hradmin_email@gmail.com</p>
            </div>
          </div>
          <Button
            variant="default"
            className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
