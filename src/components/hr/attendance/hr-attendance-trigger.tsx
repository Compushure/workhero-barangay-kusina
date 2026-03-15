'use client';

import { Clock3 } from 'lucide-react';

interface HrAttendanceTriggerProps {
  isCollapsed: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
  shouldRemind?: boolean;
}

export function HrAttendanceTrigger({
  isCollapsed,
  disabled,
  label,
  onClick,
  shouldRemind = false,
}: HrAttendanceTriggerProps) {
  if (isCollapsed) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label="Open attendance"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#f47812]/40 bg-white/70 text-[#131C2A] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 ${
          shouldRemind
            ? 'ring-2 ring-[#f47812]/45 ring-offset-2 ring-offset-muted animate-pulse'
            : ''
        }`}
      >
        <Clock3 className="size-4" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`mb-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-[#f47812]/40 bg-white/70 px-3 py-1.5 text-xs font-medium text-[#131C2A] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 ${
        shouldRemind ? 'ring-2 ring-[#f47812]/45 ring-offset-2 ring-offset-muted animate-pulse' : ''
      }`}
    >
      <Clock3 className="size-3.5" />
      {label}
    </button>
  );
}
