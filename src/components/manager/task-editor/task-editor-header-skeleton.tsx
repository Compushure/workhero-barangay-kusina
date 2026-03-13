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
      <section className="manager-sticky-controls rounded-xl px-3 py-3 sm:px-4 sm:py-3.5 flex min-w-0 flex-col gap-3 sm:gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* Category Count Display */}
        <div className="flex shrink-0 self-start gap-2 whitespace-nowrap pl-0.5 sm:gap-3 sm:pl-1">
          <Skeleton className="h-7 sm:h-8 w-32 sm:w-36 bg-gray-300 rounded-md" />
        </div>

        {/* Search, Sort, and Add Button */}
        <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:gap-3 xl:w-auto xl:flex-row xl:items-center xl:justify-end">
          {/* Search Input */}
          <Skeleton className="control-skeleton-h w-full flex-1 xl:max-w-md bg-gray-300 rounded-md" />

          <div className="flex min-w-0 flex-wrap gap-2 sm:gap-3 xl:flex-nowrap xl:justify-end">
            {/* Filter Toggle */}
            <Skeleton className="control-skeleton-h w-20 sm:w-24 bg-gray-300 rounded-md shrink-0" />

            {/* Sort and Add Button Row */}
            <div className="flex min-w-0 flex-wrap gap-2 sm:flex-nowrap">
              {/* Sort Dropdown */}
              <Skeleton className="control-skeleton-h w-full sm:w-44 bg-gray-300 rounded-md" />

              {/* Add New Category Button */}
              <Skeleton className="control-skeleton-h w-full sm:w-44 md:w-52 bg-gray-300 rounded-md" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
