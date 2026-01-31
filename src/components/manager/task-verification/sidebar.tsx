'use client';

import { UserWithExtras } from '@/types';
import { LogOutBtn } from '@/components/sidebar/logout-btn';
import { ProfilePic } from '@/components/sidebar/profile-pic';
import { FileText, CheckCircle, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useGetSessionUser } from '@/hooks/tanstack/queries/userQueries';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  ],
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Fetch current session user
  const { data: user } = useGetSessionUser();

  return (
    <aside
      className={`bg-[#690003] text-white flex flex-col justify-between transition-all duration-500 ease-in-out ${
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
              className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-full font-medium hover:transition-all duration-500 ease-in-out justify-center ${
                isCollapsed ? 'px-2' : ''
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
          isCollapsed ? 'flex justify-center items-center h-24' : 'p-4'
        }`}
      >
        <div
          className={`bg-white/10 rounded-full flex items-center ${
            isCollapsed ? 'w-16 h-16 justify-center' : 'p-4 gap-3 mb-4'
          }`}
        >
          <ProfilePic user={user} />
          {!isCollapsed && user && (
            <div className="min-w-0">
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-red-200 truncate">{user.email}</p>
            </div>
          )}
        </div>

        {!isCollapsed && <LogOutBtn />}
      </div>
    </aside>
  );
}
