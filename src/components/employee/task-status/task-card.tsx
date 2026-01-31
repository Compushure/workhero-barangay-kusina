'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import type { TaskStatusItem } from './types';

interface TaskCardProps {
  task: TaskStatusItem;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Card className="rounded-xl shadow-sm border py-3 px-4 sm:py-4 sm:px-5 w-full min-w-0">
      <CardContent className="p-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-5">
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <span className="inline-flex w-fit rounded-full bg-muted text-muted-foreground px-3 py-1 text-xs sm:text-sm font-semibold leading-tight">
            {task.taskType}
          </span>
          <p className="text-sm sm:text-base font-semibold leading-snug wrap-break-word">
            {task.title}
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end shrink-0 text-left sm:text-right gap-1.5 w-full sm:w-auto sm:min-w-[120px] border-t pt-3 sm:border-0 sm:pt-0">
          <div className="flex items-center justify-between sm:justify-end w-full gap-3">
            <span className="text-sm font-normal text-muted-foreground tabular-nums">
              {task.progressCurrent}/{task.progressMax}
            </span>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-2 text-sm sm:text-base font-bold tabular-nums">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" aria-hidden />
                {task.points}
              </span>
              <span className="text-sm sm:text-base font-normal">
                XP <span className="font-bold tabular-nums">{task.xp}</span>
              </span>
            </div>
          </div>
          <span className="text-sm font-normal text-muted-foreground">DUE : {task.dueDate}</span>
        </div>
      </CardContent>
    </Card>
  );
}
