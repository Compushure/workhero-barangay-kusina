'use client';

import { ChevronLeft, LayoutDashboard, ShoppingCart, Trophy } from 'lucide-react';
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
        <div className="min-w-0 px-2">
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
                  <p className="text-xs text-zinc-600 truncate">{user.email}</p>
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
      className={`bg-muted text-[#131C2A] flex flex-col justify-between transition-all duration-500 ease-in-out overflow-hidden ${
        isCollapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Logo Section */}
      <div className="px-3 py-7 mt-6">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`group w-full h-full p-1 cursor-pointer rounded-sm transition-colors ${
            isCollapsed ? 'flex justify-center items-center' : 'flex flex-col items-baseline'
          }`}
          aria-label="Toggle sidebar"
        >
          <div
            className={`flex items-center gap-2 w-full ${isCollapsed ? 'justify-center' : 'justify-between'}`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`bg-white flex items-center justify-center shrink-0 ${
                  isCollapsed ? 'text-lg size-8 rounded-sm' : 'text-sm size-6 rounded'
                }`}
              >
                <span className="font-bold text-[#131C2A] group-hover:text-[#f47812] transition-all duration-400 ease-in-out">
                  W
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col items-baseline">
                  <h1 className="text-2xl font-bold whitespace-nowrap transition-all duration-400 ease-in-out">
                    WorkHero
                  </h1>
                  <p className="block text-nowrap text-xs text-[#f47812] pl-0.5 transition-all duration-400 ease-in-out">
                    Barangay Kusina
                  </p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <span className="rounded-full p-1 hover:bg-[#FAA938]/20 transition-all duration-400 ease-in-out">
                <ChevronLeft
                  size={20}
                  className="group-hover:text-[#f47812] transition-all duration-400 ease-in-out"
                />
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 pb-6 space-y-3 ${
          isCollapsed
            ? 'overflow-hidden px-4'
            : 'overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-3'
        }`}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isNavigatingItem = pendingHref === item.href;
          const isDisabled = (!!pendingHref && !isNavigatingItem) || isLoggingOut;
          const navClassName = `group w-full flex items-center gap-3 py-3 cursor-pointer font-medium transition-all duration-400 ease-in-out rounded-full shadow-sm/15 ${
            isCollapsed ? 'px-4 justify-center' : 'px-5 justify-start'
          } ${
            isActive
              ? 'bg-primary-gradient text-zinc-50 transition-colors'
              : 'text-[#131C2A] hover:text-[#f47812] bg-zinc-50/75 hover:bg-[#FAA938]/20 hover:shadow-sm hover:scale-103 transform-gpu'
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
                    iconClassName="size-5 animate-spin text-primary"
                  />
                ) : (
                  <span className={`${isActive ? 'text-zinc-50' : 'text-[#f47812]'}`}>
                    {item.icon}
                  </span>
                )
              ) : (
                <span className={`${isActive ? 'text-zinc-50' : 'text-[#f47812]'}`}>
                  {item.icon}
                </span>
              )}
              {!isCollapsed && <span className="text-base">{item.label}</span>}
              {!isCollapsed && (
                <NavigationDisplay
                  isNavigating={isNavigatingItem}
                  className="ml-auto inline-flex items-center justify-center"
                  iconClassName="size-4 animate-spin text-primary"
                />
              )}
            </Link>
          );

          return (
            <Tooltip key={item.key}>
              <TooltipTrigger asChild>{navLink}</TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" sideOffset={8} className="text-black">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className={`${isCollapsed ? 'flex justify-center items-center h-24' : 'px-3 py-4'}`}>
        <div
          className={`bg-zinc-50/75 border border-white/70 rounded-full shadow-sm/15 flex items-center w-full ${
            isCollapsed ? 'w-16 h-16 justify-center' : 'gap-3 mb-4 px-2 py-2'
          }`}
        >
          <SidebarUserProfile isCollapsed={isCollapsed} disabled={isUiDisabled} />
        </div>

        {!isCollapsed && <LogOutBtn />}
      </div>
    </aside>
  );
}
