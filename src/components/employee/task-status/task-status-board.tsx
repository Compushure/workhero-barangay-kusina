'use client';

import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskStatusSection } from './task-status-section';
import { TaskCard } from './task-card';
import type { TaskStatusItem } from './types';
import { Header } from '../header';
import { useGetEmployeeTasks } from '@/hooks/tanstack/employee';

type SortOption = 'due-date' | 'points' | 'name';

function sortTasks(tasks: TaskStatusItem[], sortBy: SortOption): TaskStatusItem[] {
  const copy = [...tasks];
  switch (sortBy) {
    case 'due-date':
      return copy.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    case 'points':
      return copy.sort((a, b) => b.points - a.points);
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return copy;
  }
}

interface TaskStatusBoardProps {
  currentTasks?: TaskStatusItem[];
  inReviewTasks?: TaskStatusItem[];
  verifiedTasks?: TaskStatusItem[];
  rejectedTasks?: TaskStatusItem[];
}

export function TaskStatusBoard({
  currentTasks = [],
  inReviewTasks = [],
  verifiedTasks = [],
  rejectedTasks = [],
}: TaskStatusBoardProps) {
  const { error } = useGetEmployeeTasks();

  const [sortBy, setSortBy] = useState<SortOption>('due-date');

  const [current, onReview, verified, denied] = useMemo(
    () => [
      sortTasks(currentTasks, sortBy),
      sortTasks(inReviewTasks, sortBy),
      sortTasks(verifiedTasks, sortBy),
      sortTasks(rejectedTasks, sortBy),
    ],
    [currentTasks, inReviewTasks, verifiedTasks, rejectedTasks, sortBy]
  );

  return (
    <div className="flex flex-col gap-4 w-full min-w-150 overflow-hidden px-8 py-8 my-24 rounded-4xl bg-card/45 backdrop-blur-lg shadow-lg/25">
      <div className="flex flex-row items-start justify-between gap-2 px-3">
        <Header
          title="Tasks"
          description="View your tasks by status: Current, On Review, Verified, or Denied Approval."
        />
      
        <div>
          <span className="text-sm text-muted-foreground">Sort by</span>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-45 bg-card shadow-sm/25">
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

      {/* Single Section on small screens; 2x2 grid on lg and up (Current | On Review, Verified | Denied Approval) */}
        {error ? (
          <div className='w-full h-48 flex flex-col items-center justify-center'>
            <span className='text-lg'>Error loading tasks. Please try again</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full min-w-0">
          <TaskStatusSection status="Current" task={current}>
            {current.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </TaskStatusSection>
          <TaskStatusSection status="In Review" task={onReview}>
            {onReview.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </TaskStatusSection>
          <TaskStatusSection status="Approved" task={verified}>
            {verified.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </TaskStatusSection>
          <TaskStatusSection status="Rejected" task={denied}>
            {denied.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </TaskStatusSection>
          </div>
        )}
    </div>
  );
}
