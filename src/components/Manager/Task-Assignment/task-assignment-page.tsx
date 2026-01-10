'use client';

import { useState } from 'react';
import { PageHeader } from './page-header';
import { AssignmentCard } from './assignment-card';
import { TaskListSection } from './task-list-section';

export function TaskAssignmentPage() {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [selectedDeadline, setSelectedDeadline] = useState<Date | null>(null);

  return (
    <div className="min-h-screen bg-[#F2F2F2] p-8">
      <div className="mx-auto max-w-7xl">
        <PageHeader />

        <AssignmentCard
          selectedEmployees={selectedEmployees}
          selectedTask={selectedTask}
          selectedDeadline={selectedDeadline}
          onEmployeesChange={setSelectedEmployees}
          onTaskChange={setSelectedTask}
          onDeadlineChange={setSelectedDeadline}
        />

        <TaskListSection />
      </div>
    </div>
  );
}
