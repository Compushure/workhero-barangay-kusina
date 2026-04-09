'use client';

import { useState } from 'react';
import { Calendar, ChefHat, Coins, Soup } from 'lucide-react';
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
  const normalizedStatus = task.status?.toLowerCase();
  const isApprovedTask = normalizedStatus === 'approved';
  const isInReviewTask = normalizedStatus === 'in review';
  const hasClaimedRewards = Boolean(task.claimedAt);
  const hasDishServed = Boolean(task.completedAt);

  // Claimed means rewards were already claimed for an approved task.
  const isClaimedTask = isApprovedTask && hasClaimedRewards;
  // Fully done means task is claimed and the dish has been served.
  const isTaskFullyServed = isClaimedTask && hasDishServed;

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
        className="w-full min-w-0 cursor-pointer overflow-hidden rounded-lg border-2 border-[#d4c5a8] bg-[#fdf5e8] px-2.5 py-2.5 text-[#3f2a1a] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c79a54] hover:shadow-[0_6px_14px_rgba(71,51,31,0.12)] active:brightness-95 sm:px-3"
      >
        <CardContent className="flex flex-col gap-2 p-0 font-jersey tracking-[0.04em]">
          <div className="flex items-start justify-between gap-3 max-[430px]:flex-col">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-1">
                {isOverdue ? (
                  <span className="rounded-md border-2 border-[#d18d7e] bg-[#f4d6ce] px-2 py-0.5 text-[12px] leading-none text-[#8b2e22]">
                    OVERDUE
                  </span>
                ) : null}
                {isClaimedTask ? (
                  <span className="rounded-md border-2 border-[#d4c5a8] bg-[#efe2ca] px-2 py-0.5 text-[12px] leading-none text-[#6b5038]">
                    CLAIMED
                  </span>
                ) : null}
                {isTaskFullyServed ? (
                  <span className="rounded-md border-2 border-violet-400 bg-violet-200 px-2 py-0.5 text-[12px] leading-none text-violet-800">
                    SERVED
                  </span>
                ) : null}
              </div>

              <p
                className={`line-clamp-2 text-[15px] leading-[1.1] sm:text-[17px] ${
                  isTaskFullyServed ? 'text-[#8e7a64] line-through' : 'text-[#3f2a1a]'
                }`}
                title={task.name}
              >
                {task.name}
              </p>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.85rem] leading-none sm:text-[13px]">
                <span
                  className={`flex items-center gap-1.5 ${isOverdue ? 'text-[#8b2e22]' : 'text-[#6b5038]'}`}
                >
                  <Calendar strokeWidth={2.5} className="size-4.5 shrink-0" />
                  Due {formatDate(task.dueDate)}
                </span>

                <p
                  className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-full border-2 text-[0.9rem] sm:hidden
                  ${task.completedOrders === task.maxOrders ? 'border-[#7eb07f] bg-[#d8efdb] text-[#1f5a36]' : 'border-[#d4c5a8] bg-[#f3e4c9] text-[#6b5038]'}`}
                >
                  <Soup className="size-4.5 shrink-0" />
                  <span>ORDERS</span>
                  {task.completedOrders}/{task.maxOrders}
                </p>
              </div>
            </div>

            <div
              className={`hidden sm:block shrink-0 rounded-xl px-2.5 py-1.5 text-center text-[11px] leading-none border-2 max-[430px]:w-full max-[430px]:text-left
              ${task.completedOrders === task.maxOrders ? 'border-[#7eb07f] bg-[#d8efdb] text-[#1f5a36]' : 'border-[#d4c5a8] bg-[#f3e4c9] text-[#6b5038]'}`}
            >
              <div className="max-[430px]:flex max-[430px]:items-center max-[430px]:justify-between">
                <div>ORDERS</div>
                <div className="mt-1 text-[15px] text-[#3f2a1a]">
                  {task.completedOrders}/{task.maxOrders}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-1 text-[0.9rem]">
            <p
              className="inline-flex min-w-0 items-center justify-center gap-1 rounded-md border-2 border-[#e5d08a] bg-amber-100 px-1.5 py-0.5 leading-none text-[#6b5038]"
              title={`${task.points} points`}
            >
              <Coins className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate leading-none text-[#3f2a1a]">{task.points}</span>
            </p>
            <p
              className="inline-flex min-w-0 gap-1 items-center justify-center rounded-md border-2 border-[#87a9bc]/35 bg-[#e0eef5] px-1.5 py-0.5 leading-none text-[#204b61]"
              title={`${task.xp} XP`}
            >
              <span className="italic">XP</span>
              <span>{task.xp}</span>
            </p>
            {isInReviewTask ? (
              <span
                className="inline-flex min-w-0 items-center justify-center gap-1 rounded-md border-2 border-[#d4c5a8] bg-[#f3e4c9] px-2 py-0.5 leading-none"
                title={`${task.pendingOrders} pending orders`}
              >
                <ChefHat className="size-3.5" />
                <span>Pending {task.pendingOrders}</span>
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <TaskCardDialog task={task} modalOpen={modalOpen} setModalOpen={setModalOpen} />
    </>
  );
}
