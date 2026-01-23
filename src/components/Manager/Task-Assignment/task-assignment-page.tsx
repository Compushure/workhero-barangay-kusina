'use client';

import { useState } from 'react';
import { TaskAssignmentCard } from './task-assignment-card/task-assignment-card';
import { CurrentAssignedTasks } from './assigned-tasks-section/current-assigned-tasks';
import { MOCK_TASKS } from '@/mock-data/employees';
import { AssignedEmployee, AssignedTask } from '@/types';



export interface SelectedFilters {
  employees: AssignedEmployee[];
  tasks: { id: string; maxAttempts: number }[];
  deadline: Date | null;
}

export function TaskAssignmentPage() {
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [viewMode, setViewMode] = useState<'task' | 'employee'>('task');

  const handleAssignTasks = (filters: SelectedFilters) => {
    if (filters.employees.length === 0 || filters.tasks.length === 0) {
      return;
    }

    const newAssignments: AssignedTask[] = filters.tasks.map((taskSelection) => {
      // Find the actual task details from your centralized mock data source
      const baseTask = MOCK_TASKS.find((t) => t.id === taskSelection.id);

      return {
        // Create a unique instance ID for this specific assignment session
        id: `${taskSelection.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        taskId: baseTask?.id || taskSelection.id,
        taskName: baseTask?.name || 'Unknown Task',
        taskType: baseTask?.type || 'General',
        isRepeatable: baseTask?.isRepeatable || false,
        points: baseTask?.points || 0,
        xp: baseTask?.xp || 0,
        dateRange: {
          start: new Date().toISOString().split('T')[0],
          end: filters.deadline
            ? filters.deadline.toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        },
        // Use the specific maxAttempts passed from the Selection Dialog
        maxAttempts: taskSelection.maxAttempts,
        assignedEmployees: filters.employees,
      };
    });

    setAssignedTasks((prev) => [...prev, ...newAssignments]);
  };

  const handleRemoveAssignment = (taskId: string, employeeId: string) => {
    setAssignedTasks((prev) =>
      prev
        .map((task) =>
          task.id === taskId
            ? {
                ...task,
                assignedEmployees: task.assignedEmployees.filter((emp) => emp.id !== employeeId),
              }
            : task
        )
        .filter((task) => task.assignedEmployees.length > 0)
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setAssignedTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const handleClearAllEmployeeTasks = (employeeId: string) => {
    setAssignedTasks((prev) =>
      prev
        .map((task) => ({
          ...task,
          assignedEmployees: task.assignedEmployees.filter((emp) => emp.id !== employeeId),
        }))
        .filter((task) => task.assignedEmployees.length > 0)
    );
  };

  const handleEditTask = (
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

  const handleClearAll = () => {
    setAssignedTasks([]);
  };

  return (
    <main className="min-h-screen bg-[#F2F2F2] p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-[#690003]">Task Assignment</h1>
          <p className="text-lg text-gray-600">Assign tasks to employees in Barangay Kusina.</p>
        </div>

        <TaskAssignmentCard onAssign={handleAssignTasks} assignedTasks={assignedTasks} />

        <CurrentAssignedTasks
          tasks={assignedTasks}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRemoveAssignment={handleRemoveAssignment}
          onDeleteTask={handleDeleteTask}
          onClearAllEmployeeTasks={handleClearAllEmployeeTasks}
          onEditTask={handleEditTask}
          onClearAll={handleClearAll}
        />
      </div>
    </main>
  );
}
