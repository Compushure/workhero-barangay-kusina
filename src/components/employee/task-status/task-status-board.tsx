'use client';

import { useMemo, useState } from 'react';
import { ArrowUpDown, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useDebounce } from '@/hooks/useDebounce';
import { normalizeSearchQuery, sanitizeSearchInput } from '@/lib/utils/search-normalization';
import { getTaskSectionStatusChipMeta, isTaskStatusItemOverdue } from './task-status-utils';
import { TaskCard } from './task-card';
import { TaskStatusSection } from './task-status-section';
import type { TaskOverdueFilter, TaskSortOption, TaskStatusItem, TaskStatusKind } from './types';

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

const mobileDefaultSection: TaskStatusKind = 'Current';

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

function filterTasksByOverdue(
  tasks: TaskStatusItem[],
  overdueFilter: TaskOverdueFilter
): TaskStatusItem[] {
  if (overdueFilter === 'all') return tasks;

  return tasks.filter((task) => {
    const overdue = isTaskStatusItemOverdue(task);
    return overdueFilter === 'overdue' ? overdue : !overdue;
  });
}

function filterTasksByName(tasks: TaskStatusItem[], query: string): TaskStatusItem[] {
  if (!query) return tasks;

  return tasks.filter((task) => normalizeSearchQuery(task.name).includes(query));
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

function MobileTaskCardSkeleton() {
  return (
    <div className="rounded-xl border-2 border-[#d4c5a8] bg-[#fdf5e8] p-3">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40 bg-[#eadbc1]" />
        <Skeleton className="h-4 w-36 bg-[#eadbc1]" />
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-6 w-18 rounded-md bg-[#d7e3f4]" />
          <Skeleton className="h-6 w-16 rounded-md bg-[#eadbc1]" />
          <Skeleton className="h-6 w-14 rounded-md bg-[#d7e3f4]" />
          <Skeleton className="h-6 w-16 rounded-md bg-[#f4d6ce]" />
          <Skeleton className="h-6 w-16 rounded-md bg-[#efe2ca]" />
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

interface TaskStatusSectionData {
  status: TaskStatusKind;
  tasks: TaskStatusItem[];
}

function groupSectionsByColumn(
  sections: TaskStatusSectionData[],
  columnCount: number
): TaskStatusSectionData[][] {
  const columns: TaskStatusSectionData[][] = Array.from({ length: columnCount }, () => []);

  sections.forEach((section, index) => {
    columns[index % columnCount].push(section);
  });

  return columns;
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
  const [searchInput, setSearchInput] = useState('');
  const [openSections, setOpenSections] =
    useState<Record<TaskStatusKind, boolean>>(desktopOpenState);
  const [mobileOpenSection, setMobileOpenSection] = useState<TaskStatusKind | ''>(
    mobileDefaultSection
  );
  const debouncedSearchInput = useDebounce(searchInput, 300);
  const normalizedSearchQuery = useMemo(
    () => normalizeSearchQuery(debouncedSearchInput),
    [debouncedSearchInput]
  );
  const hasActiveSearch = normalizedSearchQuery.length > 0;

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

  const [currentByOverdue, onReviewByOverdue, verifiedByOverdue, deniedByOverdue] = useMemo(
    () => [
      filterTasksByOverdue(currentTasks, overdueFilter),
      filterTasksByOverdue(inReviewTasks, overdueFilter),
      filterTasksByOverdue(verifiedTasks, overdueFilter),
      filterTasksByOverdue(rejectedTasks, overdueFilter),
    ],
    [currentTasks, inReviewTasks, overdueFilter, rejectedTasks, verifiedTasks]
  );

  const [current, onReview, verified, denied] = useMemo(
    () => [
      sortTasks(filterTasksByName(currentByOverdue, normalizedSearchQuery), sortBy),
      sortTasks(filterTasksByName(onReviewByOverdue, normalizedSearchQuery), sortBy),
      sortTasks(filterTasksByName(verifiedByOverdue, normalizedSearchQuery), sortBy),
      sortTasks(filterTasksByName(deniedByOverdue, normalizedSearchQuery), sortBy),
    ],
    [
      currentByOverdue,
      deniedByOverdue,
      normalizedSearchQuery,
      onReviewByOverdue,
      sortBy,
      verifiedByOverdue,
    ]
  );

  const sections = useMemo<TaskStatusSectionData[]>(
    () => [
      { status: 'Current' as const, tasks: current },
      { status: 'In Review' as const, tasks: onReview },
      { status: 'Approved' as const, tasks: verified },
      { status: 'Rejected' as const, tasks: denied },
    ],
    [current, denied, onReview, verified]
  );

  const sectionSummaries = useMemo(
    () =>
      sections.map(({ status, tasks }) => ({
        status,
        count: tasks.length,
        totalCount:
          status === 'Current'
            ? currentByOverdue.length
            : status === 'In Review'
              ? onReviewByOverdue.length
              : status === 'Approved'
                ? verifiedByOverdue.length
                : deniedByOverdue.length,
      })),
    [
      currentByOverdue.length,
      deniedByOverdue.length,
      onReviewByOverdue.length,
      sections,
      verifiedByOverdue.length,
    ]
  );

  const sectionsByMdColumns = useMemo(() => groupSectionsByColumn(sections, 2), [sections]);
  const sectionsByLgColumns = useMemo(() => groupSectionsByColumn(sections, 3), [sections]);

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

  function getXlSectionContainerClass(status: TaskStatusKind): string {
    if (openSections[status]) {
      return 'min-h-0 min-w-0 flex-[1_1_0%] xl:h-full xl:overflow-hidden';
    }

    return 'min-h-0 w-[13.25rem] min-w-[12.5rem] max-w-[14rem] flex-none xl:h-full xl:overflow-hidden';
  }

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col overflow-hidden rounded-lg border-3 border-[#47331F] bg-[#eadbc1] p-2.5 font-jersey shadow-[0_10px_28px_rgba(71,51,31,0.24)] min-h-[55vh] h-fit md:h-full sm:p-3 xl:h-full">
      <div className="flex flex-col gap-3 border-b-2 border-[#d4c5a8] pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          {isLoading ? (
            <>
              <div className="flex w-full gap-2 overflow-hidden">
                <Skeleton className="h-9 w-28 rounded-full bg-[#dcc8aa]" />
                <Skeleton className="h-9 w-32 rounded-full bg-[#dcc8aa]" />
                <Skeleton className="h-9 w-30 rounded-full bg-[#dcc8aa]" />
                <Skeleton className="h-9 w-30 rounded-full bg-[#dcc8aa]" />
              </div>
              <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:items-end">
                <div className="w-full space-y-1 sm:w-auto">
                  <Skeleton className="h-5 w-20 bg-[#dcc8aa]" />
                  <Skeleton className="h-9 w-full rounded-lg bg-[#f7efdf] sm:w-52" />
                </div>
                <div className="w-full space-y-1 sm:w-auto">
                  <Skeleton className="h-5 w-24 bg-[#dcc8aa]" />
                  <Skeleton className="h-9 w-full rounded-lg bg-[#f7efdf] sm:w-56" />
                </div>
                <div className="flex w-full items-center gap-2 self-start sm:w-auto lg:self-end">
                  <Skeleton className="h-9 w-full rounded-lg bg-[#f7efdf] sm:w-32" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="hidden sm:flex min-w-0 w-full lg:w-auto">
                <div className="flex min-w-0 w-full gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {sectionSummaries.map(({ status, count, totalCount }) => {
                    const statusChipMeta = getTaskSectionStatusChipMeta(status);
                    const StatusIcon = statusChipMeta.icon;

                    return (
                      <div
                        key={status}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-[#d4c5a8] bg-[#f7efdf] px-2.5 py-1.5 text-[12px] leading-none text-[#6b5038]"
                      >
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border-2 px-2 py-0.5 tracking-[0.08em] ${statusChipMeta.className}`}
                        >
                          <StatusIcon className="size-3.5 shrink-0" />
                          <span>{status}</span>
                        </span>
                        <span className="text-[13px] text-[#3f2a1a]">
                          {hasActiveSearch ? `${count}/${totalCount}` : count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex w-full min-w-0 flex-col gap-2 lg:w-auto sm:flex-row lg:items-end">
                <div className="relative w-full lg:w-56">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a6039]" />
                  <Input
                    value={searchInput}
                    onChange={(event) => setSearchInput(sanitizeSearchInput(event.target.value))}
                    placeholder="Search task name"
                    className="h-9 rounded-lg border-2 border-[#9b7a56] bg-[#f7efdf] pl-9 font-jersey text-[14px] tracking-[0.04em] text-[#4b3522] placeholder:text-[#8a6039]/85 focus-visible:border-[#F4B925] focus-visible:ring-0"
                    aria-label="Search task name"
                  />
                </div>

                <div className="flex w-full min-w-0 gap-2 lg:w-auto lg:items-end">
                  <div className="flex w-full space-y-1 sm:w-auto">
                    <Select
                      value={sortBy}
                      onValueChange={(value) => setSortBy(value as TaskSortOption)}
                    >
                      <SelectTrigger className="h-9 w-full rounded-lg border-2 border-[#9b7a56] bg-[#f7efdf] font-jersey text-[14px] tracking-[0.05em] text-[#4b3522] shadow-none outline-none transition-colors duration-200 cursor-pointer hover:bg-[#f7efdf] hover:text-[#4b3522] focus:ring-0 focus-visible:border-[#F4B925] focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:border-[#F4B925] data-[state=open]:shadow-none data-[state=open]:ring-0 sm:w-52">
                        <ArrowUpDown className="size-4 text-[#8a6039]" />
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="w-56 border-[#9b7a56] bg-[#f6eddd] p-1 text-[#4b3522] sm:w-64">
                        {sortOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="cursor-pointer rounded-md py-1.5 font-jersey text-[14px] tracking-[0.04em] text-[#4b3522] transition-colors duration-200 data-[state=checked]:bg-transparent data-[state=checked]:text-[#4b3522] focus:bg-[#8a6039] focus:text-[#fff6e5] data-highlighted:bg-[#8a6039] data-highlighted:text-[#fff6e5]"
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
                          className="h-9 w-full justify-start gap-2 rounded-lg border-2 border-[#9b7a56] bg-[#f7efdf] px-3 py-1 font-jersey text-[14px] tracking-[0.05em] text-[#4b3522] shadow-none outline-none transition-colors duration-200 cursor-pointer hover:bg-[#efe2ca] hover:text-[#4b3522] focus:ring-0 focus-visible:border-[#F4B925] focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:border-[#F4B925] data-[state=open]:shadow-none data-[state=open]:ring-0 sm:w-auto"
                        >
                          <Filter strokeWidth={2.5} className="h-4 w-4 text-[#6b5038]" />
                          <span className="inline-flex items-center text-[16px] leading-none">
                            {filterLabel}
                          </span>
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
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 pt-3 md:min-h-0 xl:min-h-0 xl:overflow-hidden">
        {error ? (
          <div className="flex h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-[#c9b08d] bg-[#f7efdf] px-4 text-center">
            <span className="font-jersey text-[14px] tracking-[0.06em] text-[#8b2e22]">
              Error loading tasks. Please try again.
            </span>
          </div>
        ) : (
          <>
            <div className="min-w-0 space-y-3 md:hidden">
              <div className="rounded-xl border-2 border-[#d4c5a8] bg-[#f7efdf] px-3 py-1 sm:py-2 text-[0.7rem] sm:text-[0.85rem] tracking-[0.04em] text-[#6b5038]">
                Open one section at a time to keep tasks easy to scan on small screens.
              </div>

              <Accordion
                type="single"
                collapsible
                value={mobileOpenSection}
                onValueChange={(value) =>
                  setMobileOpenSection((value as TaskStatusKind | '') ?? '')
                }
                className="space-y-2"
              >
                {sectionSummaries.map(({ status, count, totalCount }) => {
                  const tasks = sections.find((section) => section.status === status)?.tasks ?? [];
                  const statusChipMeta = getTaskSectionStatusChipMeta(status);
                  const StatusIcon = statusChipMeta.icon;

                  return (
                    <AccordionItem
                      key={status}
                      value={status}
                      className="min-w-0 overflow-hidden rounded-xl border-2 border-[#9b7a56] bg-[#f7efdf] px-0"
                    >
                      <AccordionTrigger className="sticky top-0 z-10 bg-[#f7efdf] px-3 py-3 text-left hover:no-underline [&>svg]:text-[#8a6039]">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-[13px] leading-none ${statusChipMeta.className}`}
                          >
                            <StatusIcon className="size-3.5 shrink-0" />
                            <span>{status}</span>
                          </span>
                          <span className="rounded-full border-2 border-[#d4c5a8] bg-[#fff8ec] px-2 py-1 text-[13px] leading-none text-[#6b5038]">
                            {hasActiveSearch ? `${count}/${totalCount}` : count}
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
                              {hasActiveSearch
                                ? 'No tasks match this search in this section.'
                                : 'No tasks in this section right now.'}
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>

            <div className="hidden min-h-0 gap-2.5 md:grid md:grid-cols-2 lg:hidden">
              {sectionsByMdColumns.map((columnSections, columnIndex) => (
                <div key={`md-column-${columnIndex}`} className="flex min-h-0 flex-col gap-2.5">
                  {columnSections.map(({ status, tasks }) => (
                    <div key={status} className="min-h-0">
                      {renderDesktopSection(status, tasks)}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="hidden min-h-0 gap-2.5 lg:grid lg:grid-cols-3 xl:hidden">
              {sectionsByLgColumns.map((columnSections, columnIndex) => (
                <div key={`lg-column-${columnIndex}`} className="flex min-h-0 flex-col gap-2.5">
                  {columnSections.map(({ status, tasks }) => (
                    <div key={status} className="min-h-0">
                      {renderDesktopSection(status, tasks)}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="hidden h-full min-h-0 xl:flex xl:gap-3">
              {sections.map(({ status, tasks }) => (
                <div
                  key={status}
                  className={`transition-[flex-basis,width,max-width] duration-300 ${getXlSectionContainerClass(status)}`}
                >
                  {renderDesktopSection(status, tasks)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
