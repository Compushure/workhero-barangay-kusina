'use client';

import { Clock3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { AttendanceStatus } from '@/types/attendance';

interface HrManagerMobileAttendanceTriggerProps {
  disabled: boolean;
  shouldRemind?: boolean;
  label: string;
  tooltipLabel: string;
  onClick: () => void;
  status?: AttendanceStatus;
}

export function HrManagerMobileAttendanceTrigger({
  disabled,
  shouldRemind = false,
  label,
  tooltipLabel,
  onClick,
  status,
}: HrManagerMobileAttendanceTriggerProps) {
  // Determine status badge display
  let statusText: string | null = null;
  let statusColor = '';
  
  if (status?.isAbsent) {
    statusText = 'Absent';
    statusColor = 'text-red-600';
  } else if (status?.hasTimedOut) {
    statusText = 'Timed Out';
    statusColor = 'text-green-600';
  } else if (status?.isOnBreak) {
    statusText = 'On Break';
    statusColor = 'text-amber-600';
  } else if (status?.hasTimedIn) {
    statusText = 'Active';
    statusColor = 'text-blue-600';
  } else if (status?.canTimeIn) {
    statusText = 'Ready';
    statusColor = 'text-emerald-600';
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          className={`flex flex-col items-center justify-center rounded-xl px-1 py-2 pb-2.5 text-primary transition-all duration-300 hover:bg-accent/20 hover:text-orange-500 ${
            disabled ? 'pointer-events-none opacity-50' : ''
          } ${shouldRemind ? 'animate-pulse' : ''}`}
        >
          <Clock3 className="size-4" strokeWidth={1.9} />
          <span className="text-[0.7rem] font-medium mt-1 w-full truncate text-center leading-tight">
            {label}
          </span>
          {statusText && (
            <span className={`text-[9px] font-semibold mt-0.5 ${statusColor}`}>
              {statusText}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" align="center" className="bg-card text-foreground shadow-sm/25">
        <div className="flex flex-col gap-1">
          <span>{tooltipLabel}</span>
          {statusText && <span className="text-xs text-muted-foreground">{statusText}</span>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
