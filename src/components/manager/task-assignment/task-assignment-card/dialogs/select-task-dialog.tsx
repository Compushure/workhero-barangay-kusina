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
import { Search, Plus, ChevronDown, ListTodo } from 'lucide-react';
import type { AssignedTask, Task } from '@/types';
import SelectTasksTable from './select-task-table';
import {
  handleFetchTaskList,
  handleFetchEmployeeList,
} from '@/action-handlers/manager/assignments';
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
    const activeStatuses = new Set(['assigned', 'in review', 'rejected']);

    if (totalEmployees > 0) {
      // Group active assignments by taskId and count unique employees
      const taskEmployeeCounts = new Map<string, Set<string>>();
      assignedTasks.forEach((assignment) => {
        const taskStatus = (assignment.status ?? '').toLowerCase();
        const hasActiveTaskStatus = activeStatuses.has(taskStatus);

        assignment.assignedEmployees.forEach((emp) => {
          const employeeStatus = (emp.status ?? taskStatus ?? '').toLowerCase();
          const isActive = hasActiveTaskStatus || activeStatuses.has(employeeStatus);
          if (!isActive) return;

          if (!taskEmployeeCounts.has(assignment.taskId)) {
            taskEmployeeCounts.set(assignment.taskId, new Set());
          }
          taskEmployeeCounts.get(assignment.taskId)!.add(emp.id);
        });
      });

      // Mark tasks as fully assigned only when all employees have an active assignment
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
      const newMaxOrders = { ...taskMaxOrders, [taskId]: Math.max(1, Math.min(99, newValue)) };
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
        className={`bg-zinc-50 shadow-sm/25 flex items-center min-w-54 justify-between cursor-pointer transition-all duration-400 ease-in-out hover:bg-accent/15`}
      >
        <div className="flex items-center gap-2 min-w-45 max-9/10">
          <ListTodo size={16} className="text-accent" />
          <span
            className={`truncate ${selectedTask.length === 0 ? 'text-secondary' : 'text-primary'}`}
          >
            {buttonLabel}
          </span>
        </div>
        <Plus className="size-4 shrink-0 text-primary" />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-card max-w-full min-w-4xl max-h-[90vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="flex gap-2 text-2xl text-foreground text-left items-center">
              <ListTodo className="size-7 p-1.25 bg-primary-gradient text-card rounded-full" />
              Select Task
            </DialogTitle>
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
                className="w-full pl-10 pr-4 py-2 rounded-full text-sm bg-card shadow-sm/25 focus:outline-none focus:border focus:border-accent"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="default"
                  className="bg-card shadow-sm/25 hover:bg-gray-50 transition-all duration-200 ease-in-out cursor-pointer text-gray-700 shadow-md w-48 py-2 justify-between border border-gray-200"
                >
                  <span className="truncate">{currentFilterLabel}</span>
                  <ChevronDown size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background">
                {taskTypes.map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => handleFilterChange(type)}
                    className={`cursor-pointer transition-all duration-400 ease-in-out ${filterType === type ? 'bg-accent text-card' : 'hover:bg-accent/25!'}`}
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
              className="px-12 bg-card text-foreground hover:bg-accent hover:text-card cursor-pointer transition-all duration-400 ease-in-out"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
