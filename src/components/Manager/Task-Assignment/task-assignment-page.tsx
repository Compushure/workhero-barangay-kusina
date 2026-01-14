'use client';

import { useState } from 'react';
import { TaskAssignmentCard } from './task-assignment-card';
import { CurrentAssignedTasks } from './current-assigned-tasks';

export interface AssignedTask {
  id: string;
  taskName: string;
  taskType: string;
  points: number;
  xp: number;
  dateRange: {
    start: string;
    end: string;
  };
  maxAttempts: number;
  assignedEmployees: AssignedEmployee[];
}

export interface AssignedEmployee {
  id: string;
  name: string;
  empId: string;
  tenure?: string;
  completedAttempts: number;
}

export interface SelectedFilters {
  employees: AssignedEmployee[];
  tasks: string[];
  deadline: Date | null;
}

export function TaskAssignmentPage() {
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [viewMode, setViewMode] = useState<'task' | 'employee'>('task');

  const handleAssignTasks = (filters: SelectedFilters) => {
    if (filters.employees.length === 0 || filters.tasks.length === 0) {
      return;
    }

    // Create new task assignments
    const newAssignments = filters.tasks.map((taskId) => ({
      id: `${taskId}-${Date.now()}`,
      taskName: taskId,
      taskType: 'Core Deliverables',
      points: 5,
      xp: 100,
      dateRange: {
        start: new Date().toISOString().split('T')[0],
        end:
          filters.deadline?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      },
      maxAttempts: 5,
      assignedEmployees: filters.employees,
    }));

    setAssignedTasks((prev) => [...prev, ...newAssignments]);
  };

  const handleRemoveAssignment = (taskId: string, employeeId: string) => {
    setAssignedTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              assignedEmployees: task.assignedEmployees.filter((emp) => emp.id !== employeeId),
            }
          : task
      )
    );
  };

  const handleClearAll = () => {
    setAssignedTasks([]);
  };

  return (
    <main className="min-h-screen bg-[#F2F2F2] p-12">
      <div className="mx-auto max-w-full min-w-5xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-[#690003]">Task Assignment</h1>
          <p className="text-lg text-gray-600">Assign task to employees.</p>
        </div>

        {/* Main Assignment Card */}
        <TaskAssignmentCard onAssign={handleAssignTasks} />

        {/* Currently Assigned Tasks */}
        <CurrentAssignedTasks
          tasks={assignedTasks}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRemoveAssignment={handleRemoveAssignment}
          onClearAll={handleClearAll}
        />
      </div>
    </main>
  );
}
