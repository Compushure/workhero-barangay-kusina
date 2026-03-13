import { Skeleton } from '@/components/ui/skeleton';

export function TaskAssignmentCardSkeleton() {
  return (
    <div className="rounded-2xl bg-background-soft p-4 sm:p-6 shadow-sm/25">
      {/* Title skeleton */}
      <Skeleton className="h-5 sm:h-6 w-44 sm:w-48 md:w-60 mb-4 sm:mb-5 bg-gray-300" />

      {/* Button group skeleton */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <div className="w-full sm:w-auto sm:min-w-50">
          <Skeleton className="control-skeleton-h w-full sm:w-50 bg-gray-300 rounded-md" />
        </div>
        <div className="w-full sm:w-auto">
          <Skeleton className="control-skeleton-h w-full sm:w-50 bg-gray-300 rounded-md" />
        </div>
        <div className="w-full sm:w-auto">
          <Skeleton className="control-skeleton-h w-full sm:w-50 bg-gray-300 rounded-md" />
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
