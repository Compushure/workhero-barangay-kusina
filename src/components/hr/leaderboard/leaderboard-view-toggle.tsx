'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';

interface LeaderboardViewToggleProps {
  currentView: 'generate' | 'past';
}

export function LeaderboardViewToggle({ currentView }: LeaderboardViewToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleSwitch = (view: 'generate' | 'past') => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === 'generate') {
      params.delete('view');
    } else {
      params.set('view', 'past');
      // Clear period params so the past-ranks list is shown, not a specific rank
      params.delete('show');
      params.delete('year');
      params.delete('week');
      params.delete('month');
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  return (
    <div className="flex w-full flex-wrap items-center gap-1 rounded-full border border-accent/30 bg-background/80 p-1 shadow-sm sm:w-auto sm:flex-nowrap">
      <button
        onClick={() => handleSwitch('generate')}
        className={cn(
          'control-h flex-1 rounded-full px-4 text-sm font-semibold transition-all sm:flex-none',
          currentView === 'generate'
            ? 'bg-primary-gradient text-white shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Generate Rankings
      </button>
      <button
        onClick={() => handleSwitch('past')}
        className={cn(
          'control-h flex-1 rounded-full px-4 text-sm font-semibold transition-all sm:flex-none',
          currentView === 'past'
            ? 'bg-primary-gradient text-white shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        View Past Rankings
      </button>
    </div>
  );
}
