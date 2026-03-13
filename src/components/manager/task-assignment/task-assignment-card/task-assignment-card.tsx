'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { AssignEmployeesDialog } from './dialogs/assign-employees-dialog';
import { SelectTasksDialog } from './dialogs/select-task-dialog';
import { DatePickerPopover } from './date-picker-popover';
import type { AssignedEmployee, Task } from '@/types';
import ClearSelectionDialog from './dialogs/clear-selection-dialog';
import { useTaskAssignment } from '../task-assignment-page-context';
import {
  handleFetchTaskList,
  handleFetchEmployeeList,
} from '@/action-handlers/manager/assignments';
import {
  useGetCurrentAssignedTasksPaginated,
  managerAssignmentKeys,
} from '@/hooks/tanstack/queries/managerAssignmentQueries';
import { TaskAssignmentCardSkeleton } from './task-assignment-card-skeleton';

// Shadcn UI Dialog imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

interface TaskAssignmentCardProps {
  // ✅ Removed onInitialLoadChange - component manages its own loading state
}

export function TaskAssignmentCard({}: TaskAssignmentCardProps) {
  const { assignTasks, assignedTasks } = useTaskAssignment();
  const queryClient = useQueryClient();

  // ✅ Reduced from 1000 to 100 - card only needs to check task assignment status
  // This significantly reduces network payload and processing time
  const assignedTasksQuery = useGetCurrentAssignedTasksPaginated(
    1,
    100,
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // NEW STATES
  const [showAssignConfirm, setShowAssignConfirm] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Calculate total employees count
  const [totalEmployees, setTotalEmployees] = useState(0);

  useEffect(() => {
    async function loadData() {
      setIsInitialLoading(true);
      // ✅ Fetch both in parallel - both are already imported at top level
      const [tasks, employees] = await Promise.all([
        handleFetchTaskList(),
        handleFetchEmployeeList(),
      ]);
      setAvailableTasks(tasks);
      setTotalEmployees(employees.length);
      setIsInitialLoading(false);
    }
    loadData();
  }, []);

  // Calculate if selected task is fully assigned (all employees assigned)
  const isSelectedTaskFullyAssigned = useMemo(() => {
    if (selectedTask.length === 0 || totalEmployees === 0) return false;

    const taskId = selectedTask[0];
    const taskEmployeeIds = new Set<string>();

    assignedTasksForAssign.forEach((assignment) => {
      if (assignment.taskId === taskId) {
        assignment.assignedEmployees.forEach((emp) => {
          taskEmployeeIds.add(emp.id);
        });
      }
    });

    return taskEmployeeIds.size >= totalEmployees;
  }, [selectedTask, assignedTasksForAssign, totalEmployees]);

  // Clear selected employees when selected task becomes fully assigned
  useEffect(() => {
    if (isSelectedTaskFullyAssigned && selectedEmployees.length > 0) {
      setSelectedEmployees([]);
    }
  }, [isSelectedTaskFullyAssigned, selectedEmployees.length]);

  const handleTasksChange = useCallback((tasks: string[], maxRepeats?: Record<string, number>) => {
    setselectedTask(tasks);
    if (maxRepeats) {
      setTaskMaxRepeats(maxRepeats);
    }
    if (tasks.length > 0) {
      setShowTaskWarning(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setSelectedEmployees([]);
    setselectedTask([]);
    setTaskMaxRepeats({});
    setSelectedDeadline(null);
    setShowClearConfirm(false);
    setShowTaskWarning(false);
  }, []);

  const handleAssign = useCallback(async () => {
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

      // Call clear logic directly instead of through closure
      setSelectedEmployees([]);
      setselectedTask([]);
      setTaskMaxRepeats({});
      setSelectedDeadline(null);
      setShowAssignConfirm(false);
      setIsAssigning(false);
    }
  }, [selectedEmployees, selectedTask, selectedDeadline, taskMaxRepeats, assignTasks, queryClient]);

  const handleEmployeesDialogAttempt = useCallback(() => {
    if (selectedTask.length === 0) {
      setShowTaskWarning(true);
    }
  }, [selectedTask.length]);

  const getSelectedTaskName = useCallback(() => {
    if (selectedTask.length === 0) return 'Select Task';
    const task = availableTasks.find((t) => t.id === selectedTask[0]);
    return task?.name || 'Select Task';
  }, [selectedTask, availableTasks]);

  if (isInitialLoading) {
    return <TaskAssignmentCardSkeleton />;
  }

  return (
    <div className="rounded-2xl bg-background-soft p-3 sm:p-4 md:px-7 py-5 shadow-sm/25">
      <h2 className="text-h2 mb-4 text-primary">Assign Employees for Task</h2>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        <div className="w-full sm:w-auto sm:min-w-44">
          <SelectTasksDialog
            selectedTask={selectedTask}
            onTasksChange={handleTasksChange}
            assignedTasks={assignedTasksForAssign}
            buttonLabel={getSelectedTaskName()}
          />
        </div>

        <div className="w-full sm:w-auto" onClick={handleEmployeesDialogAttempt}>
          <AssignEmployeesDialog
            selectedEmployees={selectedEmployees}
            onEmployeesChange={setSelectedEmployees}
            disabled={selectedTask.length === 0}
            selectedTaskIds={selectedTask}
            assignedTasks={assignedTasksForAssign}
          />
        </div>

        <div className="w-full sm:w-auto">
          <DatePickerPopover deadline={selectedDeadline} onDeadlineChange={setSelectedDeadline} />
        </div>
      </div>

      {showTaskWarning && (
        <p className="text-meta text-red-600 my-2 transition-all duration-500 ease-in-out">
          Select a task first before assigning employees.
        </p>
      )}

      {/* Action Buttons */}
      <div className="mt-3 flex justify-end">
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setShowAssignConfirm(true)}
            disabled={
              isAssigning ||
              selectedEmployees.length === 0 ||
              selectedTask.length === 0 ||
              !selectedDeadline
            }
            className="text-button flex-1 sm:flex-initial sm:w-auto bg-primary-gradient hover:bg-primary-gradient hover:brightness-85 text-card px-4 sm:px-10 cursor-pointer transition-all duration-500 ease-in-out disabled:bg-foreground disabled:opacity-50 disabled:brightness-50 disabled:cursor-not-allowed shadow-sm/25 h-9"
          >
            {isAssigning ? 'Assigning...' : 'Assign'}
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowClearConfirm(true)}
            className="text-button flex-1 sm:flex-initial sm:w-auto text-primary bg-white hover:bg-gray-100 hover:text-accent px-4 sm:px-10 cursor-pointer transition-all duration-500 ease-in-out shadow-sm/25 h-9"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Clear Confirmation Dialog */}
      <ClearSelectionDialog
        showClearConfirm={showClearConfirm}
        setShowClearConfirm={setShowClearConfirm}
        handleClear={handleClear}
      />

      {/* Assign Confirmation Dialog */}
      <Dialog open={showAssignConfirm} onOpenChange={setShowAssignConfirm}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl transition-all duration-500 ease-in-out bg-card">
          <DialogHeader>
            <DialogTitle className="text-h2 text-foreground">Confirm Assignment</DialogTitle>
            <DialogDescription className="text-meta">
              Are you sure you want to assign this task to the selected employees?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              onClick={handleAssign}
              disabled={isAssigning}
              className="text-button bg-foreground hover:bg-accent text-white cursor-pointer transition-all duration-500 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed px-6 shadow-sm/25 h-9"
            >
              {isAssigning ? 'Assigning...' : 'Confirm'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAssignConfirm(false)}
              className="border-zinc-400 bg-white hover:bg-gray-100 px-8 cursor-pointer transition-all duration-500 ease-in-out shadow-sm/25"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
