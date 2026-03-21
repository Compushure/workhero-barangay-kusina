'use client';

import { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskStatusSection } from './task-status-section';
import { TaskCard } from './task-card';
import type { TaskStatusItem, TaskOverdueFilter, TaskSortOption } from './types';
import { Header } from '../header';
import { cn } from '@/lib/utils';
import { isTaskStatusItemOverdue } from './task-status-utils';

const sortOptions: Array<{ value: TaskSortOption; label: string }> = [
  { value: 'due-date-asc', label: 'Due date (Ascending)' },
  { value: 'due-date-desc', label: 'Due date (Descending)' },
  { value: 'points-asc', label: 'Points (Ascending)' },
  { value: 'points-desc', label: 'Points (Descending)' },
  { value: 'title-asc', label: 'Task Name (A-Z)' },
  { value: 'title-desc', label: 'Task Name (Z-A)' },
];

function dueDateTimeOrInfinity(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

function sortTasks(tasks: TaskStatusItem[], sortBy: TaskSortOption): TaskStatusItem[] {
  const copy = [...tasks];
  switch (sortBy) {
    case 'due-date-asc':
      return copy.sort((a, b) => dueDateTimeOrInfinity(a.dueDate) - dueDateTimeOrInfinity(b.dueDate));
    case 'due-date-desc':
      return copy.sort((a, b) => dueDateTimeOrInfinity(b.dueDate) - dueDateTimeOrInfinity(a.dueDate));
    case 'points-asc':
      return copy.sort((a, b) => a.points - b.points);
    case 'points-desc':
      return copy.sort((a, b) => b.points - a.points);
    case 'title-asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'title-desc':
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return copy;
  }
}

function filterTasksByOverdue(tasks: TaskStatusItem[], overdueFilter: TaskOverdueFilter): TaskStatusItem[] {
  if (overdueFilter === 'all') return tasks;

  return tasks.filter((task) => {
    const overdue = isTaskStatusItemOverdue(task);
    return overdueFilter === 'overdue' ? overdue : !overdue;
  });
}

interface TaskStatusBoardProps {
  currentTasks?: TaskStatusItem[];
  inReviewTasks?: TaskStatusItem[];
  verifiedTasks?: TaskStatusItem[];
  rejectedTasks?: TaskStatusItem[];
  isLoading?: boolean;
  error?: Error | null;
}

export function TaskStatusBoard({
  currentTasks = [],
  inReviewTasks = [],
  verifiedTasks = [],
  rejectedTasks = [],
  isLoading = false,
  error = null,
}: TaskStatusBoardProps) {
  const [sortBy, setSortBy] = useState<TaskSortOption>('due-date-asc');
  const [overdueFilter, setOverdueFilter] = useState<TaskOverdueFilter>('all');

  const activeFilterCount = overdueFilter !== 'all' ? 1 : 0;

  const checkboxItemClassName = (isActive: boolean) =>
    `group cursor-pointer py-1.5 transition-all duration-500 ease-in-out ${
      isActive
        ? 'bg-accent-secondary text-white'
        : 'hover:bg-accent-secondary/80 hover:text-white data-[highlighted]:bg-accent-secondary/80 data-[highlighted]:text-white'
    }`;

  const [current, onReview, verified, denied] = useMemo(
    () => [
      sortTasks(filterTasksByOverdue(currentTasks, overdueFilter), sortBy),
      sortTasks(filterTasksByOverdue(inReviewTasks, overdueFilter), sortBy),
      sortTasks(filterTasksByOverdue(verifiedTasks, overdueFilter), sortBy),
      sortTasks(filterTasksByOverdue(rejectedTasks, overdueFilter), sortBy),
    ],
    [currentTasks, inReviewTasks, verifiedTasks, rejectedTasks, overdueFilter, sortBy]
  );

  return (
    <div className="flex flex-col gap-4 w-full min-w-300 overflow-hidden px-8 py-8 my-24 rounded-4xl bg-card/45 backdrop-blur-lg shadow-lg/25">
      <div className="flex flex-row items-start justify-between gap-2 px-3">
        <Header
          title="Tasks Board"
          description="View your tasks by status: Current, On Review, Verified, or Denied Approval."
        />
      
        <div className="flex items-end gap-2">
          <div>
            <span className="text-sm text-muted-foreground">Sort by</span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as TaskSortOption)}>
              <SelectTrigger className="w-58 bg-card shadow-sm/25">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={cn('flex items-center gap-2')}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="default"
                  variant="outline"
                  className="text-button control-h w-full justify-between rounded-md border border-gray-200 bg-card px-3 py-1.5 text-primary shadow-md shadow-sm/25 transition-all duration-200 ease-in-out cursor-pointer hover:bg-gray-200 sm:w-auto"
                >
                  <Filter className="h-4 w-4 text-accent" />
                  <span className="hidden sm:inline">Filter</span>
                  {activeFilterCount > 0 && (
                    <Badge className="ml-1 h-5 min-w-5 rounded-full bg-accent/75 px-1.5 py-0 text-[11px] leading-none text-primary-foreground">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                collisionPadding={12}
                className="manager-dropdown-content w-72 max-h-136 overflow-visible p-1"
              >
                <DropdownMenuLabel className="px-2 py-1 text-xs text-muted-foreground">
                  Due Date State
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={overdueFilter === 'all'}
                  onCheckedChange={(checked) => {
                    if (checked) setOverdueFilter('all');
                  }}
                  className={checkboxItemClassName(overdueFilter === 'all')}
                >
                  All Tasks
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={overdueFilter === 'overdue'}
                  onCheckedChange={(checked) => {
                    if (checked) setOverdueFilter('overdue');
                    else setOverdueFilter('all');
                  }}
                  className={checkboxItemClassName(overdueFilter === 'overdue')}
                >
                  Overdue Only
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={overdueFilter === 'not-overdue'}
                  onCheckedChange={(checked) => {
                    if (checked) setOverdueFilter('not-overdue');
                    else setOverdueFilter('all');
                  }}
                  className={checkboxItemClassName(overdueFilter === 'not-overdue')}
                >
                  Not Overdue Only
                </DropdownMenuCheckboxItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Single Section on small screens; 2x2 grid on lg and up (Current | On Review, Verified | Denied Approval) */}
        {error ? (
          <div className='w-full h-48 flex flex-col items-center justify-center'>
            <span className='text-lg'>Error loading tasks. Please try again</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-8 w-full min-w-0">
          <TaskStatusSection status="Current" task={current} isLoading={isLoading}>
            {current.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </TaskStatusSection>
          <TaskStatusSection status="In Review" task={onReview} isLoading={isLoading}>
            {onReview.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </TaskStatusSection>
          <TaskStatusSection status="Approved" task={verified} isLoading={isLoading}>
            {verified.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </TaskStatusSection>
          <TaskStatusSection status="Rejected" task={denied} isLoading={isLoading}>
            {denied.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </TaskStatusSection>
          </div>
        )}
    </div>
  );
}
