'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
// import { AssignedTask, AssignedEmployee, SelectedFilters } from '@/types';
import {
  handleDeleteTask,
  handleClearUnstartedTaskAssignments,
} from '@/action-handlers/manager/assigned-tasks';
import { handleAddTaskAssignment } from '@/action-handlers/manager/assignments';
import { AssignedTask, AssignedEmployee, SelectedFilters, Task } from '@/types';
// import { handleDeleteTask, handleClearAssignedTasks } from '@/action-handlers/manager/assigned-tasks';
import { useManagerAssignmentStore } from '@/store/managerAssignmentStore';
import { useAddTaskAssignmentMutation } from '@/hooks/tanstack/mutations/managerAssignmentMutations';
import { toManilaDeadlineISOString } from '@/utils/date-utils';

interface TaskAssignmentContextType {
  assignedTasks: AssignedTask[];
  viewMode: 'task' | 'employee';
  setViewMode: (mode: 'task' | 'employee') => void;
  assignTasks: (filters: SelectedFilters, options?: { availableTasks?: Task[] }) => Promise<void>;
  removeAssignment: (taskId: string, employeeId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  editTask: (
    taskId: string,
    maxOrders: number,
    newDueDate: string,
    newEmployees: AssignedEmployee[]
  ) => void;
  clearUnstarted: () => Promise<void>;
  clearUnstartedEmployeeTasks: (employeeId: string) => void;
  setAssignedTasks: (tasks: AssignedTask[]) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
}

const TaskAssignmentContext = createContext<TaskAssignmentContextType | undefined>(undefined);

export function TaskAssignmentProvider({ children }: { children: React.ReactNode }) {
  const { assignedTasks, setAssignedTasks, updateAssignedTasks, appendAssignedTasks } =
    useManagerAssignmentStore();
  const [viewMode, setViewMode] = useState<'task' | 'employee'>('task');
  const addTaskAssignmentMutation = useAddTaskAssignmentMutation();

  // ✅ Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Remove duplicate API call - let the component handle data fetching

  // Server action for assigning tasks
  const assignTasks = async (filters: SelectedFilters, options?: { availableTasks?: Task[] }) => {
    if (filters.employees.length === 0 || filters.tasks.length === 0) return;

    try {
      const startDate = new Date().toISOString();
      const endDate =
        toManilaDeadlineISOString(filters.deadline ?? new Date()) ?? new Date().toISOString();

      for (const taskSelection of filters.tasks) {
        const selectedTask = options?.availableTasks?.find((task) => task.id === taskSelection.id);
        const employeeIds = filters.employees.map((emp) => emp.id);
        const optimisticTask: AssignedTask = {
          id: `optimistic-${taskSelection.id}-${Date.now()}`,
          taskId: taskSelection.id,
          taskName: selectedTask?.name ?? 'Task',
          taskDescription: selectedTask?.type ?? 'General',
          isRepeatable: selectedTask?.isRepeatable ?? false,
          points: selectedTask?.points ?? 0,
          xp: selectedTask?.xp ?? 0,
          status: 'assigned',
          dateRange: {
            start: startDate,
            end: endDate,
          },
          maxOrders: taskSelection.maxOrders,
          assignedEmployees: filters.employees.map((employee) => ({
            ...employee,
            assignedTasks: [],
            status: 'assigned',
          })),
        };

        await addTaskAssignmentMutation.mutateAsync({
          taskId: taskSelection.id,
          employeeIds,
          startDate,
          endDate,
          maxOrders: taskSelection.maxOrders,
          optimisticTasks: [optimisticTask],
        });
      }
    } catch (error) {
      console.error('Error assigning tasks:', error);
    }
  };

  const removeAssignment = async (taskId: string, employeeId: string) => {
    // Call server action to delete from database
    const success = await handleDeleteTask(taskId);

    if (success) {
      // Only update local state if server deletion succeeded
      updateAssignedTasks((prev) =>
        prev
          .map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  assignedEmployees: task.assignedEmployees.filter((e) => e.id !== employeeId),
                }
              : task
          )
          .filter((task) => task.assignedEmployees.length > 0)
      );
    }
  };

  const deleteTask = async (taskId: string) => {
    const success = await handleDeleteTask(taskId);
    if (success) {
      updateAssignedTasks((prev) => prev.filter((task) => task.id !== taskId));
    }
  };

  const editTask = (
    taskId: string,
    maxOrders: number,
    newDueDate: string,
    newEmployees: AssignedEmployee[]
  ) => {
    updateAssignedTasks((prev) =>
      prev
        .map((task) =>
          task.id === taskId
            ? {
                ...task,
                maxOrders,
                dateRange: { ...task.dateRange, end: newDueDate },
                assignedEmployees: newEmployees,
              }
            : task
        )
        .filter((task) => task.assignedEmployees.length > 0)
    );
  };

  const clearUnstarted = async () => {
    await handleClearUnstartedTaskAssignments();
  };

  const clearUnstartedEmployeeTasks = (employeeId: string) => {
    updateAssignedTasks((prev) =>
      prev
        .map((task) => ({
          ...task,
          assignedEmployees: task.assignedEmployees.filter(
            (e) =>
              !(
                e.id === employeeId &&
                (e.status?.trim().toLowerCase() ?? 'assigned') === 'assigned' &&
                (e.completedOrders ?? 0) === 0 &&
                (e.pendingOrders ?? 0) === 0
              )
          ),
        }))
        .filter((task) => task.assignedEmployees.length > 0)
    );
  };

  const value = useMemo(
    () => ({
      assignedTasks,
      viewMode,
      setViewMode,
      assignTasks,
      removeAssignment,
      deleteTask,
      editTask,
      clearUnstarted,
      clearUnstartedEmployeeTasks,
      setAssignedTasks,
      page,
      setPage,
      totalPages,
      setTotalPages,
    }),
    [assignedTasks, viewMode, page, totalPages, setAssignedTasks, updateAssignedTasks]
  );

  return <TaskAssignmentContext.Provider value={value}>{children}</TaskAssignmentContext.Provider>;
}

export function useTaskAssignment() {
  const context = useContext(TaskAssignmentContext);
  if (!context) throw new Error('useTaskAssignment must be used within TaskAssignmentProvider');
  return context;
}
