'use client';

import { ChevronDown } from "lucide-react";

interface EmployeeSortingBarProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export function EmployeeSortingBar({ sortBy, onSortChange }: EmployeeSortingBarProps) {
  return (
    <div className="relative w-[20%]">
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-full bg-white focus:outline-none focus:border-[#690003] appearance-none cursor-pointer"
      >
        <option value="recently added">Recently Added</option>
        <option value="oldest">Oldest</option>
        <option value="name-asc">A-Z (Employee Name)</option>
        <option value="name-desc">Z-A (Employee Name)</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#690003] pointer-events-none" />
    </div>
  );
}
