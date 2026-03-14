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

export type SortOption = 'newest' | 'oldest';

interface MercadoSortToggleProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortLabels: Record<SortOption, string> = {
  newest: 'Newest First',
  oldest: 'Oldest First',
};

export function MercadoSortToggle({ value, onChange }: MercadoSortToggleProps) {
  const itemClassName = (isActive: boolean) =>
    `cursor-pointer transition-all duration-500 ease-in-out ${
      isActive
        ? 'bg-accent-secondary text-white'
        : 'hover:bg-accent-secondary/80 hover:text-white data-[highlighted]:bg-accent-secondary/80 data-[highlighted]:text-white'
    }`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="group h-10 w-44 justify-between rounded-xl border border-gray-300 bg-card text-foreground shadow-sm/25 hover:bg-accent-secondary hover:text-white transition-all duration-400 ease-in-out">
          <span className="truncate font-medium">{sortLabels[value]}</span>
          <ArrowUpDown className="h-4 w-4 text-accent group-hover:text-white transition-all duration-400 ease-in-out" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl">
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
