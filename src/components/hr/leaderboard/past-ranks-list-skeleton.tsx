'use client';

import LeaderboardTableSkeleton from '@/components/hr/leaderboard/leaderboard-table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function PastRanksListSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="w-full self-start rounded-2xl border border-accent/20 bg-background-soft p-3 shadow-sm/40 sm:p-3.5 lg:max-w-[574px]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[130px_210px_186px]">
            <div className="flex w-full flex-col gap-1.5 xl:max-w-[130px]">
              <Skeleton className="h-3 w-24 rounded bg-gray-300" />
              <Skeleton className="control-h w-full rounded-lg bg-gray-300" />
            </div>
            <div className="flex w-full flex-col gap-1.5 xl:max-w-[210px]">
              <Skeleton className="h-3 w-28 rounded bg-gray-300" />
              <Skeleton className="control-h w-full rounded-lg bg-gray-300" />
            </div>
            <div className="flex w-full flex-col justify-end gap-1.5 xl:max-w-[186px]">
              <Skeleton className="h-3 w-28 rounded bg-gray-300" />
              <div className="control-h flex w-full overflow-hidden rounded-md border border-border/40 bg-card">
                <Skeleton className="h-full flex-1 rounded-none bg-gray-300" />
                <Skeleton className="h-full flex-1 rounded-none bg-gray-300" />
              </div>
            </div>
          </div>
        </div>

        <LeaderboardTableSkeleton periodHeaderLabel="Past Period" />
      </div>
    </div>
  );
}
