'use client';

import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskStatusColumn } from './task-status-column';
import { TaskCard } from './task-card';
import type { TaskStatusItem } from './types';

type SortOption = 'due-date' | 'points' | 'title';

function sortTasks(tasks: TaskStatusItem[], sortBy: SortOption): TaskStatusItem[] {
  const copy = [...tasks];
  switch (sortBy) {
    case 'due-date':
      return copy.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    case 'points':
      return copy.sort((a, b) => b.points - a.points);
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return copy;
  }
}

interface TaskStatusBoardProps {
  currentTasks?: TaskStatusItem[];
  onReviewTasks?: TaskStatusItem[];
  verifiedTasks?: TaskStatusItem[];
  deniedTasks?: TaskStatusItem[];
}

export function TaskStatusBoard({
  currentTasks = [],
  onReviewTasks = [],
  verifiedTasks = [],
  deniedTasks = [],
}: TaskStatusBoardProps) {
  const [sortBy, setSortBy] = useState<SortOption>('due-date');

  const [current, onReview, verified, denied] = useMemo(
    () => [
      sortTasks(currentTasks, sortBy),
      sortTasks(onReviewTasks, sortBy),
      sortTasks(verifiedTasks, sortBy),
      sortTasks(deniedTasks, sortBy),
    ],
    [currentTasks, onReviewTasks, verifiedTasks, deniedTasks, sortBy]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by</span>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due-date">Due date</SelectItem>
              <SelectItem value="points">Points</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full min-w-0">
        <TaskStatusColumn status="Current">
          {current.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TaskStatusColumn>
        <TaskStatusColumn status="On Review">
          {onReview.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TaskStatusColumn>
        <TaskStatusColumn status="Verified">
          {verified.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TaskStatusColumn>
        <TaskStatusColumn status="Denied Approval">
          {denied.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TaskStatusColumn>
      </div>
    </div>
  );
}
