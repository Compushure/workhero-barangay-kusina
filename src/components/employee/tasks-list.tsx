'use client';

import { useState } from 'react';
import { TaskCard } from './task-card';
import { SortDropdown } from './sort-dropdown';
import { DonateButton } from './donate-button';
import type { Task, SortOption } from './types';

interface TasksListProps {
  tasks: Task[];
}

/**
 * TasksList - Client Component
 * Manages and displays a list of tasks with sorting functionality
 */
export function TasksList({ tasks }: TasksListProps) {
  const [sortedTasks, setSortedTasks] = useState(tasks);

  const handleSortChange = (sortBy: SortOption) => {
    const sorted = [...tasks];

    switch (sortBy) {
      case 'recent':
        sorted.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
        break;
      case 'upcoming':
        sorted.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        break;
      case 'progress':
        sorted.sort((a, b) => {
          const aProgress = a.completed / a.total;
          const bProgress = b.completed / b.total;
          return bProgress - aProgress;
        });
        break;
      case 'rewards':
        sorted.sort((a, b) => b.xpReward - a.xpReward);
        break;
    }

    setSortedTasks(sorted);
  };

  return (
    <div className="space-y-4">
      {/* Header with Donate and Sort Controls */}
      <div className="flex items-center justify-between">
        <DonateButton />
        <SortDropdown onSortChange={handleSortChange} />
      </div>

      {/* Tasks Grid */}
      <div className="space-y-3">
        {sortedTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
