'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Search, ListTodo, Users } from 'lucide-react';
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

export function CurrentAssignedTasks() {
  const { viewMode, setViewMode } = useTaskAssignment();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recently added');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 900);

  const taskQuery = useGetCurrentAssignedTasksPaginated(
    page,
    4,
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

  const tasks = data?.tasks || [];
  const totalPages = data?.totalPages || 1;

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
    <div className="rounded-3xl bg-[#FBF4E8] pl-6 pr-6 pt-6 shadow-sm/50 flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-[#690003]">Current Assigned Tasks</h2>

        {/* View Toggle */}
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm/25 mt-3 md:mt-0">
          <button
            onClick={() => handleViewModeChange('task')}
            className={`flex w-36 justify-center items-center gap-1.5 py-2 cursor-pointer rounded-lg text-sm font-medium transition-all duration-500 ease-in-out ${
              viewMode === 'task' ? 'bg-[#690003] text-white shadow-sm/15' : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <ListTodo size={16} />
            Task View
          </button>
          <button
            onClick={() => handleViewModeChange('employee')}
            className={`flex w-36 justify-center items-center gap-1.5 py-2 cursor-pointer rounded-lg text-sm font-medium transition-all duration-500 ease-in-out ${
              viewMode === 'employee'
                ? 'bg-[#690003] text-white shadow-sm/15'
                : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Users size={16} />
            Employee View
          </button>
        </div>
      </div>

      {/* Controls: Search, Sort, Clear */}
      <section className="flex flex-col md:flex-row md:items-center justify-end gap-3 mb-5">
        <div className='flex gap-2'>
          <span>Tasks: {taskQuery.data?.count || 0}</span>
          <span>Employees: {employeeQuery.data?.count || 0}</span>
        </div>
        {/* Search */}
        <div className="relative w-full md:w-90">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={viewMode === 'task' ? 'Search tasks...' : 'Search employees...'}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-full bg-white shadow-sm/25 text-sm focus:outline-none transition-all duration-500 ease-in-out focus:border focus:border-[#690003]"
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
          className="text-sm px-10 py-2 bg-[#690003] shadow-sm/25 hover:bg-[#af3b3f] cursor-pointer text-white disabled:opacity-50 transition-all duration-500 ease-in-out"
        >
          Clear All
        </Button>
      </section>

      {/* Task/Employee Lists */}
      <section className={`${memoizedTasks.length === 0 ? 'grow-0' : 'grow'} space-y-5`}>
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#690003] shadow-sm/25"></div>
            <p className="text-gray-500 text-base mt-3">Loading assigned tasks...</p>
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
        <div className="my-5">
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={handlePageChange} />
        </div>
      )}

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && <ClearAllDialog setShowClearConfirm={setShowClearConfirm} />}
    </div>
  );
}
