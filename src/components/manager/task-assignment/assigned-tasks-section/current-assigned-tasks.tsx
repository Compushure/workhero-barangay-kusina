'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, ListTodo, Users, CircleDashed } from 'lucide-react';
import { MemoizedTaskViewCard as TaskViewCard } from './task-view-card';
import { MemoizedEmployeeViewCard as EmployeeViewCard } from './employee-view-card';
import { TaskSortingBar } from './task-sorting-bar';
import { EmployeeSortingBar } from './employee-sorting-bar';
import ClearAllDialog from './dialogs/clear-all-dialog';
import { useTaskAssignment } from '../task-assignment-page-context';
import { Pagination } from '@/components/manager/task-verification/pagination';
import {
  useGetCurrentAssignedTasksPaginated,
  useGetCurrentAssignedEmployeesPaginated,
} from '@/hooks/tanstack/queries/managerAssignmentQueries';
import { useDebounce } from '@/hooks/useDebounce';
import { SkeletonCard } from '../card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { useManagerAssignmentStore } from '@/store/managerAssignmentStore';
import { sanitizeSearchInput } from '@/lib/utils/search-normalization';

function CurrentAssignedTasksSkeleton() {
  return (
    <div className="rounded-2xl bg-background-soft px-4 md:px-5 2xl:px-6 pt-3 sm:pt-5 shadow-sm/50 flex flex-col w-full">
      <div className="flex items-start sm:items-center justify-between gap-1.5 mb-4">
        <Skeleton className="h-6 sm:h-7 w-40 bg-gray-300" />
        <div className="flex rounded-md overflow-hidden w-56 sm:w-72 border border-accent/25">
          <Skeleton className="control-skeleton-h flex-1 bg-gray-300 rounded-l-md" />
          <Skeleton className="control-skeleton-h flex-1 bg-gray-300 rounded-r-md" />
        </div>
      </div>

      <section className="manager-sticky-controls rounded-xl px-2.5 py-2.5 sm:px-3 sm:py-3 flex min-w-0 flex-col gap-2 sm:gap-2.5">
        <Skeleton className="h-7 w-52 rounded-md bg-gray-300" />
        <div className="flex w-full min-w-0 flex-col items-stretch gap-1.5 sm:gap-2 lg:gap-3 xl:w-auto xl:flex-row xl:items-center xl:justify-end">
          <Skeleton className="control-skeleton-h w-full flex-1 xl:max-w-md rounded-md bg-gray-300" />
          <div className="flex min-w-0 flex-wrap gap-1.5 sm:gap-2 sm:flex-nowrap">
            <Skeleton className="control-skeleton-h w-full sm:w-40 rounded-md bg-gray-300" />
            <Skeleton className="control-skeleton-h w-full sm:w-36 rounded-md bg-gray-300" />
          </div>
        </div>
      </section>

      <section className="space-y-5 mt-5 pb-8">
        <SkeletonCard />
        <SkeletonCard />
      </section>

      <div className="my-8">
        <Skeleton className="h-8 w-48 mx-auto bg-gray-300 rounded-full" />
      </div>
    </div>
  );
}

interface CurrentAssignedTasksProps {
  // ✅ Removed onInitialLoadChange - component manages its own loading state
}

