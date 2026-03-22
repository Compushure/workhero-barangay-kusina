'use client';

import { ArrowUpDown, ArrowUp, ArrowDown, Coins, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'name-asc'
  | 'name-desc'
  | 'points-desc'
  | 'points-asc';

interface MercadoSortToggleProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

const sortLabels: Record<SortOption, string> = {
  newest: 'Newest First',
  oldest: 'Oldest First',
  'name-asc': 'Item (A-Z)',
  'name-desc': 'Item (Z-A)',
  'points-desc': 'Points (High-Low)',
  'points-asc': 'Points (Low-High)',
};

export function MercadoSortToggle({ value, onChange, className }: MercadoSortToggleProps) {
  const itemClassName = (isActive: boolean) =>
    `cursor-pointer transition-all duration-500 ease-in-out ${
      isActive
        ? 'bg-accent/15 text-foreground hover:bg-accent/15 hover:text-foreground data-[highlighted]:bg-accent/15 data-[highlighted]:text-foreground'
        : 'hover:bg-accent/15 hover:text-foreground data-[highlighted]:bg-accent/15 data-[highlighted]:text-foreground'
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
      <DropdownMenuContent
        align="end"
        className="manager-dropdown-content w-[var(--radix-dropdown-menu-trigger-width)]"
      >
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
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Sort by Name
        </DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => onChange('name-asc')}
          className={itemClassName(value === 'name-asc')}
        >
          <Tag className="mr-2 h-4 w-4" />
          Item (A-Z)
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => onChange('name-desc')}
          className={itemClassName(value === 'name-desc')}
        >
          <Tag className="mr-2 h-4 w-4" />
          Item (Z-A)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Sort by Points
        </DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => onChange('points-desc')}
          className={itemClassName(value === 'points-desc')}
        >
          <Coins className="mr-2 h-4 w-4" />
          Points (High-Low)
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => onChange('points-asc')}
          className={itemClassName(value === 'points-asc')}
        >
          <Coins className="mr-2 h-4 w-4" />
          Points (Low-High)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
