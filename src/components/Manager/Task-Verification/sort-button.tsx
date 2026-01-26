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
    { value: 'pending', label: 'Pending Requests (Default)' },
    { value: 'approved', label: 'Approved Requests' },
    { value: 'denied', label: 'Denied Requests' },
  ],
}: SortButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="default"
          className="bg-[#690003] hover:bg-[#af3b3f] cursor-pointer text-white whitespace-nowrap shadow-md"
        >
          <ArrowUpDown size={18} />
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={sortBy === opt.value ? 'bg-accent' : ''}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
