'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { AssignedTask, AssignedEmployee, SelectedFilters } from '@/types';
import { MOCK_TASKS } from '@/mock-data/employees';

interface TaskAssignmentContextType {
  assignedTasks: AssignedTask[];
  viewMode: 'task' | 'employee';
  setViewMode: (mode: 'task' | 'employee') => void;
  assignTasks: (filters: SelectedFilters) => void;
  removeAssignment: (taskId: string, employeeId: string) => void;
  deleteTask: (taskId: string) => void;
  editTask: (taskId: string, maxAttempts: number, newDueDate: string, newEmployees: AssignedEmployee[]) => void;
  clearAll: () => void;
  clearAllEmployeeTasks: (employeeId: string) => void;
}

const TaskAssignmentContext = createContext<TaskAssignmentContextType | undefined>(undefined);

export function TaskAssignmentProvider({ children }: { children: React.ReactNode }) {
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [viewMode, setViewMode] = useState<'task' | 'employee'>('task');

  const assignTasks = (filters: SelectedFilters) => {
    if (filters.employees.length === 0 || filters.tasks.length === 0) return;
    const newAssignments: AssignedTask[] = filters.tasks.map((taskSelection) => {
      const baseTask = MOCK_TASKS.find((t) => t.id === taskSelection.id);
      return {
        id: `${taskSelection.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        taskId: baseTask?.id || taskSelection.id,
        taskName: baseTask?.name || 'Unknown Task',
        taskType: baseTask?.type || 'General',
        isRepeatable: baseTask?.isRepeatable || false,
        points: baseTask?.points || 0,
        xp: baseTask?.xp || 0,
        dateRange: {
          start: new Date().toISOString(),
          end: filters.deadline ? filters.deadline.toISOString() : new Date().toISOString(),
        },
        maxAttempts: taskSelection.maxAttempts,
        assignedEmployees: filters.employees,
      };
    });
    setAssignedTasks((prev) => [...prev, ...newAssignments]);
  };

  const removeAssignment = (taskId: string, employeeId: string) => {
    setAssignedTasks((prev) =>
      prev
        .map((task) =>
          task.id === taskId
            ? { ...task, assignedEmployees: task.assignedEmployees.filter((e) => e.id !== employeeId) }
            : task
        )
        .filter((task) => task.assignedEmployees.length > 0)
    );
  };

  const deleteTask = (taskId: string) => {
    setAssignedTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const editTask = (taskId: string, maxAttempts: number, newDueDate: string, newEmployees: AssignedEmployee[]) => {
    setAssignedTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, maxAttempts, dateRange: { ...task.dateRange, end: newDueDate }, assignedEmployees: newEmployees }
          : task
      ).filter(task => task.assignedEmployees.length > 0)
    );
  };

  const clearAll = () => setAssignedTasks([]);

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

  const value = useMemo(() => ({
    assignedTasks, viewMode, setViewMode, assignTasks, 
    removeAssignment, deleteTask, editTask, clearAll, clearAllEmployeeTasks
  }), [assignedTasks, viewMode]);

  return <TaskAssignmentContext.Provider value={value}>{children}</TaskAssignmentContext.Provider>;
}

export function useTaskAssignment() {
  const context = useContext(TaskAssignmentContext);
  if (!context) throw new Error('useTaskAssignment must be used within TaskAssignmentProvider');
  return context;
}