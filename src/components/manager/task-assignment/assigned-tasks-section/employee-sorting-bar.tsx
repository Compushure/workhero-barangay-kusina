'use client';

import { ChevronDown } from 'lucide-react';

interface EmployeeSortingBarProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export function EmployeeSortingBar({ sortBy, onSortChange }: EmployeeSortingBarProps) {
  return (
    <div className="relative w-32">
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-full bg-white text-sm
                  focus:outline-none focus:border-[#690003] appearance-none cursor-pointer
                  transition-all duration-500 ease-in-out"
      >
        <option value="recently added">Recently Added</option>
        <option value="oldest">Oldest</option>
        <option value="name-asc">A-Z (Employee Name)</option>
        <option value="name-desc">Z-A (Employee Name)</option>
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[#690003] pointer-events-none" />
    </div>
  );
}
