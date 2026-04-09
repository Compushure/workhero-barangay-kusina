'use client';

import { ChevronDown, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getTaskSectionStatusChipMeta } from './task-status-utils';
import type { TaskStatusItem, TaskStatusKind } from './types';

interface TaskStatusSectionProps {
  status: TaskStatusKind;
  tasks: TaskStatusItem[];
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function TaskCardSkeleton() {
  return (
    <div className="w-full rounded-xl border-2 border-[#d4c5a8] bg-[#fdf5e8] px-3.5 py-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-6 w-44 bg-[#eadbc1]" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-4 w-4 rounded-sm bg-[#eadbc1]" />
              <Skeleton className="h-4 w-28 bg-[#eadbc1]" />
            </div>
          </div>
          <div className="rounded-xl border-2 border-[#d4c5a8] bg-[#f3e4c9] px-2 py-1.5">
            <Skeleton className="h-12 w-12 bg-[#eadbc1]" />
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-7 w-18 rounded-md bg-[#d7e3f4]" />
          <Skeleton className="h-7 w-16 rounded-md bg-[#eadbc1]" />
          <Skeleton className="h-7 w-14 rounded-md bg-[#d7e3f4]" />
          <Skeleton className="h-7 w-16 rounded-md bg-[#f4d6ce]" />
          <Skeleton className="h-7 w-16 rounded-md bg-[#efe2ca]" />
        </div>
      </div>
    </div>
  );
}

function getStatusDescription(status: TaskStatusKind): string {
  if (status === 'Current') {
    return 'Tasks in this section still have orders left for you to finish.';
  }

  if (status === 'In Review') {
    return 'Tasks in this section are waiting for manager verification.';
  }

  if (status === 'Approved') {
    return 'Tasks in this section were approved by the manager.';
  }

  return 'Tasks in this section were rejected and can be redone.';
}

export function TaskStatusSection({
  status,
  tasks,
  isLoading,
  open,
  onOpenChange,
  children,
}: TaskStatusSectionProps) {
  const statusChipMeta = getTaskSectionStatusChipMeta(status);
  const StatusIcon = statusChipMeta.icon;

  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className="flex min-h-0 min-w-0 w-full flex-col gap-2 transition-all duration-200 xl:h-full"
    >
      <header className="flex w-full items-center justify-between gap-2 px-1">
        <h5 className="flex min-w-0 items-center gap-1.5 font-jersey text-[14px] leading-none tracking-[0.06em] text-[#3f2a1a] sm:gap-2 sm:text-[16px]">
          <span
            className={`inline-flex w-fit items-center gap-1 rounded-full border-2 px-2.5 py-1 ${statusChipMeta.className}`}
          >
            <StatusIcon className="size-4 shrink-0" />
            <span>{status}</span>
          </span>
          <span className="rounded-full border-2 border-[#d4c5a8] bg-[#f7efdf] px-2 py-1 text-[14px] leading-none tracking-[0.04em] text-[#6b5038] sm:px-2.5">
            {tasks.length}
          </span>
        </h5>

        <div className="flex shrink-0 items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex size-7 items-center justify-center rounded-full border-2 border-[#d4c5a8] bg-[#f7efdf] text-[#8a6039] transition-all duration-200 hover:bg-[#efe2ca]"
                aria-label={`More information about ${status}`}
              >
                <Info className="size-4.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs border-[#9b7a56] bg-[#FFF2CC] text-center font-jersey text-[14px] leading-snug tracking-[0.04em] text-[#3B2A1A]">
              {getStatusDescription(status)}
            </TooltipContent>
          </Tooltip>

          <CollapsibleTrigger asChild>
            <button
              type="button"
              aria-label={`${open ? 'Collapse' : 'Expand'} ${status} section`}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-[#d4c5a8] bg-[#f7efdf] text-[#8a6039] transition-all duration-200 hover:bg-[#efe2ca]"
            >
              <ChevronDown
                className={`size-4 transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
              />
            </button>
          </CollapsibleTrigger>
        </div>
      </header>

      <CollapsibleContent className="min-h-0 overflow-hidden data-[state=closed]:hidden xl:h-full xl:flex-1">
        <div className="flex min-h-0 w-full flex-col overflow-hidden rounded-xl border-2 border-[#9b7a56] bg-[#f7efdf] shadow-[0_0_0_1px_rgba(155,122,86,0.2),inset_0_1px_0_rgba(255,255,255,0.35)] xl:h-full xl:flex-1">
          <ScrollArea className="min-h-0 w-full h-96 sm:h-112 md:h-[46vh] lg:h-[50vh] xl:h-full">
            <div className="flex min-w-0 w-full flex-col items-stretch gap-2 p-2">
              {isLoading ? (
                <>
                  <TaskCardSkeleton />
                  <TaskCardSkeleton />
                </>
              ) : tasks.length > 0 ? (
                children
              ) : (
                <div className="rounded-lg border-2 border-dashed border-[#d4c5a8] bg-[#fdf5e8] px-4 py-5 text-center text-[14px] tracking-[0.04em] text-[#8a6039]">
                  No tasks in this section right now.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CollapsibleContent>

      {!open ? (
        <div className="rounded-lg border-2 border-[#9b7a56] bg-[#f7efdf]/92 px-3 py-2 text-center font-jersey text-[14px] tracking-[0.04em] text-[#8a6039] shadow-[0_0_0_1px_rgba(155,122,86,0.14)]">
          Section collapsed. Expand to view tasks.
        </div>
      ) : null}
    </Collapsible>
  );
}
