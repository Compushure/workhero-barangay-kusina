'use client';

import {
  FileText,
  CheckCircle,
  User,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ShoppingCart,
  Trophy,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOutBtn } from '../sidebar/logout-btn';
import { ProfilePic } from '../sidebar/profile-pic';
import { useGetSessionUser } from '@/hooks/tanstack/queries/userQueries';
import { NavigationDisplay } from '@/components/manager/navigation-display';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigationStore } from '@/store/navigationStore';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  href: string;
} 

interface SidebarProps {
  navItems?: NavItem[];
}

function SidebarUserProfile({
  isCollapsed,
  disabled,
}: {
  isCollapsed: boolean;
  disabled: boolean;
}) {
  const { data: user, isLoading, isFetching } = useGetSessionUser();
  const isProfileLoading = isLoading || isFetching;

  return (
    <>
      <ProfilePic user={user} disabled={disabled} isLoading={isProfileLoading} />
      {!isCollapsed && (
        <div className="min-w-0">
          {isProfileLoading ? (
            <>
              <div className="h-4 w-20 bg-white/20 rounded animate-pulse" />
              <div className="h-3 w-28 bg-white/10 rounded mt-1 animate-pulse" />
            </>
          ) : (
            <>
              {user && (
                <>
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

export function Sidebar({
  navItems = [
    {
      key: 'reward-requests',
      label: 'Rewards Requests',
      icon: <LayoutDashboard size={20} className="shrink-0" />,
      href: '/hr/reward-requests',
    },
    {
      key: 'mercado',
      label: 'Mercado',
      icon: <ShoppingCart size={20} className="shrink-0" />,
      href: '/hr/mercado',
    },
    {
      key: 'leaderboard',
      label: 'Leaderboard',
      icon: <Trophy size={20} className="shrink-0" />,
      href: '/hr/leaderboard',
    },
  ],
}: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const { startNavigation, stopNavigation, isNavigating, isLoggingOut } = useNavigationStore();

  const isUiDisabled = isNavigating || isLoggingOut;

  useEffect(() => {
    if (pendingHref && pathname === pendingHref) {
      setPendingHref(null);
      stopNavigation();
      return;
    }

    if (!pendingHref && isNavigating) {
      stopNavigation();
    }
  }, [pathname, pendingHref, isNavigating, stopNavigation]);

  return (
    <aside
      className={`bg-card text-foreground flex flex-col justify-between h-screen sticky top-0 transition-all duration-300 overflow-hidden ${
        isCollapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-sidebar-primary">W</span>
            </div>
            {!isCollapsed && <h1 className="text-2xl font-bold whitespace-nowrap">WorkHero</h1>}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-accent/20 cursor-pointer rounded transition-colors"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        {!isCollapsed && <p className="pl-8 text-sm text-muted-foreground">Barangay Kusina</p>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-3 overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isNavigatingItem = pendingHref === item.href;
          const isDisabled = (!!pendingHref && !isNavigatingItem) || isLoggingOut;
          const navLink = (
            <Link
              href={item.href}
              onClick={() => {
                if (pathname !== item.href) {
                  setPendingHref(item.href);
                  startNavigation();
                }
              }}
              aria-disabled={isDisabled}
              className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-full font-medium transition-all ${
                isCollapsed ? 'justify-center px-2' : 'justify-start'
              } ${
                isActive ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/20'
              } ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {isCollapsed ? (
                isNavigatingItem ? (
                  <NavigationDisplay
                    isNavigating={isNavigatingItem}
                    className="inline-flex items-center justify-center"
                    iconClassName="size-5 animate-spin text-muted-foreground"
                  />
                ) : (
                  item.icon
                )
              ) : (
                item.icon
              )}
              {!isCollapsed && <span>{item.label}</span>}
              {!isCollapsed && (
                <NavigationDisplay
                  isNavigating={isNavigatingItem}
                  className="ml-auto inline-flex items-center justify-center"
                  iconClassName="size-4 animate-spin text-muted-foreground"
                />
              )}
            </Link>
          );

          return (
            <Tooltip key={item.key}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  onClick={() => {
                    if (pathname !== item.href) {
                      setPendingHref(item.href);
                      startNavigation();
                    }
                  }}
                  aria-disabled={isDisabled}
                  className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-full font-medium transition-all ${
                    isCollapsed ? 'justify-center px-2' : 'justify-start'
                  } ${isActive ? 'bg-white text-[#690003]' : 'text-white hover:bg-red-900'} ${
                    isDisabled ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  {isCollapsed ? (
                    isNavigatingItem ? (
                      <NavigationDisplay
                        isNavigating={isNavigatingItem}
                        className="inline-flex items-center justify-center"
                        iconClassName="size-5 animate-spin text-red-200"
                      />
                    ) : (
                      item.icon
                    )
                  ) : (
                    item.icon
                  )}
                  {!isCollapsed && <span>{item.label}</span>}
                  {!isCollapsed && (
                    <NavigationDisplay
                      isNavigating={isNavigatingItem}
                      className="ml-auto inline-flex items-center justify-center"
                      iconClassName="size-4 animate-spin text-red-200"
                    />
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div
        className={`border-t border-border ${
          isCollapsed ? 'flex justify-center items-center h-24' : 'p-4'
        }`}
      >
        <div
          className={`bg-accent/20 rounded-full flex items-center ${
            isCollapsed ? 'w-16 h-16 justify-center' : 'p-4 gap-3 mb-4'
          }`}
        >
          <SidebarUserProfile isCollapsed={isCollapsed} disabled={isUiDisabled} />
        </div>

        {!isCollapsed && <LogOutBtn />}
      </div>
    </aside>
  );
}
