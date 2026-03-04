'use client';

import { LogOutBtn } from '@/components/sidebar/logout-btn';
import { ProfilePic } from '@/components/sidebar/profile-pic';
import { FileText, CheckCircle, ChevronLeft, ChevronRight, SquarePen, Award, Medal, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGetSessionUser } from '@/hooks/tanstack/queries/userQueries';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavigationDisplay } from '@/components/manager/navigation-display';
import { useNavigationStore } from '@/store/navigationStore';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DynamicIcon } from 'lucide-react/dynamic';

interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon; // The actual icon component
  href: string;
}

interface SidebarProps {
  navItems?: NavItem[];
}

function SidebarUserProfile({ isCollapsed, disabled }: { isCollapsed: boolean; disabled: boolean }) {
  const { data: user, isLoading, isFetching } = useGetSessionUser();
  const isProfileLoading = isLoading || isFetching;

  return (
    <div className={`w-full flex py-3 rounded-2xl items-center ${isCollapsed ? 'justify-center' : 'pl-2 bg-[#FAA938]/25'}`}>
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
    </ div>
  );
}

export function Sidebar({
  navItems = [
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
  ],
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const { startNavigation, stopNavigation, isNavigating, isLoggingOut } = useNavigationStore();

  const isUiDisabled = isNavigating || isLoggingOut;
  const isLoggingOutOnly = isLoggingOut;

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
          className={`group w-full h-full p-1 hover:bg-zinc-50 cursor-pointer rounded-sm transition-colors ${
            isCollapsed ? 'flex justify-center items-center' : 'flex flex-col items-baseline'
          }`}
          aria-label="Toggle sidebar"
        >
          <div className={`flex items-center gap-2 w-full ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2">
              <div className={`bg-white flex items-center justify-center shrink-0 ${
                isCollapsed ? 'text-lg size-8 rounded-sm' : 'text-sm size-6 rounded'
              }`}>
                <span className={`font-bold text-[#131C2A] group-hover:text-[#f47812] transition-all duration-400 ease-in-out`}>
                  W
                </span>
              </div>
              {!isCollapsed && 
              <div className='flex flex-col items-baseline'>
                <h1 className="text-2xl font-bold whitespace-nowrap transition-all duration-400 ease-in-out">WorkHero</h1>
                <p className="block text-nowrap text-xs text-[#f47812] pl-0.5 transition-all duration-400 ease-in-out">Barangay Kusina</p>
              </div>
              }
            </div>
            {!isCollapsed && (
              <ChevronLeft size={20} className='group-hover:text-[#f47812] transition-all duration-400 ease-in-out'/>
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

          const NavIcon = ({ icon: Icon }: { icon: any}) => (
            <Icon strokeWidth={1.75} className={`shrink-0 text-[#f47812]  ${isActive ? 'text-zinc-50' : 'group-hover:text-[#f47812]'} `} />
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
                  className={`group w-full flex items-center gap-3 py-3 cursor-pointer font-medium transition-all duration-400 ease-in-out rounded-full shadow-sm/15
                    ${isCollapsed ? 'px-4 justify-center' : 'px-5 justify-start'} 
                    ${isActive ? 'bg-primary-gradient text-zinc-50 transition-colors' : 'text-[#131C2A] hover:text-[#f47812] bg-zinc-50/75 hover:bg-[#FAA938]/20 hover:shadow-sm hover:scale-103 transform-gpu'} 
                    ${isDisabled ? 'opacity-50 pointer-events-none' : ''}
                  `}
                >
                    {/* ${isActive ? 'text-[#f47812] bg-zinc-50' : 'text-[#131C2A] hover:bg-[#f47812]/80 hover:text-zinc-50 hover:shadow-sm'}  */}
                  {isCollapsed ? (
                    isNavigatingItem ? (
                      <NavigationDisplay
                        isNavigating={isNavigatingItem}
                        className="inline-flex items-center justify-center"
                        iconClassName="size-5 animate-spin text-red-200"
                      />
                    ) : (
                      <NavIcon icon={item.icon}/>
                    )
                  ) : (
                    <NavIcon icon={item.icon}/>
                  )}
                  {!isCollapsed && <span className='block text-nowrap'>{item.label}</span>}
                  {!isCollapsed && (
                    <NavigationDisplay
                      isNavigating={isNavigatingItem}
                      className="ml-auto inline-flex items-center justify-center"
                      iconClassName="size-4 animate-spin text-red-200"
                    />
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8} className='text-[#131C2A] shadow-2xl'>
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div
        className={`${
          isCollapsed ? 'flex justify-center items-center h-24' : 'px-3 py-4'
        }`}
      >
        <div
          className={`bg-white/10 rounded-full flex items-center w-full ${
            isCollapsed ? 'w-16 h-16 justify-center' : 'gap-3 mb-4'
          }`}
        >
          <SidebarUserProfile isCollapsed={isCollapsed} disabled={isUiDisabled} />
        </div>

        {!isCollapsed && <LogOutBtn />}
      </div>
    </aside>
  );
}
