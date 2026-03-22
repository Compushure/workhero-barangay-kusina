import { Skeleton } from '@/components/ui/skeleton';

export function MercadoSkeleton() {
  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="relative flex min-h-[7.5rem] items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm"
        >
          <Skeleton className="h-24 w-20 shrink-0 rounded-lg bg-gray-300" />

          <div className="min-w-0 flex-1 space-y-2 pr-10">
            <Skeleton className="h-5 w-2/3 rounded-md bg-gray-300" />
            <Skeleton className="h-5 w-24 rounded-lg bg-gray-300" />
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-4 w-24 rounded-full bg-gray-300" />
              <Skeleton className="h-4 w-20 rounded-full bg-gray-300" />
            </div>
            <Skeleton className="h-4 w-28 rounded-md bg-gray-300" />
          </div>

          <Skeleton className="absolute top-3.5 right-3.5 h-7 w-7 rounded-md bg-gray-300" />
        </div>
      ))}
    </div>
  );
}
