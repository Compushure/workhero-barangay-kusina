'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { AssignedTask, AssignedEmployee, SelectedFilters } from '@/types';
import {
  handleFetchCurrentAssignedTasksPaginated, // ✅ updated import
  handleDeleteTask,
  handleClearAllTasks,
} from '@/action-handlers/manager-current-assigned-task';

interface TaskAssignmentContextType {
  assignedTasks: AssignedTask[];
  viewMode: 'task' | 'employee';
  setViewMode: (mode: 'task' | 'employee') => void;
  assignTasks: (filters: SelectedFilters) => void;
  removeAssignment: (taskId: string, employeeId: string) => void;
  deleteTask: (taskId: string) => void;
  editTask: (
    taskId: string,
    maxAttempts: number,
    newDueDate: string,
    newEmployees: AssignedEmployee[]
  ) => void;
  clearAll: () => void;
  clearAllEmployeeTasks: (employeeId: string) => void;
  setAssignedTasks: React.Dispatch<React.SetStateAction<AssignedTask[]>>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

const TaskAssignmentContext = createContext<TaskAssignmentContextType | undefined>(undefined);

export function TaskAssignmentProvider({ children }: { children: React.ReactNode }) {
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [viewMode, setViewMode] = useState<'task' | 'employee'>('task');

  // ✅ Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // ✅ Load tasks from backend with pagination
  useEffect(() => {
    const loadTasks = async () => {
      const res = await handleFetchCurrentAssignedTasksPaginated(page, 10);
      setAssignedTasks(res.tasks);
      setTotalPages(res.totalPages);
    };
    loadTasks();
  }, [page]);

  // Local context update after assigning tasks
  const assignTasks = (filters: SelectedFilters) => {
    if (filters.employees.length === 0 || filters.tasks.length === 0) return;

    const newAssignments: AssignedTask[] = filters.tasks.map((taskSelection) => ({
      id: `${taskSelection.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      taskId: taskSelection.id,
      taskName: 'New Task', // category_name can be fetched if needed
      taskType: 'General',
      isRepeatable: false,
      points: 0,
      xp: 0,
      dateRange: {
        start: new Date().toISOString(),
        end: filters.deadline ? filters.deadline.toISOString() : new Date().toISOString(),
      },
      maxAttempts: taskSelection.maxAttempts,
      assignedEmployees: filters.employees,
    }));

    setAssignedTasks((prev) => [...prev, ...newAssignments]);
  };

  const removeAssignment = (taskId: string, employeeId: string) => {
    setAssignedTasks((prev) =>
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
  };

  const deleteTask = async (taskId: string) => {
    const success = await handleDeleteTask(taskId);
    if (success) {
      setAssignedTasks((prev) => prev.filter((task) => task.id !== taskId));
    }
  };

  const editTask = (
    taskId: string,
    maxAttempts: number,
    newDueDate: string,
    newEmployees: AssignedEmployee[]
  ) => {
    setAssignedTasks((prev) =>
      prev
        .map((task) =>
          task.id === taskId
            ? {
                ...task,
                maxAttempts,
                dateRange: { ...task.dateRange, end: newDueDate },
                assignedEmployees: newEmployees,
              }
            : task
        )
        .filter((task) => task.assignedEmployees.length > 0)
    );
  };

  const clearAll = async () => {
    const success = await handleClearAllTasks();
    if (success) setAssignedTasks([]);
  };

  const clearAllEmployeeTasks = (employeeId: string) => {
    setAssignedTasks((prev) =>
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
      clearAll,
      clearAllEmployeeTasks,
      setAssignedTasks,
      page,
      setPage,
      totalPages,
    }),
    [assignedTasks, viewMode, page, totalPages]
  );

  return (
    <TaskAssignmentContext.Provider value={value}>
      {children}
    </TaskAssignmentContext.Provider>
  );
}

export function useTaskAssignment() {
  const context = useContext(TaskAssignmentContext);
  if (!context) throw new Error('useTaskAssignment must be used within TaskAssignmentProvider');
  return context;
}
