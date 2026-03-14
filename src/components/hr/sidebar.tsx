'use client';

import {
  ChevronLeft,
  LayoutDashboard,
  ShoppingCart,
  Trophy,
  UserCircle2,
  type LucideIcon,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOutBtn } from '../sidebar/logout-btn';
import { ProfilePic } from '../sidebar/profile-pic';
import { ProfileModal } from '../sidebar/profile-modal';
import { useGetSessionUser } from '@/hooks/tanstack/queries/userQueries';
import { NavigationDisplay } from '@/components/manager/navigation-display';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigationStore } from '@/store/navigationStore';
import { useGetTodayAttendanceStatus } from '@/hooks/tanstack/queries/attendanceQueries';
import { HrAttendanceModal } from '@/components/hr/attendance/hr-attendance-modal';
import { HrAttendanceTrigger } from '@/components/hr/attendance/hr-attendance-trigger';

interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

interface SidebarProps {
  navItems?: NavItem[];
}

const defaultNavItems: NavItem[] = [
  {
    key: 'reward-requests',
    label: 'Rewards Requests',
    icon: LayoutDashboard,
    href: '/hr/reward-requests',
  },
  {
    key: 'mercado',
    label: 'Mercado',
    icon: ShoppingCart,
    href: '/hr/mercado',
  },
  {
    key: 'leaderboard',
    label: 'Leaderboard',
    icon: Trophy,
    href: '/hr/leaderboard',
  },
];

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
              <div className="h-4 w-20 bg-background rounded animate-pulse" />
              <div className="h-3 w-28 bg-background rounded mt-1 animate-pulse" />
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

