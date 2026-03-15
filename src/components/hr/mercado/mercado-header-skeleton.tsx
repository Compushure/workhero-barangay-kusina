import { Skeleton } from '@/components/ui/skeleton';

export function MercadoHeaderSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-lg bg-gray-300" />
        <Skeleton className="h-4 w-80 rounded-lg bg-gray-300" />
      </div>

      <div className="manager-sticky-controls rounded-xl px-3 py-3 sm:px-4 sm:py-3.5">
        <div className="flex min-w-0 flex-col items-stretch gap-2 xl:flex-row xl:items-center xl:justify-end">
          <div className="min-w-0 flex-1 xl:max-w-xs">
            <Skeleton className="control-skeleton-h w-full rounded-lg bg-gray-300" />
          </div>
          <div className="flex min-w-0 flex-wrap gap-2 sm:flex-nowrap xl:shrink-0">
            <Skeleton className="control-skeleton-h rounded-lg bg-gray-300 sm:w-40" />
            <Skeleton className="control-skeleton-h rounded-lg bg-gray-300 sm:w-44" />
            <Skeleton className="control-skeleton-h rounded-xl bg-gray-300 sm:w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}
