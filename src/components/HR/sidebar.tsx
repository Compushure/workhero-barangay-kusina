'use client';

import { Gift, Store, BarChart3 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  className?: string;
  variant?: 'default' | 'hr' | 'mercado' | 'rewards';
  isExpanded: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const navigation = [
  { name: 'Rewards Requests', href: '/hr/dashboard', icon: Gift },
  { name: 'Mercado Manager', href: '/hr/mercado', icon: Store },
  { name: 'Leaderboard', href: '/hr/leaderboard', icon: BarChart3 },
];

export function Sidebar({
  className,
  variant = 'default',
  isExpanded,
  onMouseEnter,
  onMouseLeave,
}: SidebarProps) {
  const pathname = usePathname();

  const isMercado = variant === 'mercado';
  const sidebarBg = isMercado ? 'bg-[#730202]' : 'bg-sidebar';
  const sidebarText = isMercado ? 'text-white/70' : 'text-sidebar-foreground/70';
  const sidebarTitle = isMercado ? 'text-white' : 'text-sidebar-primary';

  const activeBg = isMercado ? 'bg-[#fdf5e6]' : 'bg-secondary';
  const activeText = isMercado ? 'text-white' : 'text-white';
  const activeIcon = isMercado ? 'text-white' : 'text-white';

  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r transition-all duration-300 ease-in-out',
        isExpanded ? 'w-56' : 'w-20',
        isMercado ? 'border-[#d94141]' : 'border-sidebar-border',
        sidebarBg,
        className
      )}
    >
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header */}
        <div
          className={cn(
            'border-b px-6 py-5',
            isMercado ? 'border-[#d94141]' : 'border-sidebar-border'
          )}
        >
          <div className="flex flex-col">
            <div className="flex items-center">
              <h1 className={cn('text-2xl font-bold leading-none whitespace-nowrap', sidebarTitle)}>
                W
                <span
                  className={cn(
                    'transition-opacity duration-300',
                    isExpanded ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  orkHero
                </span>
              </h1>
            </div>
            <p
              className={cn(
                'text-[10px] whitespace-nowrap mt-1 transition-opacity duration-300',
                sidebarText,
                isExpanded ? 'opacity-100' : 'opacity-0'
              )}
            >
              Barangay Kusina
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href) && item.href !== '/hr/dashboard');

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? cn(activeBg, activeText)
                    : cn(sidebarText, 'hover:bg-white/10 hover:text-white')
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    isActive ? activeIcon : 'group-hover:text-white text-sidebar-foreground'
                  )}
                />

                <span
                  className={cn(
                    'ml-3 whitespace-nowrap transition-opacity duration-300',
                    isExpanded ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  {item.name}
                </span>

                {isActive && (
                  <div
                    className={cn(
                      'absolute left-0 h-6 w-1 rounded-sm  bg-[#f2e1c9]',
                      isMercado ? 'bg-white' : 'bg-white'
                    )}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div
          className={cn('border-t p-4', isMercado ? 'border-[#d94141]' : 'border-sidebar-border')}
        >
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarFallback
                className={cn(isMercado ? 'bg-[#d94141]' : 'bg-primary', 'text-white')}
              >
                UN
              </AvatarFallback>
            </Avatar>

            <div
              className={cn(
                'ml-3 overflow-hidden transition-opacity duration-300',
                isExpanded ? 'opacity-100' : 'opacity-0'
              )}
            >
              <p className="text-sm font-medium whitespace-nowrap text-white">User Name</p>
              <p className={cn('text-xs whitespace-nowrap opacity-75', sidebarText)}>
                hradmin@gmail.com
              </p>
            </div>
          </div>

          <div
            className={cn(
              'mt-3 transition-opacity duration-300',
              isExpanded ? 'opacity-100' : 'opacity-0'
            )}
          >
            <Button
              className={cn(
                'h-9 w-full font-medium',
                isMercado
                  ? 'bg-white text-[#730202] hover:bg-gray-100'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
