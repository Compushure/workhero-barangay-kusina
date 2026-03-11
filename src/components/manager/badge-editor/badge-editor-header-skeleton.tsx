import { Skeleton } from '@/components/ui/skeleton';

export function BadgeEditorHeaderSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-4 lg:space-y-6">
      {/* Title Section */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-48 bg-gray-300" />
        <Skeleton className="h-5 w-96 bg-gray-300" />
      </div>

      <section className='flex flex-col md:flex-row justify-between'>
        {/* Badge Count */}
        <div className="flex gap-3 sm:gap-4 pl-1 sm:pl-2 pb-4">
          <Skeleton className="h-7 w-40 bg-gray-300 rounded-full" />
        </div>

        {/* Search, Sort, Filter, and Add Button */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-start sm:justify-end">
          {/* Search */}
          <Skeleton className="h-7 w-full sm:w-64 bg-gray-300 rounded-full" />

          {/* Sort */}
          <Skeleton className="h-7 w-full sm:w-40 bg-gray-300 rounded-lg" />

          {/* Filter */}
          <Skeleton className="h-7 w-full sm:w-32 bg-gray-300 rounded-lg" />

          {/* Add Button */}
          <Skeleton className="h-7 w-full sm:w-44 bg-gray-300 rounded-full" />
        </div>
      </section>
    </div>
  );
}
