import { Skeleton } from '@/components/ui/skeleton';

export function MercadoHeaderSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title and description */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 bg-muted" />
        <Skeleton className="h-5 w-96 bg-muted" />
      </div>

      {/* Search, sort, filter, and add button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 sm:justify-end">
        <div className="w-full sm:min-w-0 md:max-w-md lg:max-w-lg sm:flex-initial">
          <Skeleton className="h-10 w-full bg-muted" />
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24 bg-muted" />
            <Skeleton className="h-10 w-24 bg-muted" />
          </div>
          <Skeleton className="h-10 w-32 bg-muted" />
        </div>
      </div>
    </div>
  );
}
