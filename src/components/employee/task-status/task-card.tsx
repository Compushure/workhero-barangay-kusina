'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import type { TaskStatusItem } from './types';

interface TaskCardProps {
  task: TaskStatusItem;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Card className="rounded-xl shadow-sm border py-4 px-5 w-full">
      <CardContent className="p-0 flex items-start justify-between gap-5">
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <span className="inline-flex w-fit rounded-full bg-muted text-muted-foreground px-3 py-1 text-sm font-semibold leading-tight">
            {task.taskType}
          </span>
          <p className="text-base font-semibold leading-snug">{task.title}</p>
        </div>
        <div className="flex flex-col items-end shrink-0 text-right gap-1.5 min-w-[120px]">
          <div className="flex items-center w-full justify-between gap-3">
            <span className="text-sm font-normal text-muted-foreground tabular-nums">
              {task.progressCurrent}/{task.progressMax}
            </span>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-2 text-base font-bold tabular-nums">
                <Sparkles className="h-5 w-5 text-muted-foreground" aria-hidden />
                {task.points}
              </span>
              <span className="text-base font-normal">
                XP <span className="font-bold tabular-nums">{task.xp}</span>
              </span>
            </div>
          </div>
          <span className="text-sm font-normal text-muted-foreground mt-1.5">
            DUE : {task.dueDate}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
