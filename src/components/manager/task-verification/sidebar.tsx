'use client';

import { LogOutBtn } from '@/components/sidebar/logout-btn';
import { ProfilePic } from '@/components/sidebar/profile-pic';
import { FileText, CheckCircle, ChevronLeft, ChevronRight, SquarePen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGetSessionUser } from '@/hooks/tanstack/queries/userQueries';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavigationDisplay } from '@/components/manager/navigation-display';
import { useNavigationStore } from '@/store/navigationStore';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface SidebarProps {
  navItems?: NavItem[];
}

function SidebarUserProfile({ isCollapsed }: { isCollapsed: boolean }) {
  const { data: user } = useGetSessionUser();

  return (
    <>
      <ProfilePic user={user} />
      {!isCollapsed && user && (
        <div className="min-w-0">
          <p className="font-semibold text-sm">{user.name}</p>
          <p className="text-xs text-red-200 truncate">{user.email}</p>
        </div>
      )}
    </>
  );
}

export function Sidebar({
  navItems = [
    {
      key: 'assignment',
      label: 'Task Assignment',
      icon: <FileText size={20} className="shrink-0" />,
      href: '/manager/dashboard/task-assignment',
    },
    {
      key: 'verification',
      label: 'Task Verification',
      icon: <CheckCircle size={20} className="shrink-0" />,
      href: '/manager/dashboard/task-verification',
    },
    {
      key: 'editor',
      label: 'Task Editor',
      icon: <SquarePen size={20} className="shrink-0" />,
      href: '/manager/dashboard/task-editor',
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
      className={`bg-[#690003] text-white flex flex-col justify-between transition-all duration-400 ease-in-out overflow-hidden ${
        isCollapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-red-900">
        <div className={`flex items-center justify-between mb-2 ${isCollapsed ? 'gap-0' : 'gap-2'}`}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full p-1 hover:bg-red-900 cursor-pointer rounded-sm transition-colors flex items-center justify-between"
            aria-label="Toggle sidebar"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-[#690003]">W</span>
              </div>
              {!isCollapsed && <h1 className="text-2xl font-bold whitespace-nowrap">WorkHero</h1>}
            </div>
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        {!isCollapsed && <p className="text-sm text-red-200">Barangay Kusina</p>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-3 overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isNavigatingItem = pendingHref === item.href;
          const isDisabled = (!!pendingHref && !isNavigatingItem) || isLoggingOut;
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
                  className={`w-full flex items-center justify-start gap-3 py-3 cursor-pointer rounded-full font-medium hover:transition-all duration-400 ease-in-out ${
                    isCollapsed ? 'px-3.5' : 'px-4'
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
        className={`border-t border-red-900 ${
          isCollapsed ? 'flex justify-center items-center h-24' : 'p-4'
        }`}
      >
        <div
          className={`bg-white/10 rounded-full flex items-center ${
            isCollapsed ? 'w-16 h-16 justify-center' : 'p-4 gap-3 mb-4'
          }`}
        >
          {isLoggingOutOnly ? (
            <ProfilePic disabled />
          ) : (
            <SidebarUserProfile isCollapsed={isCollapsed} />
          )}
        </div>

        {!isCollapsed && <LogOutBtn />}
      </div>
    </aside>
  );
}
