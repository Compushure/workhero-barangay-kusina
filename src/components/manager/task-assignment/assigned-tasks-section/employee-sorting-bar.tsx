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
  const currentLabel = options.find((opt) => opt.value === sortBy)?.label || 'Sort';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="default"
          className="text-button control-h bg-card text-foreground shadow-sm/25 hover:bg-card hover:text-foreground hover:brightness-90 transition-all duration-400 ease-in-out cursor-pointer w-32 sm:w-40 justify-between px-2 sm:px-3"
        >
          <span className="truncate">{currentLabel}</span>
          <ArrowUpDown size={14} className="sm:size-4 text-accent" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="manager-dropdown-content">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-400 ease-in-out ${sortBy === opt.value ? 'bg-accent/15 text-foreground' : ''}`}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
