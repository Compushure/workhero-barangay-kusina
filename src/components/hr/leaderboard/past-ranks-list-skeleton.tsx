'use client';

import { Skeleton } from '@/components/ui/skeleton';

const ROW_COUNT = 7;

function PeriodRowSkeleton() {
  return (
    <div className="w-full flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4">
      <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-24 rounded" />
      </div>
      <Skeleton className="h-9 w-28 rounded shrink-0" />
    </div>
  );
}

export function PastRanksListSkeleton() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col gap-4 flex-1 min-h-0">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-5 h-full">
          <div>
            <Skeleton className="h-6 w-56 rounded mb-2" />
            <Skeleton className="h-4 w-72 rounded" />
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 flex items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-10 w-44 rounded bg-white" />
            </div>
            <div className="relative flex-1">
              <Skeleton className="h-10 w-full rounded-full bg-white" />
            </div>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden gap-2">
            {Array.from({ length: ROW_COUNT }).map((_, i) => (
              <PeriodRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
