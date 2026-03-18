'use client';

import { Skeleton } from '@/components/ui/skeleton';

const ROW_COUNT = 7;

function PeriodRowSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2.5 rounded-2xl border border-accent/20 bg-card px-3.5 py-3.5 shadow-sm/30 sm:flex-row sm:items-center sm:gap-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-gray-300" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-32 rounded bg-gray-300" />
          <Skeleton className="h-5 w-20 rounded-full bg-gray-300" />
        </div>
        <Skeleton className="h-3 w-28 rounded bg-gray-300" />
      </div>
      <Skeleton className="control-h w-full rounded-full bg-gray-300 sm:w-36" />
    </div>
  );
}

export function PastRanksListSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex h-full flex-col gap-4 rounded-2xl border border-accent/20 bg-card p-3.5 shadow-sm/40 sm:p-5">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-48 rounded bg-gray-300" />
            <Skeleton className="h-4 w-48 rounded bg-gray-300" />
          </div>

          <div className="inline-flex w-full flex-col overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-sm/30 sm:flex-row sm:items-stretch">
            <div className="flex min-w-33 flex-col gap-0.5 px-3.5 py-2.5">
              <Skeleton className="h-3 w-24 rounded bg-gray-300" />
              <Skeleton className="h-4 w-16 rounded bg-gray-300" />
            </div>
            <div className="h-px w-full bg-accent/20 sm:h-auto sm:w-px" />
            <div className="flex min-w-42.5 flex-1 flex-col gap-0.5 px-3.5 py-2.5">
              <Skeleton className="h-3 w-28 rounded bg-gray-300" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full bg-gray-300" />
                <Skeleton className="h-4 w-24 rounded bg-gray-300" />
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-hidden">
            {Array.from({ length: ROW_COUNT }).map((_, i) => (
              <PeriodRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      <div className="h-9 rounded-full bg-transparent" />
    </div>
  );
}
