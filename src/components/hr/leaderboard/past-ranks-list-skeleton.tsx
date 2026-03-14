'use client';

import { Skeleton } from '@/components/ui/skeleton';

const ROW_COUNT = 7;

function PeriodRowSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-28 rounded sm:w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-24 rounded" />
      </div>
      <Skeleton className="h-10 w-full rounded shrink-0 sm:h-9 sm:w-28" />
    </div>
  );
}

export function PastRanksListSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex h-full flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
          <div>
            <Skeleton className="mb-2 h-6 w-52 rounded sm:w-56" />
            <Skeleton className="h-4 w-72 rounded" />
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-3 sm:flex-row sm:items-end sm:p-4">
            <div className="flex w-full flex-col gap-1.5 sm:w-auto">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-10 w-full rounded bg-white sm:w-44" />
            </div>
            <div className="relative w-full flex-1">
              <Skeleton className="h-10 w-full rounded-full bg-white" />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 overflow-hidden">
            {Array.from({ length: ROW_COUNT }).map((_, i) => (
              <PeriodRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
