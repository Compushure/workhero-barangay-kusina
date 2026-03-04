'use client';

import { ChevronLeft, ChevronRight, LayoutDashboard, ShoppingCart, Trophy } from 'lucide-react';
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
              <div className="h-4 w-24 bg-[#caa86f]/40 rounded animate-pulse" />
              <div className="h-3 w-32 bg-[#caa86f]/30 rounded mt-1 animate-pulse" />
            </>
          ) : (
            <>
              {user && (
                <>
                  <p className="font-semibold text-foreground text-base leading-tight truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-[#5f7482] truncate">{user.email}</p>
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
      className={`bg-[#efe5bf] text-[#111827] flex flex-col justify-between h-screen sticky top-0 transition-all duration-300 overflow-hidden shadow-sm ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#e2ecf4] rounded flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#111827]">W</span>
            </div>
            {!isCollapsed && (
              <h1 className="text-3xl font-extrabold whitespace-nowrap text-[#111827]">WorkHero</h1>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-[#f7dba8] text-[#d97706] cursor-pointer rounded transition-colors"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        {!isCollapsed && (
          <p className="pl-8 text-base text-[#111827] font-medium">Barangay Kusina</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2.5 overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isNavigatingItem = pendingHref === item.href;
          const isDisabled = (!!pendingHref && !isNavigatingItem) || isLoggingOut;
          const navClassName = `w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-full font-semibold shadow-sm transition-all ${
            isCollapsed ? 'justify-center px-2' : 'justify-start'
          } ${
            isActive
              ? 'bg-linear-to-r from-[#ffd18a] to-[#f8b340] text-[#111827]'
              : 'bg-[#fff9ef] text-[#111827] border border-[#f2d6a4] hover:bg-[#fde9c8]'
          } ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`;

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
              className={navClassName}
            >
              {isCollapsed ? (
                isNavigatingItem ? (
                  <NavigationDisplay
                    isNavigating={isNavigatingItem}
                    className="inline-flex items-center justify-center"
                    iconClassName="size-5 animate-spin text-[#d97706]"
                  />
                ) : (
                  <span className="text-[#d97706]">{item.icon}</span>
                )
              ) : (
                <span className="text-[#d97706]">{item.icon}</span>
              )}
              {!isCollapsed && <span className="text-base">{item.label}</span>}
              {!isCollapsed && (
                <NavigationDisplay
                  isNavigating={isNavigatingItem}
                  className="ml-auto inline-flex items-center justify-center"
                  iconClassName="size-4 animate-spin text-[#d97706]"
                />
              )}
            </Link>
          );

          return (
            <Tooltip key={item.key}>
              <TooltipTrigger asChild>{navLink}</TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className={`${isCollapsed ? 'flex justify-center items-center h-24 p-2' : 'p-3'}`}>
        <div
          className={`bg-[#f8dca8] rounded-3xl flex items-center ${
            isCollapsed ? 'w-16 h-16 justify-center' : 'p-2.5 gap-2.5 mb-3'
          }`}
        >
          <SidebarUserProfile isCollapsed={isCollapsed} disabled={isUiDisabled} />
        </div>

        {!isCollapsed && <LogOutBtn />}
      </div>
    </aside>
  );
}
