'use client';

import { useEffect } from 'react';
import { useNavigationStore } from '@/store/navigationStore';
import { cn } from '@/lib/utils';

interface NavigationOverlayProps {
  className?: string;
}

export function NavigationOverlay({ className }: NavigationOverlayProps) {
  const { isNavigating, isLoggingOut } = useNavigationStore();
  const isActive = isNavigating || isLoggingOut;

  useEffect(() => {
    if (!isActive) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      className={cn('fixed inset-0 bg-black/15 backdrop-blur-[1px] z-50', className)}
      aria-hidden="true"
    />
  );
}
