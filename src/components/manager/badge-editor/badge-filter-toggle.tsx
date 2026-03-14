'use client';

import { Check, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export type BadgeFilterMode = 'all' | 'manual' | 'conditional';

interface BadgeFilterToggleProps {
  filterMode: BadgeFilterMode;
  onFilterChange: (value: BadgeFilterMode) => void;
}

const badgeTypeOptions: Array<{ value: BadgeFilterMode; label: string }> = [
  { value: 'all', label: 'Show All' },
  { value: 'manual', label: 'Manual Only' },
  { value: 'conditional', label: 'Conditional Only' },
];

export function BadgeFilterToggle({ filterMode, onFilterChange }: BadgeFilterToggleProps) {
  const isActive = filterMode !== 'all';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="default"
          className={`text-button control-h shadow-sm/25 transition-all duration-400 ease-in-out cursor-pointer w-10 sm:w-26 justify-around px-2 ${
            isActive
              ? 'bg-primary-gradient text-primary-foreground hover:brightness-90'
              : 'bg-card text-foreground hover:bg-card hover:brightness-90'
          }`}
        >
          <Filter
            size={12}
            className={`shrink-0 ${isActive ? 'text-primary-foreground' : 'text-accent'}`}
          />
          <span className="truncate hidden sm:inline">Filters{isActive ? ' •' : ''}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="manager-dropdown-content min-w-44">
        <DropdownMenuLabel className="text-xs font-semibold text-secondary uppercase tracking-wide px-2 py-1">
          Badge Type
        </DropdownMenuLabel>
        {badgeTypeOptions.map((option) => {
          const selected = filterMode === option.value;

          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => onFilterChange(option.value)}
              className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-400 ease-in-out my-1 ${
                selected ? 'bg-accent/15 text-foreground font-medium' : ''
              }`}
            >
              <span className="mr-2 inline-flex w-4 items-center justify-center">
                {selected ? <Check size={14} className="text-foreground" /> : null}
              </span>
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
