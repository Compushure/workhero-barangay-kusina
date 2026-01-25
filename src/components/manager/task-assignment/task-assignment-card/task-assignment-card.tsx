'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AssignEmployeesDialog } from './dialogs/assign-employees-dialog';
import { SelectTasksDialog } from './dialogs/select-task-dialog';
import { DatePickerPopover } from './date-picker-popover';
import type { AssignedEmployee, Task } from '@/types';
import { MOCK_TASKS } from '@/mock-data/employees';
import ClearSelectionDialog from './dialogs/clear-selection-dialog';
import { useTaskAssignment } from '../task-assignment-page-context';
<<<<<<< HEAD:src/components/Manager/Task-Assignment/task-assignment-card/task-assignment-card.tsx
import { handleAddTaskAssignment } from '@/action-handlers/manager-assignments';
=======
import { handleAddTaskAssignment } from '@/action-handlers/manager-assignment';
import { handleFetchTaskList } from '@/action-handlers/manager-assignment';
>>>>>>> 1051486b2122e9879d2d08c0d442e9583f67e6dd:src/components/manager/task-assignment/task-assignment-card/task-assignment-card.tsx

export function TaskAssignmentCard() {
  const { assignTasks, assignedTasks } = useTaskAssignment();

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
<<<<<<< HEAD:src/components/Manager/Task-Assignment/task-assignment-card/task-assignment-card.tsx
    if (selectedEmployees.length > 0 && selectedTasks.length > 0 && selectedDeadline) {
      // Your dialog logic currently supports single task selection
      const taskId = selectedTasks[0];
      const employeeIds = selectedEmployees.map((emp) => emp.id);
      const startDate = new Date().toISOString();
      const endDate = selectedDeadline.toISOString();
      const maxAttempts = taskMaxRepeats[taskId] || 1;
=======
      if (selectedEmployees.length > 0 && selectedTask.length > 0 && selectedDeadline) {
        // Your dialog logic currently supports single task selection
        const taskId = selectedTask[0]; 
        const employeeIds = selectedEmployees.map((emp) => emp.id);
        const startDate = new Date().toISOString();
        const endDate = selectedDeadline.toISOString();
        const maxAttempts = taskMaxRepeats[taskId] || 1;
>>>>>>> 1051486b2122e9879d2d08c0d442e9583f67e6dd:src/components/manager/task-assignment/task-assignment-card/task-assignment-card.tsx

      // Call the server action handler
      const success = await handleAddTaskAssignment(
        taskId,
        employeeIds,
        startDate,
        endDate,
        maxAttempts
      );

<<<<<<< HEAD:src/components/Manager/Task-Assignment/task-assignment-card/task-assignment-card.tsx
      if (success) {
        // If the DB update succeeded, update the local context so the
        // "disabling" logic in the dialogs sees the new assignments
        assignTasks({
          employees: selectedEmployees,
          tasks: selectedTasks.map((id) => ({
            id,
            maxAttempts: taskMaxRepeats[id] || 1,
          })),
          deadline: selectedDeadline,
        });
        handleClear();
=======
        if (success) {
          // If the DB update succeeded, update the local context so the 
          // "disabling" logic in the dialogs sees the new assignments
          assignTasks({
            employees: selectedEmployees,
            tasks: selectedTask.map((id) => ({
              id,
              maxAttempts: taskMaxRepeats[id] || 1,
            })),
            deadline: selectedDeadline,
          });
          handleClear();
        }
>>>>>>> 1051486b2122e9879d2d08c0d442e9583f67e6dd:src/components/manager/task-assignment/task-assignment-card/task-assignment-card.tsx
      }
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
    <div className="rounded-3xl bg-[#FBF4E8] p-8 shadow-sm/25">
      <h2 className="mb-8 text-2xl font-bold text-[#690003]">Assign Employees for Task</h2>

      <div className="flex flex-wrap gap-4 mb-2">
        <div className="min-w-50">
          <SelectTasksDialog
            selectedTask={selectedTask}
            onTasksChange={handleTasksChange}
            assignedTasks={assignedTasks}
            buttonLabel={getSelectedTaskName()}
          />
        </div>

        <div onClick={handleEmployeesDialogAttempt}>
          <AssignEmployeesDialog
            selectedEmployees={selectedEmployees}
            onEmployeesChange={setSelectedEmployees}
            disabled={selectedTask.length === 0}
            selectedTaskIds={selectedTask}
            assignedTasks={assignedTasks}
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
      <div className="flex gap-4 justify-end mt-6">
        <Button
          variant="outline"
          onClick={() => setShowClearConfirm(true)}
          className="border-gray-300 text-gray-700 bg-zinc-50 hover:bg-zinc-200 px-12"
        >
          Clear
        </Button>
        <Button
          onClick={handleAssign}
          disabled={
            selectedEmployees.length === 0 || selectedTask.length === 0 || !selectedDeadline
          }
          className="bg-[#690003] hover:bg-[#8B0000] text-white disabled:opacity-50 disabled:cursor-not-allowed px-12"
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
