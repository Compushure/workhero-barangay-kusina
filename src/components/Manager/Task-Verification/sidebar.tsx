'use client';

import { FileText, CheckCircle, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
  const [activeNav, setActiveNav] = useState<'assignment' | 'verification'>('verification');
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`bg-[#690003] text-white flex flex-col justify-between transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-60'}`}
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
            className="p-1 hover:bg-red-900 rounded transition-colors"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        {!isCollapsed && <p className="text-sm text-red-200">Barangay Kusina</p>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-3">
        {/* Task Assignment */}
        <button
          onClick={() => setActiveNav('assignment')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-full font-medium transition-all justify-center ${
            isCollapsed ? 'px-2' : ''
          } ${activeNav === 'assignment' ? 'bg-white text-[#690003]' : 'text-white hover:bg-red-900'}`}
          title={isCollapsed ? 'Task Assignment' : ''}
        >
          <FileText size={20} className="shrink-0" />
          {!isCollapsed && 'Task Assignment'}
        </button>

        {/* Task Verification */}
        <button
          onClick={() => setActiveNav('verification')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-full font-medium transition-all justify-center ${
            isCollapsed ? 'px-2' : ''
          } ${activeNav === 'verification' ? 'bg-white text-[#690003]' : 'text-white hover:bg-red-900'}`}
          title={isCollapsed ? 'Task Verification' : ''}
        >
          <CheckCircle size={20} className="shrink-0" />
          {!isCollapsed && 'Task Verification'}
        </button>
      </nav>

      {/* User Profile Section */}
      <div
        className={`border-t border-red-900 ${isCollapsed ? 'flex justify-center items-center h-24' : 'p-4'}`}
      >
        <div
          className={`bg-white/10 rounded-full flex items-center ${
            isCollapsed ? 'w-16 h-16 justify-center' : 'p-4 gap-3 mb-4'
          }`}
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0">
            <User size={24} className="text-[#690003]" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-sm">User Name</p>
              <p className="text-xs text-red-200 truncate">username.email@gmail.com</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        {!isCollapsed && (
          <button className="w-full bg-white text-[#690003] py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors text-sm">
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}
