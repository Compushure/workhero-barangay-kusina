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
import { useTaskAssignment } from '../../../task-assignment-page-context';
import { useEffect, useState } from 'react';
import { handleFetchEmployeeList } from '@/action-handlers/manager-assignment';

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
  // ✅ Renamed to avoid duplicate identifier
  const { assignedTasks: contextAssignedTasks } = useTaskAssignment();

  // ✅ Fetch employees from DB instead of mock data
  const [employees, setEmployees] = useState<AssignedEmployee[]>([]);
  useEffect(() => {
    async function loadEmployees() {
      const data = await handleFetchEmployeeList();
      setEmployees(data);
    }
    loadEmployees();
  }, []);

  // Get all employees assigned to other instances of this task
  const otherTaskInstanceEmployees = new Set<string>();
  (contextAssignedTasks ?? []).forEach((assignedTask) => {
    if (assignedTask.taskId === task.taskId && assignedTask.id !== task.id) {
      (assignedTask.assignedEmployees ?? []).forEach((emp) => {
        otherTaskInstanceEmployees.add(emp.id);
      });
    }
  });

  // An employee is disabled if they're assigned to another instance of this task
  const disabledEmployeeIds = new Set<string>(
    Array.from(otherTaskInstanceEmployees).filter((empId) => !editAssignedEmployees.includes(empId))
  );

  return (
    <Dialog open={showEditDialog} onOpenChange={(open) => !open && handleCancelEdit()}>
      <DialogContent className="bg-[#FBF4E8] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#690003]">Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Info */}
          <div className="bg-white rounded-xl p-4 border-2 border-gray-300">
            <h4 className="text-lg font-bold text-[#690003] mb-2">{task.taskName}</h4>
            <p className="text-sm text-gray-600">{task.points}pts / attempt</p>
          </div>

          {/* Max Repeats */}
          {task.isRepeatable && (
            <div className="flex items-center gap-4">
              <label className="font-bold text-[#690003]">Max Repeats</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditMaxOrders(Math.max(1, editMaxOrders - 1))}
                  className="bg-[#690003] text-white w-8 h-8 rounded flex items-center justify-center hover:bg-[#8B0000]"
                >
                  −
                </button>
                <input
                  type="number"
                  value={editMaxOrders}
                  onChange={(e) =>
                    setEditMaxOrders(Math.max(1, Number.parseInt(e.target.value) || 1))
                  }
                  className="remove-arrow w-12 text-center border border-gray-300 rounded px-2 py-1 font-sans bg-[#fafafa]"
                  min="1"
                />
                <button
                  onClick={() => setEditMaxOrders(editMaxOrders + 1)}
                  className="bg-[#690003] text-white w-8 h-8 rounded flex items-center justify-center hover:bg-[#8B0000]"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Due Date */}
          <div className="flex items-center gap-4">
            <label className="font-bold text-[#690003]">Due Date</label>
            <DatePickerPopover
              deadline={editDueDate}
              onDeadlineChange={(date) => date && setEditDueDate(date)}
            />
          </div>

          {/* Assign/Remove Employees */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#690003]">Assign/Remove Employees</h4>
            <div className="bg-white rounded-xl p-4 border-2 border-gray-300 max-h-75 overflow-y-auto">
              <div className="space-y-2">
                {employees.map((emp) => {
                  const isDisabled = disabledEmployeeIds.has(emp.id);
                  const isSelected = editAssignedEmployees.includes(emp.id);

                  return (
                    <div
                      key={emp.id}
                      className={`flex items-center gap-3 p-2 rounded ${
                        isDisabled
                          ? 'opacity-50 cursor-not-allowed bg-gray-100'
                          : 'hover:bg-gray-50 cursor-pointer'
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
                        <p className="font-medium text-gray-800">{emp.name}</p>
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

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancelEdit}
            disabled={isProcessing}
            className="border-gray-300 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditTask}
            disabled={editAssignedEmployees.length === 0 || isProcessing}
            className="bg-[#690003] hover:bg-[#8B0000] text-white disabled:opacity-50"
          >
            {isProcessing ? 'Saving...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
