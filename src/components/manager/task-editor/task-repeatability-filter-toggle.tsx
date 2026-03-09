'use client';

import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export type TaskRepeatabilityFilter = 'all' | 'repeatable' | 'non-repeatable';

interface TaskRepeatabilityFilterToggleProps {
  value: TaskRepeatabilityFilter;
  onChange: (value: TaskRepeatabilityFilter) => void;
}

export function TaskRepeatabilityFilterToggle({
  value,
  onChange,
}: TaskRepeatabilityFilterToggleProps) {
  const activeFilterCount = value === 'all' ? 0 : 1;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 h-10 px-4 rounded-lg border-accent/25 hover:bg-accent/15 shadow-sm/25 bg-card"
          >
            <Filter className="h-4 w-4 text-accent" />
            <span className="hidden sm:inline">Filter</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-56 bg-background">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Task Type Category
          </DropdownMenuLabel>

          <DropdownMenuCheckboxItem
            checked={value === 'repeatable'}
            onCheckedChange={(checked) => onChange(checked ? 'repeatable' : 'all')}
            className="cursor-pointer"
          >
            Repeatable
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            checked={value === 'non-repeatable'}
            onCheckedChange={(checked) => onChange(checked ? 'non-repeatable' : 'all')}
            className="cursor-pointer"
          >
            Non-Repeatable
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Quick Actions
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onChange('all')} className="cursor-pointer pl-8">
            Clear Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
