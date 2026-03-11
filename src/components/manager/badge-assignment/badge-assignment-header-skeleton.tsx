import { Skeleton } from '@/components/ui/skeleton';

export function BadgeAssignmentHeaderSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      {/* Title Section */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-56 bg-background" />
        <Skeleton className="h-5 w-80 bg-background" />
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden shadow-md border border-accent/25">
        <Skeleton className="h-10 flex-1 bg-background rounded-l-xl" />
        <Skeleton className="h-10 flex-1 bg-background rounded-r-xl" />
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        {/* Badge/User Count */}
        <Skeleton className="h-7 w-40 bg-background rounded-full" />

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full sm:w-auto">
          <Skeleton className="h-8 w-full sm:w-64 bg-background rounded-full" />
          <Skeleton className="h-8 w-full sm:w-40 bg-background rounded-lg" />
        </div>
      </div>
    </div>
  );
}
