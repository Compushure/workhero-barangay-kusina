'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { AssignEmployeesDialog } from './dialogs/assign-employees-dialog';
import { SelectTasksDialog } from './dialogs/select-task-dialog';
import { DatePickerPopover } from './date-picker-popover';
import type { AssignedEmployee, Task } from '@/types';
import ClearSelectionDialog from './dialogs/clear-selection-dialog';
import { useTaskAssignment } from '../task-assignment-page-context';
import { handleFetchTaskList } from '@/action-handlers/manager-assignment';
import {
  useGetCurrentAssignedTasksPaginated,
  managerAssignmentKeys,
} from '@/hooks/tanstack/queries/managerAssignmentQueries';

// Shadcn UI Dialog imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export function TaskAssignmentCard() {
  const { assignTasks, assignedTasks } = useTaskAssignment();
  const queryClient = useQueryClient();

  const assignedTasksQuery = useGetCurrentAssignedTasksPaginated(
    1,
    1000,
    'recently added',
    '',
    true
  );
  const assignedTasksForAssign = assignedTasksQuery.data?.tasks ?? assignedTasks;

  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<AssignedEmployee[]>([]);
  const [selectedTask, setselectedTask] = useState<string[]>([]);
  const [taskMaxRepeats, setTaskMaxRepeats] = useState<Record<string, number>>({});
  const [selectedDeadline, setSelectedDeadline] = useState<Date | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showTaskWarning, setShowTaskWarning] = useState(false);

  // NEW STATES
  const [showAssignConfirm, setShowAssignConfirm] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    async function loadTasks() {
      const tasks = await handleFetchTaskList();
      setAvailableTasks(tasks);
    }
    loadTasks();
  }, []);

  const handleTasksChange = (tasks: string[], maxRepeats?: Record<string, number>) => {
    setselectedTask(tasks);
    if (maxRepeats) {
      setTaskMaxRepeats(maxRepeats);
    }
    if (tasks.length > 0) {
      setShowTaskWarning(false);
    }
  };

  const handleAssign = async () => {
    if (selectedEmployees.length > 0 && selectedTask.length > 0 && selectedDeadline) {
      setIsAssigning(true);

      await assignTasks({
        employees: selectedEmployees,
        tasks: selectedTask.map((id) => ({
          id,
          maxOrders: taskMaxRepeats[id] || 1,
        })),
        deadline: selectedDeadline,
      });

      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.employees() });

      handleClear();
      setIsAssigning(false);
      setShowAssignConfirm(false);
    }
  };

  const handleClear = () => {
    setSelectedEmployees([]);
    setselectedTask([]);
    setTaskMaxRepeats({});
    setSelectedDeadline(null);
    setShowClearConfirm(false);
    setShowTaskWarning(false);
  };

  const handleEmployeesDialogAttempt = () => {
    if (selectedTask.length === 0) {
      setShowTaskWarning(true);
    }
  };

  const getSelectedTaskName = () => {
    if (selectedTask.length === 0) return 'Select Task';
    const task = availableTasks.find((t) => t.id === selectedTask[0]);
    return task?.name || 'Select Task';
  };

  return (
    <div className="rounded-xl bg-[#FBF4E8] p-4 pt-2 shadow-sm/25 mb-5">
      <h2 className="mb-3 text-xl font-bold text-[#690003]">Assign Employees for Task</h2>

      <div className="flex flex-wrap gap-4 mb-2">
        <div className="min-w-50">
          <SelectTasksDialog
            selectedTask={selectedTask}
            onTasksChange={handleTasksChange}
            assignedTasks={assignedTasksForAssign}
            buttonLabel={getSelectedTaskName()}
          />
        </div>

        <div onClick={handleEmployeesDialogAttempt}>
          <AssignEmployeesDialog
            selectedEmployees={selectedEmployees}
            onEmployeesChange={setSelectedEmployees}
            disabled={selectedTask.length === 0}
            selectedTaskIds={selectedTask}
            assignedTasks={assignedTasksForAssign}
          />
        </div>

        <DatePickerPopover deadline={selectedDeadline} onDeadlineChange={setSelectedDeadline} />
      </div>

      {showTaskWarning && (
        <p className="text-red-600 text-sm mb-4 font-medium transition-all duration-500 ease-in-out">
          Select a task first before assigning employees.
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => setShowClearConfirm(true)}
          disabled={
            isAssigning ||
            selectedEmployees.length === 0 ||
            selectedTask.length === 0 ||
            !selectedDeadline
          }
          className="text-black bg-white hover:bg-gray-100 px-12 cursor-pointer transition-all duration-500 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-sm/25"
        >
          Clear
        </Button>
        <Button
          onClick={() => setShowAssignConfirm(true)}
          disabled={
            isAssigning ||
            selectedEmployees.length === 0 ||
            selectedTask.length === 0 ||
            !selectedDeadline
          }
          className="bg-[#690003] hover:bg-red-700 text-white cursor-pointer transition-all duration-500 ease-in-out disabled:opacity-50 disabled:shadow-sm/25 disabled:cursor-not-allowed px-12 shadow-sm/25"
        >
          {isAssigning ? 'Assigning...' : 'Assign'}
        </Button>
      </div>

      {/* Clear Confirmation Dialog */}
      <ClearSelectionDialog
        showClearConfirm={showClearConfirm}
        setShowClearConfirm={setShowClearConfirm}
        handleClear={handleClear}
      />

      {/* Assign Confirmation Dialog */}
      <Dialog open={showAssignConfirm} onOpenChange={setShowAssignConfirm}>
        <DialogContent className="transition-all duration-500 ease-in-out">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#690003]">
              Confirm Assignment
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to assign this task to the selected employees?
          </p>
          <DialogFooter className="flex gap-3 justify-end">
            <Button
              onClick={handleAssign}
              disabled={isAssigning}
              className="bg-[#690003] hover:bg-red-700 text-white cursor-pointer transition-all duration-500 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed px-8 shadow-sm/25"
            >
              {isAssigning ? 'Assigning...' : 'Confirm'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAssignConfirm(false)}
              className="text-black bg-white hover:bg-gray-100 px-8 cursor-pointer transition-all duration-500 ease-in-out shadow-sm/25"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
