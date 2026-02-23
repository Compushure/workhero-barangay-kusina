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
    showEditDialog
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
    if (!searchTerm.trim()) return employees;
    
    const searchLower = searchTerm.toLowerCase();
    return employees.filter((emp) => 
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
      <DialogContent className="bg-[#FBF4E8] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-2xl text-[#690003]">Edit Task</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Task Info */}
          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2 border-2 border-gray-300">
            <h4 className="text-lg font-bold text-[#690003]">{task.taskName}</h4>
            <div className="flex flex-col items-center">
              <div className="flex items-end gap-2">
                <p className="flex gap-1 items-end text-lg font-medium leading-none">
                  <Coins strokeWidth={1.5} className="size-5" />
                  <span className="inline-block font-semibold pb-0.5">{task.points}</span>
                </p>

                <p className="flex gap-1.5 items-end font-medium pb-0.5">
                  <span className="inline-block italic text-base leading-none">XP</span>
                  <span className="inline-block font-semibold text-lg leading-none">{task.xp}</span>
                </p>
              </div>

            </div>
          </div>

          <div className="flex justify-center items-start gap-4 text-sm">
            {/* Max Repeats */}
            {task.isRepeatable && (
            <div className='flex flex-col items-center gap-3'>
              <label className="font-bold text-[#690003]">Max Orders</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditMaxOrders(Math.max(1, editMaxOrders - 1))}
                  className="bg-[#690003] text-white size-6 rounded flex items-center justify-center hover:bg-[#8B0000] cursor-pointer transition-all duration-500 ease-in-out"
                >
                  −
                </button>
                <input
                  type="number"
                  value={editMaxOrders}
                  onChange={(e) =>
                    setEditMaxOrders(Math.max(1, Number.parseInt(e.target.value) || 1))
                  }
                  className="remove-arrow w-12 text-center border border-gray-300 rounded px-2 py-1 bg-[#fafafa]"
                  min="1"
                />
                <button
                  onClick={() => setEditMaxOrders(editMaxOrders + 1)}
                  className="bg-[#690003] text-white size-6 rounded flex items-center justify-center hover:bg-[#8B0000] cursor-pointer transition-all duration-500 ease-in-out"
                >
                  +
                </button>
              </div>
            </div>
            )}

            {/* Due Date */}
            <div className="flex flex-col items-center justify-baseline gap-2">
              <label className="font-bold text-[#690003]">Due Date</label>
              <DatePickerPopover
                deadline={editDueDate}
                onDeadlineChange={(date) => date && setEditDueDate(date)}
              />
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
            <input
              type="text"
              placeholder="Enter in Employee Name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white shadow-sm/15 text-sm focus:outline-none focus:border focus:border-[#690003]"
            />
          </div>
          
          {/* Assign/Remove Employees */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-[#690003]">
              Assign/Remove Employees
              <span className="bg-gray-50 px-2 py-0.5 rounded-full ml-2 shadow-sm/15">
                {editAssignedEmployees.length}
              </span>
            </h4>
            <div className="bg-white rounded-xl p-4 border-2 border-gray-300 min-h-[10vh] max-h-[30vh] overflow-y-auto">
              <div className="space-y-2">
                {filteredEmployees.map((emp) => {
                  const isDisabled = disabledEmployeeIds.has(emp.id);
                  const isSelected = editAssignedEmployees.includes(emp.id);

                  return (
                    <div
                      key={emp.id}
                      className={`flex items-center gap-2 p-1.5 rounded ${
                        isDisabled
                          ? 'opacity-50 cursor-not-allowed bg-gray-100'
                          : 'hover:bg-gray-50 cursor-pointer transition-all duration-300 ease-in-out'
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
                        className="w-5 h-5 rounded cursor-pointer accent-[#690003] disabled:cursor-not-allowed"
                      />
                      <div className="flex-1">
                        <p className="text-base font-medium text-gray-800">{emp.name}</p>
                        <p className="text-sm text-gray-500">{emp.empId}</p>
                      </div>
                      {isDisabled && (
                        <span className="text-xs text-gray-500 ml-2">Already assigned</span>
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
            className="bg-[#690003] hover:bg-[#af3b3f] text-white cursor-pointer transition-all duration-500 ease-in-out"
          >
            {isProcessing ? 'Saving...' : 'Confirm'}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancelEdit}
            disabled={isProcessing}
            className="border-gray-300 hover:bg-gray-200 cursor-pointer transition-all duration-500 ease-in-out"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
