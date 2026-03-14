import { Skeleton } from '@/components/ui/skeleton';

export function MercadoSkeleton() {
  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="bg-background border border-border rounded-xl p-3.5 min-h-32 flex items-start gap-3.5 relative"
        >
          <Skeleton className="h-23 w-23 rounded-lg bg-muted" />

          <div className="flex-1 min-w-0 pr-10 space-y-2">
            <Skeleton className="h-6 w-2/3 bg-muted" />
            <Skeleton className="h-4 w-1/3 rounded-lg bg-muted" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16 bg-muted" />
              <Skeleton className="h-4 w-24 bg-muted" />
            </div>
            <Skeleton className="h-4 w-28 bg-muted" />
          </div>

          <Skeleton className="absolute top-3 right-3 h-7 w-7 rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}
