'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TaskStatusItem, TaskStatusKind } from './types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TaskStatusSectionProps {
  status: TaskStatusKind;
  task: TaskStatusItem[];
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function TaskStatusSection({
  status,
  task,
  isLoading,
  open,
  onOpenChange,
  children,
}: TaskStatusSectionProps) {
  const statusAccentClassName =
    status === 'Current'
      ? 'bg-[#e7c27f] text-[#4b3522] border-[#c79a54]'
      : status === 'In Review'
        ? 'bg-[#d7e3f4] text-[#204b61] border-[#87a9bc]'
        : status === 'Approved'
          ? 'bg-[#d8efdb] text-[#1f5a36] border-[#7eb07f]'
          : 'bg-[#f4d6ce] text-[#8b2e22] border-[#d18d7e]';

  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className={`flex min-w-0 w-full flex-col gap-2 transition-all duration-200 ${open ? 'h-full' : ''}`}
    >
      <header className="flex w-full items-center justify-between gap-2 px-1">
        <h5 className="flex min-w-0 items-center gap-1.5 font-jersey text-[14px] leading-none tracking-[0.06em] text-[#3f2a1a] sm:gap-2 sm:text-[16px]">
          <span className={`inline-flex w-fit rounded-full border-2 px-2.5 py-1 ${statusAccentClassName}`}>
            {status}{' '}
          </span>
          <span className="rounded-full border-2 border-[#d4c5a8] bg-[#f7efdf] px-2 py-1 text-[14px] leading-none tracking-[0.04em] text-[#6b5038] sm:px-2.5 sm:text-[14px]">
            {task.length ?? 0}
          </span>
        </h5>
        <div className="flex shrink-0 items-center gap-2">
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
                    ? 'Tasks approved by manager. Claim their rewards from the dashboard quick task.'
                    : status === 'Rejected'
                      ? 'Tasks rejected by manager. They can still be resubmitted. Press redo task; it will transfer to current where you can submit it again.'
                      : null}
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
      <CollapsibleContent className="min-h-0 flex-1 overflow-hidden data-[state=closed]:hidden">
        <div className="flex min-h-0 h-full w-full flex-col overflow-hidden rounded-lg border-2 border-[#c5ac84] bg-[#f7efdf] shadow-[0_0_0_1px_rgba(155,122,86,0.2),inset_0_1px_0_rgba(255,255,255,0.35)]">
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
      </CollapsibleContent>
      {!open ? (
        <div className="rounded-lg border-2 border-[#c5ac84] bg-[#f7efdf]/92 px-3 py-2 text-center font-jersey text-[14px] tracking-[0.04em] text-[#8a6039] shadow-[0_0_0_1px_rgba(155,122,86,0.14)]">
          Section collapsed. Expand to view tasks.
        </div>
      ) : null}
    </Collapsible>
  );
}
