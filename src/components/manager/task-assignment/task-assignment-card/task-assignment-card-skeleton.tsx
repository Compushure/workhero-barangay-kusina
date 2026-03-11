import { Skeleton } from '@/components/ui/skeleton';

export function TaskAssignmentCardSkeleton() {
  return (
    <div className="rounded-3xl bg-background-soft p-4 sm:p-6 shadow-sm/25">
      {/* Title skeleton */}
      <Skeleton className="h-5 sm:h-6 w-48 sm:w-60 mb-5 bg-gray-300" />

      {/* Button group skeleton */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <div className="w-full sm:w-auto sm:min-w-50">
          <Skeleton className="h-8 w-full sm:w-50 bg-gray-300" />
        </div>
        <div className="w-full sm:w-auto">
          <Skeleton className="h-8 w-full sm:w-50 bg-gray-300" />
        </div>
        <div className="w-full sm:w-auto">
          <Skeleton className="h-8 w-full sm:w-50 bg-gray-300" />
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
        <Skeleton className="h-7 w-full sm:w-32 bg-gray-300" />
        <Skeleton className="h-7 w-full sm:w-32 bg-gray-300" />
      </div>
    </div>
  );
}
