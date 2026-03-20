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
      params.delete('pastDefault');
    } else {
      params.set('view', 'past');
      params.set('pastDefault', '1');
      params.set('show', '1');
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  return (
    <div className="flex w-full overflow-hidden rounded-md border border-accent/25 bg-card/75 shadow-sm/25 sm:w-fit">
      <button
        onClick={() => handleSwitch('generate')}
        className={cn(
          'flex flex-1 items-center justify-center gap-1 rounded-l-md px-2.5 py-2 text-xs font-semibold transition-all duration-500 ease-in-out sm:w-40 sm:flex-none sm:text-sm',
          currentView === 'generate'
            ? 'bg-linear-to-b from-accent-secondary to-accent text-zinc-50 shadow-sm/25'
            : 'text-secondary hover:bg-accent-secondary/25 inset-shadow-2xs/25 hover:cursor-pointer'
        )}
      >
        Generate Rankings
      </button>
      <button
        onClick={() => handleSwitch('past')}
        className={cn(
          'flex flex-1 items-center justify-center gap-1 rounded-r-md px-2.5 py-2 text-xs font-semibold transition-all duration-500 ease-in-out sm:w-40 sm:flex-none sm:text-sm',
          currentView === 'past'
            ? 'bg-linear-to-b from-accent-secondary to-accent text-zinc-50 shadow-sm/25'
            : 'text-secondary hover:bg-accent-secondary/25 inset-shadow-2xs/25 hover:cursor-pointer'
        )}
      >
        View Past Rankings
      </button>
    </div>
  );
}