export function CurrentAssignedTasks({}: CurrentAssignedTasksProps) {
  const { viewMode, setViewMode } = useTaskAssignment();
  const { assignedTasks, hydrateFromServer, isOptimistic } = useManagerAssignmentStore();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recently added');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 900);

  // ✅ Only enable the query for the active view mode to prevent unnecessary fetches
  const taskQuery = useGetCurrentAssignedTasksPaginated(
    page,
    10,
    sortBy,
    debouncedSearchTerm,
    viewMode === 'task' // Only fetch when task view is active
  );

  const employeeQuery = useGetCurrentAssignedEmployeesPaginated(
    page,
    10,
    sortBy,
    debouncedSearchTerm,
    viewMode === 'employee' // Only fetch when employee view is active
  );

  const isLoading = viewMode === 'task' ? taskQuery.isLoading : employeeQuery.isLoading;
  const isError = viewMode === 'task' ? taskQuery.isError : employeeQuery.isError;
  const data = viewMode === 'task' ? taskQuery.data : employeeQuery.data;

  useEffect(() => {
    if (data?.tasks) {
      hydrateFromServer(data.tasks);
      return;
    }

    if (!isOptimistic && !isLoading) {
      hydrateFromServer([]);
    }
  }, [data?.tasks, hydrateFromServer, isOptimistic, isLoading]);

  const safeAssignedTasks = Array.isArray(assignedTasks) ? assignedTasks : [];
  const fallbackTasks = Array.isArray(data?.tasks) ? data?.tasks : [];
  const tasks = isOptimistic
    ? safeAssignedTasks
    : safeAssignedTasks.length > 0
      ? safeAssignedTasks
      : fallbackTasks;
  const totalPages = data?.totalPages || 1;

  const totalTasksCount =
    viewMode === 'task' ? taskQuery.data?.count : employeeQuery.data?.taskCount;
  const totalEmployeesCount =
    viewMode === 'employee' ? employeeQuery.data?.count : taskQuery.data?.employeeCount;

  const handleViewModeChange = (newMode: 'task' | 'employee') => {
    setViewMode(newMode);
    setSortBy('recently added');
    setPage(1);
    setSearchTerm('');
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setPage(1);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(sanitizeSearchInput(term));
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const memoizedTasks = useMemo(() => tasks || [], [tasks]);
  const isInteractiveLoading = isLoading && memoizedTasks.length === 0;

  // ✅ Removed useEffect that notified parent - prevents unnecessary re-renders

  if (isInteractiveLoading) {
    return <CurrentAssignedTasksSkeleton />;
  }

  return (
    <div className="rounded-2xl bg-gray-100 px-4 md:px-5 2xl:px-6 pt-3 sm:pt-5 shadow-sm/50 flex flex-col w-full">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-1.5 mb-4">
        <h2 className="text-h2 text-foreground pb-2 pl-2">Tasks List</h2>

        {/* View Toggle */}
        <div className="flex bg-card/75 rounded-md self-end sm:self-auto">
          <button
            onClick={() => handleViewModeChange('task')}
            className={`text-sidebar-label flex w-32 md:w-36 justify-center items-center gap-1.5 py-2.5 cursor-pointer rounded-l-md transition-all duration-400 ease-in-out ${
              viewMode === 'task'
                ? 'bg-linear-to-b from-accent-secondary to-accent text-zinc-50 shadow-sm/25'
                : 'text-secondary hover:bg-accent-secondary/25 inset-shadow-xs/25 border-b border-gray-300'
            }`}
          >
            <ListTodo
              size={14}
              className={`${viewMode === 'task' ? 'text-zinc-50' : 'text-accent-secondary'}`}
            />
            <span className="">Task View</span>
          </button>
          <button
            onClick={() => handleViewModeChange('employee')}
            className={`text-sidebar-label flex w-32 md:w-36 justify-center items-center gap-1.5 py-2.5 cursor-pointer rounded-r-md transition-all duration-400 ease-in-out ${
              viewMode === 'employee'
                ? 'bg-linear-to-b from-accent-secondary to-accent text-zinc-50 shadow-sm/25'
                : 'text-secondary hover:bg-accent-secondary/25 inset-shadow-xs/25 border-b border-gray-300'
            }`}
          >
            <Users
              size={14}
              className={`${viewMode === 'employee' ? 'text-zinc-50' : 'text-accent-secondary'}`}
            />
            <span className="">Employee View</span>
          </button>
        </div>
      </div>

      {/* View Cards Number Display & Controls: Search, Sort, Clear */}
      <section className="manager-sticky-controls mt-1 rounded-xl px-2.5 py-2.5 sm:px-3 sm:py-3 flex min-w-0 flex-col gap-2 sm:gap-2.5 xl:flex-row xl:items-center xl:justify-between">
        {/* Counts */}
        <div className="flex w-fit shrink-0 self-start gap-2 whitespace-nowrap rounded-md border border-gray-200 bg-card/75 px-2.5 py-2 text-meta text-primary shadow-sm/25 md:gap-3 md:px-3">
          <h5 className="leading-none">
            Tasks{' '}
            <span className="bg-accent/75 text-primary-foreground text-[13px] px-1.5 md:px-2 py-0.5 rounded-md ml-0.5 shadow-sm/25">
              {totalTasksCount ?? 0}
            </span>
          </h5>
          <h5 className="leading-none">
            Employees{' '}
            <span className="bg-accent/75 text-primary-foreground text-[13px] px-1.5 md:px-2 py-0.5 rounded-md ml-0.5 shadow-sm/25">
              {totalEmployeesCount ?? 0}
            </span>
          </h5>
        </div>

        {/* Filters Row - Always visible, stacked nicely */}
        <div className="flex w-full min-w-0 flex-col items-stretch gap-1.5 sm:gap-2 lg:gap-3 xl:w-auto xl:flex-row xl:items-center xl:justify-end">
          {/* Search */}
          <div className="relative min-w-0 flex-1 xl:max-w-md">
            <Search className="absolute left-2 sm:left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <input
              type="text"
              placeholder={viewMode === 'task' ? 'Search tasks' : 'Search employees'}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="text-meta control-h w-full pl-8 pr-2 sm:pr-3 rounded-md border border-zinc-200 bg-card shadow-sm/25 focus:outline-none transition-all duration-500 ease-in-out focus:border-accent"
            />
          </div>

          {/* Sort Bar and Clear All in a row */}
          <div className="flex min-w-0 flex-wrap gap-1.5 sm:flex-nowrap sm:gap-2">
            {/* Sort Bar */}
            <div className="min-w-0 flex-1 sm:flex-initial">
              {viewMode === 'task' ? (
                <TaskSortingBar sortBy={sortBy} onSortChange={handleSortChange} />
              ) : (
                <EmployeeSortingBar sortBy={sortBy} onSortChange={handleSortChange} />
              )}
            </div>

            {/* Clear All */}
            <Button
              onClick={() => setShowClearConfirm(true)}
              disabled={memoizedTasks.length === 0}
              className="text-button control-h group hover:text-card px-3 sm:px-5 md:px-7 py-1.5 bg-card shadow-sm/25 hover:bg-red-700 cursor-pointer text-primary disabled:opacity-50 transition-all duration-400 ease-in-out"
              title="Clear All Assigned Tasks"
            >
              <CircleDashed
                strokeWidth={2}
                className="text-accent group-hover:text-card transition-all duration-400 ease-in-out size-3.5"
              />
              <span className="">Clear Assigned</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Task/Employee Lists */}
      <section className={`${memoizedTasks.length === 0 ? 'grow-0' : 'grow'} space-y-4 mt-4`}>
        {isLoading ? (
          <div className="space-y-5 pb-8">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : isError ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">Error loading tasks. Please try again.</p>
          </div>
        ) : memoizedTasks.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-gray-500 text-sm">No tasks assigned yet.</p>
          </div>
        ) : viewMode === 'task' ? (
          memoizedTasks.map((task: any) => <TaskViewCard key={task.id} task={task} />)
        ) : (
          <EmployeeViewCard
            tasks={memoizedTasks}
            searchTerm={debouncedSearchTerm}
            sortBy={sortBy}
          />
        )}
      </section>

      {/* Pagination */}
      {memoizedTasks.length > 0 && (
        <div className="my-8">
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={handlePageChange} />
        </div>
      )}

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && <ClearAllDialog setShowClearConfirm={setShowClearConfirm} />}
    </div>
  );
}
