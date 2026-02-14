'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, Clock } from 'lucide-react';
import type { TaskStatusItem } from './types';
import TaskCardDialog from './task-card-dialog';

interface TaskCardProps {
  task: TaskStatusItem;
}

export function TaskCard({ task }: TaskCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
    <Card
      role="button"
      tabIndex={0}
      onClick={() => setModalOpen(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setModalOpen(true);
        }
      }}
      className="rounded-xl shadow-sm border py-3 px-4 sm:py-4 sm:px-5 w-full min-w-0 cursor-pointer transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <CardContent className="p-0 flex flex-col gap-3 sm:gap-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-5">
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <p className="text-lg font-medium leading-snug wrap-break-word text-foreground">
              {task.name}
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end shrink-0 text-left sm:text-right gap-1.5 w-full sm:w-auto sm:min-w-[120px] border-t pt-3 sm:border-0 sm:pt-0">
            <div className="flex items-center justify-between sm:justify-end w-full gap-3">
              <span className="text-sm font-normal text-muted-foreground tabular-nums">
                {task.completedOrders}/{task.maxOrders}
              </span>
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-2 text-sm sm:text-base font-bold tabular-nums">
                  <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"/>
                  {task.points}
                </span>
                <span className="text-sm sm:text-base font-normal">
                  XP <span className="font-bold tabular-nums">{task.xp}</span>
                </span>
              </div>
            </div>
            <span className="flex gap-2 items-center text-sm font-normal text-muted-foreground">
              <Clock className='size-4 stroke-2'/>
              {task.dueDate}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>

    <TaskCardDialog task={task} modalOpen={modalOpen} setModalOpen={setModalOpen}/>
    </>
  );
}
