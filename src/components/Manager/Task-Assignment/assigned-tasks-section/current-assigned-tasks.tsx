'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Search, ListTodo, Users } from 'lucide-react';
import { TaskViewCard } from './task-view-card';
import { EmployeeViewCard } from './employee-view-card';
import { TaskSortingBar } from './task-sorting-bar';
import { EmployeeSortingBar } from './employee-sorting-bar';
import type { AssignedTask, AssignedEmployee } from './task-assignment-page';

interface CurrentAssignedTasksProps {
  tasks: AssignedTask[];
  viewMode: 'task' | 'employee';
  onViewModeChange: (mode: 'task' | 'employee') => void;
  onRemoveAssignment: (taskId: string, employeeId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onClearAllEmployeeTasks?: (employeeId: string) => void;
  onEditTask?: (
    taskId: string,
    maxAttempts: number,
    newDueDate: string,
    newEmployees: AssignedEmployee[]
  ) => void;
  onClearAll: () => void;
}

export function CurrentAssignedTasks({
  tasks,
  viewMode,
  onViewModeChange,
  onRemoveAssignment,
  onDeleteTask,
  onClearAllEmployeeTasks,
  onEditTask,
  onClearAll,
}: CurrentAssignedTasksProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recently added');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredTasks = useMemo(() => {
    if (!searchTerm) return tasks;

    const searchLower = searchTerm.toLowerCase();

    if (viewMode === 'task') {
      // Task View: Filter by task name OR any assigned employee name/ID
      return tasks.filter((task) => {
        const taskMatch = task.taskName.toLowerCase().includes(searchLower);
        const employeeMatch = task.assignedEmployees.some(
          (emp) =>
            emp.name.toLowerCase().includes(searchLower) ||
            emp.empId.toLowerCase().includes(searchLower)
        );
        return taskMatch || employeeMatch;
      });
    } else {
      // Employee View: Pass all tasks, filtering happens in EmployeeViewCard
      return tasks;
    }
  }, [tasks, searchTerm, viewMode]);

  const sortedTasks = useMemo(() => {
    const tasksCopy = [...filteredTasks];

    if (viewMode === 'task') {
      if (sortBy === 'recently added') {
        tasksCopy.sort((a, b) => b.id.localeCompare(a.id));
      } else if (sortBy === 'oldest') {
        tasksCopy.sort((a, b) => a.id.localeCompare(b.id));
      } else if (sortBy === 'closest') {
        tasksCopy.sort(
          (a, b) => new Date(a.dateRange.end).getTime() - new Date(b.dateRange.end).getTime()
        );
      } else if (sortBy === 'farthest') {
        tasksCopy.sort(
          (a, b) => new Date(b.dateRange.end).getTime() - new Date(a.dateRange.end).getTime()
        );
      }
    }

    // ⚠️ For employee view, don’t sort here — EmployeeViewCard will handle it
    return tasksCopy;
  }, [filteredTasks, sortBy, viewMode]);

  return (
    <div className="rounded-3xl bg-[#FBF4E8] p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[#690003]">Current Assigned Tasks</h2>

        {/* View Toggle */}
        <div className="flex gap-2 bg-white rounded-2xl p-1 border-2 border-gray-300">
          <button
            onClick={() => onViewModeChange('task')}
            className={`flex w-44 justify-center items-center gap-2 py-2.5 rounded-xl text-base font-medium transition ${
              viewMode === 'task' ? 'bg-[#690003] text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ListTodo size={20} />
            Task View
          </button>
          <button
            onClick={() => onViewModeChange('employee')}
            className={`flex w-44 justify-center items-center gap-2 py-2.5 rounded-xl text-base font-medium transition ${
              viewMode === 'employee'
                ? 'bg-[#690003] text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users size={20} />
            Employee View
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={
              viewMode === 'task' ? 'Search by task name...' : 'Search by employee name or ID...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-full bg-white focus:outline-none focus:border-[#690003]"
          />
        </div>

        {viewMode === 'task' ? (
          <TaskSortingBar sortBy={sortBy} onSortChange={setSortBy} />
        ) : (
          <EmployeeSortingBar sortBy={sortBy} onSortChange={setSortBy} />
        )}

        <Button
          onClick={() => setShowClearConfirm(true)}
          disabled={sortedTasks.length == 0}
          className="bg-[#690003] hover:bg-[#8B0000] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear All
        </Button>
      </div>

      {/* Task Cards */}
      <div className="space-y-6">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tasks assigned yet.</p>
          </div>
        ) : viewMode === 'task' ? (
          sortedTasks.map((task) => (
            <TaskViewCard
              key={task.id}
              task={task}
              onRemoveAssignment={onRemoveAssignment}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
            />
          ))
        ) : (
          <EmployeeViewCard
            tasks={filteredTasks} // pass filtered tasks, not sortedTasks
            searchTerm={searchTerm}
            sortBy={sortBy} // NEW: pass sortBy down
            onRemoveAssignment={onRemoveAssignment}
            onClearAllEmployeeTasks={onClearAllEmployeeTasks}
          />
        )}
      </div>

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm shadow-lg">
            <h3 className="text-lg font-bold text-[#690003] mb-4">Clear All Assignments?</h3>
            <p className="text-gray-600 mb-6">
              This will unassign all tasks from all employees. This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowClearConfirm(false)}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="bg-[#690003] hover:bg-[#8B0000] text-white"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
