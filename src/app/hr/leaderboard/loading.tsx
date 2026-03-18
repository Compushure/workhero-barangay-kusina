'use client';

import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import LeaderboardTableSkeleton from '@/components/hr/leaderboard/leaderboard-table-skeleton';
import { PastRanksListSkeleton } from '@/components/hr/leaderboard/past-ranks-list-skeleton';

function ViewToggleSkeleton() {
  return (
    <div className="flex h-fit w-full overflow-hidden rounded-md border border-accent/25 bg-card/75 shadow-sm/25 sm:w-fit">
      <Skeleton className="control-h flex-1 rounded-l-md bg-gray-300 sm:w-40 sm:flex-none" />
      <Skeleton className="control-h flex-1 rounded-r-md bg-gray-300 sm:w-40 sm:flex-none" />
    </div>
  );
}

function PeriodSelectorSkeleton() {
  return (
    <div className="sticky top-(--sticky-top-gap) z-20 mx-2 rounded-2xl border border-accent/20 bg-card p-3 shadow-sm/40 backdrop-blur-sm sm:p-3.5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[240px_minmax(0,1fr)_auto]">
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
          <section className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-44 rounded bg-gray-300" />
              <Skeleton className="h-4 w-80 rounded bg-gray-300" />
            </div>
            <ViewToggleSkeleton />
          </section>

          {isPastView ? null : <PeriodSelectorSkeleton />}

          {isPastView ? <Skeleton className="h-4 w-40 rounded bg-gray-300" /> : null}
        </div>

        {/* Main content area */}
        {isPastView ? <PastRanksListSkeleton /> : <LeaderboardTableSkeleton />}
      </div>
    </main>
  );
}
