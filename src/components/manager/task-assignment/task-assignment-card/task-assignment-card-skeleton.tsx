import { Skeleton } from '@/components/ui/skeleton';

export function TaskAssignmentCardSkeleton() {
  return (
    <div className="rounded-2xl bg-background-soft p-3 sm:p-4 md:px-7 py-5 shadow-sm/25 max-w-230">
      {/* Header skeleton */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <Skeleton className="h-6 w-44 sm:w-48 md:w-60 bg-gray-300" />
        <Skeleton className="size-7.5 shrink-0 rounded-md bg-gray-300" />
      </div>

      {/* Button group skeleton */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <div className="w-full sm:w-auto sm:min-w-44">
          <Skeleton className="h-9 w-full sm:w-44 md:w-50 bg-gray-300 rounded-md" />
        </div>
        <div className="w-full sm:w-auto">
          <Skeleton className="h-9 w-full sm:w-44 md:w-50 bg-gray-300 rounded-md" />
        </div>
        <div className="w-full sm:w-auto">
          <Skeleton className="h-9 w-full sm:w-44 md:w-50 bg-gray-300 rounded-md" />
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="mt-3 sm:mt-4 flex sm:justify-end">
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-3 p-1 rounded-xl border border-accent/20 bg-card/70">
          <Skeleton className="control-skeleton-h w-full sm:w-32 bg-gray-300 rounded-md" />
          <Skeleton className="control-skeleton-h w-full sm:w-32 bg-gray-300 rounded-md" />
        </div>
      </div>
    </div>
  );
}
