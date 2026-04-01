'use client';

import { useState } from 'react';
import { Calendar, Coins, Soup } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/utils/date-utils';
import { isTaskStatusItemOverdue } from './task-status-utils';
import type { TaskStatusItem } from './types';
import TaskCardDialog from './task-card-dialog';

interface TaskCardProps {
  task: TaskStatusItem;
}

export function TaskCard({ task }: TaskCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const isOverdue = isTaskStatusItemOverdue(task);
  const isFullyClaimed =
    task.status === 'approved' &&
    task.completedOrders === task.maxOrders &&
    task.pendingOrders === 0;

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        onClick={() => setModalOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setModalOpen(true);
          }
        }}
        className="w-full min-w-0 cursor-pointer overflow-hidden rounded-lg border-2 border-[#d4c5a8] bg-[#fdf5e8] px-3 py-3 text-[#3f2a1a] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c79a54] hover:shadow-[0_6px_14px_rgba(71,51,31,0.12)] active:brightness-95 sm:px-3.5"
      >
        <CardContent className="flex flex-col gap-2.5 p-0 font-jersey tracking-[0.04em]">
          <div className="flex items-start justify-between gap-3 max-[430px]:flex-col">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                {isOverdue ? (
                  <span className="rounded-md border-2 border-[#d18d7e] bg-[#f4d6ce] px-2 py-0.5 text-[12px] leading-none text-[#8b2e22]">
                    OVERDUE
                  </span>
                ) : null}
                {isFullyClaimed ? (
                  <span className="rounded-md border-2 border-[#d4c5a8] bg-[#efe2ca] px-2 py-0.5 text-[12px] leading-none text-[#6b5038]">
                    CLAIMED
                  </span>
                ) : null}
              </div>

              <p
                className={`line-clamp-2 text-[16px] leading-[1.05] sm:text-[18px] ${
                  isFullyClaimed ? 'text-[#8e7a64] line-through' : 'text-[#3f2a1a]'
                }`}
                title={task.name}
              >
                {task.name}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-none">
                <span
                  className={`flex items-center gap-1.5 ${isOverdue ? 'text-[#8b2e22]' : 'text-[#6b5038]'}`}
                >
                  <Calendar strokeWidth={2.5} className="size-4.5 shrink-0" />
                  Due {formatDate(task.dueDate)}
                </span>
                <span className="flex items-center gap-1.5 text-[#6b5038] sm:hidden">
                  <Soup className="size-4.5 shrink-0" />
                  {task.completedOrders}/{task.maxOrders} done
                </span>
              </div>
            </div>

            <div className="shrink-0 rounded-xl border-2 border-[#d4c5a8] bg-[#f3e4c9] px-3 py-2 text-center text-[12px] leading-none text-[#6b5038] max-[430px]:w-full max-[430px]:text-left">
              <div className="max-[430px]:flex max-[430px]:items-center max-[430px]:justify-between">
                <div>
                  <div>ORDERS</div>
                  <div className="mt-1 text-[16px] text-[#3f2a1a]">
                    {task.completedOrders}/{task.maxOrders}
                  </div>
                </div>
                <div className="hidden text-right max-[430px]:block">
                  <div>PENDING</div>
                  <div className="mt-1 text-[16px] text-[#3f2a1a]">{task.pendingOrders}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-md border-2 border-[#d4c5a8] bg-[#fff8ec] px-2 py-0.5 text-[12px] leading-none text-[#6b5038]">
              <Coins className="mr-1 h-4.5 w-4.5 shrink-0" />
              <span className="text-[14px] leading-none text-[#3f2a1a]">{task.points} pts</span>
            </span>
            <span className="rounded-md border-2 border-[#87a9bc]/35 bg-[#e0eef5] px-2 py-0.5 text-[14px] leading-none text-[#204b61] max-[360px]:hidden">
              XP {task.xp}
            </span>
            <span className="hidden rounded-md border-2 border-[#d4c5a8] bg-[#fff8ec] px-2 py-0.5 text-[14px] leading-none text-[#6b5038] sm:inline-flex">
              Pending {task.pendingOrders}
            </span>
            <span className="rounded-md border-2 border-[#d4c5a8] bg-[#fff8ec] px-2 py-0.5 text-[12px] leading-none text-[#6b5038]">
              <Soup className="mr-1 inline h-4.5 w-4.5" />
              <span className="text-[14px] leading-none">Done {task.completedOrders}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      <TaskCardDialog task={task} modalOpen={modalOpen} setModalOpen={setModalOpen} />
    </>
  );
}
