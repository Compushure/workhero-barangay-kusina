'use client';

import { CircleDashed } from 'lucide-react';

interface NavigationDisplayProps {
  isNavigating: boolean;
  label?: string;
  className?: string;
  iconClassName?: string;
}

export function NavigationDisplay({
  isNavigating,
  label = 'Managing tasks...',
  className,
  iconClassName,
}: NavigationDisplayProps) {
  if (!isNavigating) return null;

  return (
    <div
      className={
        className ?? 'inline-flex items-center justify-center rounded-full bg-white/10 p-2'
      }
      title={label}
      aria-live="polite"
      aria-label={label}
    >
      <CircleDashed className={iconClassName ?? 'size-4 animate-spin text-accent'} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
