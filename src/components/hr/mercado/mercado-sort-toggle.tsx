'use client';

// Sort dropdown for HR Mercado list ordering.

import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowUpDown,
  ClockArrowDown,
  ClockArrowUp,
  Coins,
} from 'lucide-react';
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
  // Highlights currently selected sort option in the dropdown.
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
            'text-button control-h w-full justify-between bg-card px-2 text-foreground shadow-sm/25 transition-all duration-400 ease-in-out cursor-pointer hover:bg-card hover:text-foreground hover:brightness-90 focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0 sm:w-44 sm:px-3',
            className
          )}
        >
          <span className="truncate">{sortLabels[value]}</span>
          <ArrowUpDown size={14} className="text-accent" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="manager-dropdown-content w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
          Sort by Date
        </DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => onChange('newest')}
          className={itemClassName(value === 'newest')}
        >
          <ClockArrowDown className="mr-2.5 size-3.5 shrink-0 text-accent" />
          Newest First
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => onChange('oldest')}
          className={itemClassName(value === 'oldest')}
        >
          <ClockArrowUp className="mr-2.5 size-3.5 shrink-0 text-accent" />
          Oldest First
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
          Sort by Name
        </DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => onChange('name-asc')}
          className={itemClassName(value === 'name-asc')}
        >
          <ArrowDownAZ className="mr-2.5 size-3.5 shrink-0 text-accent" />
          Item (A-Z)
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => onChange('name-desc')}
          className={itemClassName(value === 'name-desc')}
        >
          <ArrowUpAZ className="mr-2.5 size-3.5 shrink-0 text-accent" />
          Item (Z-A)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
          Sort by Points
        </DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => onChange('points-desc')}
          className={itemClassName(value === 'points-desc')}
        >
          <Coins className="mr-2.5 size-3.5 shrink-0 text-accent" />
          Points (High-Low)
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => onChange('points-asc')}
          className={itemClassName(value === 'points-asc')}
        >
          <Coins className="mr-2.5 size-3.5 shrink-0 text-accent" />
          Points (Low-High)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
