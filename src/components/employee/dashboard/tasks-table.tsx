'use client';

import { Button } from '@/components/ui/button';

interface Task {
  title: string;
  category?: string;
  progress: string;   // e.g. "0/5"
  points: string;     // e.g. "10"
  xp: string;         // e.g. "100"
  dueDate: string;    // e.g. "12/12/25"
}

export default function TasksTable({ tasks }: { tasks: Task[] }) {
  return (
    <div className="flex flex-col h-44 gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Tasks</h2>
        <Button variant="outline" size="sm">
          Sort
        </Button>
      </div>

      {/* Scrollable card list inside fixed container */}
      <div className="flex-1 overflow-y-auto border rounded-lg bg-gray-50 p-4">
        <div className="flex flex-col gap-2">
          {tasks.map((task, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between border border-gray-200"
            >
              {/* Category + Title */}
              <div className="flex flex-col">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {task.category || 'Name of Task Type'}
                </p>
                <h3 className="font-semibold text-base">{task.title}</h3>
              </div>

              {/* Progress */}
              <p className="text-sm text-gray-700">{task.progress}</p>

              {/* Rewards */}
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="flex items-center gap-1">
                  🔁 <span>{task.points}</span>
                </span>
                <span className="flex items-center gap-1">
                  ⭐ <span>{task.xp} XP</span>
                </span>
              </div>

              {/* Due Date */}
              <p className="text-xs text-gray-500">DUE: {task.dueDate}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
