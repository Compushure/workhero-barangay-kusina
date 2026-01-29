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

export function TaskAssignmentCard() {
  const { assignTasks, assignedTasks } = useTaskAssignment();
  const queryClient = useQueryClient();

  const assignedTasksQuery = useGetCurrentAssignedTasksPaginated(1, 4, 'recently added', '', true);
  const assignedTasksForAssign = assignedTasksQuery.data?.tasks ?? assignedTasks;

  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<AssignedEmployee[]>([]);
  const [selectedTask, setselectedTask] = useState<string[]>([]);
  const [taskMaxRepeats, setTaskMaxRepeats] = useState<Record<string, number>>({});
  const [selectedDeadline, setSelectedDeadline] = useState<Date | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showTaskWarning, setShowTaskWarning] = useState(false);

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
      // Your dialog logic currently supports single task selection
      const taskId = selectedTask[0];
      const employeeIds = selectedEmployees.map((emp) => emp.id);
      const startDate = new Date().toISOString();
      const endDate = selectedDeadline.toISOString();
      const maxOrders = taskMaxRepeats[taskId] || 1;

      // Call the server action handler - this will update the context automatically
      await assignTasks({
        employees: selectedEmployees,
        tasks: selectedTask.map((id) => ({
          id,
          maxOrders: taskMaxRepeats[id] || 1,
        })),
        deadline: selectedDeadline,
      });

      // Ensure assignment lists refresh for disabled employee calculations
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.employees() });

      handleClear();
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
    <div className="rounded-3xl bg-[#FBF4E8] p-6 shadow-sm/25">
      <h2 className="mb-8 text-2xl font-bold text-[#690003]">Assign Employees for Task</h2>

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

        {/* Set Deadline */}
        <DatePickerPopover deadline={selectedDeadline} onDeadlineChange={setSelectedDeadline} />
      </div>

      {showTaskWarning && (
        <p className="text-red-600 text-sm mb-4 font-medium">
          Select a task first before assigning employees.
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end mt-6">
        <Button
          variant="outline"
          onClick={() => setShowClearConfirm(true)}
          className="text-black bg-white hover:bg-gray-100 px-12 cursor-pointer transition-all duration-500 ease-in-out shadow-sm/25"
        >
          Clear
        </Button>
        <Button
          onClick={handleAssign}
          disabled={
            selectedEmployees.length === 0 || selectedTask.length === 0 || !selectedDeadline
          }
          className="bg-[#690003] hover:bg-red-700 text-white cursor-pointer transition-all duration-500 ease-in-out disabled:opacity-50 disabled:shadow-sm/25 disabled:cursor-not-allowed px-12 shadow-sm/25"
        >
          Assign
        </Button>
      </div>

      {/* Clear Confirmation Dialog */}
      <ClearSelectionDialog
        showClearConfirm={showClearConfirm}
        setShowClearConfirm={setShowClearConfirm}
        handleClear={handleClear}
      />
    </div>
  );
}
