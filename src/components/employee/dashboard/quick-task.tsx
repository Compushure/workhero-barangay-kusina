'use client';

import Image from 'next/image';
import { type ComponentProps, useMemo, useState } from 'react';
import { ArrowUpDown, Filter, XIcon } from 'lucide-react';
import TasksTable, { type QuickTaskFilter } from './quick-task-table';
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const [filterBy, setFilterBy] = useState<QuickTaskFilter>('all');
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

    const getClaimableOrderCount = (task: TaskStatusItem) => {
      if (task.pendingOrders > 0) return task.pendingOrders;
      if (!task.claimedAt && task.completedOrders > 0) return task.completedOrders;
      return 0;
    };

    const isServerClaimablePoints = (task: TaskStatusItem) =>
      task.status === 'approved' && getClaimableOrderCount(task) > 0;

    const isServerPrepareEligible = (task: TaskStatusItem) =>
      task.status === 'approved' &&
      task.completedOrders === task.maxOrders &&
      task.pendingOrders === 0 &&
      Boolean(task.claimedAt) &&
      !task.completedAt;

    const serverTaskIds = tasks
      .filter((task) => isServerClaimablePoints(task) || isServerPrepareEligible(task))
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
  const filterLabel =
    filterBy === 'claim-points-only'
      ? 'Claim Points Only'
      : filterBy === 'prepare-dish-only'
        ? 'Prepare Dish Only'
        : filterBy === 'points-and-dishes'
          ? 'Points and Dishes'
          : 'All';

  const checkboxItemClassName = (isActive: boolean) =>
    `group cursor-pointer rounded-md py-1.5 font-jersey text-[14px] tracking-[0.04em] transition-all duration-200 data-[state=checked]:bg-transparent data-[state=checked]:text-[#4b3522] ${
      isActive
        ? 'text-[#4b3522]'
        : 'text-[#4b3522] hover:bg-[#8a6039] hover:text-[#fff6e5] data-[highlighted]:bg-[#8a6039] data-[highlighted]:text-[#fff6e5]'
    }`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center font-pixel">
            <DialogTrigger asChild>
              <Button
                type="button"
                aria-label="Open tasks to claim rewards"
                className={`relative size-18 rounded-full border-3 border-[#47331F] bg-[#8A6039] shadow-[5px_5px_0px_#000] shadow-[#47331F]/55 transition-transform hover:bg-[#9A6E45] cursor-pointer hover:scale-105 focus-visible:ring-4 focus-visible:ring-[#F4B925]/60 ${
                  hasRewards ? 'animate-pulse ring-4 ring-[#F4B925]' : ''
                }`}
              >
                <Image
                  src="/assets/kitchen-bg/notepad-icon.png"
                  alt="Task rewards icon"
                  width={52}
                  height={52}
                  className="size-16 object-contain"
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
          <div className="mt-1 flex w-full flex-col gap-2 sm:flex-row sm:items-end sm:justify-end">
            <Select
              value={sortOrder}
              onValueChange={(value) => {
                if (value === 'newest' || value === 'oldest') {
                  setSortOrder(value);
                }
              }}
            >
              <SelectTrigger className="h-9 w-full rounded-lg border-2 border-[#9b7a56] bg-[#f7efdf] font-jersey text-[14px] tracking-[0.05em] text-[#4b3522] shadow-none outline-none transition-colors duration-200 cursor-pointer hover:bg-[#f7efdf] hover:text-[#4b3522] focus:ring-0 focus-visible:border-[#F4B925] focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:border-[#F4B925] data-[state=open]:shadow-none data-[state=open]:ring-0 sm:w-52">
                <ArrowUpDown className="size-4 text-[#8a6039]" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="w-56 border-[#9b7a56] bg-[#f6eddd] p-1 text-[#4b3522] sm:w-64">
                <SelectItem
                  value="newest"
                  className="cursor-pointer rounded-md py-1.5 font-jersey text-[14px] tracking-[0.04em] text-[#4b3522] transition-colors duration-200 data-[state=checked]:bg-transparent data-[state=checked]:text-[#4b3522] focus:bg-[#8a6039] focus:text-[#fff6e5] data-highlighted:bg-[#8a6039] data-highlighted:text-[#fff6e5]"
                >
                  Newest
                </SelectItem>
                <SelectItem
                  value="oldest"
                  className="cursor-pointer rounded-md py-1.5 font-jersey text-[14px] tracking-[0.04em] text-[#4b3522] transition-colors duration-200 data-[state=checked]:bg-transparent data-[state=checked]:text-[#4b3522] focus:bg-[#8a6039] focus:text-[#fff6e5] data-highlighted:bg-[#8a6039] data-highlighted:text-[#fff6e5]"
                >
                  Oldest
                </SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="default"
                  variant="outline"
                  className="h-9 w-full justify-start gap-2 rounded-lg border-2 border-[#9b7a56] bg-[#f7efdf] px-3 py-1 font-jersey text-[14px] tracking-[0.05em] text-[#4b3522] shadow-none outline-none transition-colors duration-200 cursor-pointer hover:bg-[#efe2ca] hover:text-[#4b3522] focus:ring-0 focus-visible:border-[#F4B925] focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:border-[#F4B925] data-[state=open]:shadow-none data-[state=open]:ring-0 sm:w-auto"
                >
                  <Filter strokeWidth={2.5} className="h-4 w-4 text-[#6b5038]" />
                  <span className="inline-flex items-center text-[16px] leading-none">
                    {filterLabel}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                collisionPadding={12}
                className="w-64 border-[#9b7a56] bg-[#f6eddd] p-1"
              >
                <DropdownMenuLabel className="px-2 py-1 font-jersey text-[14px] tracking-[0.04em] text-[#8a6039]">
                  Quick Task Filter
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filterBy === 'all'}
                  onCheckedChange={(checked) => {
                    if (checked) setFilterBy('all');
                  }}
                  className={checkboxItemClassName(filterBy === 'all')}
                >
                  All
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterBy === 'claim-points-only'}
                  onCheckedChange={(checked) => {
                    if (checked) setFilterBy('claim-points-only');
                    else setFilterBy('all');
                  }}
                  className={checkboxItemClassName(filterBy === 'claim-points-only')}
                >
                  Claim Points Only
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterBy === 'prepare-dish-only'}
                  onCheckedChange={(checked) => {
                    if (checked) setFilterBy('prepare-dish-only');
                    else setFilterBy('all');
                  }}
                  className={checkboxItemClassName(filterBy === 'prepare-dish-only')}
                >
                  Prepare Dish Only
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterBy === 'points-and-dishes'}
                  onCheckedChange={(checked) => {
                    if (checked) setFilterBy('points-and-dishes');
                    else setFilterBy('all');
                  }}
                  className={checkboxItemClassName(filterBy === 'points-and-dishes')}
                >
                  Points and Dishes
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogHeader>
        <div className="max-h-[54vh] overflow-y-auto bg-[#eadbc1] p-3">
          <TasksTable
            sortOrder={sortOrder}
            filterBy={filterBy}
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
