'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import type { TaskStatusItem, TaskStatusKind } from './types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TaskStatusSectionProps {
  status: TaskStatusKind;
  task: TaskStatusItem[];
  isLoading: boolean;
  children: React.ReactNode;
}

export function TaskStatusSection({ status, task, isLoading, children }: TaskStatusSectionProps) {
  const statusAccentClassName =
    status === 'Current'
      ? 'bg-[#e7c27f] text-[#4b3522] border-[#c79a54]'
      : status === 'In Review'
        ? 'bg-[#d7e3f4] text-[#204b61] border-[#87a9bc]'
        : status === 'Approved'
          ? 'bg-[#d8efdb] text-[#1f5a36] border-[#7eb07f]'
          : 'bg-[#f4d6ce] text-[#8b2e22] border-[#d18d7e]';

  return (
    <div className="flex h-full min-w-0 w-full flex-col gap-2">
      <header className="flex w-full items-center justify-between gap-2 px-1">
        <h5 className="flex min-w-0 items-center gap-1.5 font-jersey text-[14px] leading-none tracking-[0.06em] text-[#3f2a1a] sm:gap-2 sm:text-[16px]">
          <span className={`inline-flex w-fit rounded-full border-2 px-2.5 py-1 ${statusAccentClassName}`}>
            {status}{' '}
          </span>
          <span className="rounded-full border-2 border-[#d4c5a8] bg-[#f7efdf] px-2 py-1 text-[14px] leading-none tracking-[0.04em] text-[#6b5038] sm:px-2.5 sm:text-[14px]">
            {task.length ?? 0}
          </span>
        </h5>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="size-7 shrink-0 rounded-full border-2 border-[#d4c5a8] bg-[#f7efdf] p-1.25 text-[#8a6039] shadow-none cursor-pointer transition-all duration-200 hover:bg-[#efe2ca]" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs border-[#9b7a56] bg-[#FFF2CC] text-center font-jersey text-[14px] leading-snug tracking-[0.04em] text-[#3B2A1A]">
            {status === 'Current'
              ? 'Tasks in this section have orders you have not fully completed.'
              : status === 'In Review'
                ? 'Tasks in this section pending requests for verification to the manager.'
                : status === 'Approved'
                  ? 'Tasks approved by manager. Tasks return back to current section once you claim your points but have not completed all the orders.'
                  : status === 'Rejected'
                    ? 'Tasks rejected by manager. They can still be resubmitted. Press redo task; it will transfer to current where you can submit it again.'
                    : null}
          </TooltipContent>
        </Tooltip>
      </header>
      <div className="flex min-h-0 flex-1 w-full flex-col overflow-hidden rounded-lg border-2 border-[#d4c5a8] bg-[#f7efdf] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
        <ScrollArea className="flex-1 min-h-0 w-full">
          <div className="flex min-w-0 w-full flex-col items-stretch gap-2 p-2">
            {isLoading ? (
              <>
                <Skeleton className="h-16 w-full rounded-[1rem] bg-[#eadbc1]" />
                <Skeleton className="h-16 w-full rounded-[1rem] bg-[#eadbc1]" />
              </>
            ) : (
              children
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
