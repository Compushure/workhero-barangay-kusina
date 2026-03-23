'use client';

import { CircleSlash2, Filter, Infinity, Layers3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type TaskRepeatabilityFilter = 'all' | 'repeatable' | 'non-repeatable';

interface TaskRepeatabilityFilterToggleProps {
  value: TaskRepeatabilityFilter;
  onChange: (value: TaskRepeatabilityFilter) => void;
}

export function TaskRepeatabilityFilterToggle({
  value,
  onChange,
}: TaskRepeatabilityFilterToggleProps) {
  const isActive = value !== 'all';

  const repeatabilityOptions = [
    { value: 'all' as const, label: 'All tasks', icon: Layers3 },
    { value: 'repeatable' as const, label: 'Repeatable', icon: Infinity },
    { value: 'non-repeatable' as const, label: 'Non-Repeatable', icon: CircleSlash2 },
  ];

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="default"
            className={`text-button control-h shadow-sm/25 transition-all duration-400 ease-in-out cursor-pointer w-full sm:w-26 justify-around px-2 ${
              isActive
                ? 'bg-primary-gradient text-primary-foreground hover:brightness-90'
                : 'bg-card text-foreground hover:bg-card hover:text-foreground hover:brightness-90'
            }`}
          >
            <Filter
              className={`size-3 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-accent'}`}
            />
            <span className="hidden truncate sm:inline">Filter</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="manager-dropdown-content min-w-44">
          <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
            Filter by Type
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(nextValue) => onChange(nextValue as TaskRepeatabilityFilter)}
          >
            {repeatabilityOptions.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-400 ease-in-out pl-2 [&_span.absolute]:hidden ${
                  value === option.value ? 'bg-accent/15 text-foreground font-medium' : ''
                }`}
              >
                <option.icon className="mr-2.5 size-3.5 shrink-0 text-accent" />
                <span className="truncate">{option.label}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
            Quick Actions
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => onChange('all')}
            className="manager-dropdown-item text-meta cursor-pointer transition-all duration-400 ease-in-out"
          >
            <Sparkles className="mr-2.5 size-3.5 shrink-0 text-accent" />
            Clear Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
