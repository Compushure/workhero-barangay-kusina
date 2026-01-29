'use client';

import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SortOption } from '@/types';

interface SortButtonProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  options?: { value: SortOption; label: string }[];
}

export function SortButton({
  sortBy,
  onSortChange,
  options = [
    { value: 'pending', label: 'Pending Requests' },
    { value: 'approved', label: 'Approved Requests' },
    { value: 'denied', label: 'Denied Requests' },
  ],
}: SortButtonProps) {
  // Find the label for the current sort value
  const currentLabel =
    options.find((opt) => opt.value === sortBy)?.label || 'Sort';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="default"
          className="bg-[#690003] hover:bg-[#af3b3f] w-35 cursor-pointer rounded-full text-white shadow-sm/50 flex justify-between transition-all duration-500 ease-in-out"
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
            className={`cursor-pointer transition-all duration-500 ease-in-out ${
              sortBy === opt.value ? 'bg-red-100' : ''
            }`}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