export function Sidebar({ navItems = defaultNavItems }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredNavKey, setHoveredNavKey] = useState<string | null>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const { startNavigation, stopNavigation, isNavigating, isLoggingOut } = useNavigationStore();
  const { data: user } = useGetSessionUser();
  const { data: attendanceStatus } = useGetTodayAttendanceStatus();

  const isUiDisabled = isNavigating || isLoggingOut;
  const isNavLinkActive = (href: string) => pathname === href;
  const attendanceButtonLabel = attendanceStatus?.canTimeOut
    ? 'Time Out'
    : attendanceStatus?.canTimeIn
      ? 'Time In'
      : 'Attendance';

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  useEffect(() => {
    if (!isCollapsed) {
      setHoveredNavKey(null);
    }
  }, [isCollapsed]);

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
    <>
      <aside
        className={`hidden overflow-hidden bg-background text-primary transition-all duration-500 ease-in-out md:flex md:flex-col md:justify-between ${
          isCollapsed ? 'w-20' : 'w-60 lg:w-64'
        }`}
      >
        {/* Logo Section */}
        <div className="mt-6 px-3 py-7">
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className={`group h-full w-full cursor-pointer rounded-sm p-1 transition-colors hover:bg-zinc-50 ${
              isCollapsed ? 'flex items-center justify-center' : 'flex flex-col items-baseline'
            }`}
            aria-label="Toggle sidebar"
          >
            <div
              className={`flex w-full items-center gap-2 ${
                isCollapsed ? 'justify-center' : 'justify-between'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex shrink-0 items-center justify-center bg-white ${
                    isCollapsed ? 'size-8 rounded-sm text-lg' : 'size-6 rounded text-sm'
                  }`}
                >
                  <span className="font-bold text-primary transition-all duration-400 ease-in-out group-hover:text-[#f47812]">
                    W
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col items-baseline">
                    <h1 className="whitespace-nowrap text-2xl font-bold transition-all duration-400 ease-in-out">
                      WorkHero
                    </h1>
                    <p className="block whitespace-nowrap pl-0.5 text-xs text-[#f47812] transition-all duration-400 ease-in-out">
                      Barangay Kusina
                    </p>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <ChevronLeft
                  size={20}
                  className="transition-all duration-400 ease-in-out group-hover:text-[#f47812]"
                />
              )}
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={`flex-1 space-y-3 pb-6 ${
            isCollapsed
              ? 'overflow-hidden px-4'
              : 'overflow-y-auto px-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
          }`}
        >
          {navItems.map((item) => {
            const isActive = isNavLinkActive(item.href);
            const isNavigatingItem = pendingHref === item.href;
            const isDisabled = (!!pendingHref && !isNavigatingItem) || isLoggingOut;
            const Icon = item.icon;

            const navLinkClassName = `group flex w-full cursor-pointer items-center gap-3 rounded-full py-3 font-medium shadow-sm/15 transition-all duration-400 ease-in-out ${
              isCollapsed ? 'justify-center px-4' : 'justify-start px-5'
            } ${
              isActive
                ? 'bg-primary-gradient text-zinc-50'
                : 'bg-zinc-50/75 text-primary hover:scale-103 transform-gpu hover:bg-[#FAA938]/20 hover:text-[#f47812] hover:shadow-sm'
            } ${isDisabled ? 'pointer-events-none opacity-50' : ''}`;

            const navLink = (
              <Link
                href={item.href}
                onMouseEnter={() => {
                  if (isCollapsed) setHoveredNavKey(item.key);
                }}
                onMouseLeave={() => {
                  if (isCollapsed) setHoveredNavKey(null);
                }}
                onClick={() => {
                  if (pathname !== item.href) {
                    setPendingHref(item.href);
                    startNavigation();
                  }
                }}
                aria-disabled={isDisabled}
                className={navLinkClassName}
              >
                {isCollapsed ? (
                  isNavigatingItem ? (
                    <NavigationDisplay
                      isNavigating={isNavigatingItem}
                      className="inline-flex items-center justify-center"
                      iconClassName="size-5 animate-spin text-primary"
                    />
                  ) : (
                    <Icon
                      strokeWidth={1.75}
                      className={`shrink-0 ${isActive ? 'text-zinc-50' : 'text-[#f47812]'}`}
                    />
                  )
                ) : (
                  <>
                    <Icon
                      strokeWidth={1.75}
                      className={`shrink-0 ${isActive ? 'text-zinc-50' : 'text-[#f47812]'}`}
                    />
                    <span className="block whitespace-nowrap">{item.label}</span>
                    <NavigationDisplay
                      isNavigating={isNavigatingItem}
                      className="ml-auto inline-flex items-center justify-center"
                      iconClassName="size-4 animate-spin text-primary"
                    />
                  </>
                )}
              </Link>
            );

            return (
              <Tooltip key={item.key} open={isCollapsed && hoveredNavKey === item.key}>
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
        <div
          className={
            isCollapsed
              ? 'flex flex-col items-center justify-center gap-2 px-2 py-3'
              : 'flex flex-col px-3 py-4'
          }
        >
          <HrAttendanceTrigger
            isCollapsed={isCollapsed}
            disabled={isUiDisabled}
            label={attendanceButtonLabel}
            onClick={() => setShowAttendanceModal(true)}
          />

          <div
            className={`flex w-full items-center rounded-full bg-white/10 ${
              isCollapsed ? 'h-16 w-16 justify-center' : 'mb-4 gap-3'
            }`}
          >
            <SidebarUserProfile isCollapsed={isCollapsed} disabled={isUiDisabled} />
          </div>

          {!isCollapsed && <LogOutBtn />}
        </div>
      </aside>

      {/* Mobile Tab Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#f47812]/20 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden">
        <div className="px-2 py-2">
          <div className="grid grid-cols-4 gap-1">
            {navItems.map((item) => {
              const isActive = isNavLinkActive(item.href);
              const isNavigatingItem = pendingHref === item.href;
              const isDisabled = (!!pendingHref && !isNavigatingItem) || isLoggingOut;
              const Icon = item.icon;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => {
                    if (pathname !== item.href) {
                      setPendingHref(item.href);
                      startNavigation();
                    }
                  }}
                  aria-disabled={isDisabled}
                  className={`flex flex-col items-center justify-center rounded-xl px-1 py-1.5 transition-all duration-300 ${
                    isActive ? 'bg-accent/20 text-[#f47812]' : 'text-primary'
                  } ${isDisabled ? 'pointer-events-none opacity-50' : ''}`}
                >
                  {isNavigatingItem ? (
                    <NavigationDisplay
                      isNavigating={isNavigatingItem}
                      className="inline-flex h-5 items-center justify-center"
                      iconClassName="size-4 animate-spin text-primary"
                    />
                  ) : (
                    <Icon className="size-4" strokeWidth={1.9} />
                  )}
                  <span className="mt-1 w-full truncate text-center text-[10px] leading-none">
                    {item.label.split(' ')[0]}
                  </span>
                </Link>
              );
            })}

            <button
              onClick={handleProfileClick}
              disabled={isLoggingOut}
              className={`flex flex-col items-center justify-center rounded-xl px-1 py-1.5 text-primary transition-all duration-300 hover:bg-accent/20 hover:text-[#f47812] ${isLoggingOut ? 'pointer-events-none opacity-50' : ''}`}
            >
              <UserCircle2 className="size-4" strokeWidth={1.9} />
              <span className="mt-1 text-[10px] leading-none">Profile</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      <ProfileModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        user={user ?? null}
      />

      <HrAttendanceModal open={showAttendanceModal} onOpenChange={setShowAttendanceModal} />
    </>
  );
}
