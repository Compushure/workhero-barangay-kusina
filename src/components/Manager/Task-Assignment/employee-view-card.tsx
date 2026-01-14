'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MoreVertical, ChevronDown, X, Plus } from 'lucide-react';
import { SelectTasksDialog } from './dialogs/select-tasks-dialog';
import type { AssignedTask } from './task-assignment-page';

interface Employee {
  id: string;
  name: string;
  empId: string;
  tenure?: string;
  assignedTasks: AssignedTask[];
}

interface EmployeeViewCardProps {
  tasks: AssignedTask[];
  onRemoveAssignment: (taskId: string, employeeId: string) => void;
  onClearAllEmployeeTasks?: (employeeId: string) => void;
}

export function EmployeeViewCard({
  tasks,
  onRemoveAssignment,
  onClearAllEmployeeTasks,
}: EmployeeViewCardProps) {
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<{
    taskId: string;
    empId: string;
  } | null>(null);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState<string | null>(null);
  const [addTasksForEmployee, setAddTasksForEmployee] = useState<string[]>([]);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<string | null>(null);

  const employeeMap = new Map<string, Employee>();
  tasks.forEach((task) => {
    task.assignedEmployees.forEach((emp) => {
      if (!employeeMap.has(emp.id)) {
        employeeMap.set(emp.id, { ...emp, assignedTasks: [] });
      }
      employeeMap.get(emp.id).assignedTasks.push(task);
    });
  });

  const employees = Array.from(employeeMap.values());

  const toggleEmployeeExpand = (empId: string) => {
    const newSet = new Set(expandedEmployees);
    if (newSet.has(empId)) {
      newSet.delete(empId);
    } else {
      newSet.add(empId);
    }
    setExpandedEmployees(newSet);
  };

  return (
    <div className="space-y-4">
      {employees.map((employee) => {
        const isExpanded = expandedEmployees.has(employee.id);
        const displayedTasks = isExpanded
          ? employee.assignedTasks
          : employee.assignedTasks.slice(0, 2);
        const hiddenCount = Math.max(0, employee.assignedTasks.length - 2);

        return (
          <div
            key={employee.id}
            className="rounded-2xl bg-[#FAFAFA] p-6 border-l-4 border-[#690003]"
          >
            {/* Employee Details */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#690003]">{employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.empId}</p>
                {employee.tenure && <p className="text-sm text-gray-500">{employee.tenure}</p>}
              </div>
              <Popover
                open={openPopoverId === employee.id}
                onOpenChange={(open) => setOpenPopoverId(open ? employee.id : null)}
              >
                <PopoverTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-2" align="end">
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        setShowAddTaskDialog(employee.id);
                        setOpenPopoverId(null);
                      }}
                      variant="ghost"
                      className="justify-start text-[#690003] hover:bg-[#FBF4E8]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                    <Button
                      onClick={() => {
                        setShowClearConfirm(employee.id);
                        setOpenPopoverId(null);
                      }}
                      variant="ghost"
                      className="justify-start text-red-600 hover:bg-red-50"
                    >
                      Clear All Tasks
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Assigned Tasks */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-[#690003]">
                  Current Tasks{' '}
                  <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded-full text-sm ml-2">
                    {employee.assignedTasks.length}
                  </span>
                </h4>
                {hiddenCount > 0 && (
                  <button
                    onClick={() => toggleEmployeeExpand(employee.id)}
                    className="text-[#690003] font-medium flex items-center gap-1 hover:underline"
                  >
                    See All{' '}
                    <ChevronDown
                      className={`w-4 h-4 transition ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                )}
              </div>

              {/* Task Badges */}
              <div className="flex flex-wrap gap-3">
                {displayedTasks.map((task: AssignedTask) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-gray-300"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-700">{task.taskName}</p>
                      <p className="text-xs text-gray-500">
                        {task.dateRange.start} - {task.dateRange.end}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-gray-600">{task.points}pts</span>
                        <span className="text-xs text-gray-600">XP {task.xp}</span>
                        <span className="text-xs text-gray-600">⅕</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowRemoveConfirm({ taskId: task.id, empId: employee.id })}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Unassign Task Dialog */}
            <Dialog
              open={showRemoveConfirm?.empId === employee.id}
              onOpenChange={(open) => !open && setShowRemoveConfirm(null)}
            >
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle className="text-[#690003]">Unassign Task?</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to unassign this task from this employee?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowRemoveConfirm(null)}
                    className="border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (showRemoveConfirm) {
                        onRemoveAssignment(showRemoveConfirm.taskId, showRemoveConfirm.empId);
                        setShowRemoveConfirm(null);
                      }
                    }}
                    className="bg-[#690003] hover:bg-[#8B0000] text-white"
                  >
                    Unassign
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Clear All Tasks Dialog */}
            <Dialog
              open={showClearConfirm === employee.id}
              onOpenChange={(open) => !open && setShowClearConfirm(null)}
            >
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle className="text-[#690003]">Clear All Tasks?</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to unassign all tasks from {employee.name}? This action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowClearConfirm(null)}
                    className="border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (showClearConfirm && onClearAllEmployeeTasks) {
                        onClearAllEmployeeTasks(showClearConfirm);
                      }
                      setShowClearConfirm(null);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Clear All
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add Task Dialog */}
            <Dialog
              open={showAddTaskDialog === employee.id}
              onOpenChange={(open) => !open && setShowAddTaskDialog(null)}
            >
              <DialogContent className="bg-[#FBF4E8] max-w-4xl p-0">
                <SelectTasksDialog
                  selectedTasks={addTasksForEmployee}
                  onTasksChange={setAddTasksForEmployee}
                  mode="add-task"
                />
              </DialogContent>
            </Dialog>
          </div>
        );
      })}
    </div>
  );
}
