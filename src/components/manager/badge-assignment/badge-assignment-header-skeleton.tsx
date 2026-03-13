import { Skeleton } from '@/components/ui/skeleton';

export function BadgeAssignmentHeaderSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6 md:space-y-8">
      <section className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-3 sm:gap-4">
        {/* Title Section */}
        <div className="space-y-2">
          <Skeleton className="h-8 sm:h-9 w-48 sm:w-56 bg-gray-300" />
          <Skeleton className="h-4 sm:h-5 w-64 sm:w-80 bg-gray-300" />
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden shadow-md border border-accent/25 w-full sm:w-fit">
          <Skeleton className="h-9 sm:h-10 flex-1 sm:w-32 md:w-36 bg-gray-300 rounded-l-xl" />
          <Skeleton className="h-9 sm:h-10 flex-1 sm:w-36 md:w-40 bg-gray-300 rounded-r-xl" />
        </div>
      </section>

      {/* Search and Sort Controls */}
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        {/* Badge/User Count */}
        <Skeleton className="h-6 sm:h-7 w-36 sm:w-40 bg-gray-300 rounded-full shrink-0 self-start" />

        {/* Search and Sort */}
        <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:gap-3 xl:w-auto xl:flex-row xl:items-center xl:justify-end">
          <Skeleton className="h-7 sm:h-8 w-full flex-1 xl:max-w-md bg-gray-300 rounded-full" />
          <div className="flex min-w-0 flex-wrap gap-2 sm:flex-nowrap sm:gap-3 xl:justify-end">
            <Skeleton className="h-7 sm:h-8 w-full sm:w-36 md:w-40 bg-gray-300 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
