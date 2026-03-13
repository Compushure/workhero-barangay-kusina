'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DatePickerPopover } from '../../../task-assignment-card/date-picker-popover';
import { Button } from '@/components/ui/button';
import { AssignedTask, AssignedEmployee } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { handleFetchEmployeeList } from '@/action-handlers/manager/assignments';
import { useGetCurrentAssignedTasksPaginated } from '@/hooks/tanstack/queries/managerAssignmentQueries';
import { Coins, Search } from 'lucide-react';
import { normalizeSearchQuery, sanitizeSearchInput } from '@/lib/utils/search-normalization';

interface EditTaskDialogProps {
  showEditDialog: boolean;
  handleCancelEdit: () => void;
  handleEditTask: () => void;
  isProcessing?: boolean;
  task: AssignedTask;
  editMaxOrders: number;
  setEditMaxOrders: (edit: number) => void;
  editDueDate: Date;
  setEditDueDate: (edit: Date) => void;
  editAssignedEmployees: string[];
  toggleEmployee: (empId: string) => void;
}

export default function EditTaskDialog({
  showEditDialog,
  handleCancelEdit,
  handleEditTask,
  isProcessing = false,
  task,
  editMaxOrders,
  setEditMaxOrders,
  editDueDate,
  setEditDueDate,
  editAssignedEmployees,
  toggleEmployee,
}: EditTaskDialogProps) {
  const assignedTasksQuery = useGetCurrentAssignedTasksPaginated(
    1,
    1000,
    'recently added',
    '',
    showEditDialog,
    [],
    'all'
  );
  const assignedTasks = assignedTasksQuery.data?.tasks ?? [];

  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<AssignedEmployee[]>([]);
  useEffect(() => {
    async function loadEmployees() {
      const data = await handleFetchEmployeeList();
      setEmployees(data);
    }
    loadEmployees();
  }, []);

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    const searchLower = normalizeSearchQuery(searchTerm);
    if (!searchLower) return employees;

    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchLower) ||
        emp.empId.toLowerCase().includes(searchLower)
    );
  }, [employees, searchTerm]);

  // Get all employees assigned to other instances of this task
  const disabledEmployeeIds = useMemo(() => {
    const otherTaskInstanceEmployees = new Set<string>();
    assignedTasks.forEach((assignedTask) => {
      if (assignedTask.taskId === task.taskId && assignedTask.id !== task.id) {
        (assignedTask.assignedEmployees ?? []).forEach((emp) => {
          otherTaskInstanceEmployees.add(emp.id);
        });
      }
    });

    // An employee is disabled if they're assigned to another instance of this task
    return new Set<string>(
      Array.from(otherTaskInstanceEmployees).filter(
        (empId) => !editAssignedEmployees.includes(empId)
      )
    );
  }, [assignedTasks, editAssignedEmployees, task.id, task.taskId]);

  return (
    <Dialog open={showEditDialog} onOpenChange={(open) => !open && handleCancelEdit()}>
      <DialogContent className="bg-card max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-2xl max-h-[90vh] flex flex-col p-4 sm:p-5">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl text-foreground">Edit Task</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3">
          {/* Task Info */}
          <div className="flex items-center justify-between bg-card rounded-xl px-3 py-1.5 border border-accent/50">
            <h4 className="text-base font-bold text-foreground">{task.taskName}</h4>
            <div className="flex flex-col items-center">
              <div className="flex items-end gap-1.5">
                <p className="flex gap-0.5 items-end text-base font-medium">
                  <Coins strokeWidth={1.5} className="size-4" />
                  <span className="inline-block font-semibold text-base leading-none pb-0.5">
                    {task.points}
                  </span>
                </p>

                <p className="flex gap-1 items-end font-medium pb-0.5">
                  <span className="inline-block italic text-sm leading-none">XP</span>
                  <span className="inline-block font-semibold text-base leading-none">
                    {task.xp}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-start gap-6 text-xs mb-6">
            {/* Max Repeats */}
            {task.isRepeatable && (
              <div className="flex flex-col items-center gap-1.5 font-medium">
                <label className="font-bold text-foreground text-sm">Max Orders</label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditMaxOrders(Math.max(1, Math.min(99, editMaxOrders - 1)))}
                    className="shadow-sm/15 border border-accent/50 bg-card hover:bg-accent hover:text-card text-primary size-7 rounded flex items-center justify-center cursor-pointer transition-all duration-500 ease-in-out"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={editMaxOrders}
                    onChange={(e) =>
                      setEditMaxOrders(
                        Math.max(1, Math.min(99, Number.parseInt(e.target.value) || 1))
                      )
                    }
                    className="remove-arrow w-14 text-center border border-accent/50 rounded px-1.5 py-1 bg-card text-sm"
                    min="1"
                    max="99"
                  />
                  <button
                    onClick={() => setEditMaxOrders(Math.max(1, Math.min(99, editMaxOrders + 1)))}
                    className="shadow-sm/15 border border-accent/50 bg-card hover:bg-accent hover:text-card text-primary size-7 rounded flex items-center justify-center cursor-pointer transition-all duration-500 ease-in-out"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Due Date */}
            <div className="flex flex-col items-center justify-baseline gap-1.5">
              <label className="font-bold text-foreground text-sm">Due Date</label>
              <DatePickerPopover
                deadline={editDueDate}
                onDeadlineChange={(date) => date && setEditDueDate(date)}
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name or employee ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(sanitizeSearchInput(e.target.value))}
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-white shadow-sm/15 text-xs border border-accent/0 focus:outline-none focus:border focus:border-accent"
            />
          </div>

          {/* Assign/Remove Employees */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-foreground">
              Assign/Remove Employees
              <span className="bg-accent/65 text-primary-foreground shadow-sm px-1.5 py-0.5 rounded-full ml-1.5 shadow-sm/15 text-xs">
                {editAssignedEmployees.length}
              </span>
            </h4>
            <div className="bg-card rounded-xl border border-accent/50 min-h-[10vh] max-h-[30vh] overflow-y-auto">
              <div className="">
                {filteredEmployees.map((emp) => {
                  const isDisabled = disabledEmployeeIds.has(emp.id);
                  const isSelected = editAssignedEmployees.includes(emp.id);

                  return (
                    <div
                      key={emp.id}
                      className={`flex items-center gap-3 pl-4 py-2 ${
                        isDisabled
                          ? 'brightness-75 opacity-50 cursor-not-allowed'
                          : isSelected
                            ? 'bg-accent-secondary/25  border-b border-accent/50'
                            : 'bg-card hover:brightness-96 hover:bg-accent-secondary/25 cursor-pointer transition-all duration-300 ease-in-out border-b border-accent/25'
                      }`}
                      onClick={() => !isDisabled && toggleEmployee(emp.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => {}}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isDisabled) toggleEmployee(emp.id);
                        }}
                        className="size-4 rounded cursor-pointer appearance-none bg-card border border-accent checked:bg-accent checked:border-accent disabled:cursor-not-allowed disabled:opacity-50 relative"
                        style={{
                          backgroundImage: !!isSelected
                            ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e\")"
                            : 'none',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                          backgroundSize: '0.875rem',
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.empId}</p>
                      </div>
                      {isDisabled && (
                        <span className="text-xs text-gray-500 ml-1.5">Already assigned</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0">
          <Button
            onClick={handleEditTask}
            disabled={editAssignedEmployees.length === 0 || isProcessing}
            className="bg-foreground hover:bg-accent text-white cursor-pointer transition-all duration-400 ease-in-out"
          >
            {isProcessing ? 'Saving...' : 'Confirm'}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancelEdit}
            disabled={isProcessing}
            className="border-zinc-400 bg-white hover:bg-gray-200 cursor-pointer transition-all duration-400 ease-in-out"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
