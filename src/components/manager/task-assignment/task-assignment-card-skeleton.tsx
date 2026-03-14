import { Skeleton } from '@/components/ui/skeleton';

export function TaskAssignmentCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card p-4 sm:p-6 shadow-sm/25">
      <Skeleton className="mb-5 sm:mb-6 h-5 sm:h-6 w-56 sm:w-64 bg-background" />

      <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
        <div className="w-full sm:w-auto sm:min-w-44">
          <Skeleton className="control-skeleton-h w-full h-5 sm:w-44 md:w-50 bg-background rounded-md" />
        </div>

        <div className="w-full sm:w-auto">
          <Skeleton className="control-skeleton-h w-full h-5 sm:w-44 md:w-50 bg-background rounded-md" />
        </div>

        <div className="w-full sm:w-auto">
          <Skeleton className="control-skeleton-h w-full h-5 sm:w-44 md:w-50 bg-background rounded-md" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
        <Skeleton className="control-skeleton-h w-full sm:w-32 bg-background rounded-md" />
        <Skeleton className="control-skeleton-h w-full sm:w-32 bg-background rounded-md" />
      </div>
    </div>
  );
}
