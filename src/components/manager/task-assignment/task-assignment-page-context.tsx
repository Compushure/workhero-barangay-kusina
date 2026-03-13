'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { AssignedTask, AssignedEmployee, SelectedFilters } from '@/types';
import {
  handleDeleteTask,
  handleClearUnstartedAssignedTasks,
} from '@/action-handlers/manager/assigned-tasks';
import { handleAddTaskAssignment } from '@/action-handlers/manager/assignments';
import { useManagerAssignmentStore } from '@/store/managerAssignmentStore';

interface TaskAssignmentContextType {
  assignedTasks: AssignedTask[];
  viewMode: 'task' | 'employee';
  setViewMode: (mode: 'task' | 'employee') => void;
  assignTasks: (filters: SelectedFilters) => Promise<void>;
  removeAssignment: (taskId: string, employeeId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  editTask: (
    taskId: string,
    maxOrders: number,
    newDueDate: string,
    newEmployees: AssignedEmployee[]
  ) => void;
  clearUnstarted: () => Promise<void>;
  clearAllEmployeeTasks: (employeeId: string) => void;
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

  // ✅ Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Remove duplicate API call - let the component handle data fetching

  // Server action for assigning tasks
  const assignTasks = async (filters: SelectedFilters) => {
    if (filters.employees.length === 0 || filters.tasks.length === 0) return;

    try {
      const startDate = new Date().toISOString();
      const endDate = filters.deadline ? filters.deadline.toISOString() : new Date().toISOString();

      // Create assignments for each task-employee combination
      for (const taskSelection of filters.tasks) {
        const employeeIds = filters.employees.map((emp) => emp.id);
        const newAssignments = await handleAddTaskAssignment(
          taskSelection.id,
          employeeIds,
          startDate,
          endDate,
          taskSelection.maxOrders
        );

        // Add the new assignments to local state for immediate UI update
        if (newAssignments.length > 0) {
          appendAssignedTasks(newAssignments);
        }
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
    await handleClearUnstartedAssignedTasks();
  };

  const clearAllEmployeeTasks = (employeeId: string) => {
    updateAssignedTasks((prev) =>
      prev
        .map((task) => ({
          ...task,
          assignedEmployees: task.assignedEmployees.filter((e) => e.id !== employeeId),
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
      clearAllEmployeeTasks,
      setAssignedTasks,
      page,
      setPage,
      totalPages,
      setTotalPages,
    }),
    [
      assignedTasks,
      viewMode,
      page,
      totalPages,
      setAssignedTasks,
      updateAssignedTasks,
      appendAssignedTasks,
    ]
  );

  return <TaskAssignmentContext.Provider value={value}>{children}</TaskAssignmentContext.Provider>;
}

export function useTaskAssignment() {
  const context = useContext(TaskAssignmentContext);
  if (!context) throw new Error('useTaskAssignment must be used within TaskAssignmentProvider');
  return context;
}
