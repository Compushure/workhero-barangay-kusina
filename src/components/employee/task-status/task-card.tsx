'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, Soup, Calendar } from 'lucide-react';
import type { TaskStatusItem } from './types';
import TaskCardDialog from './task-card-dialog';
import { formatDate } from '@/utils/date-utils';
import { isTaskStatusItemOverdue } from './task-status-utils';


interface TaskCardProps {
  task: TaskStatusItem;
}

export function TaskCard({ task }: TaskCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const isOverdue = isTaskStatusItemOverdue(task);
  const isFullyClaimed =
    task.status === 'approved' && task.completedOrders === task.maxOrders && task.pendingOrders === 0;

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
        className="w-full min-w-0 cursor-pointer overflow-hidden rounded-2xl border-2 border-[#d4c5a8] bg-[#fdf5e8] px-3 py-2.5 text-[#3f2a1a] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c79a54] hover:shadow-[0_6px_14px_rgba(71,51,31,0.12)] active:brightness-95"
      >
        <CardContent className="flex flex-col gap-2.5 p-0 font-pixel">
          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-md border-2 border-[#d4c5a8] bg-[#f3e4c9] px-2 py-0.5 text-[8px] text-[#6b5038]">
                  TASK
                </span>
                {isOverdue ? (
                  <span className="rounded-md border-2 border-[#d18d7e] bg-[#f4d6ce] px-2 py-0.5 text-[8px] text-[#8b2e22]">
                    OVERDUE
                  </span>
                ) : null}
              </div>
              <p
                className={`line-clamp-2 text-[10px] leading-relaxed ${
                  isFullyClaimed ? 'text-[#8e7a64] line-through' : 'text-[#3f2a1a]'
                }`}
                title={task.name}
              >
                {task.name}
              </p>
              <span className={`mt-1.5 flex items-center gap-1.5 text-[8px] ${isOverdue ? 'text-[#8b2e22]' : 'text-[#6b5038]'}`}>
                <Calendar strokeWidth={2.5} className="size-3" />
                Due {formatDate(task.dueDate)}
              </span>
            </div>

            <div className="rounded-xl border-2 border-[#d4c5a8] bg-[#f3e4c9] px-2 py-1 text-center text-[7px] text-[#6b5038]">
              <div>ORDERS</div>
              <div className="mt-1 text-[9px] text-[#3f2a1a]">
                {task.completedOrders}/{task.maxOrders}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-md border-2 border-[#d4c5a8] bg-[#fff8ec] px-2 py-0.5 font-pixel text-[7px] leading-none text-[#6b5038]">
              <Coins className="mr-1 h-2.5 w-2.5 shrink-0" />
              <span className="text-[7px] leading-none text-[#3f2a1a]">{task.points} pts</span>
            </span>
            <span className="rounded-md border-2 border-[#87a9bc]/35 bg-[#e0eef5] px-2 py-0.5 text-[7px] text-[#204b61]">
              XP {task.xp}
            </span>
            <span className="rounded-md border-2 border-[#d4c5a8] bg-[#fff8ec] px-2 py-0.5 text-[7px] text-[#6b5038]">
              Pending {task.pendingOrders}
            </span>
            <span className="rounded-md border-2 border-[#d4c5a8] bg-[#fff8ec] px-2 py-0.5 text-[7px] text-[#6b5038]">
              <Soup className="mr-1 inline h-2.5 w-2.5" />
              Done {task.completedOrders}
            </span>
          </div>
        </CardContent>
      </Card>

      <TaskCardDialog task={task} modalOpen={modalOpen} setModalOpen={setModalOpen} />
    </>
  );
}
