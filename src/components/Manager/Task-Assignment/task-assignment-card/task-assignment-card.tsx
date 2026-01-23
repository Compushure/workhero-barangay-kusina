'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AssignEmployeesDialog } from './dialogs/assign-employees-dialog';
import { SelectTasksDialog } from './dialogs/select-task-dialog';
import { DatePickerPopover } from './date-picker-popover';
import type { SelectedFilters, AssignedEmployee, AssignedTask } from '@/types';
import { MOCK_TASKS } from '@/mock-data/employees';
import ClearSelectionDialog from './dialogs/clear-selection-dialog';
import { useTaskAssignment } from '../task-assignment-page-context';

export function TaskAssignmentCard() {
  const { assignTasks, assignedTasks } = useTaskAssignment();

  const [selectedEmployees, setSelectedEmployees] = useState<AssignedEmployee[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [taskMaxRepeats, setTaskMaxRepeats] = useState<Record<string, number>>({});
  const [selectedDeadline, setSelectedDeadline] = useState<Date | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showTaskWarning, setShowTaskWarning] = useState(false);

  const handleTasksChange = (tasks: string[], maxRepeats?: Record<string, number>) => {
    setSelectedTasks(tasks);
    if (maxRepeats) {
      setTaskMaxRepeats(maxRepeats);
    }
    if (tasks.length > 0) {
      setShowTaskWarning(false);
    }
  };

  const handleAssign = () => {
    if (selectedEmployees.length > 0 && selectedTasks.length > 0 && selectedDeadline) {
      assignTasks({
        employees: selectedEmployees,
        tasks: selectedTasks.map((taskId) => ({
          id: taskId,
          maxAttempts: taskMaxRepeats[taskId] || 1,
        })),
        deadline: selectedDeadline,
      });
      handleClear();
    }
  };

  const handleClear = () => {
    setSelectedEmployees([]);
    setSelectedTasks([]);
    setTaskMaxRepeats({});
    setSelectedDeadline(null);
    setShowClearConfirm(false);
    setShowTaskWarning(false);
  };

  const handleEmployeesDialogAttempt = () => {
    if (selectedTasks.length === 0) {
      setShowTaskWarning(true);
    }
  };

  const getSelectedTaskName = () => {
    if (selectedTasks.length === 0) return 'Select Task';
    const task = MOCK_TASKS.find((t) => t.id === selectedTasks[0]);
    return task?.name || 'Select Task';
  };

  return (
    <div className="rounded-3xl bg-[#FBF4E8] p-8 shadow-sm/25">
      <h2 className="mb-8 text-2xl font-bold text-[#690003]">Assign Employees for Task</h2>

      <div className="flex flex-wrap gap-4 mb-2">
        <div className="min-w-50">
          <SelectTasksDialog
            selectedTasks={selectedTasks}
            onTasksChange={handleTasksChange}
            assignedTasks={assignedTasks}
            buttonLabel={getSelectedTaskName()}
          />
        </div>

        <div onClick={handleEmployeesDialogAttempt}>
          <AssignEmployeesDialog
            selectedEmployees={selectedEmployees}
            onEmployeesChange={setSelectedEmployees}
            disabled={selectedTasks.length === 0}
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
            selectedEmployees.length === 0 || selectedTasks.length === 0 || !selectedDeadline
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
