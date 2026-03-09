'use client';

import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import TasksTable from './quick-task-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGetEmployeeTasks } from '@/hooks/tanstack/queries/employeeTasksQueries';
import type { TaskStatusItem } from '@/components/employee/task-status/types';

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
      <div className="flex flex-col items-center gap-2">
        <DialogTrigger asChild>
          <Button
            type="button"
            aria-label="Open tasks to claim rewards"
            className={`relative h-16 w-16 rounded-full border-2 border-[#47331F] bg-[#E8DBBF] text-[#47331F] shadow-[5px_5px_0px_#000] shadow-[#47331F]/50 transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-[#F4B925]/60 ${
              hasRewards ? 'animate-pulse ring-4 ring-[#F4B925]' : ''
            }`}
          >
            <Sparkles className="h-8 w-8" aria-hidden />
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
            Rewards are ready to claim
          </p>
        ) : (
          <p className="text-xs text-[#6b5038] text-center leading-tight">No pending rewards</p>
        )}
      </div>

      <DialogContent className="max-w-5xl w-[90vw] bg-background border-[#47331F]/40">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            Approved tasks ready to claim
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          <TasksTable />
        </div>
      </DialogContent>
    </Dialog>
  );
}
