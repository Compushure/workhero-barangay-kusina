import { Skeleton } from '@/components/ui/skeleton';

export function TaskAssignmentCardSkeleton() {
  return (
    <div className="rounded-3xl bg-background p-4 sm:p-6 shadow-sm/25">
      <Skeleton className="mb-5 sm:mb-7 h-7 w-64 bg-muted" />

      <div className="flex flex-wrap gap-3 sm:gap-4">
        <div className="w-full sm:w-auto sm:min-w-50">
          <Skeleton className="h-10 w-full sm:w-50 bg-muted rounded-lg" />
        </div>

        <div className="w-full sm:w-auto">
          <Skeleton className="h-10 w-full sm:w-50 bg-muted rounded-lg" />
        </div>

        <div className="w-full sm:w-auto">
          <Skeleton className="h-10 w-full sm:w-50 bg-muted rounded-lg" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
        <Skeleton className="h-10 w-full sm:w-32 bg-muted rounded-lg" />
        <Skeleton className="h-10 w-full sm:w-32 bg-muted rounded-lg" />
      </div>
    </div>
  );
}
