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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskStatusSection } from './task-status-section';
import { TaskCard } from './task-card';
import type { TaskStatusItem, TaskOverdueFilter, TaskSortOption } from './types';
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
    `group cursor-pointer rounded-md py-1.5 font-pixel text-[10px] transition-all duration-200 ${
      isActive
        ? 'bg-[#8a6039] text-[#fff6e5]'
        : 'text-[#4b3522] hover:bg-[#dcc8aa] data-[highlighted]:bg-[#dcc8aa] data-[highlighted]:text-[#4b3522]'
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
    <div className="w-full overflow-hidden rounded-[28px] border-3 border-[#47331F] bg-[#eadbc1] p-3 font-pixel shadow-[0_10px_28px_rgba(71,51,31,0.24)] sm:p-4">
      <div className="flex flex-col gap-3 border-b-2 border-[#d4c5a8] pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex w-fit rounded-full border-2 border-[#d4c5a8] bg-[#f7efdf] px-3 py-1 text-[9px] tracking-[0.25em] text-[#8a6039]">
              TASK BOARD
            </span>
            <div>
              <h2 className="text-[15px] leading-tight text-[#3f2a1a] sm:text-[18px]">
                Track every kitchen task by status
              </h2>
              <p className="mt-1 max-w-xl text-[9px] leading-relaxed text-[#6b5038] sm:text-[10px]">
                Keep an eye on what is active, waiting for review, approved by the manager, or sent back for redo.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
            <div className="w-full space-y-1 sm:w-auto">
              <span className="block text-[9px] tracking-[0.2em] text-[#8a6039]">SORT BY</span>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as TaskSortOption)}>
                <SelectTrigger className="h-8 w-full rounded-lg border-[#9b7a56] bg-[#f7efdf] font-pixel text-[9px] text-[#4b3522] shadow-none sm:w-52">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="border-[#9b7a56] bg-[#f6eddd] text-[#4b3522]">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="font-pixel text-[9px]">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={cn('flex w-full items-center gap-2 self-start sm:w-auto sm:self-end')}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="default"
                    variant="outline"
                    className="h-8 w-full justify-between rounded-lg border-2 border-[#9b7a56] bg-[#f7efdf] px-3 py-1 font-pixel text-[9px] text-[#4b3522] shadow-none transition-all duration-200 cursor-pointer hover:bg-[#efe2ca] sm:w-auto"
                  >
                    <Filter className="h-4 w-4 text-[#8a6039]" />
                    <span>Filter</span>
                    {activeFilterCount > 0 && (
                      <Badge className="ml-1 h-5 min-w-5 rounded-full border border-[#47331F] bg-[#F4B925] px-1.5 py-0 font-pixel text-[8px] leading-none text-[#2f2115]">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  collisionPadding={12}
                  className="w-56 border-[#9b7a56] bg-[#f6eddd] p-1 sm:w-64"
                >
                  <DropdownMenuLabel className="px-2 py-1 font-pixel text-[8px] tracking-[0.2em] text-[#8a6039]">
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
      </div>

      <div className="pt-4">
        {error ? (
          <div className="flex h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-[#c9b08d] bg-[#f7efdf] px-4 text-center">
            <span className="font-pixel text-[11px] text-[#8b2e22]">Error loading tasks. Please try again.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:gap-4">
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
    </div>
  );
}
