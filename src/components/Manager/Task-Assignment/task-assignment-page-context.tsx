'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { AssignedTask, AssignedEmployee, SelectedFilters } from '@/types';
import {
  handleFetchCurrentAssignedTasksPaginated,
  handleDeleteTask,
  handleClearAllTasks,
} from '@/action-handlers/manager-current-assigned-task';
import { handleFetchEmployeeList } from '@/action-handlers/manager-assignment';

interface TaskAssignmentContextType {
  tasksById: Record<string, AssignedTask>;
  employees: AssignedEmployee[];
  viewMode: 'task' | 'employee';
  setViewMode: (mode: 'task' | 'employee') => void;
  assignTasks: (filters: SelectedFilters) => void;
  removeAssignment: (taskId: string, employeeId: string) => void;
  deleteTask: (taskId: string) => void;
  editTask: (
    taskId: string,
    maxOrders: number,
    newDueDate: string,
    newEmployees: AssignedEmployee[]
  ) => void;
  clearAll: () => void;
  clearAllEmployeeTasks: (employeeId: string) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

const TaskAssignmentContext = createContext<TaskAssignmentContextType | undefined>(undefined);

export function TaskAssignmentProvider({ children }: { children: React.ReactNode }) {
  const [tasksById, setTasksById] = useState<Record<string, AssignedTask>>({});
  const [employees, setEmployees] = useState<AssignedEmployee[]>([]);
  const [viewMode, setViewMode] = useState<'task' | 'employee'>('task');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // ✅ Load tasks with pagination
  useEffect(() => {
    const loadTasks = async () => {
      const res = await handleFetchCurrentAssignedTasksPaginated(page, 10);
      const newTasks: Record<string, AssignedTask> = {};
      res.tasks.forEach((t) => (newTasks[t.id] = t));
      setTasksById(newTasks);
      setTotalPages(res.totalPages);
    };
    loadTasks();
  }, [page]);

  // ✅ Fetch employees once globally
  useEffect(() => {
    handleFetchEmployeeList().then(setEmployees);
  }, []);

  const assignTasks = (filters: SelectedFilters) => {
    if (filters.employees.length === 0 || filters.tasks.length === 0) return;
    const newAssignments: Record<string, AssignedTask> = {};
    filters.tasks.forEach((taskSelection) => {
      const id = `${taskSelection.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      newAssignments[id] = {
        id,
        taskId: taskSelection.id,
        taskName: 'New Task',
        taskType: 'General',
        isRepeatable: false,
        points: 0,
        xp: 0,
        dateRange: {
          start: new Date().toISOString(),
          end: filters.deadline ? filters.deadline.toISOString() : new Date().toISOString(),
        },
        maxOrders: taskSelection.maxOrders,
        assignedEmployees: filters.employees,
      };
    });
    setTasksById((prev) => ({ ...prev, ...newAssignments }));
  };

  const removeAssignment = (taskId: string, employeeId: string) => {
    setTasksById((prev) => {
      const task = prev[taskId];
      if (!task) return prev;
      const updated = {
        ...task,
        assignedEmployees: task.assignedEmployees.filter((e) => e.id !== employeeId),
      };
      if (updated.assignedEmployees.length === 0) {
        const { [taskId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [taskId]: updated };
    });
  };

  const deleteTask = async (taskId: string) => {
    const success = await handleDeleteTask(taskId);
    if (success) {
      setTasksById((prev) => {
        const { [taskId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const editTask = (
    taskId: string,
    maxOrders: number,
    newDueDate: string,
    newEmployees: AssignedEmployee[]
  ) => {
    setTasksById((prev) => {
      const task = prev[taskId];
      if (!task) return prev;
      return {
        ...prev,
        [taskId]: {
          ...task,
          maxOrders,
          dateRange: { ...task.dateRange, end: newDueDate },
          assignedEmployees: newEmployees,
        },
      };
    });
  };

  const clearAll = async () => {
    const success = await handleClearAllTasks();
    if (success) setTasksById({});
  };

  const clearAllEmployeeTasks = (employeeId: string) => {
    setTasksById((prev) => {
      const updated: Record<string, AssignedTask> = {};
      Object.values(prev).forEach((task) => {
        const filteredEmployees = task.assignedEmployees.filter((e) => e.id !== employeeId);
        if (filteredEmployees.length > 0) {
          updated[task.id] = { ...task, assignedEmployees: filteredEmployees };
        }
      });
      return updated;
    });
  };

  const value = useMemo(
    () => ({
      tasksById,
      employees,
      viewMode,
      setViewMode,
      assignTasks,
      removeAssignment,
      deleteTask,
      editTask,
      clearAll,
      clearAllEmployeeTasks,
      page,
      setPage,
      totalPages,
    }),
    [tasksById, employees, viewMode, page, totalPages]
  );

  return <TaskAssignmentContext.Provider value={value}>{children}</TaskAssignmentContext.Provider>;
}

export function useTaskAssignment() {
  const context = useContext(TaskAssignmentContext);
  if (!context) throw new Error('useTaskAssignment must be used within TaskAssignmentProvider');
  return context;
}
