'use client';

import {
  FileText,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ShoppingCart,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOutBtn } from '../sidebar/logout-btn';
import { ProfilePic } from '../sidebar/profile-pic';
import { RankWidget } from '../sidebar/rank-widget';
import { ProfileModal } from '../sidebar/profile-modal';
import { useGetSessionUser } from '@/hooks/tanstack/queries/userQueries';
import { useGetEmployeeRank } from '@/hooks/tanstack/queries/employeeQueries';
import { useQuery } from '@tanstack/react-query';
import { getEmployeeXP } from '@/actions/employee/stats';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface SidebarProps {
  navItems?: NavItem[];
}

export function Sidebar({
  navItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} className="shrink-0" />,
      href: '/employee/dashboard',
    },
    {
      key: 'tasks',
      label: 'All Task',
      icon: <FileText size={20} className="shrink-0" />,
      href: '/employee/tasks',
    },
    {
      key: 'mercado',
      label: 'Mercado',
      icon: <ShoppingCart size={20} className="shrink-0" />,
      href: '/employee/mercado',
    },
  ],
}: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Fetch current session user
  const { data: user, isLoading: isUserLoading, isFetching: isUserFetching } = useGetSessionUser();
  const isProfileLoading = isUserLoading || isUserFetching;

  // Fetch employee rank
  const { data: rankData, isLoading: isRankLoading } = useGetEmployeeRank();

  // Fetch employee XP
  const { data: xpResult } = useQuery({
    queryKey: ['employeeXP'],
    queryFn: async () => {
      const result = await getEmployeeXP();
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  return (
    <aside
      className={`bg-[#690003] text-white flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-red-900">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#690003]">W</span>
            </div>
            {!isCollapsed && <h1 className="text-2xl font-bold whitespace-nowrap">WorkHero</h1>}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-red-900 cursor-pointer rounded transition-colors"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        {!isCollapsed && <p className="text-sm text-red-200">Barangay Kusina</p>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-full font-medium transition-all ${
                isCollapsed ? 'justify-center px-2' : 'justify-start'
              } ${isActive ? 'bg-white text-[#690003]' : 'text-white hover:bg-red-900'}`}
              title={isCollapsed ? item.label : ''}
            >
              {item.icon}
              {!isCollapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div
        className={`border-t border-red-900 ${
          isCollapsed ? 'flex flex-col justify-center items-center gap-4 py-4' : 'p-4'
        }`}
      >
        {/* Rank Widget */}
        <RankWidget 
          rankData={rankData ?? null} 
          isLoading={isRankLoading} 
          isCollapsed={isCollapsed}
          totalXP={xpResult?.totalXP}
        />

        <div
          className={`bg-white/10 rounded-full flex items-center ${
            isCollapsed ? 'w-16 h-16 justify-center' : 'p-4 gap-3 mb-4'
          }`}
        >
          <ProfilePic user={user} onClick={handleProfileClick} isLoading={isProfileLoading} />
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
                      <p className="text-xs text-red-200 truncate">{user.email}</p>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {!isCollapsed && <LogOutBtn />}
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        open={showProfileModal} 
        onOpenChange={setShowProfileModal} 
        user={user ?? null} 
      />
    </aside>
  );
}
