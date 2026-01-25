'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, Plus } from 'lucide-react';
import type { AssignedTask, Task } from '@/types';
import { MOCK_TASKS } from '@/mock-data/employees';
import SelectTasksTable from './select-task-table';
import { handleFetchTaskList } from '@/action-handlers/manager-assignment';

interface SelectTasksDialogProps {
  selectedTask: string[];
  onTasksChange: (tasks: string[], maxAttempts?: Record<string, number>) => void;
  assignedTasks?: AssignedTask[];
  buttonLabel?: string;
}

export function SelectTasksDialog({
  selectedTask,
  onTasksChange,
  assignedTasks = [],
  buttonLabel,
}: SelectTasksDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [tasks, setTasks] = useState<Task[]>([]); // New state for real data
  const [isLoading, setIsLoading] = useState(true);
  const [taskMaxAttempts, setTaskMaxAttempts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    selectedTask.forEach((taskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.isRepeatable) {
        initial[taskId] = 1;
      }
    });
    return initial;
  });

  // Reset taskMaxAttempts when selectedTask becomes empty (after assignment and clear)
  useEffect(() => {
    if (selectedTask.length === 0) {
      setTaskMaxAttempts({});
    }
  }, [selectedTask]);

  // Fetch tasks on mount
  useEffect(() => {
    async function loadTasks() {
      const data = await handleFetchTaskList();
      setTasks(data);
      setIsLoading(false);
    }
    loadTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = task.name.toLowerCase().includes(searchLower);
    const matchesType = filterType === 'all' || task.type === filterType;
    return matchesSearch && matchesType;
  });

  const taskTypes = ['all', ...new Set(tasks.map((t) => t.type))];
  const assignedTaskIds = new Set(assignedTasks.map((t) => t.taskId));

  const toggleTask = (taskId: string) => {
    if (selectedTask.includes(taskId)) {
      // Deselect
      onTasksChange([], {});
      setTaskMaxAttempts({});
    } else {
      // Select this task and deselect others
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        const newMaxAttempts = { [taskId]: task.isRepeatable ? 1 : 1 };
        setTaskMaxAttempts(newMaxAttempts);
        onTasksChange([taskId], newMaxAttempts);
      }
    }
  };

  const updateMaxAttempts = (taskId: string, newValue: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.isRepeatable) {
      const newMaxAttempts = { ...taskMaxAttempts, [taskId]: Math.max(1, newValue) };
      setTaskMaxAttempts(newMaxAttempts);
      onTasksChange(selectedTask, newMaxAttempts);
    }
  };

  const handleConfirm = () => {
    setOpen(false);
    setSearchTerm('');
  };

  const handleCancel = () => {
    setOpen(false);
    setSearchTerm('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearchTerm('');
    }
    setOpen(newOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    setFilterType(e.target.value);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2 min-w-50 justify-between"
      >
        <span className="truncate">{buttonLabel}</span>
        <Plus className="w-4 h-4 shrink-0" />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-[#FBF4E8] max-w-full min-w-4xl max-h-[90vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#690003]">Select Tasks</DialogTitle>
          </DialogHeader>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Task"
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-full bg-white focus:outline-none focus:border-[#690003] font-sans"
              />
            </div>
            <select
              value={filterType}
              onChange={handleFilterChange}
              onClick={(e) => e.stopPropagation()}
              className="px-4 py-3 border-2 border-gray-300 rounded-full bg-white focus:outline-none focus:border-[#690003] font-sans"
            >
              {taskTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>

          {/* Tasks Selected Badge */}
          <div>
            <h4 className="text-lg font-bold text-[#690003]">
              Tasks Selected
              <span className="bg-gray-200 px-2 py-1 rounded-full text-sm ml-2">
                {selectedTask.length}
              </span>
            </h4>
          </div>

          {/* Tasks Table */}
          <SelectTasksTable
            filteredTasks={filteredTasks}
            toggleTask={toggleTask}
            updateMaxAttempts={updateMaxAttempts}
            selectedTaskInstance={selectedTask.map((taskId) => ({
              id: taskId,
              maxAttempts: taskMaxAttempts[taskId] || 1,
            }))}
            taskMaxAttempts={taskMaxAttempts}
          />

          {/* Dialog Footer */}
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedTask.length === 0}
              className="bg-[#690003] hover:bg-[#8B0000] text-white disabled:opacity-50"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
