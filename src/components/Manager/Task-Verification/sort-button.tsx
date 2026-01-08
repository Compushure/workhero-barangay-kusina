'use client';

import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SortOption } from '@/types/manager-verification-req';

interface SortButtonProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
}

export function SortButton({ sortBy, onSortChange }: SortButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="default"
          className="bg-[#690003] hover:bg-[#690003] cursor-pointer text-white whitespace-nowrap"
        >
          <ArrowUpDown size={18} />
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onSortChange('pending')}
          className={sortBy === 'pending' ? 'bg-accent' : ''}
        >
          Pending Requests (Default)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSortChange('approved')}
          className={sortBy === 'approved' ? 'bg-accent' : ''}
        >
          Approved Requests
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSortChange('denied')}
          className={sortBy === 'denied' ? 'bg-accent' : ''}
        >
          Denied Requests
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
