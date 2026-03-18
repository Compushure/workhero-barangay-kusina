'use client';

import { Clock3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HrManagerAttendanceTriggerProps {
  isCollapsed: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
  shouldRemind?: boolean;
}

export function HrManagerAttendanceTrigger({
  isCollapsed,
  disabled,
  label,
  onClick,
  shouldRemind = false,
}: HrManagerAttendanceTriggerProps) {
  const triggerButton = (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={isCollapsed ? 'Open attendance' : undefined}
      className={`inline-flex items-center justify-center shadow-sm/25 hover:scale-103 transform-gpu duration-300 ease-in-out hover:bg-[#FAA938]/20 hover:text-[#f47812] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 ${
        isCollapsed
          ? 'h-9 w-9 rounded-full'
          : 'mb-3 w-full gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium'
      } ${shouldRemind ? 'ring-2 ring-accent-secondary/50 ring-offset-2 ring-offset-muted animate-pulse' : ''}`}
    >
      <Clock3 className={`${isCollapsed ? 'size-4' : 'size-3.5'} text-accent`} />
      {!isCollapsed ? label : null}
    </button>
  );

  return isCollapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>{triggerButton}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        className="border border-accent/25 bg-card text-foreground shadow-sm/25"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  ) : (
    triggerButton
  );
}
