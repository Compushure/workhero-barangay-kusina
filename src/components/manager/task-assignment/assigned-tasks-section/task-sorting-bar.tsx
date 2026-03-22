'use client';

import { ArrowUpDown, CalendarArrowDown, CalendarArrowUp, ClockArrowDown, ClockArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskSortingBarProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export function TaskSortingBar({ sortBy, onSortChange }: TaskSortingBarProps) {
  const options = [
    { value: 'recently added', label: 'Recently Added', icon: ClockArrowDown },
    { value: 'oldest', label: 'Oldest Added', icon: ClockArrowUp },
    { value: 'closest', label: 'Closest Due', icon: CalendarArrowUp },
    { value: 'farthest', label: 'Farthest Due', icon: CalendarArrowDown },
  ];

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
      <DropdownMenuContent
        align="end"
        className="manager-dropdown-content w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
          Sort by Date
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-500 ease-in-out ${sortBy === opt.value ? 'bg-accent/15 text-foreground' : ''}`}
          >
            <opt.icon className="mr-2.5 size-3.5 shrink-0 text-accent" />
            <span className="truncate">{opt.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
