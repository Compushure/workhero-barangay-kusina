'use client';

import { Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Task } from './types';

interface TaskCardProps {
  task: Task;
}

/**
 * TaskCard - Client Component
 * Individual task card showing progress and rewards
 */
export function TaskCard({ task }: TaskCardProps) {
  const progressPercentage = (task.completed / task.total) * 100;

  const categoryConfig = {
    'client-centered': {
      label: 'Client-Centered Metrics',
      bgClass: 'bg-amber-50',
      labelClass: 'text-orange-600',
    },
    internal: {
      label: 'Name of Task Type',
      bgClass: 'bg-amber-50',
      labelClass: 'text-orange-600',
    },
    cpd: {
      label: 'Name of Task Type',
      bgClass: 'bg-amber-50',
      labelClass: 'text-orange-600',
    },
  };

  const config = categoryConfig[task.category];

  return (
    <Card className={`${config.bgClass} border-2 border-orange-200 p-4`}>
      <div className="space-y-3">
        <div className={`text-xs font-semibold ${config.labelClass}`}>{config.label}</div>
        <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <Progress value={progressPercentage} className="h-2" />
            <p className="mt-2 text-sm font-semibold text-gray-600">
              {task.completed}/{task.total}
            </p>
          </div>

          <div className="flex items-center gap-4 border-l-2 border-orange-200 pl-4">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-gray-900">
                {Math.round(task.xpReward / 10)}
              </span>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-red-600">{task.xpReward}</span>
              <span className="text-xs font-semibold text-red-600">XP</span>
            </div>
            <div className="text-right text-xs text-gray-600">
              <span className="block font-semibold">DUE</span>
              <span>{task.dueDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
