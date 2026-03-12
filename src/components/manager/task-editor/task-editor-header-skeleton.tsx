import { Skeleton } from '@/components/ui/skeleton';

export function TaskEditorHeaderSkeleton() {
  return (
    <>
      {/* Title Section */}
      <div className="space-y-2">
        <Skeleton className="h-8 sm:h-9 w-36 sm:w-40 bg-gray-300" />
        <Skeleton className="h-4 sm:h-5 w-72 sm:w-96 bg-gray-300" />
      </div>

      {/* Search, Sort, and Add Button - Always visible, stacked on mobile */}
      <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        {/* Category Count Display */}
        <div className="flex gap-2 sm:gap-3 pl-0.5 sm:pl-1">
          <Skeleton className="h-6 sm:h-7 w-32 sm:w-36 bg-gray-300 rounded-full" />
        </div>

        {/* Search, Sort, and Add Button */}
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-start lg:justify-end">
          {/* Search Input */}
          <Skeleton className="h-6 sm:h-7 w-full sm:w-auto sm:min-w-60 md:min-w-75 bg-gray-300 rounded-full" />

          {/* Filter Toggle */}
          <Skeleton className="h-6 sm:h-7 w-14 sm:w-16 bg-gray-300 rounded-lg" />

          {/* Sort and Add Button Row */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Sort Dropdown */}
            <Skeleton className="h-6 sm:h-7 w-full sm:w-36 md:w-40 bg-gray-300 rounded-lg" />

            {/* Add New Category Button */}
            <Skeleton className="h-6 sm:h-7 w-full sm:w-44 md:w-52 bg-gray-300 rounded-full" />
          </div>
        </div>
      </section>
    </>
  );
}
