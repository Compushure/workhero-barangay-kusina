'use client';

import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskSortingBarProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export function TaskSortingBar({ sortBy, onSortChange }: TaskSortingBarProps) {
  const options = [
    { value: 'recently added', label: 'Recently Added' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'closest', label: 'Closest due' },
    { value: 'farthest', label: 'Farthest due' },
  ];

  const currentLabel = options.find((opt) => opt.value === sortBy)?.label || 'Sort';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="default"
          className="bg-foreground shadow-sm/25 hover:bg-[#950005] transition-all duration-200 ease-in-out cursor-pointer text-zinc-50 shadow-md w-32 justify-between"
        >
          <span className="truncate">{currentLabel}</span>
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
