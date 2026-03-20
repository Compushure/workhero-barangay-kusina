'use client';

import { Clock3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HrManagerMobileAttendanceTriggerProps {
  disabled: boolean;
  shouldRemind?: boolean;
  label: string;
  tooltipLabel: string;
  onClick: () => void;
}

export function HrManagerMobileAttendanceTrigger({
  disabled,
  shouldRemind = false,
  label,
  tooltipLabel,
  onClick,
}: HrManagerMobileAttendanceTriggerProps) {
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
          <span className="text-sidebar-label mt-1 w-full truncate text-center leading-tight">
            {label}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" align="center" className="bg-card text-foreground shadow-sm/25">
        {tooltipLabel}
      </TooltipContent>
    </Tooltip>
  );
}
