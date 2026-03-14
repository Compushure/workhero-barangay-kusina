'use client';

import { Clock3 } from 'lucide-react';

interface HrAttendanceTriggerProps {
  isCollapsed: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
}

export function HrAttendanceTrigger({
  isCollapsed,
  disabled,
  label,
  onClick,
}: HrAttendanceTriggerProps) {
  if (isCollapsed) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label="Open attendance"
        className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#f47812]/40 bg-white/70 text-[#131C2A] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Clock3 className="size-4" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mb-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-[#f47812]/40 bg-white/70 px-3 py-1.5 text-xs font-medium text-[#131C2A] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Clock3 className="size-3.5" />
      {label}
    </button>
  );
}
