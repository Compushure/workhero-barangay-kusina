'use client';

import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import LeaderboardTableSkeleton from '@/components/hr/leaderboard/leaderboard-table-skeleton';
import { PastRanksListSkeleton } from '@/components/hr/leaderboard/past-ranks-list-skeleton';

function ViewToggleSkeleton() {
  return (
    <div className="flex w-full items-center rounded-full border border-gray-200 bg-gray-100 p-1 gap-1 sm:w-auto sm:gap-0.5">
      <Skeleton className="min-h-10 flex-1 rounded-full sm:flex-none sm:w-36" />
      <Skeleton className="min-h-10 flex-1 rounded-full sm:flex-none sm:w-36" />
    </div>
  );
}

function PeriodSelectorSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      {/* Period Type */}
      <div className="flex w-full flex-col gap-1.5 sm:w-auto">
        <Skeleton className="h-3.5 w-20 rounded" />
        <Skeleton className="h-10 w-full rounded-md sm:w-28" />
      </div>

      {/* Period value */}
      <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:min-w-56">
        <Skeleton className="h-3.5 w-12 rounded" />
        <Skeleton className="h-10 w-full rounded-md sm:min-w-56" />
      </div>

      {/* Generate button */}
      <Skeleton className="h-10 w-full rounded-md sm:w-32 sm:self-end" />
    </div>
  );
}

export default function LeaderboardLoading() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const isPastView = view === 'past';

  return (
    <div className="min-h-screen overflow-x-hidden bg-white px-3 py-3 sm:px-4 sm:py-4">
      <div className="mx-auto mt-2 w-full max-w-7xl sm:mt-4">
        <div className="mb-2 sm:mb-3">
          {/* Header row */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-40 rounded sm:h-9 sm:w-48" />
              <Skeleton className="h-3.5 w-64 rounded sm:h-4 sm:w-80" />
            </div>
            <ViewToggleSkeleton />
          </div>

          {/* When navigating to "View Past Rankings", show the Past Ranks list skeleton instead
              of the generate-period selector skeleton. */}
          {isPastView ? <></> : <PeriodSelectorSkeleton />}
        </div>

        {/* Main content area */}
        {isPastView ? <PastRanksListSkeleton /> : <LeaderboardTableSkeleton />}
      </div>
    </div>
  );
}
