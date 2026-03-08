'use client';

import { type ComponentProps, useMemo, useState } from 'react';
import { AwardIcon, XIcon } from 'lucide-react';
import TasksTable from './claimable-tasks-table';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGetEmployeeTasks } from '@/hooks/tanstack/queries/employeeTasksQueries';
import type { TaskStatusItem } from '@/components/employee/task-status/types';

type DialogContentProps = ComponentProps<typeof DialogContent>;

function WideDialogContent({ children, className, ...props }: DialogContentProps) {
  return (
    <DialogContent
      showCloseButton={false}
      className={`max-w-5xl sm:max-w-5xl lg:max-w-4xl w-[95vw] gap-10 font-pixel bg-[#32261B] border-[#47331F]/40 ${className ?? ''}`}
      {...props}
    >
      <DialogClose
        aria-label="Close"
        className="absolute right-4 top-4 text-red-700 opacity-85 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#32261B] hover:scale-125 duration-150 cursor-pointer"
      >
        <XIcon className="h-6 w-6" />
      </DialogClose>
      {children}
    </DialogContent>
  );
}

export default function TaskIcon() {
  const [open, setOpen] = useState(false);
  const { data } = useGetEmployeeTasks();

  const pendingCount = useMemo(() => {
    const tasks: TaskStatusItem[] = data?.verifiedTasks ?? [];
    return tasks.filter((task) => task.status === 'approved' && task.pendingOrders > 0).length;
  }, [data?.verifiedTasks]);

  const hasRewards = pendingCount > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex flex-col items-center font-pixel gap-2">
        <DialogTrigger asChild>
          <Button
            type="button"
            aria-label="Open tasks to claim rewards"
            className={`relative h-16 w-16 rounded-full border-3 border-[#47331F] bg-[#765332] text-[#47331F] shadow-[5px_5px_0px_#000] shadow-[#47331F]/50 transition-transform hover:bg-[#765332] cursor-pointer hover:scale-105 focus-visible:ring-4 focus-visible:ring-[#F4B925]/60 ${
              hasRewards ? 'animate-pulse ring-4 ring-[#F4B925]' : ''
            }`}
          >
            <span aria-hidden className="text-5xl mb-4">
              💎
            </span>
            {hasRewards ? (
              <span
                className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#F4B925] shadow-[0_0_8px_3px_#F4B925]"
                aria-hidden
              />
            ) : null}
          </Button>
        </DialogTrigger>
        {hasRewards ? (
          <p className="text-xs font-semibold text-[#47331F] text-center leading-tight">
            Rewards are ready to claim!
          </p>
        ) : (
          <p className="text-xs text-[#6b5038] text-center leading-tight">
            No rewards to claim yet
          </p>
        )}
      </div>

      <WideDialogContent>
        <DialogHeader>
          <DialogTitle className="text-md text-center font-semibold text-[#E89C30]">
            Claimable Tasks
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          <TasksTable />
        </div>
      </WideDialogContent>
    </Dialog>
  );
}
