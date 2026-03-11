import { Skeleton } from '@/components/ui/skeleton';

export function MercadoSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-xl p-4 h-32 flex items-center gap-4"
        >
          <Skeleton className="h-24 w-24 rounded-xl bg-background" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-3/4 bg-background" />
            <Skeleton className="h-4 w-1/2 bg-background" />
          </div>
        </div>
      ))}
    </div>
  );
}
