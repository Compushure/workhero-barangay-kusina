'use client';

import { useEffect, useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { AssignEmployeesDialog } from './dialogs/assign-employees-dialog';
import { SelectTasksDialog } from './dialogs/select-task-dialog';
import { DatePickerPopover } from './date-picker-popover';
import type { AssignedEmployee, Task } from '@/types';
import ClearSelectionDialog from './dialogs/clear-selection-dialog';
import { useTaskAssignment } from '../task-assignment-page-context';
import { handleFetchTaskList } from '@/action-handlers/manager/assignments';
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
  DialogDescription,
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

  // Calculate total employees count
  const [totalEmployees, setTotalEmployees] = useState(0);

  useEffect(() => {
    async function loadData() {
      const [tasks, employees] = await Promise.all([
        handleFetchTaskList(),
        import('@/action-handlers/manager/assignments').then((m) => m.handleFetchEmployeeList()),
      ]);
      setAvailableTasks(tasks);
      setTotalEmployees(employees.length);
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
    <div className="rounded-3xl bg-background p-4 sm:p-6 shadow-sm/25">
      <h2 className="mb-5 sm:mb-7 text-xl sm:text-2xl font-semibold text-[#131C2A]">Assign Employees for Task</h2>

      <div className="flex flex-wrap gap-3 sm:gap-4">
        <div className="w-full sm:w-auto sm:min-w-50">
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
        <p className="text-red-600 text-sm mb-4 font-medium transition-all duration-500 ease-in-out">
          Select a task first before assigning employees.
        </p>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
        <Button
          onClick={() => setShowAssignConfirm(true)}
          disabled={
            isAssigning ||
            selectedEmployees.length === 0 ||
            selectedTask.length === 0 ||
            !selectedDeadline
          }
          className="w-full sm:w-auto bg-primary-gradient hover:bg-primary-gradient hover:brightness-85 text-card cursor-pointer transition-all duration-500 ease-in-out disabled:bg-foreground disabled:opacity-50 disabled:brightness-50 disabled:cursor-not-allowed px-6 sm:px-12 shadow-sm/25"
        >
          {isAssigning ? 'Assigning...' : 'Assign'}
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowClearConfirm(true)}
          className="w-full sm:w-auto text-primary bg-white hover:bg-gray-100 hover:text-accent px-6 sm:px-12 cursor-pointer transition-all duration-500 ease-in-out shadow-sm/25"
        >
          Clear
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
        <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl transition-all duration-500 ease-in-out bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Confirm Assignment
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to assign this task to the selected employees?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 justify-end">
            <Button
              onClick={handleAssign}
              disabled={isAssigning}
              className="bg-foreground hover:bg-accent text-white cursor-pointer transition-all duration-500 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed px-8 shadow-sm/25"
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
