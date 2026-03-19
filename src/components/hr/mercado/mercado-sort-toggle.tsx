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
          variant="default"
          size="default"
          className={cn(
            'text-button control-h w-full justify-between rounded-md border border-gray-200 bg-card py-1.5 text-primary shadow-md shadow-sm/25 transition-all duration-200 ease-in-out cursor-pointer hover:bg-gray-200 sm:w-44',
            className
          )}
        >
          <span className="truncate">{sortLabels[value]}</span>
          <ArrowUpDown size={14} className="text-accent" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="manager-dropdown-content w-48">
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
