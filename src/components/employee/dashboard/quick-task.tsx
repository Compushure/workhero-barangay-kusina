'use client';

import Image from 'next/image';
import { type ComponentProps, useMemo, useState } from 'react';
import { XIcon } from 'lucide-react';
import TasksTable from './quick-task-table';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useGetEmployeeTasks } from '@/hooks/tanstack/queries/employeeTasksQueries';
import type { TaskStatusItem } from '@/components/employee/task-status/types';
import type { ClaimTaskResult } from '@/actions/employee/tasks';
import { type CookingLaunchPayload, useCookingStore } from '@/store/cookingStore';

type DialogContentProps = ComponentProps<typeof DialogContent>;

function WideDialogContent({ children, className, ...props }: DialogContentProps) {
  return (
    <DialogContent
      showCloseButton={false}
      overlayClassName="z-[15]"
      className={`kitchen-parchment-card z-15 w-[92vw] max-w-210 max-h-[82vh] gap-0 rounded-2xl font-pixel p-0 overflow-hidden ${className ?? ''}`}
      {...props}
    >
      <DialogClose
        aria-label="Close"
        className="absolute right-4 top-3 z-10 h-10 w-10 rounded-full bg-[#e4d3b3] text-[#3f2a1a] border-2 border-[#a88961] transition hover:scale-105 hover:bg-[#dcc7a2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8a6844]/60 focus-visible:ring-offset-[#eadbc1] cursor-pointer flex items-center justify-center"
      >
        <XIcon className="h-5 w-5" />
      </DialogClose>
      {children}
    </DialogContent>
  );
}

export default function TaskIcon() {
  const [open, setOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [claimedTaskIds, setClaimedTaskIds] = useState<Record<string, boolean>>({});
  const [retainedClaimTasks, setRetainedClaimTasks] = useState<Record<string, TaskStatusItem>>({});
  const [cookReadyByTaskId, setCookReadyByTaskId] = useState<
    Record<string, ClaimTaskResult['cookOutcome']>
  >({});
  const { data } = useGetEmployeeTasks();
  const launchCooking = useCookingStore((state) => state.launchCooking);
  const activeCookingTaskId = useCookingStore((state) => state.trigger?.taskId ?? null);

  const handlePrepareFood = (payload: CookingLaunchPayload) => {
    setOpen(false);
    setTimeout(() => {
      launchCooking(payload);
    }, 220);
  };

  const pendingCount = useMemo(() => {
    const tasks: TaskStatusItem[] = data?.verifiedTasks ?? [];

    const isServerPrepareEligible = (task: TaskStatusItem) =>
      task.status === 'approved' &&
      task.completedOrders === task.maxOrders &&
      Boolean(task.claimedAt) &&
      !task.completedAt;

    const serverTaskIds = tasks
      .filter(
        (task) =>
          (task.status === 'approved' &&
            task.pendingOrders > 0 &&
            task.completedOrders === task.maxOrders) ||
          isServerPrepareEligible(task)
      )
      .map((task) => task.id);

    const retainedTaskIds = Object.keys(retainedClaimTasks).filter(
      (taskId) => cookReadyByTaskId[taskId]?.canPrepareFood
    );

    const pendingTaskIds = new Set([...serverTaskIds, ...retainedTaskIds]);

    // While a task is actively in cooking flow, hide it from quick-task badge count.
    if (activeCookingTaskId) {
      pendingTaskIds.delete(activeCookingTaskId);
    }

    return pendingTaskIds.size;
  }, [data?.verifiedTasks, retainedClaimTasks, cookReadyByTaskId, activeCookingTaskId]);

  const hasRewards = pendingCount > 0;
  const taskBadgeLabel = pendingCount > 99 ? '99+' : String(pendingCount);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center font-pixel">
            <DialogTrigger asChild>
              <Button
                type="button"
                aria-label="Open tasks to claim rewards"
                className={`relative h-18 w-18 rounded-full border-3 border-[#47331F] bg-[#8A6039] shadow-[5px_5px_0px_#000] shadow-[#47331F]/55 transition-transform hover:bg-[#9A6E45] cursor-pointer hover:scale-105 focus-visible:ring-4 focus-visible:ring-[#F4B925]/60 ${
                  hasRewards ? 'animate-pulse ring-4 ring-[#F4B925]' : ''
                }`}
              >
                <Image
                  src="/assets/kitchen-bg/notepad-icon.png"
                  alt="Task rewards icon"
                  width={52}
                  height={52}
                  className="h-12 w-12 object-contain"
                  priority
                />
                {hasRewards ? (
                  <span
                    className="absolute -top-2 -right-2 min-w-[1.35rem] h-[1.1rem] rounded-full bg-[#F4B925] px-1 text-center font-pixel text-[8px] leading-[1.1rem] text-[#2f2115] border border-[#47331F] shadow-[0_0_8px_2px_#F4B925]"
                    aria-label={`${taskBadgeLabel} claimable quick tasks`}
                  >
                    {taskBadgeLabel}
                  </span>
                ) : null}
              </Button>
            </DialogTrigger>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="font-pixel bg-[#FFF2CC] text-[#3B2A1A] border-[#47331F]/30"
        >
          tasks to claim points for
        </TooltipContent>
      </Tooltip>

      <WideDialogContent>
        <DialogHeader className="border-b border-[#8a6844]/30 bg-[#e1d2b7] px-4 py-3">
          <DialogTitle className="text-[16px] text-center font-pixel text-[#3f2a1a] tracking-wider leading-relaxed">
            Claimable Tasks
          </DialogTitle>
          <div className="mx-auto mt-1 w-full max-w-65">
            <Select
              value={sortOrder}
              onValueChange={(value) => {
                if (value === 'newest' || value === 'oldest') {
                  setSortOrder(value);
                }
              }}
            >
              <SelectTrigger className="h-11 rounded-lg border-[#9b7a56] bg-[#f7efdf] font-pixel text-[14px] text-[#4b3522]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#f6eddd] border-[#9b7a56] text-[#4b3522]">
                <SelectItem value="newest" className="font-pixel text-[14px]">
                  Newest
                </SelectItem>
                <SelectItem value="oldest" className="font-pixel text-[14px]">
                  Oldest
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>
        <div className="max-h-[54vh] overflow-y-auto bg-[#eadbc1] p-3">
          <TasksTable
            sortOrder={sortOrder}
            onPrepareFood={handlePrepareFood}
            claimedTaskIds={claimedTaskIds}
            setClaimedTaskIds={setClaimedTaskIds}
            retainedClaimTasks={retainedClaimTasks}
            setRetainedClaimTasks={setRetainedClaimTasks}
            cookReadyByTaskId={cookReadyByTaskId}
            setCookReadyByTaskId={setCookReadyByTaskId}
          />
        </div>
      </WideDialogContent>
    </Dialog>
  );
}
