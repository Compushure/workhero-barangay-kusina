'use client';

import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, Plus, ChevronDown } from 'lucide-react';
import type { AssignedTask, Task } from '@/types';
import SelectTasksTable from './select-task-table';
import { handleFetchTaskList, handleFetchEmployeeList } from '@/action-handlers/manager-assignment';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SelectTasksDialogProps {
  selectedTask: string[];
  onTasksChange: (tasks: string[], maxOrders?: Record<string, number>) => void;
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [taskMaxOrders, setTaskMaxOrders] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    selectedTask.forEach((taskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.isRepeatable) {
        initial[taskId] = 1;
      }
    });
    return initial;
  });

  // Reset taskMaxOrders when selectedTask becomes empty
  useEffect(() => {
    if (selectedTask.length === 0) {
      setTaskMaxOrders({});
    }
  }, [selectedTask]);

  // Fetch tasks and employees on mount
  useEffect(() => {
    async function loadData() {
      const [tasksData, employeesData] = await Promise.all([
        handleFetchTaskList(),
        handleFetchEmployeeList(),
      ]);
      setTasks(tasksData);
      setTotalEmployees(employeesData.length);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = task.name.toLowerCase().includes(searchLower);
    const matchesType = filterType === 'all' || task.type === filterType;
    return matchesSearch && matchesType;
  });

  const taskTypes = ['all', ...new Set(tasks.map((t) => t.type))];

  // Calculate which tasks have ALL employees assigned
  const fullyAssignedTaskIds = useMemo(() => {
    const assigned = new Set<string>();
    if (totalEmployees > 0) {
      // Group assignments by taskId and count unique employees
      const taskEmployeeCounts = new Map<string, Set<string>>();
      assignedTasks.forEach((assignment) => {
        if (!taskEmployeeCounts.has(assignment.taskId)) {
          taskEmployeeCounts.set(assignment.taskId, new Set());
        }
        assignment.assignedEmployees.forEach((emp) => {
          taskEmployeeCounts.get(assignment.taskId)!.add(emp.id);
        });
      });

      // Mark tasks as fully assigned if they have all employees
      taskEmployeeCounts.forEach((employeeIds, taskId) => {
        if (employeeIds.size >= totalEmployees) {
          assigned.add(taskId);
        }
      });
    }
    return assigned;
  }, [assignedTasks, totalEmployees]);

  // Automatically deselect task if it becomes fully assigned (disabled)
  useEffect(() => {
    if (selectedTask.length > 0 && fullyAssignedTaskIds.has(selectedTask[0])) {
      onTasksChange([], {});
      setTaskMaxOrders({});
    }
  }, [fullyAssignedTaskIds, selectedTask, onTasksChange]);

  const currentFilterLabel = filterType === 'all' ? 'All Types' : filterType;

  const toggleTask = (taskId: string) => {
    if (selectedTask.includes(taskId)) {
      // Deselect
      onTasksChange([], {});
      setTaskMaxOrders({});
    } else {
      // Select this task and deselect others
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        const newMaxOrders = { [taskId]: task.isRepeatable ? 1 : 1 };
        setTaskMaxOrders(newMaxOrders);
        onTasksChange([taskId], newMaxOrders);
      }
    }
  };

  const updateMaxOrders = (taskId: string, newValue: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.isRepeatable) {
      const newMaxOrders = { ...taskMaxOrders, [taskId]: Math.max(1, newValue) };
      setTaskMaxOrders(newMaxOrders);
      onTasksChange(selectedTask, newMaxOrders);
    }
  };

  const handleClose = () => {
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

  const handleFilterChange = (value: string) => {
    setFilterType(value);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={`bg-zinc-50 shadow-sm/25 hover:bg-gray-100 flex items-center gap-16 min-w-50 justify-between cursor-pointer transition-all duration-500 ease-in-out
          ${selectedTask.length === 0 ? 'text-zinc-700' : 'text-[#690003]'}`}
      >
        <span className="truncate">{buttonLabel}</span>
        <Plus className="w-4 h-4 shrink-0" />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-[#FBF4E8] max-w-full min-w-4xl max-h-[90vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#690003] text-left">Select Tasks</DialogTitle>
          </DialogHeader>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-4 justify-center">
            <div className="relative flex w-1/2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Task"
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()}
                className="w-full pl-10 pr-4 py-2 rounded-full text-sm bg-white shadow-sm/25 focus:outline-none focus:border-[#690003]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="default"
                  className="bg-white shadow-sm/25 hover:bg-gray-50 transition-all duration-200 ease-in-out cursor-pointer text-gray-700 shadow-md w-48 py-2 justify-between border border-gray-200"
                >
                  <span className="truncate">{currentFilterLabel}</span>
                  <ChevronDown size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {taskTypes.map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => handleFilterChange(type)}
                    className={`cursor-pointer transition-all duration-500 ease-in-out ${filterType === type ? 'bg-red-100' : ''}`}
                  >
                    {type === 'all' ? 'All Types' : type}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tasks Table */}
          <SelectTasksTable
            isLoading={isLoading}
            filteredTasks={filteredTasks}
            toggleTask={toggleTask}
            updateMaxOrders={updateMaxOrders}
            selectedTaskInstance={selectedTask.map((taskId) => ({
              id: taskId,
              maxOrders: taskMaxOrders[taskId] || 1,
            }))}
            taskMaxOrders={taskMaxOrders}
            setTasks={setTasks}
            disabledTaskIds={fullyAssignedTaskIds}
          />

          {/* Dialog Footer */}
          <DialogFooter className="flex flex-row">
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-12 border-gray-300 bg-zinc-50 hover:bg-[#690003] hover:text-zinc-50 cursor-pointer transition-all duration-500 ease-in-out"
            >
              Close
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-gray-300 hover:bg-gray-200 cursor-pointer transition-all duration-500 ease-in-out"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
