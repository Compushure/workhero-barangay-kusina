import { Skeleton } from '@/components/ui/skeleton';

// Loading placeholder for HR Mercado header + controls.

export function MercadoHeaderSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-lg bg-gray-300" />
        <Skeleton className="h-4 w-80 rounded-lg bg-gray-300" />
      </div>

      <section className="manager-sticky-controls rounded-xl px-3 py-3 sm:px-4 sm:py-3.5 flex min-w-0 flex-col gap-3 sm:gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex shrink-0 self-start gap-2 whitespace-nowrap pl-0.5 sm:gap-3 sm:pl-1">
          <Skeleton className="h-7 sm:h-8 w-24 sm:w-28 bg-gray-300 rounded-md" />
        </div>

        <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:gap-3 xl:w-auto xl:flex-row xl:items-center xl:justify-end">
          <div className="min-w-0 flex-1 xl:max-w-xs">
            <Skeleton className="control-skeleton-h w-full rounded-lg bg-gray-300" />
          </div>
          <div className="w-full min-w-0 overflow-x-auto pb-1 xl:w-auto xl:overflow-visible xl:pb-0">
            <div className="flex min-w-max flex-nowrap items-center gap-2 sm:gap-3 xl:justify-end">
              <Skeleton className="control-skeleton-h w-40 shrink-0 rounded-lg bg-gray-300 sm:w-44" />
              <Skeleton className="control-skeleton-h w-24 shrink-0 rounded-lg bg-gray-300 sm:w-28" />
              <Skeleton className="control-skeleton-h w-32 shrink-0 rounded-xl bg-gray-300 sm:w-36" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
