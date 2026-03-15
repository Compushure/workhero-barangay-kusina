'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type SortOption = 'newest' | 'oldest';

interface MercadoSortToggleProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

const sortLabels: Record<SortOption, string> = {
  newest: 'Newest First',
  oldest: 'Oldest First',
};

export function MercadoSortToggle({ value, onChange, className }: MercadoSortToggleProps) {
  const itemClassName = (isActive: boolean) =>
    `cursor-pointer transition-all duration-500 ease-in-out ${
      isActive
        ? 'bg-accent-secondary text-white'
        : 'hover:bg-accent-secondary/80 hover:text-white data-[highlighted]:bg-accent-secondary/80 data-[highlighted]:text-white'
    }`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(
            'control-h text-button group inline-flex w-full items-center justify-between rounded-xl border border-accent/25 bg-card px-3 text-foreground shadow-sm/25 transition-all duration-400 ease-in-out hover:bg-accent-secondary hover:text-white sm:w-44',
            className
          )}
        >
          <span className="truncate font-medium">{sortLabels[value]}</span>
          <ArrowUpDown className="h-4 w-4 text-accent group-hover:text-white transition-all duration-400 ease-in-out" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="manager-dropdown-content w-48 rounded-xl">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Sort by Date
        </DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => onChange('newest')}
          className={itemClassName(value === 'newest')}
        >
          <ArrowDown className="mr-2 h-4 w-4" />
          Newest First
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => onChange('oldest')}
          className={itemClassName(value === 'oldest')}
        >
          <ArrowUp className="mr-2 h-4 w-4" />
          Oldest First
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
