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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[240px_minmax(0,1fr)_auto] xl:grid-cols-[130px_260px_auto]">
        <div className="flex w-full flex-col gap-1.5 xl:max-w-[130px]">
          <Skeleton className="h-3 w-20 rounded bg-gray-300" />
          <Skeleton className="control-h w-full rounded-lg bg-gray-300" />
        </div>
        <div className="flex w-full flex-col gap-1.5 xl:max-w-[260px]">
          <Skeleton className="h-3 w-14 rounded bg-gray-300" />
          <Skeleton className="control-h w-full rounded-lg bg-gray-300" />
        </div>
        <div className="flex w-full flex-col gap-1.5 self-start">
          <div className="grid w-full gap-2 sm:grid-cols-2 xl:grid-cols-[172px_172px]">
            <div className="flex w-full flex-col items-start gap-1.5 xl:max-w-[172px]">
              <div className="flex min-h-4 items-center gap-1.5">
                <Skeleton className="h-3.5 w-3.5 rounded-full bg-gray-300" />
                <Skeleton className="h-3 w-24 rounded bg-gray-300" />
              </div>
              <Skeleton className="control-h w-full rounded-full bg-gray-300" />
            </div>
            <div className="flex w-full flex-col items-start gap-1.5 xl:max-w-[172px]">
              <Skeleton className="h-3 w-28 rounded bg-gray-300" />
              <div className="control-h flex w-full overflow-hidden rounded-md border border-accent/25 bg-card/75 shadow-sm/25">
                <Skeleton className="control-h flex-1 rounded-none rounded-l-md bg-gray-300/90" />
                <Skeleton className="control-h flex-1 rounded-none rounded-r-md bg-gray-300/70" />
              </div>
            </div>
          </div>
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
        </div>

        {/* Main content area */}
        {isPastView ? <PastRanksListSkeleton /> : <LeaderboardTableSkeleton />}
      </div>
    </main>
  );
}
