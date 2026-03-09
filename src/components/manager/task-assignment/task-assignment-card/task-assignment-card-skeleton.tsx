import { Skeleton } from '@/components/ui/skeleton';

export function TaskAssignmentCardSkeleton() {
  return (
    <div className="rounded-3xl bg-background p-4 sm:p-6 shadow-sm/25">
      {/* Title skeleton */}
      <Skeleton className="h-7 sm:h-8 w-64 sm:w-80 mb-5 sm:mb-7 bg-muted" />

      {/* Button group skeleton */}
      <div className="flex flex-wrap gap-3 sm:gap-4">
        <div className="w-full sm:w-auto sm:min-w-50">
          <Skeleton className="h-10 w-full sm:w-50 bg-muted" />
        </div>
        <div className="w-full sm:w-auto">
          <Skeleton className="h-10 w-full sm:w-50 bg-muted" />
        </div>
        <div className="w-full sm:w-auto">
          <Skeleton className="h-10 w-full sm:w-50 bg-muted" />
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
        <Skeleton className="h-10 w-full sm:w-32 bg-muted" />
        <Skeleton className="h-10 w-full sm:w-32 bg-muted" />
      </div>
    </div>
  );
}
