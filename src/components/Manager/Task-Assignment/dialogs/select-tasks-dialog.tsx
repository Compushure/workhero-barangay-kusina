'use client';

import type React from 'react';
import { useState } from 'react';
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

interface SelectTasksDialogProps {
  selectedTasks: string[];
  onTasksChange: (tasks: string[], maxAttempts?: Record<string, number>) => void;
  assignedTasks?: AssignedTask[];
  buttonLabel?: string;
}

export function SelectTasksDialog({
  selectedTasks,
  onTasksChange,
  assignedTasks = [],
  buttonLabel,
}: SelectTasksDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [taskMaxAttempts, setTaskMaxAttempts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    selectedTasks.forEach((taskId) => {
      const task = MOCK_TASKS.find((t) => t.id === taskId);
      if (task && task.isRepeatable) {
        initial[taskId] = 1;
      }
    });
    return initial;
  });

  const filteredTasks = MOCK_TASKS.filter((task) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = task.name.toLowerCase().includes(searchLower);
    const matchesType = filterType === 'all' || task.type === filterType;
    return matchesSearch && matchesType;
  });

  const taskTypes = ['all', ...new Set(MOCK_TASKS.map((t) => t.type))];
  const assignedTaskIds = new Set(assignedTasks.map((t) => t.taskId));

  const toggleTask = (taskId: string) => {
    if (selectedTasks.includes(taskId)) {
      // Deselect
      onTasksChange([], {});
      setTaskMaxAttempts({});
    } else {
      // Select this task and deselect others
      const task = MOCK_TASKS.find((t) => t.id === taskId);
      if (task) {
        const newMaxAttempts = { [taskId]: task.isRepeatable ? 1 : 1 };
        setTaskMaxAttempts(newMaxAttempts);
        onTasksChange([taskId], newMaxAttempts);
      }
    }
  };

  const updateMaxAttempts = (taskId: string, newValue: number) => {
    const task = MOCK_TASKS.find((t) => t.id === taskId);
    if (task && task.isRepeatable) {
      const newMaxAttempts = { ...taskMaxAttempts, [taskId]: Math.max(1, newValue) };
      setTaskMaxAttempts(newMaxAttempts);
      onTasksChange(selectedTasks, newMaxAttempts);
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
        <span className="truncate">{buttonLabel || `${selectedTasks.length} selected`}</span>
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
            <h4 className="text-lg font-bold text-[#690003] mb-3">
              Tasks Selected
              <span className="bg-gray-200 px-2 py-1 rounded-full text-sm ml-2">
                {selectedTasks.length}
              </span>
            </h4>
          </div>

          {/* Tasks Table */}
          <div className="bg-white rounded-2xl border-2 border-gray-300 overflow-hidden">
            <div className="max-h-100 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-[#690003] text-white sticky top-0 z-10">
                  <tr>
                    <th className="w-[5%] py-4"></th>
                    <th className="w-[35%] py-4 text-left pl-4 text-sm font-bold">TASK</th>
                    <th className="w-[20%] py-4 text-center text-sm font-bold">POINTS</th>
                    <th className="w-[15%] py-4 text-center text-sm font-bold">XP</th>
                    <th className="w-[25%] py-4 text-center text-sm font-bold">MAX ATTEMPTS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => {
                    const isSelected = selectedTasks.includes(task.id);
                    const currentMaxAttempts =
                      taskMaxAttempts[task.id] ?? (task.isRepeatable ? 1 : task.maxAttempts);
                    const isAlreadyAssigned = assignedTaskIds.has(task.id);
                    const isDisabled = isAlreadyAssigned;

                    return (
                      <tr
                        key={task.id}
                        className={`border-b border-gray-200 ${
                          isDisabled
                            ? 'opacity-50 cursor-not-allowed bg-gray-100'
                            : 'hover:bg-gray-50 cursor-pointer'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isDisabled) toggleTask(task.id);
                        }}
                      >
                        <td className="w-[5%] p-4 text-center">
                          <input
                            type="radio"
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (!isDisabled) toggleTask(task.id);
                            }}
                            className="w-5 h-5 cursor-pointer accent-[#690003] disabled:cursor-not-allowed"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="w-[35%] px-4 py-3">
                          <div className="font-medium text-gray-800 font-sans">{task.name}</div>
                          <div className="text-sm text-gray-500 font-sans">{task.type}</div>
                        </td>
                        <td className="w-[20%] p-4 text-gray-600 text-center font-sans">
                          {task.points}pts
                        </td>
                        <td className="w-[15%] p-4 text-gray-600 text-center font-sans">
                          {task.xp}
                        </td>
                        <td className="w-[25%] p-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            {task.isRepeatable ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateMaxAttempts(task.id, currentMaxAttempts - 1);
                                  }}
                                  disabled={isDisabled}
                                  className="bg-[#690003] text-white w-6 h-6 rounded flex items-center justify-center hover:bg-[#8B0000] disabled:opacity-50"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  value={currentMaxAttempts}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updateMaxAttempts(
                                      task.id,
                                      Number.parseInt(e.target.value) || 1
                                    );
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  disabled={isDisabled}
                                  className="remove-arrow w-12 text-center border border-gray-300 rounded px-2 py-1 font-sans disabled:opacity-50"
                                  min="1"
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateMaxAttempts(task.id, currentMaxAttempts + 1);
                                  }}
                                  disabled={isDisabled}
                                  className="bg-[#690003] text-white w-6 h-6 rounded flex items-center justify-center hover:bg-[#8B0000] disabled:opacity-50"
                                >
                                  +
                                </button>
                              </>
                            ) : (
                              <span className="text-gray-600 font-sans">1</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

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
              disabled={selectedTasks.length === 0}
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
