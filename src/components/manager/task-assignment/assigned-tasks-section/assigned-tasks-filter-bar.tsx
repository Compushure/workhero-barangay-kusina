'use client';

import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
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
  { value: 'all', label: 'All tasks' },
  { value: 'hide-overdue', label: 'Hide overdue' },
  { value: 'only-overdue', label: 'Only overdue' },
];

const statusOptions = [
  { value: 'assigned', label: 'Assigned' },
  { value: 'in review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
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
          className={`text-button control-h shadow-sm/25 transition-all duration-400 ease-in-out cursor-pointer w-10 sm:w-22 justify-between px-2 sm:px-3 ${
            isActive
              ? 'bg-primary-gradient text-primary-foreground hover:brightness-90'
              : 'bg-card text-foreground hover:bg-card hover:brightness-90'
          }`}
        >
          <Filter
            size={12}
            className={`shrink-0 ${isActive ? 'text-primary-foreground' : 'text-accent'}`}
          />
          <span className="truncate hidden sm:inline">Filter{isActive ? ' •' : ''}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="manager-dropdown-content min-w-44">
        <DropdownMenuLabel className="text-xs font-semibold text-secondary uppercase tracking-wide px-2 py-1">
          Overdue
        </DropdownMenuLabel>
        {overdueOptions.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt.value}
            checked={overdueFilter === opt.value}
            onCheckedChange={(checked) => {
              if (checked) onOverdueFilterChange(opt.value);
            }}
            className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-400 ease-in-out ${
              overdueFilter === opt.value ? 'bg-accent/15 text-foreground font-medium' : ''
            }`}
          >
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}
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
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
