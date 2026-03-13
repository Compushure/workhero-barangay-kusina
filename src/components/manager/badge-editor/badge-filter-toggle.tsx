'use client';

import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export type BadgeFilterMode = 'all' | 'manual' | 'conditional';

interface BadgeFilterToggleProps {
  filterMode: BadgeFilterMode;
  onFilterChange: (value: BadgeFilterMode) => void;
}

export function BadgeFilterToggle({ filterMode, onFilterChange }: BadgeFilterToggleProps) {
  const activeFilterCount = filterMode === 'all' ? 0 : 1;

  const clearFilters = () => {
    onFilterChange('all');
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="text-button control-h gap-2 px-4 rounded-md border-accent/25 hover:bg-accent/15 shadow-sm/25 bg-card"
          >
            <Filter className="h-4 w-4 text-accent" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="manager-dropdown-content w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Badge Type
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={filterMode === 'manual'}
            onCheckedChange={(checked) => onFilterChange(checked ? 'manual' : 'all')}
            className="manager-dropdown-item cursor-pointer"
          >
            Manual Only
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filterMode === 'conditional'}
            onCheckedChange={(checked) => onFilterChange(checked ? 'conditional' : 'all')}
            className="manager-dropdown-item cursor-pointer"
          >
            Conditional Only
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Quick Actions
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={clearFilters}
            className="manager-dropdown-item cursor-pointer text-secondary hover:text-foreground pl-8"
          >
            Clear Filters
          </DropdownMenuItem>
          <DropdownMenuCheckboxItem
            checked={filterMode === 'all'}
            onCheckedChange={() => onFilterChange('all')}
            className="manager-dropdown-item cursor-pointer"
          >
            Show All
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
