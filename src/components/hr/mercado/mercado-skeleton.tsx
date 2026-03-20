import { Skeleton } from '@/components/ui/skeleton';

export function MercadoSkeleton() {
  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="relative flex min-h-32 items-start gap-4 rounded-2xl border border-accent/15 bg-card px-3.5 py-3 shadow-sm/25"
        >
          <Skeleton className="h-20 w-20 shrink-0 rounded-xl bg-gray-300" />

          <div className="min-w-0 flex-1 space-y-3 pr-8">
            <Skeleton className="h-5 w-2/3 rounded-lg bg-gray-300" />
            <Skeleton className="h-4 w-1/2 rounded-lg bg-gray-300" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16 rounded-full bg-gray-300" />
              <Skeleton className="h-4 w-20 rounded-full bg-gray-300" />
            </div>
            <Skeleton className="h-4 w-28 rounded-full bg-gray-300" />
          </div>

          <Skeleton className="absolute top-3 right-3 h-8 w-8 rounded-xl bg-gray-300" />
        </div>
      ))}
    </div>
  );
}
