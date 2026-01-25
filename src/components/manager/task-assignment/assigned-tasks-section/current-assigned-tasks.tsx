'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Search, ListTodo, Users } from 'lucide-react';
import { TaskViewCard } from './task-view-card';
import { EmployeeViewCard } from './employee-view-card';
import { TaskSortingBar } from './task-sorting-bar';
import { EmployeeSortingBar } from './employee-sorting-bar';
import ClearAllDialog from './dialogs/clear-all-dialog';
import { useTaskAssignment } from '../task-assignment-page-context';

export function CurrentAssignedTasks() {
  const { assignedTasks, viewMode, setViewMode, clearAll } = useTaskAssignment();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recently added');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredTasks = useMemo(() => {
    return assignedTasks.filter((task) => {
      const searchLower = searchTerm.toLowerCase();
      if (viewMode === 'task') {
        return (task.taskName ?? '').toLowerCase().includes(searchLower);
      } else {
        return task.assignedEmployees.some(
          (emp) =>
            (emp.name ?? '').toLowerCase().includes(searchLower) ||
            (emp.empId ?? '').toLowerCase().includes(searchLower)
        );
      }
    });
  }, [assignedTasks, searchTerm, viewMode]);


  const sortedTasks = useMemo(() => {
    const tasksCopy = [...filteredTasks];
    switch (sortBy) {
      case 'oldest':
        return tasksCopy;
      case 'recently added':
        return tasksCopy.reverse();
      case 'closest':
        return tasksCopy.sort(
          (a, b) => new Date(a.dateRange.end).getTime() - new Date(b.dateRange.end).getTime()
        );
      case 'farthest':
        return tasksCopy.sort(
          (a, b) => new Date(b.dateRange.end).getTime() - new Date(a.dateRange.end).getTime()
        );
      default:
        return tasksCopy;
    }
  }, [filteredTasks, sortBy]);

  return (
    <div className="rounded-3xl bg-[#FBF4E8] p-8 shadow-sm/25">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[#690003]">Current Assigned Tasks</h2>
        
        {/* View Toggle */}
        <div className="flex gap-2 bg-white rounded-2xl p-1 border-2 border-gray-300">
          <button
            onClick={() => setViewMode('task')}
            className={`flex w-44 justify-center items-center gap-2 py-2.5 rounded-xl text-base font-medium transition ${
              viewMode === 'task' ? 'bg-[#690003] text-white' : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <ListTodo size={20} />
            Task View
          </button>
          <button
            onClick={() => setViewMode('employee')}
            className={`flex w-44 justify-center items-center gap-2 py-2.5 rounded-xl text-base font-medium transition ${
              viewMode === 'employee' ? 'bg-[#690003] text-white' : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Users size={20} />
            Employee View
          </button>
        </div>
      </div>

      {/* Search and Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={viewMode === 'task' ? "Search tasks..." : "Search employees..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-full bg-white focus:outline-none focus:border-[#690003]"
          />
        </div>
        
        {viewMode === 'task' ? (
          <TaskSortingBar sortBy={sortBy} onSortChange={setSortBy} />
        ) : (
          <EmployeeSortingBar sortBy={sortBy} onSortChange={setSortBy} />
        )}

        <Button
          onClick={() => setShowClearConfirm(true)}
          disabled={assignedTasks.length === 0}
          className="text-base py-5 bg-[#690003] hover:bg-[#8B0000] text-white disabled:opacity-50"
        >
          Clear All
        </Button>
      </div>

      {/* Task/Employee Lists */}
      <div className="space-y-6">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tasks assigned yet.</p>
          </div>
        ) : viewMode === 'task' ? (
          sortedTasks.map((task) => (
            <TaskViewCard key={task.id} task={task} />
          ))
        ) : (
          <EmployeeViewCard tasks={filteredTasks} searchTerm={searchTerm} sortBy={sortBy} />
        )}
      </div>

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <ClearAllDialog setShowClearConfirm={setShowClearConfirm} onClearAll={clearAll} />
      )}
    </div>
  );
}