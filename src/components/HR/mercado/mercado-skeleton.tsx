import { Skeleton } from '@/components/ui/skeleton';

export function MercadoSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className="bg-card border-border rounded-xl p-4 flex items-center relative shadow-sm h-32"
        >
          {/* Image skeleton */}
          <Skeleton className="h-24 w-24 rounded-lg shrink-0" />

          {/* Content area */}
          <div className="ml-4 flex-1 min-w-0">
            {/* Title skeleton */}
            <Skeleton className="h-6 w-3/4 mb-3" />

            {/* Price and Quantity skeleton */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Menu button skeleton */}
          <div className="absolute top-4 right-4">
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
