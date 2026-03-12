'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle,
  ChevronLeft,
  FileText,
  Medal,
  SquarePen,
  UserCircle2,
  type LucideIcon,
} from 'lucide-react';

import { useGetSessionUser } from '@/hooks/tanstack/queries/userQueries';
import { useNavigationStore } from '@/store/navigationStore';
import { NavigationDisplay } from '@/components/manager/navigation-display';
import { LogOutBtn } from '@/components/sidebar/logout-btn';
import { ProfilePic } from '@/components/sidebar/profile-pic';
import { ProfileModal } from '@/components/sidebar/profile-modal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
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
    <div
      className={`flex w-full items-center rounded-2xl py-3 ${
        isCollapsed ? 'justify-center' : 'bg-accent-secondary/25 pl-2'
      }`}
    >
      <ProfilePic user={user} disabled={disabled} isLoading={isProfileLoading} />
      {!isCollapsed && (
        <div className="min-w-0 px-2">
          {isProfileLoading ? (
            <>
              <div className="h-4 w-20 animate-pulse rounded bg-background" />
              <div className="mt-1 h-3 w-28 animate-pulse rounded bg-background" />
            </>
          ) : user ? (
            <>
              <p className="truncate text-xs font-semibold">{user.name}</p>
              <p className="truncate text-xs text-zinc-600">{user.email}</p>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

const defaultNavItems: NavItem[] = [
  {
    key: 'assignment',
    label: 'Task Assignment',
    icon: FileText,
    href: '/manager/dashboard/task-assignment',
  },
  {
    key: 'verification',
    label: 'Task Verification',
    icon: CheckCircle,
    href: '/manager/dashboard/task-verification',
  },
  {
    key: 'editor',
    label: 'Task Editor',
    icon: SquarePen,
    href: '/manager/dashboard/task-editor',
  },
  {
    key: 'badge-assignment',
    label: 'Badge Assignment',
    icon: Medal,
    href: '/manager/dashboard/badge-assignment',
  },
  {
    key: 'badge-editor',
    label: 'Badge Editor',
    icon: Award,
    href: '/manager/dashboard/badge-editor',
  },
];

export function Sidebar({ navItems = defaultNavItems }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { startNavigation, stopNavigation, isNavigating, isLoggingOut } = useNavigationStore();
  const { data: user } = useGetSessionUser();

  useEffect(() => {
    if (pendingHref && pathname === pendingHref) {
      setPendingHref(null);
      stopNavigation();
      return;
    }

    if (!pendingHref && isNavigating) {
      stopNavigation();
    }
  }, [isNavigating, pathname, pendingHref, stopNavigation]);

  const isUiDisabled = isNavigating || isLoggingOut;
  const isNavLinkActive = (href: string) => pathname === href;

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  return (
    <>
      <aside
        className={`hidden overflow-hidden bg-gray-100 text-[#131C2A] transition-all duration-500 ease-in-out md:flex md:flex-col md:justify-between z-50 shadow-sm/25 ${
          isCollapsed ? 'w-17' : 'w-48 lg:w-52'
        }`}
      >
        <div className="mt-6 px-3 py-7">
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className={`group h-full w-full cursor-pointer rounded-sm p-1 transition-colors ${
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
                  <span className="font-bold text-[#131C2A] transition-all duration-400 ease-in-out group-hover:text-[#f47812]">
                    W
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col items-baseline">
                    <h1 className="whitespace-nowrap text-xl font-bold transition-all duration-400 ease-in-out">
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

        <TooltipProvider>
          <nav
            className={`flex-1 space-y-2.5 pb-6 ${
              isCollapsed
                ? 'overflow-hidden px-3.5'
                : 'overflow-y-auto px-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
            }`}
          >
            {navItems.map((item) => {
              const isActive = isNavLinkActive(item.href);
              const isNavigatingItem = pendingHref === item.href;
              const isDisabled = (!!pendingHref && !isNavigatingItem) || isLoggingOut;
              const Icon = item.icon;

              const navLinkClassName = `group flex w-full cursor-pointer items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium shadow-sm/15 transition-all duration-400 ease-in-out ${
                isCollapsed ? 'justify-center' : 'justify-start'
              } ${
                isActive
                  ? 'bg-primary-gradient text-zinc-50'
                  : 'bg-card text-[#131C2A] hover:scale-103 transform-gpu hover:bg-[#FAA938]/20 hover:text-[#f47812] hover:shadow-sm'
              } ${isDisabled ? 'pointer-events-none opacity-50' : ''}`;

              const navLink = (
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
                  className={navLinkClassName}
                >
                  {isNavigatingItem ? (
                    <NavigationDisplay
                      isNavigating={isNavigatingItem}
                      className="inline-flex items-center justify-center"
                      iconClassName="size-5 animate-spin text-accent"
                    />
                  ) : (
                    <Icon
                      strokeWidth={1.75}
                      size={20}
                      className={`shrink-0 ${isActive ? 'text-zinc-50' : 'text-accent'}`}
                    />
                  )}
                  {!isCollapsed && <span className="block whitespace-nowrap">{item.label}</span>}
                </Link>
              );

              if (!isCollapsed) {
                return navLink;
              }

              return (
                <Tooltip key={item.key}>
                  <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                  <TooltipContent
                    side="right"
                    align="center"
                    className="border border-accent/25 bg-card text-foreground shadow-sm/25"
                  >
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </TooltipProvider>

        <div className={isCollapsed ? 'flex h-24 items-center justify-center' : 'px-3 py-4'}>
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

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-background/95 backdrop-blur supports-backdrop-filter:bg-gray-50 md:hidden">
        <div className="px-2 py-2">
          <div className="grid grid-cols-6 gap-1">
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
                  className={`flex flex-col items-center justify-center rounded-xl py-1.5 transition-all duration-300 ${
                    isActive ? 'bg-accent/20 text-[#f47812]' : 'text-[#131C2A]'
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
              className={`flex flex-col items-center justify-center rounded-xl px-1 py-1.5 text-[#131C2A] transition-all duration-300 hover:bg-accent/20 hover:text-[#f47812] ${isLoggingOut ? 'pointer-events-none opacity-50' : ''}`}
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
    </>
  );
}
