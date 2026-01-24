'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DatePickerPopover } from '../../../task-assignment-card/date-picker-popover';
import { MOCK_EMPLOYEES } from '@/mock-data/employees';
import { Button } from '@/components/ui/button';
import { AssignedTask } from '@/types';
import { useTaskAssignment } from '../../../task-assignment-page-context';

interface EditTaskDialogProps {
  showEditDialog: boolean;
  handleCancelEdit: () => void;
  handleEditTask: () => void;
  task: AssignedTask;
  editMaxAttempts: number;
  setEditMaxAttempts: (edit: number) => void;
  editDueDate: Date;
  setEditDueDate: (edit: Date) => void;
  editAssignedEmployees: string[];
  toggleEmployee: (empId: string) => void;
}

export default function EditTaskDialog({
  showEditDialog,
  handleCancelEdit,
  handleEditTask,
  task,
  editMaxAttempts,
  setEditMaxAttempts,
  editDueDate,
  setEditDueDate,
  editAssignedEmployees,
  toggleEmployee,
}: EditTaskDialogProps) {
  const { assignedTasks } = useTaskAssignment();

  // Get all employees assigned to other instances of this task
  const otherTaskInstanceEmployees = new Set<string>();
  assignedTasks.forEach((assignedTask) => {
    // Find other instances of the same task (different IDs but same taskId)
    if (assignedTask.taskId === task.taskId && assignedTask.id !== task.id) {
      assignedTask.assignedEmployees.forEach((emp) => {
        otherTaskInstanceEmployees.add(emp.id);
      });
    }
  });

  // An employee is disabled if they're assigned to another instance of this task
  // (unless they're already assigned to this instance)
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
          {/* Task Info (Read-only display) */}
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
                  onClick={() => setEditMaxAttempts(Math.max(1, editMaxAttempts - 1))}
                  className="bg-[#690003] text-white w-8 h-8 rounded flex items-center justify-center hover:bg-[#8B0000]"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold">{editMaxAttempts}</span>
                <button
                  onClick={() => setEditMaxAttempts(editMaxAttempts + 1)}
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
                {MOCK_EMPLOYEES.map((emp) => {
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
                        <p className="text-sm text-gray-500">
                          {emp.empId} - {emp.tenure}
                        </p>
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
            className="border-gray-300 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditTask}
            disabled={editAssignedEmployees.length === 0}
            className="bg-[#690003] hover:bg-[#8B0000] text-white disabled:opacity-50"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
