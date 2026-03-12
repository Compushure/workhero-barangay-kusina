import { Skeleton } from '@/components/ui/skeleton';

export function BadgeEditorHeaderSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Title Section */}
      <div className="space-y-2">
        <Skeleton className="h-8 sm:h-9 w-40 sm:w-48 bg-gray-300" />
        <Skeleton className="h-4 sm:h-5 w-72 sm:w-96 bg-gray-300" />
      </div>

      <section className="flex flex-col md:flex-row md:justify-between gap-3 sm:gap-4">
        {/* Badge Count */}
        <div className="flex gap-2 sm:gap-3 pl-0.5 sm:pl-1">
          <Skeleton className="h-6 sm:h-7 w-36 sm:w-40 bg-gray-300 rounded-full" />
        </div>

        {/* Search, Sort, Filter, and Add Button */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-start md:justify-end">
          {/* Search */}
          <Skeleton className="h-6 sm:h-7 w-full sm:w-56 md:w-64 bg-gray-300 rounded-full" />

          {/* Sort */}
          <Skeleton className="h-6 sm:h-7 w-full sm:w-32 md:w-40 bg-gray-300 rounded-lg" />

          {/* Filter */}
          <Skeleton className="h-6 sm:h-7 w-full sm:w-28 md:w-32 bg-gray-300 rounded-lg" />

          {/* Add Button */}
          <Skeleton className="h-6 sm:h-7 w-full sm:w-40 md:w-44 bg-gray-300 rounded-full" />
        </div>
      </section>
    </div>
  );
}
