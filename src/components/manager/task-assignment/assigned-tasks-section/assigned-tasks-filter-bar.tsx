'use client';

import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  EyeOff,
  Filter,
  Layers3,
  Target,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AssignedTasksFilterBarProps {
  statusFilters: string[];
  overdueFilter: string;
  onStatusFilterToggle: (value: string) => void;
  onOverdueFilterChange: (value: string) => void;
}

const overdueOptions = [
  { value: 'all', label: 'All tasks', icon: Layers3 },
  { value: 'hide-overdue', label: 'Hide overdue', icon: EyeOff },
  { value: 'only-overdue', label: 'Only overdue', icon: CircleAlert },
];

const statusOptions = [
  { value: 'assigned', label: 'Assigned', icon: CircleDashed },
  { value: 'in review', label: 'In Review', icon: Target },
  { value: 'approved', label: 'Approved', icon: CircleCheck },
  { value: 'rejected', label: 'Rejected', icon: XCircle },
];

export function AssignedTasksFilterBar({
  statusFilters,
  overdueFilter,
  onStatusFilterToggle,
  onOverdueFilterChange,
}: AssignedTasksFilterBarProps) {
  const isActive =
    statusFilters.length !== statusOptions.length || overdueFilter !== 'hide-overdue';

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
          <span className="truncate hidden sm:inline">Filters</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="manager-dropdown-content min-w-44">
        <DropdownMenuLabel className="text-xs font-semibold text-secondary uppercase tracking-wide px-2 py-1">
          Overdue
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={overdueFilter} onValueChange={onOverdueFilterChange}>
          {overdueOptions.map((opt) => (
            <DropdownMenuRadioItem
              key={opt.value}
              value={opt.value}
              className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-400 ease-in-out pl-2 [&_span.absolute]:hidden ${
                overdueFilter === opt.value ? 'bg-accent/15 text-foreground font-medium' : ''
              }`}
            >
              <opt.icon className="mr-2.5 size-3.5 shrink-0 text-accent" />
              <span className="truncate">{opt.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-semibold text-secondary uppercase tracking-wide px-2 py-1">
          Status
        </DropdownMenuLabel>
        {statusOptions.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt.value}
            checked={statusFilters.includes(opt.value)}
            onCheckedChange={() => onStatusFilterToggle(opt.value)}
            className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-400 ease-in-out my-1 ${
              statusFilters.includes(opt.value) ? 'bg-accent/15 text-foreground font-medium' : ''
            }`}
          >
            <opt.icon className="mr-2.5 size-3.5 shrink-0 text-accent" />
            <span className="truncate">{opt.label}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
