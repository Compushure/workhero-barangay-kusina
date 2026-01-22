'use client';

import { useState } from 'react';
import { TaskAssignmentCard } from './task-assignment-card';
import { CurrentAssignedTasks } from './current-assigned-tasks';
import type { AssignedTask, AssignedEmployee, SelectedFilters } from '@/types';

const MOCK_TASK_MAP: Record<
  string,
  { name: string; type: string; isRepeatable: boolean; points: number; xp: number }
> = {
  task1: {
    name: '2024 FS Preparation',
    type: 'Core Deliverables',
    isRepeatable: true,
    points: 5,
    xp: 25,
  },
  task2: {
    name: '2024 ITR Preparation Completeness',
    type: 'Core Deliverables',
    isRepeatable: false,
    points: 5,
    xp: 25,
  },
  task3: {
    name: 'Turnaround Completion Time (TAT)',
    type: 'Compliance & Discipline',
    isRepeatable: true,
    points: 3,
    xp: 25,
  },
  task4: {
    name: 'Zero Compliance Violations',
    type: 'Compliance & Discipline',
    isRepeatable: false,
    points: 5,
    xp: 25,
  },
  task5: {
    name: 'Advanced Training',
    type: 'Growth & Development',
    isRepeatable: true,
    points: 5,
    xp: 25,
  },
};

const MOCK_EMPLOYEES = [
  { id: 'emp1', name: 'Juan Dela Cruz', empId: '09-0347-79', tenure: 'Junior staff' },
  { id: 'emp2', name: 'Maria Santos', empId: '08-1234-56', tenure: 'Senior staff' },
  { id: 'emp3', name: 'Jose Reyes', empId: '10-5678-90', tenure: 'Mid-level staff' },
  { id: 'emp4', name: 'Ana Garcia', empId: '07-9012-34', tenure: 'Team lead' },
  { id: 'emp5', name: 'Pedro Rodriguez', empId: '11-3456-78', tenure: 'Junior staff' },
];

export function TaskAssignmentPage() {
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [viewMode, setViewMode] = useState<'task' | 'employee'>('task');

  const handleAssignTasks = (filters: SelectedFilters) => {
    if (filters.employees.length === 0 || filters.tasks.length === 0) {
      return;
    }

    const newAssignments = filters.tasks.map((task) => {
      const taskData = MOCK_TASK_MAP[task.id] || {
        name: task.id,
        type: 'Unknown',
        isRepeatable: true,
        points: 0,
        xp: 0,
      };
      return {
        id: `${task.id}-${Date.now()}`,
        taskId: task.id,
        taskName: taskData.name,
        taskType: taskData.type,
        isRepeatable: taskData.isRepeatable,
        points: taskData.points,
        xp: taskData.xp,
        dateRange: {
          start: new Date().toISOString().split('T')[0],
          end:
            filters.deadline?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        },
        maxAttempts: task.maxAttempts,
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

  // const handleAssignEmployees = (taskId: string, employeeIds: string[]) => {
  //   setAssignedTasks((prev) =>
  //     prev
  //       .map((task) => {
  //         if (task.id === taskId) {
  //           const newEmployees = employeeIds.map((empId) => {
  //             const existingEmp = task.assignedEmployees.find((e) => e.id === empId)
  //             if (existingEmp) {
  //               return existingEmp
  //             }
  //             const mockEmp = MOCK_EMPLOYEES.find((e) => e.id === empId)
  //             return {
  //               id: empId,
  //               name: mockEmp?.name || "",
  //               empId: mockEmp?.empId || "",
  //               tenure: mockEmp?.tenure,
  //               completedAttempts: 0,
  //             }
  //           })
  //           return { ...task, assignedEmployees: newEmployees }
  //         }
  //         return task
  //       })
  //       .filter((task) => task.assignedEmployees.length > 0),
  //   )
  // }

  const handleClearAll = () => {
    setAssignedTasks([]);
  };

  return (
    <main className="min-h-screen bg-[#F2F2F2] p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-[#690003]">Task Assignment</h1>
          <p className="text-lg text-gray-600">Assign task to employees.</p>
        </div>

        {/* Main Assignment Card */}
        <TaskAssignmentCard onAssign={handleAssignTasks} assignedTasks={assignedTasks} />

        {/* Currently Assigned Tasks */}
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
