'use client';

import LeaderboardTableSkeleton from '@/components/hr/leaderboard/leaderboard-table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function PastRanksListSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="manager-sticky-controls !mx-0 w-full rounded-2xl p-3 sm:p-3.5 xl:mr-auto xl:w-fit">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[240px_minmax(0,1fr)_196px] xl:grid-cols-[130px_210px_196px]">
            <div className="flex w-full flex-col gap-1.5 xl:max-w-[130px]">
              <Skeleton className="h-3 w-24 rounded bg-gray-300" />
              <Skeleton className="control-h w-full rounded-lg bg-gray-300" />
            </div>
            <div className="flex w-full flex-col gap-1.5 xl:max-w-[210px]">
              <Skeleton className="h-3 w-28 rounded bg-gray-300" />
              <Skeleton className="control-h w-full rounded-lg bg-gray-300" />
            </div>
            <div className="flex w-full flex-col gap-1.5 lg:justify-end">
              <Skeleton className="h-3 w-24 rounded bg-gray-300" />
              <Skeleton className="control-h w-full rounded-lg bg-gray-300" />
            </div>
          </div>
        </div>

        <LeaderboardTableSkeleton periodHeaderLabel="Past Period" />
      </div>
    </div>
  );
}
