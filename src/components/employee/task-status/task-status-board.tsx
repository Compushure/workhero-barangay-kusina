'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
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
  const [openSections, setOpenSections] = useState<Record<'Current' | 'In Review' | 'Approved' | 'Rejected', boolean>>({
    Current: true,
    'In Review': true,
    Approved: true,
    Rejected: true,
  });
  const [isMobileLayout, setIsMobileLayout] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateLayoutMode = () => setIsMobileLayout(mediaQuery.matches);

    updateLayoutMode();
    mediaQuery.addEventListener('change', updateLayoutMode);

    return () => mediaQuery.removeEventListener('change', updateLayoutMode);
  }, []);

  const openCount = Object.values(openSections).filter(Boolean).length;
  const filterLabel =
    overdueFilter === 'overdue'
      ? 'Overdue Only'
      : overdueFilter === 'not-overdue'
        ? 'Not Overdue'
        : 'Filter';

  const checkboxItemClassName = (isActive: boolean) =>
    `group cursor-pointer rounded-md py-1.5 font-jersey text-[14px] tracking-[0.04em] transition-all duration-200 data-[state=checked]:bg-transparent data-[state=checked]:text-[#4b3522] ${
      isActive
        ? 'text-[#4b3522]'
        : 'text-[#4b3522] hover:bg-[#8a6039] hover:text-[#fff6e5] data-[highlighted]:bg-[#8a6039] data-[highlighted]:text-[#fff6e5]'
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

  const sectionClassName = (status: 'Current' | 'In Review' | 'Approved' | 'Rejected') =>
    cn(
      'min-h-0',
      openSections[status] && openCount === 1 && 'md:col-span-2'
    );

  function handleSectionOpenChange(
    status: 'Current' | 'In Review' | 'Approved' | 'Rejected',
    open: boolean
  ) {
    setOpenSections((prev) => {
      if (isMobileLayout && open) {
        return {
          Current: status === 'Current',
          'In Review': status === 'In Review',
          Approved: status === 'Approved',
          Rejected: status === 'Rejected',
        };
      }

      const next = { ...prev, [status]: open };

      if (!Object.values(next).some(Boolean)) {
        return prev;
      }

      return next;
    });
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border-3 border-[#47331F] bg-[#eadbc1] p-2.5 font-jersey shadow-[0_10px_28px_rgba(71,51,31,0.24)] sm:p-3">
      <div className="flex flex-col gap-2 border-b-2 border-[#d4c5a8] pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          {isLoading ? (
            <>
              <div className="space-y-2">
                <Skeleton className="h-8 w-52 bg-[#dcc8aa]" />
                <Skeleton className="h-5 w-80 max-w-full bg-[#e3d3b7]" />
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
                <div className="w-full space-y-1 sm:w-auto">
                  <Skeleton className="h-5 w-20 bg-[#dcc8aa]" />
                  <Skeleton className="h-9 w-full rounded-lg bg-[#f7efdf] sm:w-52" />
                </div>
                <div className="flex w-full items-center gap-2 self-start sm:w-auto sm:self-end">
                  <Skeleton className="h-9 w-full rounded-lg bg-[#f7efdf] sm:w-32" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div>
                  <h2 className="text-[28px] leading-none text-[#3f2a1a] sm:text-[32px]">
                    Task Board
                  </h2>
                  <p className="mt-1 max-w-xl text-[14px] leading-snug tracking-[0.04em] text-[#6b5038] sm:text-[16px]">
                    View your assigned tasks and track each one by status.
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
                <div className="w-full space-y-1 sm:w-auto">
                  <span className="block text-[14px] tracking-[0.18em] text-[#8a6039] sm:text-[16px]">SORT BY</span>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as TaskSortOption)}>
                    <SelectTrigger className="h-9 w-full rounded-lg border-2 border-[#9b7a56] bg-[#f7efdf] font-jersey text-[14px] tracking-[0.05em] text-[#4b3522] shadow-none outline-none transition-colors duration-200 cursor-pointer hover:bg-[#f7efdf] hover:text-[#4b3522] focus:ring-0 focus-visible:border-[#F4B925] focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:border-[#F4B925] data-[state=open]:shadow-none data-[state=open]:ring-0 sm:w-52">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="w-56 border-[#9b7a56] bg-[#f6eddd] p-1 text-[#4b3522] sm:w-64">
                      {sortOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="cursor-pointer rounded-md py-1.5 font-jersey text-[14px] tracking-[0.04em] text-[#4b3522] transition-colors duration-200 data-[state=checked]:bg-transparent data-[state=checked]:text-[#4b3522] focus:bg-[#8a6039] focus:text-[#fff6e5] data-[highlighted]:bg-[#8a6039] data-[highlighted]:text-[#fff6e5]"
                        >
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
                        className="h-9 w-full justify-between rounded-lg border-2 border-[#9b7a56] bg-[#f7efdf] px-3 py-1 font-jersey text-[14px] tracking-[0.05em] text-[#4b3522] shadow-none outline-none transition-colors duration-200 cursor-pointer hover:bg-[#efe2ca] hover:text-[#4b3522] focus:ring-0 focus-visible:border-[#F4B925] focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:border-[#F4B925] data-[state=open]:shadow-none data-[state=open]:ring-0 sm:w-auto"
                      >
                        <Filter strokeWidth={2.5} className="h-4 w-4 text-[#6b5038]" />
                        <span className="inline-flex items-center text-[16px] leading-none">{filterLabel}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      collisionPadding={12}
                      className="w-56 border-[#9b7a56] bg-[#f6eddd] p-1 sm:w-64"
                    >
                      <DropdownMenuLabel className="px-2 py-1 font-jersey text-[14px] tracking-[0.04em] text-[#8a6039]">
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
            </>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 pt-3">
        {error ? (
          <div className="flex h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-[#c9b08d] bg-[#f7efdf] px-4 text-center">
            <span className="font-jersey text-[14px] tracking-[0.06em] text-[#8b2e22]">Error loading tasks. Please try again.</span>
          </div>
        ) : (
          <div className="grid h-full min-h-0 grid-cols-1 gap-2.5 md:grid-cols-2 xl:gap-3">
            <div className={sectionClassName('Current')}>
              <TaskStatusSection
                status="Current"
                task={current}
                isLoading={isLoading}
                open={openSections.Current}
                onOpenChange={(open) => handleSectionOpenChange('Current', open)}
              >
                {current.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </TaskStatusSection>
            </div>
            <div className={sectionClassName('In Review')}>
              <TaskStatusSection
                status="In Review"
                task={onReview}
                isLoading={isLoading}
                open={openSections['In Review']}
                onOpenChange={(open) => handleSectionOpenChange('In Review', open)}
              >
                {onReview.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </TaskStatusSection>
            </div>
            <div className={sectionClassName('Approved')}>
              <TaskStatusSection
                status="Approved"
                task={verified}
                isLoading={isLoading}
                open={openSections.Approved}
                onOpenChange={(open) => handleSectionOpenChange('Approved', open)}
              >
                {verified.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </TaskStatusSection>
            </div>
            <div className={sectionClassName('Rejected')}>
              <TaskStatusSection
                status="Rejected"
                task={denied}
                isLoading={isLoading}
                open={openSections.Rejected}
                onOpenChange={(open) => handleSectionOpenChange('Rejected', open)}
              >
                {denied.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </TaskStatusSection>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
