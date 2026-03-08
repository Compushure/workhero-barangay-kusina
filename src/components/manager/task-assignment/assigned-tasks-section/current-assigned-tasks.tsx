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
import { useManagerAssignmentStore } from '@/store/managerAssignmentStore';

export function CurrentAssignedTasks() {
  const { viewMode, setViewMode } = useTaskAssignment();
  const { assignedTasks, hydrateFromServer, isOptimistic } = useManagerAssignmentStore();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recently added');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 900);

  const taskQuery = useGetCurrentAssignedTasksPaginated(
    page,
    10,
    sortBy,
    debouncedSearchTerm,
    true
  );

  const employeeQuery = useGetCurrentAssignedEmployeesPaginated(
    page,
    4,
    sortBy,
    debouncedSearchTerm,
    true
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
    setSearchTerm(term);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const memoizedTasks = useMemo(() => tasks || [], [tasks]);

  return (
    <div className="rounded-3xl bg-background pl-6 pr-6 pt-6 shadow-sm/50 flex flex-col w-full">
      {/* Header */}
      <div className="flex flex-row md:items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-foreground">Task List</h2>

        {/* View Toggle */}
        <div className="flex bg-card/75 rounded-xl mb-1">
          <button
            onClick={() => handleViewModeChange('task')}
            className={`flex w-35 justify-center items-center gap-1.5 py-2 cursor-pointer rounded-l-xl text-sm font-medium transition-all duration-400 ease-in-out ${
              viewMode === 'task'
                ? 'bg-linear-to-b from-accent-secondary to-accent text-zinc-50 shadow-sm/25'
                : 'text-secondary hover:bg-accent-secondary/25 inset-shadow-xs/25'
            }`}
          >
            <ListTodo
              size={16}
              className={`${viewMode === 'task' ? 'text-zinc-50' : 'text-accent-secondary'}`}
            />
            Task View
          </button>
          <button
            onClick={() => handleViewModeChange('employee')}
            className={`flex w-35 justify-center items-center gap-1.5 py-2 cursor-pointer rounded-r-xl text-sm font-medium transition-all duration-400 ease-in-out ${
              viewMode === 'employee'
                ? 'bg-linear-to-b from-accent-secondary to-accent text-zinc-50 shadow-sm/25'
                : 'text-secondary hover:bg-accent-secondary/25 inset-shadow-xs/25'
            }`}
          >
            <Users
              size={16}
              className={`${viewMode === 'employee' ? 'text-zinc-50' : 'text-accent-secondary'}`}
            />
            Employee View
          </button>
        </div>
      </div>

      {/* View Cards Number Display & Controls: Search, Sort, Clear */}
      <section className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-4 text-lg font-semibold text-primary bg-card/75 inset-shadow-xs/15 border-b border-accent/25 px-4 py-1 rounded-full shrink-0">
          <h5 className="">
            Tasks{' '}
            <span className="bg-accent/75 text-primary-foreground px-2.5 py-0.5 rounded-full text-sm ml-1 shadow-sm/25">
              {totalTasksCount ?? 0}
            </span>
          </h5>
          <h5 className="">
            Employees{' '}
            <span className="bg-accent/75 text-primary-foreground px-2.5 py-0.5 rounded-full text-sm ml-1 shadow-sm/25">
              {totalEmployeesCount ?? 0}
            </span>
          </h5>
        </div>

        <div className="flex gap-3 justify-end items-center flex-1 min-w-0">
          {/* Search */}
          <div className="relative flex-1 min-w-48 max-w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={viewMode === 'task' ? 'Search by task name' : 'Search by name or ID'}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-full bg-card shadow-sm/25 text-sm focus:outline-none transition-all duration-500 ease-in-out focus:border focus:border-accent"
            />
          </div>

          {/* Sort Bar */}
          <div className="">
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
            className="group hover:text-card text-sm px-10 py-2 bg-card shadow-sm/25 hover:bg-red-700 cursor-pointer text-primary disabled:opacity-50 transition-all duration-400 ease-in-out"
            title="Clear All Assigned Tasks"
          >
            <CircleDashed
              strokeWidth={2}
              className="text-accent group-hover:text-card transition-all duration-400 ease-in-out"
            />
            Clear Assigned
          </Button>
        </div>
      </section>

      {/* Task/Employee Lists */}
      <section className={`${memoizedTasks.length === 0 ? 'grow-0' : 'grow'} space-y-5 mt-5`}>
        {isLoading ? (
          <div className="space-y-5 pb-8">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <p className="text-red-500 text-base">Error loading tasks. Please try again.</p>
          </div>
        ) : memoizedTasks.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 text-base">No tasks assigned yet.</p>
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
        <div className="my-10">
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={handlePageChange} />
        </div>
      )}

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && <ClearAllDialog setShowClearConfirm={setShowClearConfirm} />}
    </div>
  );
}
