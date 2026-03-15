'use client';

import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import LeaderboardTableSkeleton from '@/components/hr/leaderboard/leaderboard-table-skeleton';
import { PastRanksListSkeleton } from '@/components/hr/leaderboard/past-ranks-list-skeleton';

function ViewToggleSkeleton() {
  return (
    <div className="flex w-full items-center rounded-full border border-gray-200 bg-gray-100 p-1 gap-1 sm:w-auto sm:gap-0.5">
      <Skeleton className="min-h-10 flex-1 rounded-full bg-gray-300 sm:flex-none sm:w-36" />
      <Skeleton className="min-h-10 flex-1 rounded-full bg-gray-300 sm:flex-none sm:w-36" />
    </div>
  );
}

function PeriodSelectorSkeleton() {
  return (
    <div className="rounded-3xl border border-accent/20 bg-card p-4 shadow-sm/40">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[280px_minmax(0,1fr)_auto]">
        <div className="flex w-full flex-col gap-1.5">
          <Skeleton className="h-3 w-20 rounded bg-gray-300" />
          <Skeleton className="control-h w-full rounded-full bg-gray-300" />
        </div>
        <div className="flex w-full flex-col gap-1.5">
          <Skeleton className="h-3 w-14 rounded bg-gray-300" />
          <Skeleton className="control-h w-full rounded-full bg-gray-300" />
        </div>
        <div className="flex w-full items-center">
          <Skeleton className="control-h w-full rounded-full bg-gray-300 lg:w-36" />
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardLoading() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const isPastView = view === 'past';

  return (
    <main className="w-full min-h-screen bg-background px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-4 sm:gap-6 2xl:max-w-screen-2xl">
        <div className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded bg-gray-300" />
            <Skeleton className="h-4 w-80 rounded bg-gray-300" />
          </div>

          <section className="manager-sticky-controls rounded-xl px-3 py-3 sm:px-4 sm:py-3.5">
            <div className="space-y-3">
              <ViewToggleSkeleton />

              {/* When navigating to "View Past Rankings", show the Past Ranks list skeleton instead
                  of the generate-period selector skeleton. */}
              {isPastView ? <></> : <PeriodSelectorSkeleton />}
            </div>
          </section>
        </div>

        {/* Main content area */}
        {isPastView ? <PastRanksListSkeleton /> : <LeaderboardTableSkeleton />}
      </div>
    </main>
  );
}
