import { Skeleton } from '@/components/ui/skeleton';

export function TaskEditorHeaderSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      {/* Title Section */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-40 bg-muted" />
        <Skeleton className="h-5 w-96 bg-muted" />
      </div>

      {/* Task Count */}
      <div className="flex gap-3 sm:gap-4 pl-1 sm:pl-2">
        <Skeleton className="h-7 w-36 bg-muted rounded-full" />
      </div>

      {/* Search, Sort, and Add Button */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-start sm:justify-end">
        {/* Search */}
        <Skeleton className="h-10 w-full sm:w-64 bg-muted rounded-full" />

        {/* Sort and Add Button Row */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Skeleton className="h-10 w-full sm:w-48 bg-muted rounded-lg" />
          <Skeleton className="h-10 w-full sm:w-52 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}
