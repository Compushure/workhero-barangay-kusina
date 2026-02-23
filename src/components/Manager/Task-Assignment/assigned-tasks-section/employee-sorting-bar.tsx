'use client';

import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmployeeSortingBarProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export function EmployeeSortingBar({ sortBy, onSortChange }: EmployeeSortingBarProps) {
  const options = [
    { value: 'recently added', label: 'Recently Added' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'name-asc', label: 'A-Z (Employee Name)' },
    { value: 'name-desc', label: 'Z-A (Employee Name)' },
  ];

  // Find the label for the current sort value
  const currentLabel =
    options.find((opt) => opt.value === sortBy)?.label || 'Sort';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="default"
          className="bg-[#690003] shadow-sm/25 hover:bg-[#af3b3f] transition-all duration-500 ease-in-out cursor-pointer text-white shadow-md w-32 flex justify-between"
        >
          {/* Label on the left */}
          <span className="truncate">{currentLabel}</span>
          {/* Arrow on the right */}
          <ArrowUpDown size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={`cursor-pointer transition-all duration-500 ease-in-out ${sortBy === opt.value ? 'bg-red-100' : ''}`}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
