'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import type { TaskStatusItem, TaskStatusKind } from './types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { useGetEmployeeTasks } from '@/hooks/tanstack/employee';
import { Skeleton } from '@/components/ui/skeleton';

interface TaskStatusSectionProps {
  status: TaskStatusKind;
  task: TaskStatusItem[];
  children: React.ReactNode;
}

export function TaskStatusSection({ status, task, children }: TaskStatusSectionProps) {
  const { error, isLoading } = useGetEmployeeTasks();
  
  return (
    <div className="flex flex-col gap-3 min-w-0 w-full">
      <header className="flex w-full justify-between px-2">
        <h5 className="text-base font-semibold flex items-center gap-2">
          <span className='inline-flex w-fit rounded-full bg-muted text-muted-foreground px-4 py-0.5 shadow-sm/15'>
            {status}{' '}
          </span>
          <span className="bg-gray-50 px-2.5 py-0.5 rounded-full ml-1 shadow-sm/15">
            {task.length ?? 0}
          </span>
        </h5>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className='size-8 p-1 rounded-full bg-muted text-foreground hover:bg-foreground hover:text-muted shadow-sm/15 cursor-pointer transition-all ease-in-out duration-200'/>
          </TooltipTrigger>
          <TooltipContent className='text-sm w-xs max-w-md text-wrap'>
                {status ===  "Current" ? 'Tasks in this section have orders you have not fully completed.' :
                status === "In Review" ? 'Tasks in this section pending requests for verification to the manager.' :
                status === "Approved" ? 'Tasks approved by manager. Tasks return back to current section once you claim your points but have not completed all the orders.' :
                status === "Rejected" ? 'Tasks rejected by manager. They can still be resubmitted. Press redo task; it will transfer to current where you can submit it again.' : 
                null}
          </TooltipContent>
        </Tooltip>
      </header>
      {/* Exactly 3 task cards visible; 4+ tasks scroll vertically */}
      <div className="bg-[#2D061D]/35 border rounded-xl shadow-sm h-80 flex flex-col min-h-0 overflow-hidden w-full inset-shadow-sm/25">
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-4 items-center p-4">
            {isLoading ? (
              <>
              <Skeleton className="w-full h-20 rounded-[1.1875rem] bg-background" />
              <Skeleton className="w-full h-20 rounded-[1.1875rem] bg-background" />
              </>
            ) : (
              <>{children}</>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
