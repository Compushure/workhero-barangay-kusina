'use client';

import { useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { isTaskStatusItemOverdue } from './task-status-utils';
import { TaskCard } from './task-card';
import { TaskStatusSection } from './task-status-section';
import type {
  TaskOverdueFilter,
  TaskSortOption,
  TaskStatusItem,
  TaskStatusKind,
} from './types';

const sortOptions: Array<{ value: TaskSortOption; label: string }> = [
  { value: 'due-date-asc', label: 'Due date (Ascending)' },
  { value: 'due-date-desc', label: 'Due date (Descending)' },
  { value: 'points-asc', label: 'Points (Ascending)' },
  { value: 'points-desc', label: 'Points (Descending)' },
  { value: 'title-asc', label: 'Task Name (A-Z)' },
  { value: 'title-desc', label: 'Task Name (Z-A)' },
];

const desktopOpenState: Record<TaskStatusKind, boolean> = {
  Current: true,
  'In Review': true,
  Approved: true,
  Rejected: true,
};

function dueDateTimeOrInfinity(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

function sortTasks(tasks: TaskStatusItem[], sortBy: TaskSortOption): TaskStatusItem[] {
  const copy = [...tasks];

  switch (sortBy) {
    case 'due-date-asc':
      return copy.sort(
        (left, right) => dueDateTimeOrInfinity(left.dueDate) - dueDateTimeOrInfinity(right.dueDate)
      );
    case 'due-date-desc':
      return copy.sort(
        (left, right) => dueDateTimeOrInfinity(right.dueDate) - dueDateTimeOrInfinity(left.dueDate)
      );
    case 'points-asc':
      return copy.sort((left, right) => left.points - right.points);
    case 'points-desc':
      return copy.sort((left, right) => right.points - left.points);
    case 'title-asc':
      return copy.sort((left, right) => left.name.localeCompare(right.name));
    case 'title-desc':
      return copy.sort((left, right) => right.name.localeCompare(left.name));
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

function getSectionHelperText(status: TaskStatusKind): string {
  if (status === 'Current') {
    return 'Continue cooking, then submit completed orders for verification.';
  }

  if (status === 'In Review') {
    return 'These tasks are already with your manager for checking.';
  }

  if (status === 'Approved') {
    return 'Approved tasks stay here until every reward is claimed.';
  }

  return 'Rejected tasks can be reopened and sent back to your current queue.';
}

function getSectionAccentClassName(status: TaskStatusKind): string {
  if (status === 'Current') {
    return 'border-[#c79a54] bg-[#e7c27f] text-[#4b3522]';
  }

  if (status === 'In Review') {
    return 'border-[#87a9bc] bg-[#d7e3f4] text-[#204b61]';
  }

  if (status === 'Approved') {
    return 'border-[#7eb07f] bg-[#d8efdb] text-[#1f5a36]';
  }

  return 'border-[#d18d7e] bg-[#f4d6ce] text-[#8b2e22]';
}

function MobileTaskCardSkeleton() {
  return (
    <div className="rounded-xl border-2 border-[#d4c5a8] bg-[#fdf5e8] p-3">
      <div className="space-y-2.5">
        <Skeleton className="h-5 w-32 bg-[#eadbc1]" />
        <Skeleton className="h-4 w-40 bg-[#eadbc1]" />
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-6 w-16 bg-[#eadbc1]" />
          <Skeleton className="h-6 w-14 bg-[#d7e3f4]" />
          <Skeleton className="h-6 w-18 bg-[#eadbc1]" />
        </div>
      </div>
    </div>
  );
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
  const [openSections, setOpenSections] =
    useState<Record<TaskStatusKind, boolean>>(desktopOpenState);
  const [mobileOpenSection, setMobileOpenSection] = useState<TaskStatusKind | ''>('Current');
  const [isMobileLayout, setIsMobileLayout] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateLayoutMode = () => setIsMobileLayout(mediaQuery.matches);

    updateLayoutMode();
    mediaQuery.addEventListener('change', updateLayoutMode);

    return () => mediaQuery.removeEventListener('change', updateLayoutMode);
  }, []);

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
    [currentTasks, inReviewTasks, overdueFilter, rejectedTasks, sortBy, verifiedTasks]
  );

  const sections = useMemo(
    () => [
      { status: 'Current' as const, tasks: current },
      { status: 'In Review' as const, tasks: onReview },
      { status: 'Approved' as const, tasks: verified },
      { status: 'Rejected' as const, tasks: denied },
    ],
    [current, denied, onReview, verified]
  );

  const openCount = sections.filter(({ status }) => openSections[status]).length;
  const singleOpenSection =
    openCount === 1 ? sections.find(({ status }) => openSections[status]) ?? null : null;
  const collapsedSections = sections.filter(({ status }) => !openSections[status]);
  const reorderedSectionsForTwoOpen =
    openCount === 2
      ? [...sections.filter(({ status }) => openSections[status]), ...collapsedSections]
      : sections;

  const sectionClassName = (status: TaskStatusKind) =>
    cn('min-h-0 transition-all duration-200', openSections[status] ? 'flex-1' : 'flex-none');

  const sectionSummaries = useMemo(
    () =>
      sections.map(({ status, tasks }) => ({
        status,
        count: tasks.length,
      })),
    [sections]
  );

  function handleSectionOpenChange(status: TaskStatusKind, open: boolean) {
    setOpenSections((previous) => {
      const next = { ...previous, [status]: open };

      if (!Object.values(next).some(Boolean)) {
        return previous;
      }

      return next;
    });
  }

  function renderTaskCards(tasks: TaskStatusItem[]) {
    return tasks.map((task) => <TaskCard key={task.id} task={task} />);
  }

  function renderDesktopSection(status: TaskStatusKind, tasks: TaskStatusItem[]) {
    return (
      <TaskStatusSection
        status={status}
        tasks={tasks}
        isLoading={isLoading}
        open={openSections[status]}
        onOpenChange={(open) => handleSectionOpenChange(status, open)}
      >
        {renderTaskCards(tasks)}
      </TaskStatusSection>
    );
  }

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col overflow-hidden rounded-lg border-3 border-[#47331F] bg-[#eadbc1] p-2.5 font-jersey shadow-[0_10px_28px_rgba(71,51,31,0.24)] lg:h-full sm:p-3">
      <div className="flex flex-col gap-3 border-b-2 border-[#d4c5a8] pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          {isLoading ? (
            <>
              <div className="space-y-2">
                <Skeleton className="h-8 w-52 bg-[#dcc8aa]" />
                <Skeleton className="h-5 w-80 max-w-full bg-[#e3d3b7]" />
              </div>
              <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:items-end">
                <div className="w-full space-y-1 sm:w-auto">
                  <Skeleton className="h-5 w-20 bg-[#dcc8aa]" />
                  <Skeleton className="h-9 w-full rounded-lg bg-[#f7efdf] sm:w-52" />
                </div>
                <div className="flex w-full items-center gap-2 self-start sm:w-auto lg:self-end">
                  <Skeleton className="h-9 w-full rounded-lg bg-[#f7efdf] sm:w-32" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="min-w-0 space-y-3">
                <div>
                  <h2 className="text-[26px] leading-none text-[#3f2a1a] sm:text-[32px]">
                    Task Board
                  </h2>
                  <p className="mt-1 max-w-xl text-[14px] leading-snug tracking-[0.04em] text-[#6b5038] sm:text-[16px]">
                    Track your current work, review requests, approved tasks, and rejected orders in one place.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 min-[430px]:hidden">
                  {sectionSummaries.map(({ status, count }) => (
                    <div
                      key={status}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-[#d4c5a8] bg-[#f7efdf] px-2.5 py-1 text-[12px] leading-none text-[#6b5038]"
                    >
                      <span className="tracking-[0.08em] text-[#8a6039]">{status}</span>
                      <span className="text-[13px] text-[#3f2a1a]">{count}</span>
                    </div>
                  ))}
                </div>

                <div className="hidden min-[430px]:grid min-[430px]:grid-cols-2 min-[430px]:gap-2 sm:flex sm:flex-wrap">
                  {sectionSummaries.map(({ status, count }) => (
                    <div
                      key={status}
                      className="min-w-0 rounded-lg border-2 border-[#d4c5a8] bg-[#f7efdf] px-3 py-2 text-left"
                    >
                      <div className="truncate text-[12px] tracking-[0.12em] text-[#8a6039]">{status}</div>
                      <div className="mt-1 text-[18px] leading-none text-[#3f2a1a]">{count}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row lg:w-auto lg:items-end">
                <div className="w-full space-y-1 sm:w-auto">
                  <span className="block text-[14px] tracking-[0.18em] text-[#8a6039] sm:text-[16px]">
                    SORT BY
                  </span>
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

                <div className="flex w-full items-center gap-2 self-start sm:w-auto lg:self-end">
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

      <div className="flex-1 pt-3 md:min-h-0">
        {error ? (
          <div className="flex h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-[#c9b08d] bg-[#f7efdf] px-4 text-center">
            <span className="font-jersey text-[14px] tracking-[0.06em] text-[#8b2e22]">
              Error loading tasks. Please try again.
            </span>
          </div>
        ) : isMobileLayout ? (
          <div className="min-w-0 space-y-3">
            <div className="rounded-xl border-2 border-[#d4c5a8] bg-[#f7efdf] px-3 py-2 text-[13px] tracking-[0.04em] text-[#6b5038]">
              Open one section at a time for a cleaner view on smaller screens.
            </div>

            <Accordion
              type="single"
              collapsible
              value={mobileOpenSection}
              onValueChange={(value) => setMobileOpenSection((value as TaskStatusKind | '') ?? '')}
              className="space-y-2"
            >
              {sections.map(({ status, tasks }) => (
                <AccordionItem
                  key={status}
                  value={status}
                  className="min-w-0 overflow-hidden rounded-xl border-2 border-[#9b7a56] bg-[#f7efdf] px-0"
                >
                  <AccordionTrigger className="px-3 py-3 text-left hover:no-underline [&>svg]:text-[#8a6039]">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border-2 px-2.5 py-1 text-[13px] leading-none ${getSectionAccentClassName(status)}`}
                      >
                        {status}
                      </span>
                      <span className="rounded-full border-2 border-[#d4c5a8] bg-[#fff8ec] px-2 py-1 text-[13px] leading-none text-[#6b5038]">
                        {tasks.length}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="space-y-2">
                      <p className="text-[13px] leading-relaxed tracking-[0.04em] text-[#6b5038]">
                        {getSectionHelperText(status)}
                      </p>

                      {isLoading ? (
                        <>
                          <MobileTaskCardSkeleton />
                          <MobileTaskCardSkeleton />
                        </>
                      ) : tasks.length > 0 ? (
                        <div className="space-y-2">{renderTaskCards(tasks)}</div>
                      ) : (
                        <div className="rounded-lg border-2 border-dashed border-[#d4c5a8] bg-[#fdf5e8] px-4 py-5 text-center text-[14px] tracking-[0.04em] text-[#8a6039]">
                          No tasks in this section right now.
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : singleOpenSection ? (
          <div className="flex h-full min-h-0 flex-col gap-2.5 xl:gap-3">
            <div className="min-h-0 flex-1">
              <TaskStatusSection
                status={singleOpenSection.status}
                tasks={singleOpenSection.tasks}
                isLoading={isLoading}
                open
                onOpenChange={(open) => handleSectionOpenChange(singleOpenSection.status, open)}
              >
                {renderTaskCards(singleOpenSection.tasks)}
              </TaskStatusSection>
            </div>

            {collapsedSections.map(({ status, tasks }) => (
              <div key={status} className="flex-none">
                <TaskStatusSection
                  status={status}
                  tasks={tasks}
                  isLoading={isLoading}
                  open={false}
                  onOpenChange={(open) => handleSectionOpenChange(status, open)}
                >
                  {renderTaskCards(tasks)}
                </TaskStatusSection>
              </div>
            ))}
          </div>
        ) : openCount === 2 ? (
          <div className="grid h-full min-h-0 grid-cols-1 gap-2.5 lg:grid-cols-2 xl:gap-3">
            {reorderedSectionsForTwoOpen.map(({ status, tasks }) => (
              <div key={status} className={cn('min-h-0', openSections[status] && 'lg:min-h-[18rem]')}>
                <TaskStatusSection
                  status={status}
                  tasks={tasks}
                  isLoading={isLoading}
                  open={openSections[status]}
                  onOpenChange={(open) => handleSectionOpenChange(status, open)}
                >
                  {renderTaskCards(tasks)}
                </TaskStatusSection>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid h-full min-h-0 grid-cols-1 gap-2.5 lg:grid-cols-2 xl:gap-3">
            <div className="flex min-h-0 flex-col gap-2.5 xl:gap-3">
              <div className={sectionClassName('Current')}>
                {renderDesktopSection('Current', current)}
              </div>
              <div className={sectionClassName('Approved')}>
                {renderDesktopSection('Approved', verified)}
              </div>
            </div>

            <div className="flex min-h-0 flex-col gap-2.5 xl:gap-3">
              <div className={sectionClassName('In Review')}>
                {renderDesktopSection('In Review', onReview)}
              </div>
              <div className={sectionClassName('Rejected')}>
                {renderDesktopSection('Rejected', denied)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
