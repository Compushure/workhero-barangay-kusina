'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import type { TaskStatusKind } from './types';

interface TaskStatusColumnProps {
  status: TaskStatusKind;
  children: React.ReactNode;
}

export function TaskStatusColumn({ status, children }: TaskStatusColumnProps) {
  return (
    <div className="flex flex-col gap-3 min-w-0 w-full">
      <span className="inline-flex w-fit rounded-full bg-muted text-muted-foreground px-4 py-1.5 text-base font-semibold">
        {status}
      </span>
      {/* Exactly 3 task cards visible; 4+ tasks scroll vertically */}
      <div className="bg-muted/50 border rounded-xl p-4 sm:p-5 shadow-sm h-[300px] sm:h-[340px] md:h-[350px] flex flex-col min-h-0 overflow-hidden w-full">
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-4 pr-4">{children}</div>
        </ScrollArea>
      </div>
    </div>
  );
}
