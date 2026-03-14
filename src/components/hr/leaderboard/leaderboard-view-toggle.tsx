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
    <div className="flex w-full flex-wrap items-center rounded-full border border-gray-200 bg-gray-100 p-1 gap-1 sm:w-auto sm:flex-nowrap sm:gap-0.5">
      <button
        onClick={() => handleSwitch('generate')}
        className={cn(
          'min-h-10 flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:flex-none sm:px-4 sm:text-sm',
          currentView === 'generate'
            ? 'bg-[#E07C24] shadow-sm text-white'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Generate Rankings
      </button>
      <button
        onClick={() => handleSwitch('past')}
        className={cn(
          'min-h-10 flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:flex-none sm:px-4 sm:text-sm',
          currentView === 'past'
            ? 'bg-[#E07C24] shadow-sm text-white'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        View Past Rankings
      </button>
    </div>
  );
}
