'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, Soup, Calendar } from 'lucide-react';
import type { TaskStatusItem } from './types';
import TaskCardDialog from './task-card-dialog';
import { formatDate, isTaskOverdue } from '@/utils/date-utils';


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
      className="wood-panel border-[#47331F] text-card rounded-2xl border-2 pt-3.5 pb-2 px-5 w-full min-w-0 overflow-hidden cursor-pointer transition-all ease-in-out duration-400 shadow-sm/15 hover:shadow-lg/25 active:brightness-90"
    >
      <CardContent className={`p-0 flex flex-col gap-3 sm:gap-5`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-5">
          <div className="flex flex-col gap-1 min-w-0 w-full flex-1">
            <p className={`min-w-0 w-full max-w-xs truncate text-lg font-medium leading-snug ${task.status === 'approved' && task.completedOrders === task.maxOrders && task.pendingOrders === 0 ? 'text-card/50 line-through' : 'text-card'}`} title={task.name}>
              {task.name}
            </p>
            <span className={`flex gap-2 items-center text-sm font-medium ${isTaskOverdue(task.dueDate) ? 'text-red-700' : ''}`}>
              <Calendar strokeWidth={2.75} className='size-4'/>
              {formatDate(task.dueDate)}
            </span>
          </div>
          <div className="flex flex-col items-start sm:items-end shrink-0 text-left sm:text-right gap-1.5 w-full sm:w-auto sm:min-w-30 border-t pt-3 sm:border-0 sm:pt-0">
            
            <span className="flex text-base font-semibold tabular-nums">
              <Soup strokeWidth={1.75} className="size-5 mr-1" />
              <span>{task.completedOrders} / {task.maxOrders}</span>
            </span>
            <div className="flex items-center justify-between sm:justify-end w-full gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-2 text-sm sm:text-base font-bold tabular-nums">
                  <Coins className="h-4 w-4 sm:h-5 sm:w-5"/>
                  {task.points}
                </span>
                <span className="text-sm sm:text-base font-normal flex gap-2 items-center">
                  <span className='italic text-base leading-none'>XP</span>
                  <span className="font-bold tabular-nums">{task.xp}</span>
                </span>
              </div>
            </div>
            
          </div>
        </div>
      </CardContent>
    </Card>

    <TaskCardDialog task={task} modalOpen={modalOpen} setModalOpen={setModalOpen}/>
    </>
  );
}
