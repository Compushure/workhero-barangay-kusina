'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, ListTodo, Users } from 'lucide-react';
import { TaskViewCard } from './task-view-card';
import { EmployeeViewCard } from './employee-view-card';
import type { AssignedTask } from './task-assignment-page';

interface CurrentAssignedTasksProps {
  tasks: AssignedTask[];
  viewMode: 'task' | 'employee';
  onViewModeChange: (mode: 'task' | 'employee') => void;
  onRemoveAssignment: (taskId: string, employeeId: string) => void;
  onClearAll: () => void;
}

export function CurrentAssignedTasks({
  tasks,
  viewMode,
  onViewModeChange,
  onRemoveAssignment,
  onClearAll,
}: CurrentAssignedTasksProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    const searchLower = searchTerm.toLowerCase();
    const taskMatch = task.taskName.toLowerCase().includes(searchLower);
    const employeeMatch = task.assignedEmployees.some((emp) =>
      emp.name.toLowerCase().includes(searchLower)
    );
    return taskMatch || employeeMatch;
  });

  return (
    <div className="rounded-3xl bg-[#FBF4E8] p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[#690003]">Current Assigned Tasks</h2>

        {/* View Toggle */}
        <div className="flex gap-2 bg-white rounded-full p-1 border-2 border-gray-300">
          <button
            onClick={() => onViewModeChange('task')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition ${
              viewMode === 'task' ? 'bg-[#690003] text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            Task View
          </button>
          <button
            onClick={() => onViewModeChange('employee')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition ${
              viewMode === 'employee'
                ? 'bg-[#690003] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
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
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-full bg-white focus:outline-none focus:border-[#690003]"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 border-2 border-gray-300 rounded-full bg-white focus:outline-none focus:border-[#690003]"
        >
          <option value="newest">Sort by: Newest</option>
          <option value="oldest">Oldest</option>
          <option value="closest">Closest deadline</option>
          <option value="farthest">Farthest deadline</option>
        </select>

        <Button
          onClick={() => setShowClearConfirm(true)}
          disabled={filteredTasks.length == 0}
          className="bg-[#690003] hover:bg-[#8B0000] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear All
        </Button>
      </div>

      {/* Task Cards */}
      <div className="space-y-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tasks assigned yet.</p>
          </div>
        ) : viewMode === 'task' ? (
          filteredTasks.map((task) => (
            <TaskViewCard key={task.id} task={task} onRemoveAssignment={onRemoveAssignment} />
          ))
        ) : (
          <EmployeeViewCard tasks={filteredTasks} onRemoveAssignment={onRemoveAssignment} />
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
