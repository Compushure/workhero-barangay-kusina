import { Skeleton } from '@/components/ui/skeleton';

export function BadgeEditorHeaderSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Title Section */}
      <div className="space-y-2">
        <Skeleton className="h-8 sm:h-9 w-40 sm:w-48 bg-gray-300" />
        <Skeleton className="h-4 sm:h-5 w-72 sm:w-96 bg-gray-300" />
      </div>

      <section className="flex min-w-0 flex-col gap-3 sm:gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* Badge Count */}
        <div className="flex shrink-0 self-start gap-2 whitespace-nowrap pl-0.5 sm:gap-3 sm:pl-1">
          <Skeleton className="h-6 sm:h-7 w-36 sm:w-40 bg-gray-300 rounded-full" />
        </div>

        {/* Search, Sort, Filter, and Add Button */}
        <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:gap-3 xl:w-auto xl:flex-row xl:items-center xl:justify-end">
          {/* Search */}
          <Skeleton className="h-6 sm:h-7 w-full flex-1 xl:max-w-md bg-gray-300 rounded-full" />

          <div className="flex min-w-0 flex-wrap gap-2 sm:gap-3 xl:flex-nowrap xl:justify-end">
            {/* Filter */}
            <Skeleton className="h-6 sm:h-7 w-24 sm:w-28 bg-gray-300 rounded-lg shrink-0" />

            {/* Sort */}
            <Skeleton className="h-6 sm:h-7 w-full sm:w-32 md:w-40 bg-gray-300 rounded-lg" />

            {/* Add Button */}
            <Skeleton className="h-6 sm:h-7 w-full sm:w-40 md:w-44 bg-gray-300 rounded-full" />
          </div>
        </div>
      </section>
    </div>
  );
}
