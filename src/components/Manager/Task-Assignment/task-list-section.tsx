'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskCard } from './task-card';

// Mock task data
const MOCK_TASKS = [
  {
    id: '1',
    title: 'Internal Training',
    category: 'Compliance & Discipline',
    dateRange: 'October 20, 2025 - October 26, 2025',
    coins: 10,
    xp: 100,
    assignedCount: 8,
    employees: [
      'Juan Dela Cruz',
      'MJ Lip',
      'Richard Becerra',
      'Herbert M. Brown',
      'Sarah Johnson',
      'Michael Chen',
      'Emma Davis',
      'James Wilson',
    ],
  },
  {
    id: '2',
    title: 'Internal Training',
    category: 'Compliance & Discipline',
    dateRange: 'October 20, 2025 - October 26, 2025',
    coins: 10,
    xp: 100,
    assignedCount: 8,
    employees: [
      'Juan Dela Cruz',
      'MJ Lip',
      'Richard Becerra',
      'Herbert M. Brown',
      'Sarah Johnson',
      'Michael Chen',
      'Emma Davis',
      'James Wilson',
    ],
  },
  {
    id: '3',
    title: 'Internal Training',
    category: 'Compliance & Discipline',
    dateRange: 'October 20, 2025 - October 26, 2025',
    coins: 10,
    xp: 100,
    assignedCount: 8,
    employees: [
      'Juan Dela Cruz',
      'MJ Lip',
      'Richard Becerra',
      'Herbert M. Brown',
      'Sarah Johnson',
      'Michael Chen',
      'Emma Davis',
      'James Wilson',
    ],
  },
];

export function TaskListSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const filteredTasks = MOCK_TASKS.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="rounded-3xl bg-[#FBF4E8] p-8 shadow-sm flex flex-col content-center">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#690003]">Current Assigned Tasks</h2>
        <div className="flex gap-4">
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 rounded-full border border-gray-300 bg-white px-6 py-3"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 rounded-full border border-gray-300 bg-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="az">A - Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isExpanded={expandedTaskId === task.id}
            onToggleExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
          />
        ))}
      </div>
    </div>
  );
}
